import { plainE } from '../lib/user-copy.mjs';
// Defaults and DOM structure remain intact if the API is absent or invalid.
async function refreshContent() {
  const endpoint = document.body.dataset.contentEndpoint;
  if (!endpoint) return;
  try {
    const response = await fetch(endpoint, { credentials: 'omit', signal: AbortSignal.timeout(6000) });
    if (!response.ok) return;
    const data = await response.json();
    if (data.ok !== true || !Number.isSafeInteger(data.revision) || !data.overrides || typeof data.overrides !== 'object' || Array.isArray(data.overrides)) return;
    for (const element of document.querySelectorAll<HTMLElement>('[data-content-id]')) {
      const ids = element.dataset.contentId!.split(' ');
      const slots = (element.dataset.contentSlots || '').split(' ').map(Number);
      const parts = (element.dataset.contentParts || '').split(' ').map(Number);
      const texts = [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE);
      ids.forEach((id, index) => {
        let value = data.overrides[id];
        if (typeof value === 'string' && parts[index] >= 0) value = value.split('\n')[parts[index]];
        const node = texts[slots[index]];
        if (!node || typeof value !== 'string' || !value.trim() || value.length > 4000 || /[<>\u0000-\u0008\u000b-\u001f\u007f]/.test(value)) return;
        const original = node.textContent || '';
        node.textContent = original.match(/^\s*/)?.[0] + plainE(value) + original.match(/\s*$/)?.[0];
      });
    }
  } catch { /* Offline / GitHub Pages: retain the embedded text. */ }
}
void refreshContent();
