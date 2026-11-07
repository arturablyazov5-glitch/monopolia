import { referralHeadingPrefix } from "../referral-bonus.mjs";
import type { SiteText } from "../../data/site-texts.mjs";
const $ = <T extends HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
interface PreviewOptions {
  items: () => SiteText[];
  value: (item: SiteText) => string;
  select: (id: string, common: boolean) => void;
  save: () => void;
}
export function createContentPreview(options: PreviewOptions) {
  const frame = $<HTMLIFrameElement>("#content-preview-frame");
  const viewport = $<HTMLDivElement>("#content-preview-viewport");
  const status = $<HTMLParagraphElement>("#content-preview-status");
  const retry = $<HTMLButtonElement>("#content-preview-retry");
  let width = window.innerWidth < 768 ? 390 : 1440,
    path = "",
    selected = "",
    doc: Document | null = null;
  let observer: MutationObserver | null = null,
    timer: ReturnType<typeof setTimeout> | undefined;
  let whitespace = new WeakMap<Text, { before: string; after: string }>();
  let hovered: HTMLElement | null = null,
    applyQueued = false;
  function size() {
    const available = viewport.clientWidth;
    if (!available) return;
    const scale = Math.min(1, available / width);
    frame.style.width = width + "px";
    frame.style.marginLeft =
      Math.max(0, (available - width * scale) / 2) + "px";
    frame.style.height = Math.ceil(viewport.clientHeight / scale) + "px";
    frame.style.transform = `scale(${scale})`;
    $<HTMLElement>("#content-preview-size").textContent = width + " px";
    document
      .querySelectorAll<HTMLButtonElement>("[data-preview-width]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(Number(button.dataset.previewWidth) === width),
        ),
      );
  }
  new ResizeObserver(size).observe(viewport);
  function nodes(id: string) {
    return [
      ...(doc?.querySelectorAll<HTMLElement>("[data-content-id]") || []),
    ].filter((node) => node.dataset.contentId?.split(" ").includes(id));
  }
  function reveal(node: HTMLElement) {
    for (
      let parent: HTMLElement | null = node;
      parent && parent !== doc?.body;
      parent = parent.parentElement
    ) {
      if (parent.hidden) parent.hidden = false;
      parent.removeAttribute("inert");
      if (parent.classList.contains("faq-answer")) {
        parent.classList.remove("is-closed");
        doc
          ?.querySelector(`[aria-controls="${CSS.escape(parent.id)}"]`)
          ?.setAttribute("aria-expanded", "true");
      }
      if (parent.tagName === "DIALOG" && !parent.hasAttribute("open"))
        (parent as HTMLDialogElement).show();
    }
    if (node.closest(".site-header"))
      node.closest(".site-header")?.classList.add("menu-open");
  }
  function highlight(id: string, scroll = false) {
    selected = id;
    doc
      ?.querySelectorAll("[data-admin-text-selected]")
      .forEach((node) => node.removeAttribute("data-admin-text-selected"));
    const matches = nodes(id);
    for (const node of matches)
      node.setAttribute("data-admin-text-selected", "");
    if (scroll && matches.length) {
      const node =
        matches.find((node) => node.getClientRects().length) || matches[0];
      reveal(node);
      node.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "instant",
      });
    }
  }
  function apply() {
    applyQueued = false;
    if (!doc) return;
    observer?.disconnect();
    const definitions = new Map(options.items().map((item) => [item.id, item]));
    for (const node of doc.querySelectorAll<HTMLElement>("[data-content-id]")) {
      const ids = node.dataset.contentId!.split(" "),
        slots = (node.dataset.contentSlots || "").split(" ").map(Number),
        parts = (node.dataset.contentParts || "").split(" ").map(Number);
      const texts = [...node.childNodes].filter(
        (child) => child.nodeType === 3,
      ) as Text[];
      ids.forEach((id, index) => {
        const item = definitions.get(id),
          text = texts[slots[index]];
        if (!item || !text) return;
        if (!whitespace.has(text)) {
          const original = text.data;
          whitespace.set(text, {
            before: original.match(/^\s*/)?.[0] || "",
            after: original.match(/\s*$/)?.[0] || "",
          });
        }
        let value = options.value(item);
        if (parts[index] >= 0) value = value.split("\n")[parts[index]] ?? "";
        // Match the public referral renderer: the month is a separate live node.
        if (node.hasAttribute("data-referral-prefix"))
          value = referralHeadingPrefix(value);
        const spaces = whitespace.get(text)!;
        const next = spaces.before + value + spaces.after;
        if (text.data !== next) text.data = next;
      });
      if (!node.matches("a,button,input,textarea,select,[tabindex]")) {
        node.tabIndex = 0;
        node.setAttribute(
          "aria-label",
          "Редактировать текст: " + (definitions.get(ids[0])?.label || ""),
        );
      }
    }
    if (selected) highlight(selected);
    observer?.observe(doc.body, {
      subtree: true,
      characterData: true,
      childList: true,
    });
  }
  function hit(node: HTMLElement, event?: MouseEvent) {
    const ids = (node.dataset.contentId || "").split(" "),
      slots = (node.dataset.contentSlots || "").split(" ").map(Number);
    if (event) {
      const point = (
        doc as Document & {
          caretPositionFromPoint?: (
            x: number,
            y: number,
          ) => { offsetNode: Node } | null;
        }
      )?.caretPositionFromPoint?.(event.clientX, event.clientY);
      const range = point
        ? null
        : (
            doc as Document & {
              caretRangeFromPoint?: (x: number, y: number) => Range | null;
            }
          )?.["caretRangeFromPoint"]?.(event.clientX, event.clientY);
      const texts = [...node.childNodes].filter(
        (child) => child.nodeType === 3,
      );
      const index = slots.indexOf(
        texts.indexOf(
          (point?.offsetNode || range?.startContainer) as ChildNode,
        ),
      );
      if (index >= 0) return ids[index];
    }
    return ids[0];
  }
  frame.addEventListener("load", () => {
    if (!path) return;
    clearTimeout(timer);
    observer?.disconnect();
    doc = null;
    try {
      const loaded = frame.contentDocument;
      if (
        !loaded?.querySelector("[data-content-id]") ||
        frame.contentWindow?.location.origin !== location.origin
      )
        throw Error();
      doc = loaded;
      whitespace = new WeakMap();
      const style = doc.createElement("style");
      style.id = "admin-text-preview-style";
      style.textContent =
        "[data-content-id]{cursor:text!important}[data-cookie-banner]{display:none!important}[data-content-id]:focus-visible{outline:3px solid var(--color-accent)!important;outline-offset:4px}[data-admin-text-hover]{outline:2px dashed var(--color-accent)!important;outline-offset:3px}[data-admin-text-selected]{outline:3px solid var(--color-accent)!important;outline-offset:4px;background-color:rgb(from var(--color-paper-warm) r g b / 35%)!important}";
      doc.head.append(style);
      // Listeners and styles are installed by the parent admin bundle only.
      doc.addEventListener("mousemove", (event) => {
        const node =
          (event.target as Element)?.closest<HTMLElement>(
            "[data-content-id]",
          ) || null;
        if (node === hovered) return;
        hovered?.removeAttribute("data-admin-text-hover");
        hovered = node;
        hovered?.setAttribute("data-admin-text-hover", "");
      });
      doc.addEventListener("mouseleave", () => {
        hovered?.removeAttribute("data-admin-text-hover");
        hovered = null;
      });
      doc.addEventListener(
        "click",
        (event) => {
          const target = event.target as Element,
            node = target.closest<HTMLElement>("[data-content-id]");
          if (node) {
            event.preventDefault();
            event.stopImmediatePropagation();
            const id = hit(node, event);
            highlight(id);
            options.select(
              id,
              Boolean(node.closest(".site-header,.site-footer,dialog")),
            );
          } else if (target.closest("a,button[data-lead],input[type=submit]")) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        },
        true,
      );
      doc.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
        },
        true,
      );
      doc.addEventListener(
        "keydown",
        (event) => {
          if (
            (event.ctrlKey || event.metaKey) &&
            !event.altKey &&
            event.key.toLowerCase() === "s"
          ) {
            event.preventDefault();
            options.save();
            return;
          }
          const node = (event.target as Element)?.closest<HTMLElement>(
            "[data-content-id]",
          );
          if (node && ["Enter", " "].includes(event.key)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            const id = hit(node);
            highlight(id);
            options.select(
              id,
              Boolean(node.closest(".site-header,.site-footer,dialog")),
            );
          }
        },
        true,
      );
      observer = new MutationObserver(() => {
        if (!applyQueued) {
          applyQueued = true;
          queueMicrotask(apply);
        }
      });
      apply();
      size();
      highlight(selected, Boolean(selected));
      status.textContent = "Предпросмотр: нажмите на текст для редактирования.";
      retry.hidden = true;
      frame.dataset.ready = "true";
    } catch {
      status.textContent =
        "Предпросмотр недоступен. Проверьте страницу и разрешение фреймов на сервере.";
      retry.hidden = false;
    }
  });
  function navigate(next: string, label: string) {
    const url = new URL(next, location.origin);
    if (
      url.origin !== location.origin ||
      !["/", "/sell/", "/buy/"].includes(url.pathname)
    )
      return;
    frame.title = "Предпросмотр: " + label;
    if (path === url.pathname && doc) {
      apply();
      size();
      return;
    }
    path = url.pathname;
    doc = null;
    hovered = null;
    observer?.disconnect();
    frame.dataset.ready = "false";
    status.textContent = "Загрузка предпросмотра…";
    retry.hidden = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!doc) {
        status.textContent =
          "Страница долго загружается. Можно продолжать редактировать поля или повторить загрузку.";
        retry.hidden = false;
      }
    }, 15000);
    frame.src = url.href;
  }
  retry.addEventListener("click", () => {
    const current = path;
    path = "";
    navigate(current, frame.title.replace("Предпросмотр: ", ""));
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-preview-width]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        width = Number(button.dataset.previewWidth);
        size();
        if (selected) highlight(selected, true);
      }),
    );
  document
    .querySelectorAll<HTMLButtonElement>("[data-preview-target]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        doc
          ?.querySelector(
            button.dataset.previewTarget === "header"
              ? ".site-header"
              : ".site-footer",
          )
          ?.scrollIntoView({ block: "start", behavior: "instant" });
      }),
    );
  size();
  return {
    navigate,
    apply,
    highlight,
    size,
    clear() {
      observer?.disconnect();
      clearTimeout(timer);
      doc = null;
      hovered = null;
      path = "";
      selected = "";
      frame.removeAttribute("src");
      frame.dataset.ready = "false";
    },
  };
}
