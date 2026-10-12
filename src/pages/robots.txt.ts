import type { APIRoute } from "astro";
import { siteUrl } from "../lib/seo";

export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin/\n${site ? `\nSitemap: ${siteUrl("/sitemap.xml", site)}\n` : ""}`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
// /ui-kit/ разрешён для обхода: робот должен прочитать его meta noindex.
