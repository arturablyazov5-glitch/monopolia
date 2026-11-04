import { defineMiddleware } from 'astro:middleware';
import { frameHeaders } from './lib/frame-policy.mjs';
import { bindContent, normalizeVisibleCopy } from './lib/content-bindings.mjs';
// Runs at static generation and in dev; production needs only the emitted HTML.
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const source = await response.text();
  const bound = ['/', '/sell/', '/buy/'].includes(context.url.pathname) ? bindContent(source) : source;
  const html = context.url.pathname.startsWith('/admin') ? bound : normalizeVisibleCopy(bound);
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(frameHeaders)) headers.set(name, value);
  headers.delete('content-length');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
});
