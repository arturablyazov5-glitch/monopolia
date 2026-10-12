/** Идентификаторы поддерживаются наряду с явными названиями из DOM.
 * Неизвестные непустые значения отображаются как переданы клиентом. */
export const leadSources = Object.freeze({
  "home-question": "Форма внизу страницы · Остались вопросы? Задайте их здесь",
  "sell-question": "Форма внизу страницы · Остались вопросы? Задайте их здесь",
  "buy-question": "Форма внизу страницы · Остались вопросы? Задайте их здесь",
  "sell-week": "Хотите продать жилье на этой неделе?",
  "question-demo": "UI-kit · Форма обратной связи",
  "contact-demo": "UI-kit · Получите подборку объектов",
  "kit-lead": "UI-kit · Форма с кирпичным фоном",
  modal: "Модальная форма",
  "inner-hero": "Квиз в шапке",
  "buy-mortgage": "Калькулятор ипотеки",
});
export const sourceName = (value) => leadSources[value] || value;
export function pageName(page) {
  const path = new URL(page).pathname.replace(/\/+$/, "") || "/";
  return (
    {
      "/": "Главная",
      "/sell": "Продажа",
      "/buy": "Покупка",
      "/ui-kit": "UI-kit (тест)",
    }[path] || path
  );
}
