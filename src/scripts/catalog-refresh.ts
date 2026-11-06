import type { Card } from '../lib/catalog-schema.mjs';
import { getHeaderCity } from '../lib/city-picker';
import { matchesCatalogCity } from '../lib/catalog-city';

const emptyMessage = 'В выбранном городе пока нет объектов.';
const unavailableMessage = 'Не удалось загрузить объекты. Обновите страницу.';

for (const root of document.querySelectorAll<HTMLElement>('[data-catalog]')) {
  const track = root.querySelector<HTMLElement>('.carousel-track')!;
  const live = root.querySelector<HTMLElement>('[data-catalog-live]')!;
  const empty = root.querySelector<HTMLElement>('[data-catalog-empty]')!;
  const status = root.querySelector<HTMLElement>('[data-catalog-status]')!;
  const template = root.querySelector<HTMLTemplateElement>('template[data-card-template]')!;
  let loaded = false;
  let pending = false;

  function updateCarousel() {
    root.querySelector('[data-carousel]')!.dispatchEvent(new Event('catalog-updated'));
  }

  function filterByCity() {
    if (!loaded) return;
    const city = getHeaderCity();
    let count = 0;
    for (const card of Array.from(track.children) as HTMLElement[]) {
      const address = card.querySelector('[data-card=address]')?.textContent ?? '';
      card.hidden = !matchesCatalogCity(address, city);
      if (!card.hidden) count++;
    }
    live.hidden = count === 0;
    empty.hidden = count > 0;
    updateCarousel();
  }

  function showUnavailable() {
    loaded = false;
    root.dataset.revision = '-1';
    track.replaceChildren();
    live.hidden = true;
    empty.hidden = false;
    status.textContent = unavailableMessage;
    updateCarousel();
  }

  async function refresh() {
    if (pending) return;
    pending = true;
    try {
      const base = new URL(root.dataset.mediaBase || location.origin, location.origin);
      const response = await fetch(root.dataset.endpoint || '/api/catalog', {
        credentials: 'omit',
        cache: 'no-cache',
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) throw Error('Каталог недоступен');
      const data = await response.json();
      if (data.ok !== true || !Number.isSafeInteger(data.revision) || data.revision < 0 ||
        !Array.isArray(data.objects) || data.objects.length > 100) throw Error('Некорректный каталог');
      if (loaded && Number(root.dataset.revision) === data.revision) return;

      const cards: DocumentFragment[] = [];
      for (const p of data.objects as Card[]) {
        if (!['title','address','price','oldPrice','pricePerMeter','mortgage','discount'].every(
          k => typeof p[k as keyof Card] === 'string') || !p.image) throw Error('Некорректная карточка');
        const imageURL = (src: string) => {
          // Uploaded pictures stay on the configured media origin.
          if (src === '/assets/property-card-default-photo.webp') return new URL(src, location.origin).href;
          const url = new URL(src, base);
          if (url.origin !== base.origin || !['https:', 'http:'].includes(url.protocol) ||
            url.username || url.password || !/^\/media\/[a-f0-9]{48}\.webp$/.test(url.pathname) ||
            url.search || url.hash) throw Error('Некорректное фото');
          return url.href;
        };
        const small = imageURL(p.image.small), large = imageURL(p.image.large);
        const fragment = template.content.cloneNode(true) as DocumentFragment;
        for (const k of ['title','address','price'] as const) {
          fragment.querySelector(`[data-card=${k}]`)!.textContent = p[k];
        }
        for (const [selector, value] of [['s',p.oldPrice],['.price p',p.pricePerMeter],['.mortgage',p.mortgage]]) {
          const node = fragment.querySelector(selector)!;
          node.textContent = value;
          node.setAttribute('aria-hidden', String(!value));
        }
        const discount = fragment.querySelector<HTMLElement>('.discount')!;
        discount.classList.toggle('badge', Boolean(p.discount));
        discount.textContent = p.discount;
        discount.setAttribute('aria-hidden', String(!p.discount));
        const img = fragment.querySelector<HTMLImageElement>('.property-photo img')!;
        img.src = large;
        img.alt = p.title;
        const source = fragment.querySelector<HTMLSourceElement>('source')!;
        if (p.image.large === '/assets/property-card-default-photo.webp') {
          const picture = img.closest('picture')!;
          picture.replaceWith(img);
          img.width = 336;
          img.height = 252;
        } else {
          source.srcset = small + ' 360w, ' + large + ' 680w';
        }
        const button = fragment.querySelector<HTMLElement>('[data-lead]')!;
        button.dataset.subject = p.title;
        button.dataset.leadSource = p.title + ' · Кнопка «Записаться на просмотр»';
        cards.push(fragment);
      }

      track.replaceChildren(...cards);
      root.dataset.revision = String(data.revision);
      loaded = true;
      status.textContent = emptyMessage;
      filterByCity();
    } catch (error) {
      console.warn('Catalog refresh failed:', error);
      // Never display deleted properties from a stale HTML snapshot or an earlier request.
      showUnavailable();
    } finally {
      pending = false;
    }
  }

  window.addEventListener('city-changed', filterByCity);
  window.addEventListener('focus', () => { void refresh(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void refresh();
  });
  window.setInterval(() => {
    if (!document.hidden) void refresh();
  }, 30000);
  void refresh();
}
