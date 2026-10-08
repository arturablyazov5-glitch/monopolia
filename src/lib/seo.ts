/** Публичные маршруты сайта; служебная библиотека в sitemap не входит. */
export const indexablePaths = ["/", "/sell/", "/buy/"];

/** Канонический адрес берётся только из заданного владельцем Astro.site. */
export function siteUrl(path: string, site: URL): string {
  return new URL(path.replace(/^\//, ""), site.href.replace(/\/?$/, "/")).href;
}

export function escapeXml(value: string): string {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[character]!,
  );
}
