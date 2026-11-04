import { siteText } from "./site-texts.mjs";
/** Ссылки навигации в подвале. */
export const siteSections: { label: string; href: string }[] = [
  { label: "Продать объект", href: "/sell/" },
  { label: "Купить объект", href: "/buy/" },
  { label: siteText("site-nav.label.3"), href: "/#reviews" },
  { label: siteText("site-header.label.3"), href: "/#cases" },
  { label: siteText("site-nav.label.4"), href: "/#team" },
  { label: "Дополнительные услуги", href: "/#services" },
  { label: siteText("site-nav.label.6"), href: "/#careers" },
  { label: siteText("site-nav.label.7"), href: "/#faq-title" },
];
