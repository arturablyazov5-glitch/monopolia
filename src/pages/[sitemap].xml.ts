import type { APIRoute, GetStaticPaths } from "astro";
import { site as configuredSite } from "astro:config/server";
import { escapeXml, indexablePaths, siteUrl } from "../lib/seo";

// Без подтверждённого домена XML не генерируется. После задания site
// статическая сборка создаст /sitemap.xml, robots.txt добавит его адрес.
export const getStaticPaths: GetStaticPaths = () =>
  configuredSite ? [{ params: { sitemap: "sitemap" } }] : [];

export const GET: APIRoute = ({ site }) => {
  if (!site) return new Response(null, { status: 404 });
  const urls = indexablePaths
    .map((path) => `  <url><loc>${escapeXml(siteUrl(path, site))}</loc></url>`)
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
