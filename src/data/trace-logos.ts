/**
 * Логотипы с Trace Logos (https://trace-logos.ru/): картинка берется оттуда же,
 * где лежит страница логотипа, и каждый логотип ведет обратной ссылкой на нее:
 * <a href="https://trace-logos.ru/logos/market/wildberries/">
 *   <img src="https://trace-logos.ru/assets/logos/svgs/wildberries.svg" alt="Логотип Wildberries">
 * </a>
 */
const ORIGIN = "https://trace-logos.ru";

const logos = {
  sber: { page: "bank/sber", name: "СберБанк" },
  "t-bank": { page: "bank/tbank", name: "Т‑Банк" },
  "alfa-bank": { page: "bank/alfa", name: "Альфа Банк" },
  "ozon-bank": { page: "bank/ozonbank", name: "Ozon Банк" },
  "mts-money": { page: "pay/mtsmoney", name: "МТС Деньги" },
  wildberries: { page: "market/wildberries", name: "Wildberries" },
  "2gis": { page: "map/2gis", name: "2ГИС" },
  "2gis-full": { page: "map/2gis", name: "2ГИС" },
  domclick: { page: "developers/domclick", name: "Домклик" },
  "domclick-full": { page: "developers/domclick", name: "Домклик" },
  "yandex-maps-full": { page: "map/yandexmaps", name: "Яндекс Карты" },
} as const;

export type TraceLogo = keyof typeof logos;

export function traceLogo(file: TraceLogo | (string & {})) {
  const logo = logos[file as TraceLogo];
  if (!logo) throw new Error(`Нет страницы Trace Logos для логотипа «${file}»`);
  return {
    src: `${ORIGIN}/assets/logos/svgs/${file}.svg`,
    href: `${ORIGIN}/logos/${logo.page}/`,
    alt: `Логотип ${logo.name}`,
  };
}
