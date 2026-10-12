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
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text = "") => {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
};
let toastTimer: ReturnType<typeof setTimeout>;
function message(text: string, error = false) {
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
  if (!$(".admin-login").hidden) {
    const notice = $("#login-notice");
    notice.hidden = false;
    notice.textContent = text;
  }
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
        'button:not(:disabled),input:not(:disabled),a[href],[tabindex="0"]',
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
  for (const node of document.querySelectorAll<HTMLElement>("[data-field]"))
    node.textContent = "";
  for (const node of document.querySelectorAll("input[aria-invalid]"))
    node.removeAttribute("aria-invalid");
  for (const field of e.fields || []) {
    const name = field.path.replace(/^objects\.\d+\./, "").split(".")[0];
    const slot = document.querySelector<HTMLElement>(`[data-field="${name}"]`);
    if (slot) slot.textContent = field.message;
    const input = document.querySelector<HTMLInputElement>(
      `#form [name="${name}"]`,
    );
    input?.setAttribute("aria-invalid", "true");
  }
  message(
    e instanceof TypeError
      ? "Нет связи с сервером. Попробуйте ещё раз."
      : e.message || "Нет связи с сервером",
    true,
  );
  document
    .querySelector<HTMLInputElement>("#form [aria-invalid=true]")
    ?.focus();
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
    closeEditor();
    $("#workspace").hidden = true;
    $(".admin-login").hidden = false;
    $("#logout").hidden = true;
    csrf = "";
  }
}
function photoURL(value: string) {
  if (value === "/assets/da35e.webp") return value;
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
  $<HTMLButtonElement>("#add").disabled = true;
  $<HTMLButtonElement>("#reload").disabled = true;
  $(".admin-login").hidden = true;
  $("#workspace").hidden = false;
  $("#logout").hidden = false;
  container.replaceChildren(
    ...Array.from({ length: 3 }, () => {
      const n = el("div");
      n.className = "paper admin-skeleton";
      n.setAttribute("aria-label", "Загружаем объекты…");
      return n;
    }),
  );
  try {
    catalog = await api("/api/admin/catalog");
    render();
  } catch (error) {
    errors(error);
    const state = el("div");
    state.className = "paper admin-state";
    state.append(
      icon("reload"),
      el("h3", "Не удалось загрузить объекты"),
      el("p", "Проверьте соединение и попробуйте ещё раз."),
    );
    const retry = el("button", "Повторить");
    retry.type = "button";
    retry.className = "button red";
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
  const active = document.activeElement as HTMLElement,
    activeId = active.closest<HTMLElement>("[data-id]")?.dataset.id,
    activeAction = active.dataset.action;
  try {
    catalog = await api("/api/admin/catalog", "PUT", {
      baseRevision: catalog.revision,
      objects,
    });
    render();
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
  }
}
function render() {
  const container = $("#objects");
  container.replaceChildren();
  $("#search-label").hidden = catalog.objects.length <= 12;
  $("#object-count").textContent = String(catalog.objects.length);
  const query = $<HTMLInputElement>("#search").value.toLocaleLowerCase().trim();
  if (!catalog.objects.length) {
    const state = el("div");
    state.className = "paper admin-state";
    state.append(
      icon("plus"),
      el("h3", "Пока нет объектов"),
      el("p", "Добавьте первый — он появится в подборке на сайте."),
    );
    const add = el("button");
    add.className = "button red";
    add.type = "button";
    add.append(icon("plus"), document.createTextNode("Добавить объект"));
    add.addEventListener("click", () => edit(null));
    state.append(add);
    container.append(state);
  }
  let matches = 0;
  catalog.objects.forEach((p, index) => {
    if (
      catalog.objects.length > 12 &&
      !p.title.toLocaleLowerCase().includes(query)
    )
      return;
    matches++;
    const row = el("article");
    row.className = "paper admin-object" + (p.visible ? "" : " is-hidden");
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
    const status = el("span", p.visible ? "Показывается" : "Скрыта");
    status.className = "admin-status";
    copy.append(status);
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
    row.append(actions);
    container.append(row);
  });
  if (catalog.objects.length && !matches) {
    const state = el("div");
    state.className = "paper admin-state";
    state.append(
      icon("search"),
      el("h3", "Ничего не найдено"),
      el("p", "Попробуйте другое название."),
    );
    container.append(state);
  }
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
  const group = $("[data-choice-group]");
  group.querySelectorAll<HTMLButtonElement>("button").forEach((b, i) => {
    b.classList.toggle("selected", i === (visible ? 0 : 1));
    b.setAttribute("aria-pressed", String(i === (visible ? 0 : 1)));
  });
  $("#crop-preview").hidden = true;
  $("#current-image").hidden = !image;
  if (image) $<HTMLImageElement>("#current-image").src = photoURL(image.large);
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
  input.maxLength = limits[name as keyof typeof limits];
  input.required = ["title", "address", "price"].includes(name);
  input.setAttribute("aria-describedby", "error-" + name);
  const error = el("span");
  error.className = "field-error";
  error.dataset.field = name;
  error.id = "error-" + name;
  wrapper.append(input, error);
  $("#fields").append(wrapper);
}
$("#form").addEventListener("input", () => {
  dirty = true;
});
const choiceGroup = $("[data-choice-group]");
choiceGroup.querySelectorAll<HTMLButtonElement>("button").forEach((button) =>
  button.addEventListener("click", () => {
    choiceGroup.querySelectorAll("button").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    visible = button.dataset.value === "Показывать";
    dirty = true;
  }),
);
$("#image-file").setAttribute("aria-describedby", "error-image");
$("#image-file").addEventListener("change", () => {
  const file = $<HTMLInputElement>("#image-file").files?.[0];
  if (!file) return;
  image = null;
  $("#crop-preview").hidden = true;
  dirty = true;
  photoPromise = (async () => {
    try {
      const blobs = await preparePhoto(
        file,
        $<HTMLCanvasElement>("#crop-preview"),
      );
      $("#crop-preview").hidden = false;
      $("#current-image").hidden = true;
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
      message("Фото готово. Проверьте кадр и сохраните карточку.");
    } catch (e) {
      $("#error-image").textContent = (e as Error).message;
      message("Фото не загружено", true);
    } finally {
      photoPromise = null;
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
  if (!image) {
    $("#error-image").textContent = "Выберите фотографию";
    $<HTMLInputElement>("#image-file").focus();
    return;
  }
  const form = $<HTMLFormElement>("#form"),
    p = { id: editing?.id || crypto.randomUUID(), visible, image } as Property;
  for (const name of Object.keys(labels))
    p[name as keyof typeof labels] = (
      form.elements.namedItem(name) as HTMLInputElement
    ).value;
  const objects = structuredClone(catalog.objects),
    index = objects.findIndex((o) => o.id === p.id);
  if (index < 0) objects.push(p);
  else objects[index] = p;
  if (await save(objects)) closeEditor();
});
$("#add").addEventListener("click", () => edit(null));
for (const selector of ["#cancel", "#editor-close"])
  $(selector).addEventListener("click", () => void requestClose());
$("#search").addEventListener("input", render);
$("#reload").addEventListener("click", () => void load());
$("#login").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = $<HTMLFormElement>("#login"),
    b = form.querySelector("button")!;
  b.disabled = true;
  try {
    const session = await api("/api/admin/session", "POST", {
      username: (form.elements.namedItem("username") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    });
    csrf = session.csrfToken;
    await load();
  } catch (e) {
    errors(e);
  } finally {
    (form.elements.namedItem("password") as HTMLInputElement).value = "";
    b.disabled = false;
  }
});
$("#logout").addEventListener("click", async () => {
  if (photoPromise || busy) return;
  if (
    dirty &&
    !(await ask(
      "Выйти без сохранения?",
      "Изменения в карточке будут потеряны.",
      "Выйти",
    ))
  )
    return;
  try {
    await api("/api/admin/session", "DELETE");
    csrf = "";
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
$("#recovery").addEventListener("click", async () => {
  // Open from the click event so popup blocking does not hide the bot link.
  const win = window.open("about:blank", "_blank");
  if (win) win.opener = null;
  const button = $<HTMLButtonElement>("#recovery");
  button.disabled = true;
  try {
    const result = await api("/api/admin/recovery/start", "POST", {});
    const url = new URL(result.url);
    if (url.origin !== "https://t.me")
      throw Error("Не удалось открыть Telegram");
    const link = $<HTMLAnchorElement>("#recovery-link");
    link.href = url.href;
    link.hidden = false;
    if (win) win.location.href = url.href;
    message(
      "Откройте Telegram и отправьте запрос доступа. Ссылка действует 10 минут; выдачу одобряет администратор.",
    );
  } catch (e) {
    win?.close();
    errors(e);
  } finally {
    button.disabled = false;
  }
});
window.addEventListener("beforeunload", (event) => {
  if (dirty) event.preventDefault();
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
