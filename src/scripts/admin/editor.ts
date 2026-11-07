import { formatPrice, priceForEditing } from "./price-format";
import { createContentEditor } from "./content-editor";
import {
  buildAddress,
  buildTitle,
  discountValue,
  displayCities,
  formatMoney,
  kindOptions,
  parseMoney,
  pricePerMeterValue,
  settlementOptions,
  streetOptions,
  TRASH_TTL,
  type Catalog,
  type FieldError,
  type Property,
  type TrashItem,
} from "../../lib/catalog-schema.mjs";
import type { Image } from "../../lib/catalog-schema.mjs";
import { icon, type IconName } from "./icons";
import { preparePhoto } from "./image-editor";
const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const base = document.body.dataset.apiBase || "";
const media = document.body.dataset.mediaBase || "";
let csrf = "",
  catalog: Catalog,
  editing: Property | null = null,
  image: Image | null = null,
  visible = true,
  busy = false,
  dirty = false;
let objectFilter = "all";
let resumeObject = false;
let photoPromise: Promise<void> | null = null;
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text = "") => {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
};
let toastTimer: ReturnType<typeof setTimeout>;
function dismissMessage() {
  clearTimeout(toastTimer);
  const toast = $("#message");
  if (toast.matches(":popover-open")) toast.hidePopover();
  toast.hidden = true;
}
function message(text: string, error = false) {
  if (!$(".admin-login").hidden) {
    dismissMessage();
    const notice = $("#login-notice");
    notice.hidden = false;
    notice.textContent = text;
    notice.classList.toggle("error", error);
    return;
  }
  const toast = $("#message");
  toast.textContent = text;
  toast.classList.toggle("error", error);
  toast.hidden = false;
  if (!toast.matches(":popover-open")) toast.showPopover();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidePopover();
    toast.hidden = true;
  }, 4200);
}
// ---------- structured field definitions ----------
type FieldKind = "text" | "number" | "money" | "select";
interface FieldDef {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  options?: [string, string][];
  placeholder?: string;
  hint?: string;
  when?: (values: Record<string, string>) => boolean;
}
const numberField = (name: string, label: string, hint: string): FieldDef => ({
  name,
  label,
  kind: "number",
  placeholder: "—",
  hint,
});
const FIELD_DEFS: FieldDef[] = [
  {
    name: "kind",
    label: "Тип объекта",
    kind: "select",
    required: true,
    options: kindOptions,
    hint: "Квартира, студия, дом, участок или коммерческое помещение.",
  },
  {
    name: "rooms",
    label: "Комнат",
    kind: "number",
    placeholder: "2",
    hint: "Только для квартиры. Участвует в названии.",
    when: (v) => v.kind === "flat",
  },
  numberField(
    "area",
    "Площадь объекта, м²",
    "Например: 40 или 29,3. Необязательно.",
  ),
  numberField("floor", "Этаж", "Необязательно. Например: 5."),
  numberField("floors", "Этажность здания", "Необязательно. Например: 8."),
  numberField(
    "landArea",
    "Площадь участка, сот.",
    "Только для дома с участком. Например: 14,85.",
  ),
  {
    name: "settlement",
    label: "Населенный пункт",
    kind: "text",
    required: true,
    placeholder: "Серышево",
    hint: "Название без типа: Серышево, Яковлевка, Белогорск.",
  },
  {
    name: "settlementKind",
    label: "Тип населенного пункта",
    kind: "select",
    options: [["", "Без типа"], ...settlementOptions],
    hint: "Выберите г., с., пос. или пгт. — приставка добавится сама.",
  },
  {
    name: "street",
    label: "Улица",
    kind: "text",
    placeholder: "Ленина",
    hint: "Название без «ул.» — тип улицы выбирается рядом.",
  },
  {
    name: "streetKind",
    label: "Тип улицы",
    kind: "select",
    options: [["", "—"], ...streetOptions],
    hint: "Для проездов, переулков и других типов выбирайте соответствующий вариант.",
  },
  {
    name: "house",
    label: "Номер дома",
    kind: "text",
    placeholder: "47",
    hint: "Только номер: 47 или 12к3. Для «вл. 5» введите значение целиком.",
  },
  {
    name: "city",
    label: "Город отображения",
    kind: "select",
    required: true,
    options: displayCities.map((c) => [c, c] as [string, string]),
    hint: "В каком городском каталоге показывать объект. Это не адрес.",
  },
  {
    name: "price",
    label: "Цена",
    kind: "money",
    required: true,
    placeholder: "900 000 ₽",
    hint: "Только число: 900000. Рубли и пробелы добавятся автоматически.",
  },
  {
    name: "oldPrice",
    label: "Старая цена",
    kind: "money",
    placeholder: "1 000 000 ₽",
    hint: "Необязательно. Скидка рассчитается автоматически.",
  },
  {
    name: "mortgage",
    label: "Ипотека в месяц",
    kind: "text",
    placeholder: "от 35 000 ₽/мес.",
    hint: "Необязательно. Подпись об ипотечном платеже.",
  },
];
const NUMBER_NAMES = new Set(["rooms", "area", "floor", "floors", "landArea"]);
const MONEY_NAMES = new Set(["price", "oldPrice"]);
function fieldValue(name: string): string {
  const input = document.querySelector<HTMLInputElement>(
    `#form [name="${name}"]`,
  );
  return input ? input.value.trim() : "";
}
function numberOrNull(name: string): number | null {
  const raw = fieldValue(name).replace(",", ".");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}
// Live snapshot used for title/address/price preview and final validation.
function snapshot(): Record<string, string> {
  const values: Record<string, string> = {};
  for (const def of FIELD_DEFS)
    if (!def.when || def.when(values)) values[def.name] = fieldValue(def.name);
  return values;
}
function previewValues() {
  const v = snapshot();
  const draft = {
    kind: v.kind || "",
    rooms: numberOrNull("rooms"),
    area: numberOrNull("area"),
    floor: numberOrNull("floor"),
    floors: numberOrNull("floors"),
    landArea: numberOrNull("landArea"),
    settlement: v.settlement || "",
    settlementKind: v.settlementKind || "",
    street: v.street || "",
    streetKind: v.streetKind || "",
    house: v.house || "",
    price: parseMoney(v.price),
    oldPrice: parseMoney(v.oldPrice),
  } as Property;
  const title = v.kind ? buildTitle(draft) : fieldValue("title");
  const address = buildAddress(draft) || v.settlement || "";
  return {
    title: title || "Название объекта",
    address: address || "Адрес объекта",
    price: v.price ? formatMoney(parseMoney(v.price)) || "Цена" : "Цена",
    oldPrice: v.oldPrice ? formatMoney(parseMoney(v.oldPrice)) : "",
    pricePerMeter: pricePerMeterValue(draft),
    discount: discountValue(draft),
    mortgage: v.mortgage || "",
  };
}
function updateObjectPreview() {
  const values = previewValues();
  for (const [name, fallback] of [
    ["title", "Название объекта"],
    ["address", "Адрес объекта"],
    ["price", "Цена"],
    ["oldPrice", ""],
    ["pricePerMeter", ""],
    ["mortgage", ""],
    ["discount", ""],
  ] as const) {
    const target = $(
      "#preview-" + name.replace(/[A-Z]/g, (l) => "-" + l.toLowerCase()),
    );
    const value = values[name];
    target.textContent = value || fallback;
    target.hidden = !fallback && !value;
  }
  $("#preview-photo-placeholder").hidden = !$("#current-image").hidden;
  $("#visibility-help").textContent = visible
    ? image
      ? "После сохранения карточка появится на сайте."
      : "Без фотографии объект сохранится как черновик и не будет виден посетителям."
    : "Карточка останется в админке. Посетители ее не увидят.";
  $("#object-save-status").textContent = dirty
    ? "Есть несохраненные изменения"
    : editing
      ? "Карточка сохранена. Можно внести изменения."
      : "Изменения еще не сохранены";
  syncConditionalFields();
}
function syncConditionalFields() {
  const values = snapshot();
  for (const wrapper of document.querySelectorAll<HTMLElement>(
    "#form [data-conditional]",
  )) {
    const def = FIELD_DEFS.find((d) => d.name === wrapper.dataset.conditional);
    const show =
      wrapper.id === "field-title-manual"
        ? !values.kind
        : def?.when
          ? def.when(values)
          : true;
    wrapper.hidden = !show;
    wrapper
      .querySelectorAll("input,select")
      .forEach((input) => input.removeAttribute("required"));
  }
}
function clearObjectErrors() {
  $("#object-error-summary").hidden = true;
  $("#object-error-summary").replaceChildren();
  document
    .querySelectorAll<HTMLElement>("#form [data-field]")
    .forEach((node) => {
      node.textContent = "";
    });
  document
    .querySelectorAll("#form [aria-invalid]")
    .forEach((node) => node.removeAttribute("aria-invalid"));
}
function objectErrors(fields: FieldError[], focus = true) {
  clearObjectErrors();
  const summary = $("#object-error-summary");
  summary.append(el("h3", "Проверьте поля карточки"));
  for (const field of fields) {
    const name = field.path.replace(/^objects\.\d+\./, "").split(".")[0];
    const input =
      name === "image"
        ? $("#image-file")
        : document.querySelector<HTMLInputElement>(`#form [name="${name}"]`);
    const slot = document.querySelector<HTMLElement>(
      `#form [data-field="${name}"]`,
    );
    if (!input || !slot) continue;
    slot.textContent = field.message;
    input.setAttribute("aria-invalid", "true");
    const link = el("a", field.message);
    link.href = "#" + input.id;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      input.focus();
    });
    summary.append(link);
  }
  summary.hidden = false;
  if (focus) summary.focus();
}
function refreshObjectErrorSummary() {
  const summary = $("#object-error-summary");
  if (summary.hidden || !summary.querySelector("a")) return;
  const fields = [
    ...document.querySelectorAll<HTMLElement>("#form [data-field]"),
  ]
    .filter((node) => node.textContent)
    .map((node) => ({ path: node.dataset.field!, message: node.textContent! }));
  if (!fields.length) {
    clearObjectErrors();
    return;
  }
  objectErrors(fields, false);
}
// ---------- dialogs ----------
const editor = $<HTMLDialogElement>("#editor"),
  confirmation = $<HTMLDialogElement>("#confirmation");
let editorOpener: HTMLElement | null = null,
  confirmOpener: HTMLElement | null = null,
  confirmResolve: ((value: boolean) => void) | null = null,
  closeResolve: ((value: "save" | "discard" | "cancel") => void) | null = null;
let scrollOverflow = "",
  scrollPadding = "";
function scrollLock() {
  if (!document.body.classList.contains("admin-modal-open")) {
    scrollOverflow = document.body.style.overflow;
    scrollPadding = document.body.style.paddingRight;
    document.body.style.paddingRight = `${innerWidth - document.documentElement.clientWidth}px`;
    document.body.style.overflow = "hidden";
    document.body.classList.add("admin-modal-open");
  }
}
function scrollUnlock() {
  if (editor.open || confirmation.open) return;
  document.body.style.overflow = scrollOverflow;
  document.body.style.paddingRight = scrollPadding;
  document.body.classList.remove("admin-modal-open");
}
function showConfirm() {
  confirmOpener = document.activeElement as HTMLElement;
  scrollLock();
  confirmation.showModal();
}
function hideConfirm() {
  confirmation.close();
  const opener = confirmOpener;
  confirmOpener = null;
  opener?.focus();
  scrollUnlock();
}
function ask(
  title: string,
  description: string,
  label: string,
): Promise<boolean> {
  $("#confirm-title").textContent = title;
  $("#confirm-description").textContent = description;
  $("#confirm-ok").textContent = label;
  $("#confirm-ok").hidden = false;
  $("#confirm-save").hidden = true;
  $("#confirm-cancel").textContent = "Оставить как есть";
  $("#confirm-cancel").className = "admin-button admin-secondary";
  showConfirm();
  $("#confirm-cancel").focus();
  return new Promise((resolve) => {
    confirmResolve = resolve;
  });
}
function answer(value: boolean) {
  hideConfirm();
  const resolve = confirmResolve;
  confirmResolve = null;
  resolve?.(value);
}
// Save/discard/cancel choice for closing the object editor with edits.
function askEditorClose(): Promise<"save" | "discard" | "cancel"> {
  $("#confirm-title").textContent = "Сохранить изменения?";
  $("#confirm-description").textContent =
    "В карточке есть несохраненные изменения.";
  $("#confirm-ok").hidden = true;
  $("#confirm-save").hidden = false;
  $("#confirm-save").textContent = "Сохранить и закрыть";
  $("#confirm-cancel").textContent = "Закрыть без сохранения";
  $("#confirm-cancel").className = "admin-button admin-secondary";
  showConfirm();
  $("#confirm-save").focus();
  return new Promise((resolve) => {
    closeResolve = resolve;
  });
}
function answerClose(value: "save" | "discard" | "cancel") {
  hideConfirm();
  const resolve = closeResolve;
  closeResolve = null;
  resolve?.(value);
}
$("#confirm-ok").addEventListener("click", () => {
  if (closeResolve) answerClose("discard");
  else answer(true);
});
$("#confirm-save").addEventListener("click", () => {
  answerClose("save");
  void (async () => {
    if (await saveCurrent()) closeEditor();
  })();
});
for (const selector of ["#confirm-cancel", "#confirm-close"])
  $(selector).addEventListener("click", () => {
    if (closeResolve)
      answerClose(selector === "#confirm-cancel" ? "discard" : "cancel");
    else answer(false);
  });
confirmation.addEventListener("cancel", (event) => {
  event.preventDefault();
  if (closeResolve) answerClose("cancel");
  else answer(false);
});
function outside(event: MouseEvent, dialog: HTMLDialogElement) {
  const r = dialog.getBoundingClientRect();
  return (
    event.target === dialog &&
    (event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom)
  );
}
confirmation.addEventListener("click", (event) => {
  if (outside(event, confirmation)) {
    if (closeResolve) answerClose("cancel");
    else answer(false);
  }
});
async function requestClose() {
  if (busy || photoPromise) {
    message("Дождитесь завершения операции", true);
    return;
  }
  if (!dirty) {
    closeEditor();
    return;
  }
  const choice = await askEditorClose();
  if (choice === "save") return; // handled by #confirm-save
  if (choice === "discard") closeEditor();
}
editor.addEventListener("cancel", (event) => {
  // File inputs also emit a bubbling cancel event when the picker is dismissed.
  if (event.target !== editor) return;
  event.preventDefault();
  void requestClose();
});
editor.addEventListener("click", (event) => {
  if (outside(event, editor)) void requestClose();
});
// Paste an image straight from the clipboard into the photo block.
editor.addEventListener("paste", (event) => {
  const items = event.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (!item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (!file) continue;
    event.preventDefault();
    void uploadPhoto(
      new File([file], "clipboard." + (file.type.split("/")[1] || "png"), {
        type: file.type,
      }),
    );
    return; // one paste event = one upload
  }
});
// Native dialog makes the page inert; explicitly wrap Tab across its controls.
for (const dialog of [editor, confirmation])
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = [
      ...dialog.querySelectorAll<HTMLElement>(
        'button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),summary,a[href],[tabindex="0"]',
      ),
    ].filter((n) => n.getClientRects().length);
    const first = controls[0],
      last = controls.at(-1);
    if (
      event.shiftKey &&
      (document.activeElement === first ||
        !controls.includes(document.activeElement as HTMLElement))
    ) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last ||
        !controls.includes(document.activeElement as HTMLElement))
    ) {
      event.preventDefault();
      first?.focus();
    }
  });
interface APIError extends Error {
  status?: number;
  fields?: FieldError[];
}
async function api(path: string, method = "GET", body?: unknown) {
  const response = await fetch(base + path, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-CSRF": csrf,
      "X-Admin-Request": "1",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok)
    throw Object.assign(Error(result.error?.message || "Сервер недоступен"), {
      status: response.status,
      fields: result.error?.fields,
    });
  return result;
}
function errors(error: unknown) {
  const e = error as APIError;
  if (editor.open && e.fields?.length) objectErrors(e.fields);
  const errorText =
    e instanceof TypeError
      ? "Нет связи с сервером. Ваши поля сохранены в редакторе. Попробуйте еще раз."
      : e.message || "Нет связи с сервером";
  if (editor.open || (!$("#texts-panel").hidden && !$("#workspace").hidden))
    dismissMessage();
  else message(errorText, true);
  if (editor.open && !e.fields?.length) {
    const summary = $("#object-error-summary");
    summary.replaceChildren(
      el("h3", "Не удалось сохранить карточку"),
      el("p", errorText),
    );
    summary.hidden = false;
    summary.focus();
  } else if (!$("#workspace").hidden && !editor.open) {
    $("#workspace-notice").textContent = errorText;
    $("#workspace-notice").hidden = false;
  }
  if (e.status === 409 && editor.open) {
    const banner = el("div");
    banner.className = "admin-banner";
    banner.id = "conflict-notice";
    banner.setAttribute("role", "alert");
    banner.append(
      el(
        "p",
        "Каталог изменен в другой вкладке. Ваши поля сохранены. Получите свежую версию перед повторным сохранением.",
      ),
    );
    const refresh = el("button", "Получить свежую версию");
    refresh.type = "button";
    refresh.className = "admin-text-button";
    refresh.addEventListener("click", async () => {
      try {
        catalog = await api("/api/admin/catalog");
        render();
        banner.remove();
        message("Список обновлен. Проверьте поля и сохраните карточку.");
      } catch (error) {
        errors(error);
      }
    });
    banner.append(refresh);
    $("#conflict-notice")?.remove();
    $("#fields").before(banner);
  }
  if (e.status === 401) {
    if (editor.open) {
      resumeObject = true;
      editor.close();
      editor.hidden = true;
      scrollUnlock();
    }
    $("#workspace").hidden = true;
    $(".admin-login").hidden = false;
    $("#logout").hidden = true;
    csrf = "";
    $("#login-notice").textContent =
      "Сессия завершилась. Войдите снова, чтобы продолжить работу.";
    $("#login-notice").hidden = false;
    $("#login-username").focus();
  }
}
function photoURL(value: string) {
  if (value === "/assets/property-card-default-photo.webp") return value;
  const url = new URL(value, media || location.origin),
    allowed = new URL(media || location.origin);
  if (
    url.origin !== allowed.origin ||
    !/^\/media\/[a-f0-9]{48}\.webp$/.test(url.pathname)
  )
    throw Error("Некорректное фото");
  return url.href;
}
function closeEditor() {
  const returnId = editing?.id;
  editor.close();
  editor.hidden = true;
  editing = null;
  image = null;
  dirty = false;
  $("#crop-preview").hidden = true;
  $("#current-image").hidden = true;
  $<HTMLFormElement>("#form").reset();
  document.querySelector("#conflict-notice")?.remove();
  scrollUnlock();
  if (editorOpener?.isConnected) editorOpener.focus();
  else {
    const target = returnId
      ? document.querySelector<HTMLButtonElement>(
          `[data-id="${CSS.escape(returnId)}"] button[aria-label="Изменить"]`,
        )
      : null;
    (target || $("#add")).focus();
  }
  editorOpener = null;
}
async function load() {
  const container = $("#objects");
  container.setAttribute("aria-busy", "true");
  $("#object-results").textContent = "Загрузка объектов…";
  $<HTMLButtonElement>("#add").disabled = true;
  $<HTMLButtonElement>("#reload").disabled = true;
  $(".admin-login").hidden = true;
  $("#workspace").hidden = false;
  $("#logout").hidden = false;
  $("#workspace-notice").hidden = true;
  container.replaceChildren(
    ...Array.from({ length: 3 }, () => {
      const n = el("div");
      n.className = "admin-card admin-skeleton";
      n.setAttribute("aria-label", "Загружаем объекты…");
      return n;
    }),
  );
  try {
    catalog = await api("/api/admin/catalog");
    render();
  } catch (error) {
    errors(error);
    $("#object-results").textContent = "Не удалось обновить список";
    const state = el("div");
    state.className = "admin-card admin-state";
    state.append(
      icon("reload"),
      el("h3", "Не удалось загрузить объекты"),
      el("p", "Проверьте соединение и попробуйте еще раз."),
    );
    const retry = el("button", "Повторить");
    retry.type = "button";
    retry.className = "admin-button admin-primary";
    retry.addEventListener("click", () => void load());
    state.append(retry);
    container.replaceChildren(state);
  } finally {
    container.setAttribute("aria-busy", "false");
    $<HTMLButtonElement>("#reload").disabled = false;
    $<HTMLButtonElement>("#add").disabled = !catalog;
  }
}
async function save(objects: Property[], trash: TrashItem[] = []) {
  if (busy) return false;
  busy = true;
  const buttons = [
    ...document.querySelectorAll<HTMLButtonElement>("button"),
  ].filter((b) => !b.disabled);
  buttons.forEach((b) => (b.disabled = true));
  const inputs = [
    ...editor.querySelectorAll<HTMLInputElement>("input:not(:disabled)"),
  ];
  inputs.forEach((input) => {
    input.disabled = true;
  });
  $("#object-save").textContent = "Сохраняем…";
  $("#object-save-status").textContent = "Сохраняем карточку…";
  $("#form").setAttribute("aria-busy", "true");
  const active = document.activeElement as HTMLElement,
    activeId = active.closest<HTMLElement>("[data-id]")?.dataset.id,
    activeAction = active.dataset.action;
  try {
    catalog = await api("/api/admin/catalog", "PUT", {
      baseRevision: catalog.revision,
      objects,
      trash,
    });
    render();
    $("#workspace-notice").hidden = true;
    if (!editor.open && activeId && activeAction)
      document
        .querySelector<HTMLButtonElement>(
          `[data-id="${CSS.escape(activeId)}"] [data-action="${activeAction}"]`,
        )
        ?.focus();
    message("Сохранено. Список объектов обновлен.");
    return true;
  } catch (e) {
    errors(e);
    return false;
  } finally {
    busy = false;
    buttons.filter((b) => b.isConnected).forEach((b) => (b.disabled = false));
    inputs.forEach((input) => {
      input.disabled = false;
    });
    $("#object-save").textContent = "Сохранить объект";
    $("#form").setAttribute("aria-busy", "false");
    if (editor.open) updateObjectPreview();
  }
}
// Build the canonical object from the form; returns issues for invalid input.
function collectProperty(): {
  property: Property | null;
  issues: FieldError[];
} {
  const issues: FieldError[] = [];
  const v = snapshot();
  const manualTitle = fieldValue("title");
  const draft = {
    kind: v.kind || "",
    rooms: numberOrNull("rooms"),
    area: numberOrNull("area"),
    floor: numberOrNull("floor"),
    floors: numberOrNull("floors"),
    landArea: numberOrNull("landArea"),
    settlement: v.settlement || "",
    settlementKind: v.settlementKind || "",
    street: v.street || "",
    streetKind: v.streetKind || (v.street ? "street" : ""),
    house: v.house || "",
    city: v.city || "",
    price: parseMoney(v.price),
    oldPrice: v.oldPrice ? parseMoney(v.oldPrice) : null,
    mortgage: v.mortgage || "",
  } as Property;
  for (const name of NUMBER_NAMES) {
    const raw = fieldValue(name);
    if (raw && Number.isNaN(numberOrNull(name)))
      issues.push({ path: name, message: "Введите число" });
  }
  if (!v.kind) {
    if (!editing || editing.kind)
      issues.push({ path: "kind", message: "Выберите тип объекта" });
    if (!manualTitle)
      issues.push({ path: "title", message: "Укажите название объекта" });
  }
  if (!draft.price || !Number.isFinite(draft.price))
    issues.push({ path: "price", message: "Укажите цену объекта" });
  if (v.oldPrice && !draft.oldPrice)
    issues.push({
      path: "oldPrice",
      message: "Укажите корректную старую цену",
    });
  const address = buildAddress(draft as Property);
  if (!address)
    issues.push({
      path: "settlement",
      message: "Укажите адрес: населенный пункт, улицу или дом",
    });
  if (!displayCities.includes(draft.city || ""))
    issues.push({ path: "city", message: "Выберите город отображения" });
  if (issues.length) return { property: null, issues };
  const title = draft.kind ? buildTitle(draft) : manualTitle;
  const property: Property = {
    id: editing?.id || crypto.randomUUID(),
    visible: image ? visible : false,
    image,
    kind: draft.kind || "",
    rooms: draft.kind === "flat" ? (draft.rooms ?? null) : null,
    area: draft.area ?? null,
    floor: draft.floor ?? null,
    floors: draft.floors ?? null,
    landArea: draft.landArea ?? null,
    settlement: draft.settlement || "",
    settlementKind: draft.settlementKind || "",
    street: draft.street || "",
    streetKind: draft.streetKind || "",
    house: draft.house || "",
    city: draft.city || displayCities[0],
    price: draft.price!,
    oldPrice: draft.oldPrice ?? null,
    mortgage: draft.mortgage || "",
    title,
    address,
  };
  return { property, issues };
}
async function saveCurrent(): Promise<boolean> {
  const { property, issues } = collectProperty();
  if (!property) {
    objectErrors(issues);
    return false;
  }
  clearObjectErrors();
  const objects = structuredClone(catalog.objects),
    trash = structuredClone(catalog.trash || []),
    index = objects.findIndex((o) => o.id === property.id);
  if (index < 0) objects.push(property);
  else objects[index] = property;
  const saved = await save(objects, trash);
  if (saved && !image && visible)
    message(
      "Объект сохранен, но не опубликован. Добавьте фотографию, чтобы разместить его на сайте.",
    );
  return saved;
}
function render() {
  if (!catalog) return;
  const container = $("#objects");
  container.replaceChildren();
  $("#search-label").hidden = false;
  $("#object-visible-count").textContent = String(
    catalog.objects.filter((item) => item.visible).length,
  );
  $("#object-hidden-count").textContent = String(
    catalog.objects.filter((item) => !item.visible).length,
  );
  $("#object-trash-count").textContent = String((catalog.trash || []).length);
  $("#object-count").textContent = String(catalog.objects.length);
  const query = $<HTMLInputElement>("#search").value.toLocaleLowerCase().trim();
  const trash = catalog.trash || [];
  if (objectFilter === "trash") {
    $("#object-results").textContent = trash.length
      ? `В корзине: ${trash.length}. Хранение — 30 дней.`
      : "Корзина пуста";
    if (!trash.length) {
      const state = el("div");
      state.className = "admin-card admin-state";
      state.append(
        icon("trash"),
        el("h3", "Корзина пуста"),
        el("p", "Удаленные объекты хранятся здесь 30 дней."),
      );
      container.append(state);
      return;
    }
    trash.forEach((item) => {
      if (
        ![item.title, item.address]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query)
      )
        return;
      const row = el("article");
      row.className = "admin-card admin-object is-hidden";
      row.dataset.id = item.id;
      const img = el("img");
      if (item.image) img.src = photoURL(item.image.small);
      img.alt = "";
      img.width = 144;
      img.height = 108;
      img.hidden = !item.image;
      row.append(img);
      const copy = el("div");
      copy.className = "admin-object-copy";
      copy.append(el("h3", item.title));
      const price = el("p");
      price.className = "admin-price";
      price.append(document.createTextNode(formatMoney(item.price)));
      copy.append(price);
      const address = el("p", item.address);
      address.className = "admin-address";
      copy.append(address);
      const daysLeft = Math.max(
        0,
        Math.ceil((item.deletedAt + TRASH_TTL - Date.now()) / 86400000),
      );
      const meta = el("div");
      meta.className = "admin-object-meta";
      const deleted = el(
        "span",
        "Удален " +
          new Date(item.deletedAt).toLocaleDateString("ru-RU") +
          " · осталось " +
          daysLeft +
          " дн.",
      );
      deleted.className = "admin-order";
      const status = el("span", "В корзине");
      status.className = "admin-status";
      meta.append(deleted, status);
      const footer = el("div");
      footer.className = "admin-object-footer";
      footer.append(meta);
      row.append(copy);
      const actions = el("div");
      actions.className = "admin-actions";
      actions.setAttribute("role", "group");
      actions.setAttribute("aria-label", "Действия: " + item.title);
      const action = (label: string, name: IconName, fn: () => void) => {
        const b = el("button");
        b.type = "button";
        b.className = "admin-icon-button" + (name === "trash" ? " danger" : "");
        b.setAttribute("aria-label", label);
        b.title = label;
        b.dataset.tooltip = label;
        b.dataset.action = name;
        b.append(icon(name));
        if (["edit", "eye", "eyeOff", "undo"].includes(name)) {
          b.classList.add("admin-action-label");
          b.append(el("span", label));
        }
        b.addEventListener("click", fn);
        actions.append(b);
      };
      const change = async (
        fn: () => { objects: Property[]; trash: TrashItem[] },
      ) => {
        const next = fn();
        await save(next.objects, next.trash);
      };
      action(
        "Восстановить",
        "undo",
        () =>
          void (async () => {
            const { deletedAt: _removed, ...rest } = item;
            await change(() => ({
              objects: [
                ...structuredClone(catalog.objects),
                { ...rest, visible: rest.image ? rest.visible : false },
              ],
              trash: structuredClone(catalog.trash || []).filter(
                (t) => t.id !== item.id,
              ),
            }));
            if (!row.isConnected) $("#add").focus();
          })(),
      );
      action(
        "Удалить навсегда",
        "trash",
        () =>
          void (async () => {
            if (
              await ask(
                "Удалить «" + item.title + "» навсегда?",
                "Объект будет удален без возможности восстановления.",
                "Удалить навсегда",
              )
            ) {
              await change(() => ({
                objects: structuredClone(catalog.objects),
                trash: structuredClone(catalog.trash || []).filter(
                  (t) => t.id !== item.id,
                ),
              }));
              if (!row.isConnected) $("#add").focus();
            }
          })(),
      );
      footer.append(actions);
      row.append(footer);
      container.append(row);
    });
    $("#object-results").textContent =
      `В корзине: ${trash.length}. Хранение — 30 дней.`;
    return;
  }
  if (!catalog.objects.length) {
    const state = el("div");
    state.className = "admin-card admin-state";
    state.append(
      icon("plus"),
      el("h3", "Пока нет объектов"),
      el("p", "Добавьте первый — он появится в подборке на сайте."),
    );
    const add = el("button");
    add.className = "admin-button admin-primary";
    add.type = "button";
    add.append(icon("plus"), document.createTextNode("Добавить объект"));
    add.addEventListener("click", () => edit(null));
    state.append(add);
    container.append(state);
  }
  let matches = 0;
  catalog.objects.forEach((p, index) => {
    if (
      ![p.title, p.address].join(" ").toLocaleLowerCase().includes(query) ||
      (objectFilter === "visible" && !p.visible) ||
      (objectFilter === "hidden" && p.visible)
    )
      return;
    matches++;
    const row = el("article");
    row.className = "admin-card admin-object" + (p.visible ? "" : " is-hidden");
    row.dataset.id = p.id;
    const img = el("img");
    if (p.image) img.src = photoURL(p.image.small);
    img.alt = "";
    img.width = 144;
    img.height = 108;
    img.hidden = !p.image;
    row.append(img);
    const copy = el("div");
    copy.className = "admin-object-copy";
    copy.append(el("h3", p.title));
    const price = el("p");
    price.className = "admin-price";
    price.append(document.createTextNode(formatMoney(p.price)));
    if (p.oldPrice) price.append(el("del", formatMoney(p.oldPrice)));
    copy.append(price);
    const address = el("p", p.address);
    address.className = "admin-address";
    copy.append(address);
    const status = el(
      "span",
      p.visible && p.image
        ? "На сайте"
        : p.image
          ? "Скрыт с сайта"
          : "Черновик",
    );
    status.className = "admin-status";
    const footer = el("div");
    footer.className = "admin-object-footer";
    const meta = el("div");
    meta.className = "admin-object-meta";
    const order = el("span", "№ " + String(index + 1).padStart(2, "0"));
    order.className = "admin-order";
    meta.append(order, status);
    footer.append(meta);
    row.append(copy);
    const actions = el("div");
    actions.className = "admin-actions";
    actions.setAttribute("role", "group");
    actions.setAttribute("aria-label", "Действия: " + p.title);
    const action = (
      label: string,
      name: IconName,
      fn: () => void,
      disabled = false,
    ) => {
      const b = el("button");
      b.type = "button";
      b.className = "admin-icon-button" + (name === "trash" ? " danger" : "");
      b.setAttribute("aria-label", label);
      b.title = label;
      b.dataset.tooltip = label;
      b.dataset.action = name;
      b.disabled = disabled;
      b.append(icon(name));
      if (["edit", "eye", "eyeOff"].includes(name)) {
        b.classList.add("admin-action-label");
        b.append(el("span", label));
      }
      b.addEventListener("click", fn);
      actions.append(b);
    };
    const change = async (
      fn: (objects: Property[], trash: TrashItem[]) => void,
    ) => {
      const objects = structuredClone(catalog.objects);
      const trash = structuredClone(catalog.trash || []);
      fn(objects, trash);
      await save(objects, trash);
    };
    action("Изменить", "edit", () => edit(p));
    action(
      p.visible ? "Скрыть" : "Показать",
      p.visible ? "eyeOff" : "eye",
      () =>
        void change((objects) => {
          objects[index].visible = !p.visible && !!p.image;
        }),
    );
    for (const [label, delta, name] of [
      ["Выше", -1, "up"],
      ["Ниже", 1, "down"],
    ] as const)
      action(
        label,
        name,
        () =>
          void change((objects) => {
            [objects[index], objects[index + delta]] = [
              objects[index + delta],
              objects[index],
            ];
          }),
        index + delta < 0 || index + delta >= catalog.objects.length,
      );
    action(
      "Удалить",
      "trash",
      () =>
        void (async () => {
          if (
            await ask(
              "Удалить «" + p.title + "»?",
              "Объект переместится в корзину и будет храниться там 30 дней. Его можно восстановить.",
              "В корзину",
            )
          ) {
            await change((objects, trash) => {
              trash.push({
                ...structuredClone(objects[index]),
                deletedAt: Date.now(),
              });
              objects.splice(index, 1);
            });
            if (!row.isConnected) $("#add").focus();
          }
        })(),
    );
    footer.append(actions);
    row.append(footer);
    container.append(row);
  });
  if (catalog.objects.length && !matches) {
    const state = el("div");
    state.className = "admin-card admin-state";
    state.append(
      icon("search"),
      el("h3", "Ничего не найдено"),
      el("p", "Попробуйте другой запрос или выберите «Все»."),
    );
    const reset = el("button", "Сбросить поиск и фильтр");
    reset.className = "admin-button admin-secondary";
    reset.type = "button";
    reset.addEventListener("click", () => {
      $<HTMLInputElement>("#search").value = "";
      objectFilter = "all";
      updateFilters();
      render();
    });
    state.append(reset);
    container.append(state);
  }
  $("#object-results").textContent =
    query || objectFilter !== "all"
      ? `Найдено: ${matches} из ${catalog.objects.length}`
      : `Всего объектов: ${catalog.objects.length}`;
}
function edit(property: Property | null) {
  if (photoPromise) {
    message("Дождитесь подготовки фотографии");
    return;
  }
  editing = property ? structuredClone(property) : null;
  image = editing?.image || null;
  visible = editing ? editing.visible : false;
  dirty = false;
  const form = $<HTMLFormElement>("#form");
  form.reset();
  for (const input of form.querySelectorAll<
    HTMLInputElement | HTMLSelectElement
  >("#fields input,#fields select,#fields textarea")) {
    const name = input.name;
    if (!name) continue;
    if (name === "title") input.value = editing?.title || "";
    else if (NUMBER_NAMES.has(name)) {
      const n = editing?.[name as keyof Property];
      input.value =
        n === null || n === undefined ? "" : String(n).replace(".", ",");
    } else if (MONEY_NAMES.has(name)) {
      const n = editing?.[name as keyof Property];
      input.value = typeof n === "number" && n > 0 ? String(n) : "";
    } else {
      const v = editing?.[name as keyof Property];
      input.value = typeof v === "string" ? v : "";
    }
  }
  document
    .querySelectorAll<HTMLElement>("[data-field]")
    .forEach((n) => (n.textContent = ""));
  document
    .querySelectorAll("input[aria-invalid]")
    .forEach((n) => n.removeAttribute("aria-invalid"));
  $("#object-visible").setAttribute("aria-checked", String(visible));
  $("#crop-preview").hidden = true;
  $("#current-image").hidden = !image;
  if (image) $<HTMLImageElement>("#current-image").src = photoURL(image.large);
  clearObjectErrors();
  $("#image-status").textContent =
    "Фото будет обрезано по центру в формате 4:3. Можно выбрать файл или вставить изображение из буфера обмена.";
  updateObjectPreview();
  $("#edit-title").textContent = editing ? "Изменить объект" : "Новый объект";
  editorOpener = document.activeElement as HTMLElement;
  editor.hidden = false;
  scrollLock();
  editor.showModal();
  editor.scrollTop = 0;
  $("#edit-title").focus();
}
// Build the field inputs once; conditional fields toggle via data-conditional.
for (const def of FIELD_DEFS) {
  const wrapper = el("label", def.label + (def.required ? " *" : "")),
    input = document.createElement(
      def.kind === "select" ? "select" : "input",
    ) as HTMLInputElement | HTMLSelectElement;
  input.name = def.name;
  input.id = "object-" + def.name;
  if (def.kind === "select") {
    for (const [value, label] of def.options || []) {
      const option = el("option", label);
      option.value = value;
      (input as HTMLSelectElement).append(option);
    }
  } else {
    const textInput = input as HTMLInputElement;
    textInput.placeholder = def.placeholder || "";
    if (def.kind === "number") {
      textInput.inputMode = "decimal";
      textInput.autocomplete = "off";
    }
    if (def.kind === "money") {
      textInput.inputMode = "decimal";
      let initial = "";
      textInput.addEventListener("focus", () => {
        initial = textInput.value;
        textInput.value = priceForEditing(textInput.value);
      });
      textInput.addEventListener("blur", () => {
        textInput.value = formatPrice(textInput.value);
        if (textInput.value !== initial) dirty = true;
        updateObjectPreview();
      });
    }
    if (def.name === "title") textInput.maxLength = 160;
    if (def.name === "mortgage") textInput.maxLength = 100;
  }
  const help = el("small", def.hint || "");
  help.className = "admin-field-hint";
  help.id = "hint-" + def.name;
  input.setAttribute(
    "aria-describedby",
    "hint-" + def.name + " error-" + def.name,
  );
  const error = el("span");
  error.className = "field-error";
  error.dataset.field = def.name;
  error.id = "error-" + def.name;
  wrapper.append(input, help, error);
  if (def.when) wrapper.dataset.conditional = def.name;
  $("#fields").append(wrapper);
}
// Legacy objects without a parsed kind keep a manual title field.
{
  const wrapper = el("label", "Название (свой вариант)"),
    input = el("input");
  input.name = "title";
  input.id = "object-title";
  input.maxLength = 160;
  input.placeholder = "Название объекта";
  const help = el("small", "Видно только если тип объекта не определен.");
  help.className = "admin-field-hint";
  help.id = "hint-title";
  const error = el("span");
  error.className = "field-error";
  error.dataset.field = "title";
  error.id = "error-title";
  wrapper.append(input, help, error);
  wrapper.dataset.conditional = "kind";
  wrapper.id = "field-title-manual";
  $("#fields").append(wrapper);
}
$("#form").addEventListener("input", (event) => {
  dirty = true;
  const input = event.target as HTMLInputElement;
  if (input.name && input.value.trim()) {
    input.removeAttribute("aria-invalid");
    const error = document.querySelector(`[data-field="${input.name}"]`);
    if (error) error.textContent = "";
    refreshObjectErrorSummary();
  }
  updateObjectPreview();
});
$("#form").addEventListener("change", () => updateObjectPreview());
$("#object-visible").addEventListener("click", () => {
  const next = !visible;
  if (next && !image) {
    const slot = document.querySelector<HTMLElement>(
      '#form [data-field="image"]',
    );
    if (slot) slot.textContent = "Сначала загрузите фотографию";
    $("#image-file").setAttribute("aria-invalid", "true");
    $("#visibility-help").textContent =
      "Публикация требует фотографию. Добавьте фото, затем включите показ на сайте.";
    return;
  }
  visible = next;
  $("#object-visible").setAttribute("aria-checked", String(visible));
  dirty = true;
  updateObjectPreview();
});
$("#image-file").setAttribute("aria-describedby", "error-image");
async function uploadPhoto(file: File) {
  if (photoPromise) {
    message("Дождитесь подготовки предыдущей фотографии", true);
    return;
  }
  const previousImage = image;
  const fileInput = $<HTMLInputElement>("#image-file");
  fileInput.disabled = true;
  $<HTMLButtonElement>("#object-save").disabled = true;
  $("#image-status").textContent = "Подготавливаем и загружаем фотографию…";
  $("#error-image").textContent = "";
  fileInput.removeAttribute("aria-invalid");
  $("#crop-preview").hidden = true;
  dirty = true;
  photoPromise = (async () => {
    try {
      const blobs = await preparePhoto(
        file,
        $<HTMLCanvasElement>("#crop-preview"),
      );
      $("#current-image").hidden = false;
      $<HTMLImageElement>("#current-image").src =
        $<HTMLCanvasElement>("#crop-preview").toDataURL("image/webp");
      updateObjectPreview();
      const results = [];
      for (const blob of blobs) {
        const response = await fetch(base + "/api/admin/media", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/octet-stream",
            "X-Admin-CSRF": csrf,
          },
          body: blob,
        });
        const data = await response.json();
        if (!response.ok)
          throw Error(data.error?.message || "Фото не загружено");
        results.push(data);
      }
      image = { small: results[0].src, large: results[1].src };
      dirty = true;
      $("#error-image").textContent = "";
      refreshObjectErrorSummary();
      $("#image-status").textContent =
        "Фотография готова. Проверьте кадр в предпросмотре и сохраните объект.";
      updateObjectPreview();
    } catch (e) {
      image = previousImage;
      $("#current-image").hidden = !image;
      if (image)
        $<HTMLImageElement>("#current-image").src = photoURL(image.large);
      updateObjectPreview();
      $("#error-image").textContent = (e as Error).message;
      fileInput.setAttribute("aria-invalid", "true");
      $("#image-status").textContent = previousImage
        ? "Предыдущее фото сохранено. Выберите другой файл, чтобы заменить его."
        : "Выберите другую фотографию.";
    } finally {
      photoPromise = null;
      fileInput.disabled = false;
      fileInput.value = "";
      $<HTMLButtonElement>("#object-save").disabled = false;
    }
  })();
}
$("#image-file").addEventListener("change", () => {
  const file = $<HTMLInputElement>("#image-file").files?.[0];
  if (file) void uploadPhoto(file);
});
$("#form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  if (photoPromise) {
    message("Дождитесь подготовки фотографии", true);
    return;
  }
  if (await saveCurrent()) closeEditor();
});
$("#add").addEventListener("click", () => edit(null));
for (const selector of ["#cancel", "#editor-close"])
  $(selector).addEventListener("click", () => void requestClose());
function updateFilters() {
  document
    .querySelectorAll<HTMLButtonElement>("[data-object-filter]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.objectFilter === objectFilter),
      ),
    );
}
document
  .querySelectorAll<HTMLButtonElement>("[data-object-filter]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      objectFilter = button.dataset.objectFilter!;
      updateFilters();
      render();
    }),
  );
$("#password-toggle").addEventListener("click", () => {
  const input = $<HTMLInputElement>("#login-password");
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  const toggle = $<HTMLButtonElement>("#password-toggle");
  const label = show ? "Скрыть пароль" : "Показать пароль";
  toggle.setAttribute("aria-pressed", String(show));
  toggle.setAttribute("aria-label", label);
  toggle.title = label;
});
$("#search").addEventListener("input", render);
$("#reload").addEventListener("click", () => void load());
$("#login").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = $<HTMLFormElement>("#login"),
    b = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
  b.disabled = true;
  b.querySelector("span")!.textContent = "Входим…";
  $("#login-notice").hidden = true;
  try {
    const session = await api("/api/admin/session", "POST", {
      username: (form.elements.namedItem("username") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    });
    csrf = session.csrfToken;
    await load();
    if (resumeObject) {
      resumeObject = false;
      editor.hidden = false;
      scrollLock();
      editor.showModal();
      $("#object-error-summary").hidden = true;
      updateObjectPreview();
      $("#object-save-status").textContent =
        "Вход восстановлен. Ваши несохраненные изменения остались в редакторе.";
    }
  } catch (e) {
    errors(e);
  } finally {
    (form.elements.namedItem("password") as HTMLInputElement).value = "";
    b.disabled = false;
    b.querySelector("span")!.textContent = "Войти в админку";
  }
});
const contentEditor = createContentEditor(api, ask, errors);
for (const tab of ["objects", "texts"])
  $("#tab-" + tab).addEventListener("click", () => {
    dismissMessage();
    $("#workspace-notice").hidden = true;
  });
$("#logout").addEventListener("click", async () => {
  if (photoPromise || busy || contentEditor.busy) return;
  if (
    (dirty || contentEditor.dirty) &&
    !(await ask(
      "Выйти без сохранения?",
      "Несохраненные изменения будут потеряны.",
      "Выйти",
    ))
  )
    return;
  try {
    await api("/api/admin/session", "DELETE");
    csrf = "";
    contentEditor.clear();
    closeEditor();
    $("#objects").replaceChildren();
    $("#workspace").hidden = true;
    $("#logout").hidden = true;
    $(".admin-login").hidden = false;
    message("Вы вышли из админки.");
  } catch (e) {
    errors(e);
  }
});
window.addEventListener("beforeunload", (event) => {
  if (dirty || contentEditor.dirty || contentEditor.busy)
    event.preventDefault();
});
window.addEventListener("keydown", (event) => {
  if (
    editor.open &&
    !confirmation.open &&
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    event.key.toLowerCase() === "s"
  ) {
    event.preventDefault();
    if (!busy && !photoPromise) $<HTMLFormElement>("#form").requestSubmit();
  }
});
void (async () => {
  try {
    const session = await api("/api/admin/session");
    csrf = session.csrfToken;
    await load();
  } catch (error) {
    if ((error as APIError).status !== 401) errors(error);
  }
})();
