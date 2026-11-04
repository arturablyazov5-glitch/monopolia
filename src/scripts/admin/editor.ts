import { formatPrice, priceForEditing } from "./price-format";
import { createContentEditor } from "./content-editor";
import type {
  Catalog,
  Property,
  Image,
  FieldError,
} from "../../lib/catalog-schema.mjs";
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
const labels = {
  title: "Заголовок",
  address: "Адрес",
  price: "Цена",
  oldPrice: "Старая цена",
  pricePerMeter: "Цена за метр",
  mortgage: "Ипотека в месяц",
  discount: "Скидка",
};
const limits = {
  title: 100,
  address: 160,
  price: 32,
  oldPrice: 32,
  pricePerMeter: 40,
  mortgage: 100,
  discount: 8,
};
const fieldHints: Record<keyof typeof labels, [string, string]> = {
  title: [
    "Например: 2-комнатная квартира, 52 м²",
    "Тип объекта, площадь и этаж — коротко и по делу.",
  ],
  address: [
    "Город, улица, дом",
    "Укажите город, чтобы посетитель понял расположение.",
  ],
  price: ["5 950 000 ₽", "Полная стоимость объекта с валютой."],
  oldPrice: ["6 400 000 ₽", "Необязательно. Будет показана зачёркнутой."],
  pricePerMeter: ["114 423 ₽/м²", "Необязательно. Цена за квадратный метр."],
  mortgage: [
    "от 35 000 ₽/мес.",
    "Необязательно. Подпись об ипотечном платеже.",
  ],
  discount: ["−7%", "Необязательно. Короткая отметка на фото."],
};
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
  // Keep the remaining error links accurate without moving focus while typing.
  objectErrors(fields, false);
}
function updateObjectPreview() {
  const form = $<HTMLFormElement>("#form");
  const read = (name: keyof typeof labels) => {
    const text = (
      form.elements.namedItem(name) as HTMLInputElement
    ).value.trim();
    return ["price", "oldPrice", "pricePerMeter"].includes(name)
      ? formatPrice(text, name === "pricePerMeter")
      : text;
  };
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
      "#preview-" +
        name.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase()),
    );
    const value = read(name);
    target.textContent = value || fallback;
    target.hidden = !fallback && !value;
  }
  $("#preview-photo-placeholder").hidden = !$("#current-image").hidden;
  $("#visibility-help").textContent = visible
    ? "После сохранения карточка появится на сайте."
    : "Карточка останется в админке. Посетители её не увидят.";
  $("#object-save-status").textContent = dirty
    ? "Есть несохранённые изменения"
    : editing
      ? "Карточка сохранена. Можно внести изменения."
      : "Изменения ещё не сохранены";
}
const editor = $<HTMLDialogElement>("#editor"),
  confirmation = $<HTMLDialogElement>("#confirmation");
let editorOpener: HTMLElement | null = null,
  confirmOpener: HTMLElement | null = null,
  confirmResolve: ((value: boolean) => void) | null = null;
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
function ask(
  title: string,
  description: string,
  label: string,
): Promise<boolean> {
  $("#confirm-title").textContent = title;
  $("#confirm-description").textContent = description;
  $("#confirm-ok").textContent = label;
  confirmOpener = document.activeElement as HTMLElement;
  scrollLock();
  confirmation.showModal();
  $("#confirm-cancel").focus();
  return new Promise((resolve) => {
    confirmResolve = resolve;
  });
}
function answer(value: boolean) {
  confirmation.close();
  const resolve = confirmResolve;
  confirmResolve = null;
  confirmOpener?.focus();
  scrollUnlock();
  resolve?.(value);
}
$("#confirm-ok").addEventListener("click", () => answer(true));
for (const selector of ["#confirm-cancel", "#confirm-close"])
  $(selector).addEventListener("click", () => answer(false));
confirmation.addEventListener("cancel", (event) => {
  event.preventDefault();
  answer(false);
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
  if (outside(event, confirmation)) answer(false);
});
async function requestClose() {
  if (busy || photoPromise) {
    message("Дождитесь завершения операции", true);
    return;
  }
  if (
    !dirty ||
    (await ask(
      "Закрыть без сохранения?",
      "Изменения в карточке будут потеряны.",
      "Закрыть",
    ))
  )
    closeEditor();
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
      ? "Нет связи с сервером. Ваши поля сохранены в редакторе. Попробуйте ещё раз."
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
        "Каталог изменён в другой вкладке. Ваши поля сохранены. Получите свежую версию перед повторным сохранением.",
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
        message("Список обновлён. Проверьте поля и сохраните карточку.");
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
      el("p", "Проверьте соединение и попробуйте ещё раз."),
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
async function save(objects: Property[]) {
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
    });
    render();
    $("#workspace-notice").hidden = true;
    if (!editor.open && activeId && activeAction)
      document
        .querySelector<HTMLButtonElement>(
          `[data-id="${CSS.escape(activeId)}"] [data-action="${activeAction}"]`,
        )
        ?.focus();
    message("Сохранено. Список объектов обновлён.");
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
  $("#object-count").textContent = String(catalog.objects.length);
  const query = $<HTMLInputElement>("#search").value.toLocaleLowerCase().trim();
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
    img.src = photoURL(p.image.small);
    img.alt = "";
    img.width = 144;
    img.height = 108;
    row.append(img);
    const copy = el("div");
    copy.className = "admin-object-copy";
    copy.append(el("h3", p.title));
    const price = el("p");
    price.className = "admin-price";
    price.append(document.createTextNode(p.price));
    if (p.oldPrice) price.append(el("del", p.oldPrice));
    copy.append(price);
    const address = el("p", p.address);
    address.className = "admin-address";
    copy.append(address);
    const status = el("span", p.visible ? "На сайте" : "Скрыт с сайта");
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
    const change = async (fn: (objects: Property[]) => void) => {
      const objects = structuredClone(catalog.objects);
      fn(objects);
      await save(objects);
    };
    action("Изменить", "edit", () => edit(p));
    action(
      p.visible ? "Скрыть" : "Показать",
      p.visible ? "eyeOff" : "eye",
      () =>
        void change((objects) => {
          objects[index].visible = !p.visible;
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
              "Это действие нельзя отменить.",
              "Удалить",
            )
          ) {
            await change((objects) => {
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
  visible = editing?.visible ?? true;
  dirty = false;
  const form = $<HTMLFormElement>("#form");
  form.reset();
  for (const [name] of Object.entries(labels))
    (form.elements.namedItem(name) as HTMLInputElement).value =
      editing?.[name as keyof typeof labels] || "";
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
    "Фото будет обрезано по центру в формате 4:3. Проверьте кадр в предпросмотре.";
  updateObjectPreview();
  $("#edit-title").textContent = editing ? "Изменить объект" : "Новый объект";
  editorOpener = document.activeElement as HTMLElement;
  editor.hidden = false;
  scrollLock();
  editor.showModal();
  editor.scrollTop = 0;
  $("#edit-title").focus();
}
for (const [name, label] of Object.entries(labels)) {
  const wrapper = el(
      "label",
      label + (["title", "address", "price"].includes(name) ? " *" : ""),
    ),
    input = el("input");
  input.name = name;
  if (["price", "oldPrice", "pricePerMeter"].includes(name)) {
    input.inputMode = "decimal";
    let initial = "";
    input.addEventListener("focus", () => {
      initial = input.value;
      input.value = priceForEditing(input.value);
    });
    input.addEventListener("blur", () => {
      input.value = formatPrice(input.value, name === "pricePerMeter");
      if (input.value !== initial) dirty = true;
      updateObjectPreview();
    });
  }
  input.id = "object-" + name;
  const [placeholder, hint] = fieldHints[name as keyof typeof labels];
  input.placeholder = placeholder;
  const help = el("small", hint);
  help.className = "admin-field-hint";
  help.id = "hint-" + name;
  input.maxLength = limits[name as keyof typeof limits];
  input.required = ["title", "address", "price"].includes(name);
  input.setAttribute("aria-describedby", "hint-" + name + " error-" + name);
  const error = el("span");
  error.className = "field-error";
  error.dataset.field = name;
  error.id = "error-" + name;
  wrapper.append(input, help, error);
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
$("#object-visible").addEventListener("click", () => {
  visible = !visible;
  $("#object-visible").setAttribute("aria-checked", String(visible));
  dirty = true;
  updateObjectPreview();
});
$("#image-file").setAttribute("aria-describedby", "error-image");
$("#image-file").addEventListener("change", () => {
  const file = $<HTMLInputElement>("#image-file").files?.[0];
  if (!file) return;
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
});
$("#form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  if (photoPromise) {
    message("Дождитесь подготовки фотографии", true);
    return;
  }
  const issues: FieldError[] = [];
  for (const name of ["title", "address", "price"] as const) {
    const input = document.querySelector<HTMLInputElement>(
      `#form [name="${name}"]`,
    )!;
    if (!input.value.trim())
      issues.push({
        path: name,
        message: {
          title: "Укажите название объекта",
          address: "Укажите адрес объекта",
          price: "Укажите цену объекта",
        }[name],
      });
  }
  if (!image)
    issues.push({ path: "image", message: "Выберите фотографию объекта" });
  if (issues.length) {
    objectErrors(issues);
    return;
  }
  clearObjectErrors();
  for (const name of ["price", "oldPrice", "pricePerMeter"]) {
    const input = document.querySelector<HTMLInputElement>(
      `#form [name="${name}"]`,
    )!;
    input.value = formatPrice(input.value, name === "pricePerMeter");
  }
  const form = $<HTMLFormElement>("#form"),
    p = { id: editing?.id || crypto.randomUUID(), visible, image } as Property;
  for (const name of Object.keys(labels))
    p[name as keyof typeof labels] = (
      form.elements.namedItem(name) as HTMLInputElement
    ).value.trim();
  const objects = structuredClone(catalog.objects),
    index = objects.findIndex((o) => o.id === p.id);
  if (index < 0) objects.push(p);
  else objects[index] = p;
  if (await save(objects)) closeEditor();
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
        "Вход восстановлен. Ваши несохранённые изменения остались в редакторе.";
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
      "Несохранённые изменения будут потеряны.",
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
