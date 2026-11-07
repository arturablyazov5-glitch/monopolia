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
// Friendly names for [data-dialog-form] groups inside the shared lead dialog.
const dialogFormNames: Record<string, string> = {
  callback: "Заявка · Обратный звонок",
  office: "Заявка · Консультация в офисе",
  analysis: "Заявка · Анализ объекта",
  "closed-base": "Заявка · Закрытая база",
  service: "Заявка · Консультация по услуге",
  team: "Заявка · Вакансия",
  mortgage: "Заявка · Ипотека",
  viewing: "Заявка · Просмотр",
  "new-build": "Заявка · Новостройка",
  buy: "Форма · Покупка",
  sell: "Форма · Продажа",
};
const caseBlocks = new Set([
  "client-cases",
  "blockbuster-case",
  "sell-week-case",
]);
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
          const form = node.closest<HTMLElement>("[data-dialog-form]");
          const dialog = node.closest("dialog");
          let key: string, label: string;
          if (form) {
            // Each popup/quiz inside the lead dialog is its own group.
            key = "form:" + (form.dataset.dialogForm || "other");
            label =
              dialogFormNames[form.dataset.dialogForm || ""] ||
              "Модальная форма";
          } else if (dialog) {
            key =
              "dialog:" +
              (dialog.id || dialog.getAttribute("aria-label") || "dialog");
            label =
              dialog.id === "lead-dialog"
                ? "Модальная форма"
                : headingText(dialog.querySelector("h1,h2,h3")) ||
                  dialog.getAttribute("aria-label") ||
                  "Диалог";
          } else {
            key = node.closest(".site-header")
              ? "header"
              : node.closest(".site-footer")
                ? "footer"
                : "other";
            label =
              (
                {
                  header: "Шапка",
                  footer: "Подвал",
                  other: "Общие подписи",
                } as Record<string, string>
              )[key] || "Общие подписи";
          }
          let group = commonGroups.get(key);
          if (!group) {
            group = { id: "common-" + key, label, ids: [] };
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
  const remaining = items.filter((item) => !allSeen.has(item.id));
  // Group leftovers by their real block: cases together, the rest by section.
  const blockGroups = new Map<string, string[]>();
  for (const item of remaining) {
    const block = caseBlocks.has(item.block) ? "__cases" : item.block || "other";
    const list = blockGroups.get(block) || [];
    list.push(item.id);
    blockGroups.set(block, list);
  }
  const orderedBlocks = [...blockGroups.keys()].sort((a, b) =>
    a === "__cases" ? -1 : b === "__cases" ? 1 : a.localeCompare(b, "ru"),
  );
  for (const block of orderedBlocks) {
    common.push({
      id: "common-block-" + block,
      label:
        block === "__cases"
          ? "Кейсы"
          : names[block] || block || "Другие общие тексты",
      ids: blockGroups.get(block)!,
    });
  }
  // Header and footer stay first; everything else keeps DOM encounter order.
  const priority = (id: string) =>
    id === "common-header" ? 0 : id === "common-footer" ? 1 : 2;
  common.sort((a, b) => priority(a.id) - priority(b.id));
  return [
    ...pages,
    { ...pageChoices[3], groups: common.filter((group) => group.ids.length) },
  ];
}
