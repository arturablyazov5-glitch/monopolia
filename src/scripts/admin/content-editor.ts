import type { SiteText } from "../../data/site-texts.mjs";
import {
  readTextPages,
  type PageKey,
  type TextPage,
  type TextGroup,
} from "./content-pages";
import { createContentPreview } from "./content-preview";
interface Content {
  revision: number;
  overrides: Record<string, string>;
  items: SiteText[];
}
type API = (path: string, method?: string, body?: unknown) => Promise<Content>;
type EditorText = SiteText & { sourceIds?: string[] };
// One editorial sentence can occupy several original text nodes. Keep the
// published IDs and existing overrides, but expose one field to the editor.
let joinedFields: string[][] = [];
const names: Record<string, string> = {
  "home-hero": "Первый экран главной",
  "inner-hero": "Первый экран продажи и покупки",
  index: "Главная",
  sell: "Продажа",
  buy: "Покупка",
  "site-header": "Шапка",
  "site-footer": "Подвал",
  "site-nav": "Навигация",
  faq: "Частые вопросы",
  "faq-section": "Заголовок вопросов",
  button: "Общие кнопки",
  "lead-section": "Форма заявки",
  "lead-form": "Поля заявки",
  "home-services": "Услуги",
  "home-team": "Команда",
  "buyer-audience": "Покупатели",
  "fast-sale": "Быстрая продажа",
  "private-catalog": "Закрытый каталог",
  certificates: "Сертификаты",
  "honest-reviews": "Отзывы",
  "client-cases": "Кейсы",
  "company-about": "О компании",
  "company-guild": "Гильдия риелторов",
  "office-expansion": "Новый офис",
  "home-partners": "Партнеры",
  "director-invitation": "Приглашение директора",
  "blockbuster-case": "Кейс",
  "home-telegram": "Telegram",
  "home-recruiting": "Работа в команде",
  "sell-gossip": "Продажа без лишних разговоров",
  "sell-valuation": "Оценка",
  "sell-answers": "Ответы о продаже",
  "sell-process": "Процесс продажи",
  "office-consultation": "Консультация в офисе",
  "trust-and-viewing": "Доверие и показы",
  "sell-commission-note": "Комиссия",
  "referral-bonus": "Бонус за рекомендацию",
  "buy-mortgage": "Ипотека",
  "buy-closed-base": "Закрытая база",
  "buy-new-build": "Новостройки",
  "deal-insurance": "Страхование сделки",
  "site-layout": "Служебные подписи",
  "speech-bubble": "Реплики",
  "staff-card": "Сотрудники",
  "faq-card": "Кнопки вопросов",
  "sell-week-case": "Кейс продажи за неделю",
  "relocation-map": "Переезд",
  "deal-steps": "Этапы сделки",
  "realtor-comparison": "Работа с риелтором",
  "comparison-table": "Таблица сравнения",
  "sell-deal-steps": "Этапы продажи",
  "sell-realtor-comparison": "Сравнение способов продажи",
  "referral-notification": "Рекомендации знакомым",
  "prepared-viewing": "Подготовка к просмотру",
  "equal-interests": "Интересы клиента",
  "proven-trust": "Доверие",
};
const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const element = <K extends keyof HTMLElementTagNameMap>(tag: K, text = "") => {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
};
export function createContentEditor(
  api: API,
  ask: (title: string, text: string, label: string) => Promise<boolean>,
  onError: (error: unknown) => void,
) {
  let content: Content | null = null,
    pages: TextPage[] = [],
    current: PageKey = "home",
    selected = "",
    saving = false,
    loading = false;
  const drafts = new Map<string, string | null>();
  const fieldErrors = new Map<string, string>();
  let definitions = new Map<string, EditorText>();
  let sourceDefinitions = new Map<string, SiteText>();
  const aliases = new Map<string, string>();
  const panel = $("#texts-panel"),
    list = $("#content-groups"),
    status = $("#content-status");
  const search = $<HTMLInputElement>("#content-search"),
    changed = $<HTMLInputElement>("#content-changed");
  const save = $<HTMLButtonElement>("#content-save"),
    discard = $<HTMLButtonElement>("#content-discard");
  const preview = createContentPreview({
    items: () => content?.items || [],
    value,
    select: (id, common) => goToField(id, common),
    save: () => void persist(),
  });
  const itemMap = () => definitions;
  function buildFields(items: SiteText[]) {
    sourceDefinitions = new Map(items.map((item) => [item.id, item]));
    definitions = new Map(sourceDefinitions);
    aliases.clear();
    for (const ids of joinedFields) {
      const sources = ids.map((id) => sourceDefinitions.get(id));
      if (sources.some((item) => !item)) continue;
      const parts = sources as SiteText[];
      const first = parts[0];
      definitions.set(first.id, {
        ...first,
        label: parts.map((item) => item.label).join(" "),
        defaultValue: parts.map((item) => item.defaultValue).join("\n"),
        maxLength: parts.reduce(
          (sum, item) => sum + item.maxLength,
          ids.length - 1,
        ),
        multiline: true,
        lines: ids.length,
        sourceIds: ids,
      });
      for (const id of ids) {
        aliases.set(id, first.id);
        if (id !== first.id) definitions.delete(id);
      }
    }
  }
  function savedValue(item: EditorText): string {
    return item.sourceIds
      ? item.sourceIds
          .map(
            (id) =>
              content?.overrides[id] ?? sourceDefinitions.get(id)!.defaultValue,
          )
          .join("\n")
      : (content?.overrides[item.id] ?? item.defaultValue);
  }
  function hasOverride(item: EditorText) {
    return (item.sourceIds || [item.id]).some(
      (id) => id in (content?.overrides || {}),
    );
  }
  function value(item: EditorText): string {
    const owner = aliases.get(item.id);
    if (!item.sourceIds && owner && drafts.has(owner)) {
      const field = definitions.get(owner)!;
      return (
        (drafts.get(owner) ?? field.defaultValue).split("\n")[
          field.sourceIds!.indexOf(item.id)
        ] ?? ""
      );
    }
    return drafts.has(item.id)
      ? (drafts.get(item.id) ?? item.defaultValue)
      : savedValue(item);
  }
  function isChanged(id: string) {
    const item = itemMap().get(id);
    return Boolean(
      item && (drafts.has(id) || value(item) !== item.defaultValue),
    );
  }
  function say(text: string, error = false) {
    status.textContent = text;
    status.classList.toggle("error", error);
  }
  function currentPage() {
    return pages.find((page) => page.key === current);
  }
  function resize(input: HTMLTextAreaElement) {
    if (!input.getClientRects().length) return;
    input.style.height = "auto";
    input.style.height = Math.max(88, input.scrollHeight + 2) + "px";
  }
  function resizeFields() {
    list.querySelectorAll("textarea").forEach(resize);
  }
  new ResizeObserver(resizeFields).observe(list);
  function setView(view: string) {
    panel.dataset.view = view;
    document
      .querySelectorAll<HTMLButtonElement>("[data-content-view]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.contentView === view),
        ),
      );
    requestAnimationFrame(() => {
      preview.size();
      resizeFields();
      if (view === "preview" && selected) preview.highlight(selected, true);
    });
  }
  function update() {
    const blocked = saving || loading;
    save.disabled = blocked || !drafts.size;
    discard.disabled = blocked || !drafts.size;
    $<HTMLButtonElement>("#content-reload").disabled = blocked;
    search.disabled = blocked;
    changed.disabled = blocked;
    list.setAttribute("aria-busy", String(blocked));
    panel.setAttribute("aria-busy", String(blocked));
    save.textContent = saving ? "Сохраняем…" : "Сохранить изменения";
    document
      .querySelector(".admin-content-savebar")
      ?.classList.toggle("is-dirty", drafts.size > 0);
    $("#text-draft-badge").hidden = !drafts.size;
    $("#text-draft-badge").textContent = String(drafts.size);
    $("#text-draft-badge").setAttribute(
      "aria-label",
      `Несохраненных текстов: ${drafts.size}`,
    );
    $("#content-review").hidden = !drafts.size;
    if (($("#content-review") as HTMLDetailsElement).open) renderReview();
    $("#content-dirty-count").textContent = drafts.size
      ? `${drafts.size} изменено · не сохранено`
      : "Нет несохраненных изменений";
    for (const button of document.querySelectorAll<HTMLButtonElement>(
      "[data-content-page]",
    )) {
      button.disabled = blocked;
      const page = pages.find(
        (page) => page.key === button.dataset.contentPage,
      )!;
      const count = new Set(
        page.groups.flatMap((group) => group.ids).filter(isChanged),
      ).size;
      button.querySelector("span")!.textContent = String(count);
      button.querySelector("span")!.hidden = !count;
      button.setAttribute(
        "aria-label",
        `${page.label}. Измененных текстов: ${count}`,
      );
    }
    const definitions = itemMap();
    for (const field of list.querySelectorAll<HTMLElement>("[data-text-id]")) {
      const item = definitions.get(field.dataset.textId!)!;
      field.querySelector("textarea")!.disabled = blocked;
      field.querySelector("button")!.disabled =
        blocked || value(item) === item.defaultValue;
    }
  }
  function markGroup(id: string) {
    for (const button of document.querySelectorAll<HTMLButtonElement>(
      "[data-content-block]",
    ))
      button.setAttribute(
        "aria-current",
        button.dataset.contentBlock === id ? "location" : "false",
      );
    const active = document.querySelector<HTMLButtonElement>(
      `[data-content-block="${CSS.escape(id)}"]`,
    );
    if (active) $("#content-block-label").textContent = active.textContent;
  }
  function renderReview() {
    const review = $("#content-review-list");
    review.replaceChildren();
    for (const [id] of drafts) {
      const item = definitions.get(id);
      if (!item || !content) continue;
      const card = element("article");
      card.className = "admin-review-item";
      card.append(
        element("h3", (names[item.block] || item.page) + " · " + item.label),
      );
      const before = element("p", "На сайте: " + savedValue(item));
      before.className = "before";
      const after = element("p", "После сохранения: " + value(item));
      after.className = "after";
      const edit = element("button", "Перейти к тексту");
      edit.type = "button";
      edit.className = "admin-text-button";
      edit.addEventListener("click", () => goToField(id));
      card.append(before, after, edit);
      review.append(card);
    }
  }
  $("#content-review").addEventListener("toggle", () => {
    if (($("#content-review") as HTMLDetailsElement).open) renderReview();
  });
  function validation(item: EditorText) {
    const text = value(item).trim();
    if (!text)
      return "Введите текст. Чтобы вернуть исходный вариант, нажмите «Вернуть исходный».";
    if (text.length > item.maxLength)
      return `Сократите текст до ${item.maxLength} символов.`;
    if (/[<>]/.test(text))
      return "Введите обычный текст без HTML-тегов и угловых скобок.";
    if (
      item.lines &&
      text.replace(/\r\n?/g, "\n").split("\n").length !== item.lines
    )
      return `В этом тексте должно быть строк: ${item.lines}. Сохраните переносы строк.`;
    if (item.sourceIds) {
      const lines = text.split("\n");
      for (const [index, id] of item.sourceIds.entries()) {
        if (!lines[index]?.trim()) return `Заполните строку ${index + 1}.`;
        const limit = sourceDefinitions.get(id)!.maxLength;
        if (lines[index].length > limit)
          return `Сократите строку ${index + 1} до ${limit} символов.`;
      }
    }
    return "";
  }
  function scrollField(field: HTMLElement) {
    const group = field.closest<HTMLDetailsElement>(".admin-content-group");
    if (group) group.open = true;
    resizeFields();
    list.scrollTo({
      top:
        field.getBoundingClientRect().top -
        list.getBoundingClientRect().top +
        list.scrollTop -
        16,
      behavior: "instant",
    });
    if (group) markGroup(group.id);
  }
  function selectField(id: string, scrollPreview = true) {
    selected = id;
    list
      .querySelectorAll<HTMLElement>("[data-text-id]")
      .forEach((field) =>
        field.classList.toggle("is-selected", field.dataset.textId === id),
      );
    preview.highlight(id, scrollPreview);
  }
  function goToField(id: string, preferCommon = false) {
    id = aliases.get(id) || id;
    const includes = (page: TextPage) =>
      page.groups.some((group) => group.ids.includes(id));
    const target = preferCommon
      ? pages.find((page) => page.key === "common" && includes(page))
      : currentPage() && includes(currentPage()!)
        ? currentPage()
        : undefined;
    const page = target || pages.find(includes);
    if (!page) return;
    current = page.key;
    search.value = "";
    changed.checked = false;
    render();
    setView("fields");
    const field = list.querySelector<HTMLElement>(
      `[data-text-id="${CSS.escape(id)}"]`,
    );
    if (field) {
      scrollField(field);
      selectField(id, false);
      field.querySelector("textarea")?.focus({ preventScroll: true });
    }
  }
  function switchPage(key: PageKey) {
    if (current !== key) {
      selected = "";
      preview.highlight("");
      list.scrollTop = 0;
    }
    current = key;
    render();
    document
      .querySelector<HTMLButtonElement>(`[data-content-page="${key}"]`)
      ?.focus({ preventScroll: true });
  }
  function renderPages() {
    const nav = $("#content-pages");
    nav.replaceChildren();
    for (const page of pages) {
      const button = element("button", page.label + " ");
      button.type = "button";
      button.className = "admin-page-choice";
      button.dataset.contentPage = page.key;
      button.setAttribute("aria-pressed", String(page.key === current));
      button.setAttribute("aria-controls", "content-groups");
      const count = element("span", "0");
      count.className = "admin-count";
      const hint = element(
        "small",
        {
          home: "Главная страница",
          sell: "Для продавцов",
          buy: "Для покупателей",
          common: "Шапка, подвал, формы",
        }[page.key],
      );
      button.append(count, hint);
      button.addEventListener("click", () => switchPage(page.key));
      nav.append(button);
    }
  }
  function matches(item: SiteText, group: TextGroup, query: string) {
    return [
      item.label,
      item.defaultValue,
      value(item),
      item.id,
      group.label,
      names[item.block] || item.block,
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .toLocaleLowerCase()
      .includes(query);
  }
  function renderResults(query: string) {
    const results = $("#content-results");
    results.replaceChildren();
    results.hidden = !query;
    if (!query) return;
    const definitions = itemMap();
    let total = 0;
    for (const page of pages) {
      const seen = new Set<string>();
      for (const group of page.groups)
        for (const id of group.ids) {
          const item = definitions.get(id)!;
          if (
            seen.has(id) ||
            !matches(item, group, query) ||
            (changed.checked && !isChanged(id))
          )
            continue;
          seen.add(id);
          total++;
          if (total > 60) continue;
          const button = element("button");
          button.type = "button";
          button.className = "admin-content-result";
          button.dataset.resultId = id;
          button.dataset.resultPage = page.key;
          button.append(
            element("small", page.label + " · " + group.label),
            element("span", value(item).slice(0, 140)),
          );
          button.addEventListener("click", () => {
            current = page.key;
            goToField(id, page.key === "common");
          });
          results.append(button);
        }
    }
    results.prepend(
      element(
        "p",
        total
          ? `Найдено: ${total}${total > 60 ? " · показаны первые 60, уточните запрос" : ""}`
          : "Ничего не найдено. Попробуйте другой запрос.",
      ),
    );
  }
  function render() {
    const open = new Set(
      [...list.querySelectorAll<HTMLDetailsElement>("details[open]")].map(
        (node) => node.id,
      ),
    );
    const scroll = list.scrollTop;
    list.replaceChildren();
    $("#content-blocks").replaceChildren();
    if (!content) return;
    renderPages();
    const definitions = itemMap(),
      page = currentPage();
    if (!page) return;
    const query = search.value.replace(/\s+/g, " ").toLocaleLowerCase().trim();
    renderResults(query);
    let count = 0;
    for (const group of page.groups) {
      const items = group.ids
        .map((id) => definitions.get(id)!)
        .filter(
          (item) =>
            (!query || matches(item, group, query)) &&
            (!changed.checked || isChanged(item.id)),
        );
      if (!items.length) continue;
      const details = element("details");
      details.className = "admin-content-group";
      details.id = group.id;
      details.open = open.has(group.id) || !count || Boolean(query);
      count++;
      const summary = element("summary", group.label + " · " + items.length);
      details.append(summary);
      details.addEventListener("toggle", () => {
        resizeFields();
      });
      const nav = element("button", group.label);
      nav.type = "button";
      nav.dataset.contentBlock = group.id;
      nav.setAttribute("aria-controls", group.id);
      nav.setAttribute("aria-current", count === 1 ? "location" : "false");
      nav.addEventListener("click", () => {
        details.open = true;
        resizeFields();
        list.scrollTo({
          top:
            details.getBoundingClientRect().top -
            list.getBoundingClientRect().top +
            list.scrollTop -
            8,
          behavior: "instant",
        });
        summary.focus({ preventScroll: true });
        markGroup(group.id);
        ($("#content-block-picker") as HTMLDetailsElement).open = false;
      });
      $("#content-blocks").append(nav);
      const fields = element("div");
      fields.className = "admin-content-fields";
      for (const [fieldIndex, item] of items.entries()) {
        const field = element("div");
        field.className = "admin-content-field";
        field.dataset.textId = item.id;
        const label = element("label", item.label);
        const number = element("span", String(fieldIndex + 1).padStart(2, "0"));
        number.className = "admin-field-number";
        number.setAttribute("aria-hidden", "true");
        label.prepend(number);
        label.htmlFor = "content-" + item.id;
        const input = element("textarea");
        input.id = label.htmlFor;
        input.value = value(item);
        input.maxLength = item.maxLength;
        input.rows = item.multiline ? 3 : 2;
        const fieldError = element("span", fieldErrors.get(item.id) || "");
        fieldError.className = "field-error";
        fieldError.id = input.id + "-error";
        if (fieldErrors.has(item.id))
          input.setAttribute("aria-invalid", "true");
        const meta = element("div");
        meta.className = "admin-content-meta";
        const counter = element("span"),
          indicator = element("span"),
          reset = element("button", "Вернуть исходный");
        reset.type = "button";
        reset.className = "admin-text-button";
        reset.setAttribute("aria-label", "Вернуть исходный: " + item.label);
        counter.id = input.id + "-count";
        input.setAttribute(
          "aria-describedby",
          counter.id + " " + fieldError.id,
        );
        const reference = element("details");
        reference.className = "admin-content-reference";
        reference.append(
          element("summary", "Как сейчас на сайте"),
          element("p", savedValue(item)),
        );
        if (hasOverride(item))
          reference.append(element("small", "Исходный: " + item.defaultValue));
        const refresh = () => {
          counter.textContent = `${input.value.length} / ${item.maxLength}`;
          indicator.textContent = drafts.has(item.id)
            ? "Не сохранен"
            : hasOverride(item)
              ? "Изменен"
              : "Исходный";
          field.dataset.dirty = String(drafts.has(item.id));
          indicator.dataset.state = drafts.has(item.id) ? "draft" : "saved";
          reset.disabled =
            saving || loading || input.value === item.defaultValue;
        };
        const edit = () => {
          if (saving || loading) return;
          const previous = savedValue(item);
          if (input.value === previous) drafts.delete(item.id);
          else
            drafts.set(
              item.id,
              input.value === item.defaultValue ? null : input.value,
            );
          if (fieldErrors.has(item.id)) validateField();
          refresh();
          resize(input);
          update();
          preview.apply();
          say(
            drafts.size
              ? `Есть несохраненные изменения: ${drafts.size}`
              : "Все изменения сохранены.",
          );
        };
        const validateField = () => {
          const error = validation(item);
          if (error) fieldErrors.set(item.id, error);
          else fieldErrors.delete(item.id);
          fieldError.textContent = error;
          if (error) input.setAttribute("aria-invalid", "true");
          else input.removeAttribute("aria-invalid");
        };
        input.addEventListener("input", edit);
        input.addEventListener("blur", () => {
          if (drafts.has(item.id)) validateField();
        });
        input.addEventListener("click", () => selectField(item.id));
        input.addEventListener("focus", () => {
          selectField(item.id);
          markGroup(group.id);
        });
        reset.addEventListener("click", () => {
          input.value = item.defaultValue;
          edit();
          selectField(item.id);
        });
        meta.append(counter, indicator, reset);
        field.append(label, input, fieldError, meta, reference);
        if (item.lines)
          field.append(
            element(
              "small",
              "Сохраните число строк: " +
                item.lines +
                ". Переносы нужны для композиции.",
            ),
          );
        refresh();
        fields.append(field);
      }
      details.append(fields);
      list.append(details);
    }
    if (!count)
      list.append(
        element(
          "p",
          changed.checked
            ? "На этой странице нет измененных текстов."
            : "На этой странице совпадений нет. Выберите результат поиска выше.",
        ),
      );
    $("#content-common-targets").hidden = current !== "common";
    preview.navigate(
      page.path,
      page.label === "Общие" ? "общие шапка и подвал" : page.label,
    );
    if (selected) selectField(selected, false);
    update();
    const firstGroup = list.querySelector<HTMLDetailsElement>(
      ".admin-content-group",
    );
    if (firstGroup) markGroup(firstGroup.id);
    else $("#content-block-label").textContent = "Нет подходящих блоков";
    list.scrollTop = scroll;
    requestAnimationFrame(resizeFields);
  }
  async function load(preserve = false) {
    if (saving || loading) return;
    if (
      !preserve &&
      drafts.size &&
      !(await ask(
        "Обновить без сохранения?",
        "Несохраненные правки текстов будут потеряны.",
        "Обновить",
      ))
    )
      return;
    loading = true;
    update();
    say("Загрузка текстов и страниц…");
    try {
      const next = await api("/api/admin/content");
      const inventory = await readTextPages(
        next.items,
        AbortSignal.timeout(12000),
        names,
      );
      const used = new Set<string>();
      joinedFields = inventory
        .flatMap((page) => page.joinedFields || [])
        .filter((ids) => {
          if (ids.some((id) => used.has(id))) return false;
          ids.forEach((id) => used.add(id));
          return true;
        });
      content = next;
      $("#workspace-notice").hidden = true;
      buildFields(next.items);
      pages = inventory.map((page) => ({
        ...page,
        groups: page.groups.map((group) => ({
          ...group,
          ids: [...new Set(group.ids.map((id) => aliases.get(id) || id))],
        })),
      }));
      if (!preserve) {
        drafts.clear();
        fieldErrors.clear();
      }
      render();
      preview.apply();
      say(
        drafts.size
          ? "Загружена свежая версия. Проверьте свои поля и сохраните."
          : "Все изменения сохранены.",
      );
    } catch (error) {
      say(
        (error as Error).message ||
          "Не удалось загрузить тексты. Повторите обновление.",
        true,
      );
      onError(error);
    } finally {
      loading = false;
      update();
    }
  }
  async function persist() {
    if (!content || saving || loading || !drafts.size) return;
    fieldErrors.clear();
    for (const [id] of drafts) {
      const item = definitions.get(id)!;
      const error = validation(item);
      if (error) fieldErrors.set(id, error);
    }
    if (fieldErrors.size) {
      const [id, error] = fieldErrors.entries().next().value!;
      goToField(id);
      say("Исправьте текст перед сохранением: " + error, true);
      return;
    }
    const active =
      document.activeElement instanceof HTMLTextAreaElement
        ? document.activeElement.id
        : "";
    saving = true;
    update();
    say("Сохраняем…");
    try {
      const changes: Record<string, string | null> = {};
      for (const [id, draft] of drafts) {
        const field = definitions.get(id)!;
        if (!field.sourceIds) changes[id] = draft;
        else
          for (const [index, sourceId] of field.sourceIds.entries()) {
            const text = (draft ?? field.defaultValue).split("\n")[index];
            changes[sourceId] =
              text === sourceDefinitions.get(sourceId)!.defaultValue
                ? null
                : text;
          }
      }
      content = await api("/api/admin/content", "PUT", {
        baseRevision: content.revision,
        changes,
      });
      drafts.clear();
      fieldErrors.clear();
      $("#workspace-notice").hidden = true;
      buildFields(content.items);
      render();
      preview.apply();
      say("Сохранено. Посетители увидят правки при открытии страницы.");
      if (active)
        document.getElementById(active)?.focus({ preventScroll: true });
    } catch (error) {
      say((error as Error).message, true);
      onError(error);
      if ((error as Error & { status?: number }).status === 409) {
        const button = element(
          "button",
          "Получить свежую версию, сохранив мои поля",
        );
        button.type = "button";
        button.className = "admin-text-button";
        button.addEventListener("click", () => void load(true));
        status.append(" ", button);
      }
    } finally {
      saving = false;
      update();
    }
  }
  save.addEventListener("click", () => void persist());
  discard.addEventListener("click", async () => {
    if (saving || loading || !drafts.size) return;
    if (
      await ask(
        "Отменить все несохраненные правки?",
        "Вернутся последние сохраненные тексты.",
        "Отменить правки",
      )
    ) {
      drafts.clear();
      fieldErrors.clear();
      render();
      preview.apply();
      say("Несохраненные правки отменены.");
    }
  });
  $("#content-reload").addEventListener("click", () => void load());
  search.addEventListener("input", render);
  changed.addEventListener("change", render);
  list.addEventListener(
    "scroll",
    () => {
      const top = list.getBoundingClientRect().top;
      const groups = [
        ...list.querySelectorAll<HTMLDetailsElement>(".admin-content-group"),
      ];
      const group =
        groups
          .filter((node) => node.getBoundingClientRect().top <= top + 64)
          .at(-1) || groups[0];
      if (group) markGroup(group.id);
    },
    { passive: true },
  );
  document
    .querySelectorAll<HTMLButtonElement>("[data-content-view]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        setView(button.dataset.contentView!),
      ),
    );
  window.addEventListener("keydown", (event) => {
    if (
      !panel.hidden &&
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      event.key.toLowerCase() === "s"
    ) {
      event.preventDefault();
      void persist();
    }
  });
  for (const tab of ["objects", "texts"])
    $("#tab-" + tab).addEventListener("click", async () => {
      if (saving || loading) return;
      if (
        tab === "objects" &&
        !panel.hidden &&
        drafts.size &&
        !(await ask(
          "Переключить раздел?",
          "Несохраненные правки текстов останутся в черновике.",
          "Переключить",
        ))
      )
        return;
      $("#objects-panel").hidden = tab !== "objects";
      panel.hidden = tab !== "texts";
      for (const name of ["objects", "texts"])
        $("#tab-" + name).setAttribute("aria-pressed", String(tab === name));
      if (tab === "texts" && !content) await load();
      else if (tab === "texts") {
        preview.size();
        resizeFields();
      }
    });
  return {
    get dirty() {
      return drafts.size > 0;
    },
    get busy() {
      return saving || loading;
    },
    clear() {
      content = null;
      definitions.clear();
      sourceDefinitions.clear();
      aliases.clear();
      pages = [];
      drafts.clear();
      fieldErrors.clear();
      preview.clear();
      list.replaceChildren();
      $("#content-pages").replaceChildren();
      search.value = "";
      changed.checked = false;
      current = "home";
      selected = "";
      setView("fields");
      $("#objects-panel").hidden = false;
      panel.hidden = true;
      $("#tab-objects").setAttribute("aria-pressed", "true");
      $("#tab-texts").setAttribute("aria-pressed", "false");
      update();
    },
  };
}
