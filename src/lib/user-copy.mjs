export const plainE = text => text.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
// Render only visible copy; never alter scripts, CSS, URLs or binding IDs.
export function normalizeVisibleCopy(html) {
 return html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<[^>]*(?:"[^"]*"[^>]*|'[^']*'[^>]*)*>|[^<]+/gi,
  token => token.startsWith('<') ? token : plainE(token));
}
