/** Источник из реального DOM; общий для модалки и резервного пути отправки. */
const clean = (value: string | null | undefined) =>
  (value || "").replace(/\s+/g, " ").trim();

function heading(element: Element): string {
  const ids = element.getAttribute("aria-labelledby")?.split(/\s+/) || [];
  const title =
    ids.map((id) => document.getElementById(id)).find(Boolean) ||
    element.querySelector("h1,h2");
  if (title) {
    const copy = title.cloneNode(true) as HTMLElement;
    copy
      .querySelectorAll('[aria-hidden="true"], .inner-hero-accent-space')
      .forEach((e) => e.remove());
    copy.querySelectorAll("br").forEach((e) => e.replaceWith(" "));
    return clean(copy.textContent);
  }
  return clean(
    element.id || element.className || element.tagName.toLowerCase(),
  );
}

export function leadSection(element: HTMLElement): string {
  const section = element.closest(".sell-week, section");
  if (section) return heading(section);
  if (element.closest("header"))
    return element.closest(".menu-panel") ? "Шапка · Меню" : "Шапка";
  if (element.closest("footer")) return "Подвал";
  if (element.closest("dialog")) return "Модальная форма";
  return heading(element.closest("main") || document.body);
}

export function leadSource(element: HTMLElement): string {
  if (clean(element.dataset.leadSource))
    return clean(element.dataset.leadSource);
  const label = clean(
    element.dataset.lead ||
      element.querySelector('[type="submit"]')?.textContent ||
      element.textContent,
  );
  const card = element.closest(
    "article, .service-card, .property-card, .range-demo, .buy-mortgage-calc, .inner-hero-card",
  );
  const title = clean(card?.querySelector("h3")?.textContent);
  return `${leadSection(element)} · ${title ? title + " · " : ""}${label || "Форма заявки"}`;
}

/** Button уже выводит явный атрибут; добавляем секцию, недоступную Astro.props.
 * Не меняем защищённые компоненты карточек/калькулятора. */
export function initializeLeadSources(): void {
  document.querySelectorAll<HTMLElement>("[data-lead]").forEach((element) => {
    if (element.dataset.leadSourceReady) return;
    const block = leadSection(element);
    const detail = clean(element.dataset.leadSource) || leadSource(element);
    element.dataset.leadSource = `${block} · ${detail}`;
    element.dataset.leadSourceReady = "1";
    element.dataset.leadSection = block;
  });
}
