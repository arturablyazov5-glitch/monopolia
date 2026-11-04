// HTTP response headers: frame-ancestors cannot be enforced by a meta tag.
export const frameHeaders = Object.freeze({
  "Content-Security-Policy": "frame-ancestors 'self'",
  "X-Frame-Options": "SAMEORIGIN",
});
export function adminCsp(api = "", media = "") {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data:${media ? ` ${new URL(media).origin}` : ""}`,
    `connect-src 'self'${api ? ` ${api}` : ""}`,
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
  ].join("; ");
}
