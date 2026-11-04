import type { SiteText } from "../../data/site-texts.mjs";
export type PageKey = "home" | "sell" | "buy" | "common";
export interface TextGroup {
  id: string;
  label: string;
  ids: string[];
}
export interface TextPage {
  key: PageKey;
  label: string;
  path: string;
  groups: TextGroup[];
  joinedFields?: string[][];
}
export const pageChoices: { key: PageKey; label: string; path: string }[] = [
  { key: "home", label: "Главная", path: "/" },
  { key: "sell", label: "Продажа", path: "/sell/" },
  { key: "buy", label: "Покупка", path: "/buy/" },
  { key: "common", label: "Общие", path: "/" },
];
const clean = (text: string) => text.replace(/\s+/g, " ").trim();
function headingText(heading: Element | null) {
  if (!heading) return "";
  const clone = heading.cloneNode(true) as Element;
  clone
    .querySelectorAll("[aria-hidden=true],.sr-only")
    .forEach((node) => node.remove());
  for (const node of clone.querySelectorAll("br")) node.replaceWith(" ");
  for (const node of clone.querySelectorAll("span,strong")) {
    node.prepend(" ");
    node.append(" ");
  }
  return clean(clone.textContent || "");
}
// The rendered page, rather than the source-component prefix, determines order
// and membership. Reused copy can occur on several pages without new text IDs.
export async function readTextPages(
  items: SiteText[],
  signal: AbortSignal,
  names: Record<string, string> = {},
): Promise<TextPage[]> {
  const known = new Map(items.map((item) => [item.id, item]));
  const common: TextGroup[] = [],
    commonGroups = new Map<string, TextGroup>();
  const commonSeen = new Set<string>();
  const pages = await Promise.all(
    pageChoices.slice(0, 3).map(async (choice) => {
      const response = await fetch(new URL(choice.path, location.origin), {
        signal,
        credentials: "omit",
      });
      if (!response.ok)
        throw Error(
          "Не удалось загрузить страницу «" +
            choice.label +
            "». Обновите тексты.",
        );
      const doc = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
      const main = doc.querySelector("main");
      if (!main || !doc.querySelector("[data-content-id]"))
        throw Error(
          "На странице «" +
            choice.label +
            "» нет привязок текстов. Проверьте сборку сайта.",
        );
      const joinedFields: string[][] = [];
      for (const sentence of doc.querySelectorAll("h1,h2,h3,h4,p")) {
        if (sentence.querySelector("button,a,input,svg")) continue;
        const ordered: string[] = [];
        const walk = (node: Element) => {
          const ids = (node.getAttribute("data-content-id") || "").split(" ");
          const slots = (node.getAttribute("data-content-slots") || "")
            .split(" ")
            .map(Number);
          let textIndex = 0;
          for (const child of node.childNodes) {
            if (child.nodeType === 3) {
              const id = ids[slots.indexOf(textIndex++)];
              if (known.has(id)) ordered.push(id);
            } else if (child.nodeType === 1) walk(child as Element);
          }
        };
        walk(sentence);
        const ids = [...new Set(ordered)];
        if (ids.length > 1 && ids.every((id) => !known.get(id)!.lines))
          joinedFields.push(ids);
      }
      const groups: TextGroup[] = [],
        containers = new Map<Element, TextGroup>(),
        seen = new Set<string>();
      for (const node of doc.querySelectorAll<HTMLElement>(
        "[data-content-id]",
      )) {
        const ids = node.dataset
          .contentId!.split(" ")
          .filter((id) => known.has(id));
        if (main.contains(node)) {
          const container = node.closest("section") || main;
          let group = containers.get(container);
          if (!group) {
            const heading = container.querySelector("h1,h2");
            const block = known.get(ids[0])?.block || "";
            const fallback = names[block] || "Другие тексты";
            group = {
              id: choice.key + "-block-" + groups.length,
              label: (container.matches(".home-hero,.inner-hero")
                ? "Первый экран"
                : headingText(heading) || fallback
              ).slice(0, 96),
              ids: [],
            };
            containers.set(container, group);
            groups.push(group);
          }
          for (const id of ids)
            if (!seen.has(id)) {
              seen.add(id);
              group.ids.push(id);
            }
        } else {
          const key = node.closest(".site-header")
            ? "header"
            : node.closest(".site-footer")
              ? "footer"
              : node.closest("dialog")
                ? "dialog"
                : "other";
          let group = commonGroups.get(key);
          if (!group) {
            group = {
              id: "common-" + key,
              label: {
                header: "Шапка",
                footer: "Подвал",
                dialog: "Модальная форма",
                other: "Общие подписи",
              }[key],
              ids: [],
            };
            commonGroups.set(key, group);
            common.push(group);
          }
          for (const id of ids)
            if (!commonSeen.has(id)) {
              commonSeen.add(id);
              group.ids.push(id);
            }
        }
      }
      return {
        ...choice,
        joinedFields,
        groups: groups.filter((group) => group.ids.length),
      };
    }),
  );
  const allSeen = new Set([
    ...pages.flatMap((page) => page.groups.flatMap((group) => group.ids)),
    ...commonSeen,
  ]);
  const remaining = items
    .filter((item) => !allSeen.has(item.id))
    .map((item) => item.id);
  if (remaining.length)
    common.push({
      id: "common-other-texts",
      label: "Другие общие тексты",
      ids: remaining,
    });
  // Promise completion must not influence the navigation order.
  common.sort(
    (a, b) =>
      [
        "common-header",
        "common-footer",
        "common-dialog",
        "common-other",
        "common-other-texts",
      ].indexOf(a.id) -
      [
        "common-header",
        "common-footer",
        "common-dialog",
        "common-other",
        "common-other-texts",
      ].indexOf(b.id),
  );
  return [
    ...pages,
    { ...pageChoices[3], groups: common.filter((group) => group.ids.length) },
  ];
}
