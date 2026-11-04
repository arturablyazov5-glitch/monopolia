/** TASK-044. Read-only browser audit; --replace briefly swaps ONLY the texture,
 * restores its exact bytes in finally, and verifies sha256. Never submits forms. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { launchBrowser } from './check-baseline.mjs';

const out = 'design-reference/task044b';
mkdirSync(out, { recursive: true });
const asset = 'public/assets/textures/paper-beige.webp';
const original = readFileSync(asset);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const replace = process.argv.includes('--replace');
const snapshots = process.argv.includes('--screenshots');
const browser = await launchBrowser();
const results = [];
const expected = { '/': 17785, '/sell/': 16105, '/buy/': 15972 };
const targets = '.paper, .lead-section-card, .lead-form > input, .lead-form textarea, #lead-dialog .popup-phone, #lead-dialog .popup-resume-label, #lead-dialog .popup-media-neutral .popup-media-window, .cases-tabs .channels, .comparison-risk .comparison-risk-ours, .sell-answers-topics > .badge, .buy-safari-header, .buy-safari-old-price > span';
// Expected colors are selected by semantic component, independently of paper-white.
// The ordered table prevents an accidentally removed/added modifier from passing.
const surfaceExpectations = [
  { selector: '.sell-answers-card', expected: 'white', reason: 'Customer correction; HEAD texture-paper-crumpled at 10%, white container with beige tags' },
  { selector: '.director-card', expected: 'white', reason: 'HEAD texture-paper-crumpled at 10%, white container with beige coffee note/signature' },
  { selector: '.paper-frame, .guild-card, .staff-certificate, .sell-week-story-card, .taped-note-plain', expected: 'white', reason: 'Existing white paper preserved by TASK-044' },
  { selector: '.lead-section-card', expected: 'white', reason: 'HEAD and current shared form wrapper are white' },
  { selector: '.blockbuster-label', expected: 'dark', reason: 'Existing dark paper preserved' },
  { selector: '.sell-answers-topics > .badge', expected: 'beige', reason: 'Customer: beige tags inside white SellAnswers' },
  { selector: targets, expected: 'beige', reason: 'Existing texture-paper-warm-export/texture-paper-beige-export paper family and its fields; shared texture' },
];

async function audit(page, route, width, state) {
  const data = await page.evaluate(({ targets, surfaceExpectations }) => {
    const label = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + [...e.classList].join('.');
    const visible = e => {
      if (!e.getClientRects().length) return false;
      for (let p = e; p; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0' || p.hidden) return false;
      }
      return e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0;
    };
    const surfaces = [...document.querySelectorAll(targets)].filter(visible).map(e => {
      const r = e.getBoundingClientRect();
      const layers = ['', '::before', '::after'].map(pseudo => {
        const s = getComputedStyle(e, pseudo || null);
        return { pseudo, generated: !pseudo || !['none', 'normal'].includes(s.content), image: s.backgroundImage, color: s.backgroundColor, opacity: s.opacity, filter: s.filter, blend: s.backgroundBlendMode, z: s.zIndex, mask: s.maskImage === 'none' ? 'none' : 'present', size: s.backgroundSize, repeat: s.backgroundRepeat };
      });
      const expectation = surfaceExpectations.find(row => e.matches(row.selector));
      return { selector: label(e), expected: expectation.expected, reason: expectation.reason, exception: expectation.expected !== 'beige', layers, bounds: { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height } };
    });
    const beigeOutside = [...document.querySelectorAll('body *')].filter(e => visible(e) && !e.matches(targets) && !e.closest('.tape-layer, .paper-tape, .button')).flatMap(e => {
      const r = e.getBoundingClientRect();
      if (r.width < 60 || r.height < 24) return [];
      const s = getComputedStyle(e), rgb = s.backgroundColor.match(/^rgb\((\d+), (\d+), (\d+)\)$/)?.slice(1).map(Number);
      if (!rgb || rgb[0] < rgb[1] || rgb[1] < rgb[2] || rgb[0] < 225 || rgb[0] > 253 || rgb[0] - rgb[2] < 5 || rgb[0] - rgb[1] > 18 || rgb[1] - rgb[2] > 24) return [];
      return [{ selector: label(e), color: s.backgroundColor, image: s.backgroundImage }];
    });
    return { height: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth - innerWidth, surfaces, beigeOutside, resources: performance.getEntriesByType('resource').filter(r => /paper-beige|texture-paper-warm-export|texture-paper-beige-export|texture-paper-crumpled/.test(r.name)).map(r => ({ url: r.name, transferSize: r.transferSize, duration: r.duration })), lcp: window.__paperLcp, preloads: [...document.querySelectorAll('link[rel=preload][as=image]')].map(e => e.href) };
  }, { targets, surfaceExpectations });
  data.failures = data.surfaces.filter(s => {
    const paint = s.layers.filter(l => l.generated);
    if (s.expected === 'white') return paint.some(l => l.image !== 'none') || !paint.some(l => l.color === 'rgb(255, 255, 255)');
    if (s.expected === 'dark') return !paint.some(l => l.image.includes('blockbuster-decoration.webp'));
    return !paint.some(l => l.image.includes('paper-beige.webp'));
  }).map(s => ({ selector: s.selector, expected: s.expected, reason: 'Computed paint does not match expected color', layers: s.layers }));
  data.overlays = data.surfaces.filter(s => !s.exception).flatMap(s => s.layers.filter(l => l.generated && l.image.includes('paper-beige.webp') && (l.opacity !== '1' || l.filter !== 'none' || l.blend !== 'normal' || l.image.includes('gradient'))).map(l => ({ selector: s.selector, layer: l })));
  if (replace) {
    const bytes = await page.evaluate(async () => [...new Uint8Array(await (await fetch('/assets/textures/paper-beige.webp', { cache: 'reload' })).arrayBuffer())]);
    data.servedHash = hash(Buffer.from(bytes));
    const screenshot = await page.screenshot({ fullPage: true });
    const { data: pixels, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    data.redPixels = data.surfaces.filter(s => !s.exception).map(s => {
      let red = 0, tested = 0;
      const b = s.bounds;
      for (let yy = .1; yy <= .9; yy += .1) for (let xx = .1; xx <= .9; xx += .1) {
        const x = Math.round(b.x + b.width * xx), y = Math.round(b.y + b.height * yy);
        if (x < 0 || x >= info.width || y < 0 || y >= info.height) continue;
        const i = (y * info.width + x) * info.channels;
        tested++;
        if (pixels[i] > 230 && pixels[i + 1] < 30 && pixels[i + 2] < 30) red++;
      }
      return { selector: s.selector, red, tested };
    });
  }
  results.push({ route, width, state, ...data });
}

try {
  let replacementHash;
  if (replace) {
    const red = await sharp({ create: { width: 48, height: 32, channels: 3, background: '#ff0000' } }).webp({ lossless: true }).toBuffer();
    replacementHash = hash(red);
    writeFileSync(asset, red);
  }
  for (const width of [1440, 390]) {
    for (const route of ['/', '/sell/', '/buy/', '/spasibo/']) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 900 });
      await page.setCacheEnabled(false);
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.evaluateOnNewDocument(() => {
        new PerformanceObserver(list => {
          const e = list.getEntries().at(-1);
          window.__paperLcp = { tag: e.element?.tagName, class: e.element?.className, url: e.url, time: e.startTime };
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
      await page.goto('http://127.0.0.1:4321' + route, { waitUntil: 'networkidle0' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(async img => { img.loading = 'eager'; await img.decode().catch(() => {}); }));
      });
      await audit(page, route, width, 'page');
      if (snapshots && route === '/' && width === 1440) {
        for (const [name, selector] of [['note', '.fast-sale-note'], ['faq', '.faq-card-accordion'], ['signature', '.director-signature'], ['guild', '.guild-note'], ['review', '.review-card']]) {
          const el = await page.$(selector);
          if (!el || !await el.evaluate(e => e.getBoundingClientRect().width > 0)) continue;
          await el.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
          await page.screenshot({ path: `${out}/${name}-after.png` });
        }
      }
      if (snapshots && width === 390) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: `${out}/${route.replaceAll('/', '') || 'home'}-390.png` });
      }
      // Exercise the real dialog click handler through a temporary DOM trigger.
      // No forms are submitted; the trigger is removed immediately after click.
      const modes = await page.$$eval('[data-dialog-form]', es => es.map(e => e.dataset.dialogForm));
      for (const mode of modes) {
        await page.evaluate(mode => {
          const button = document.createElement('button');
          button.dataset.lead = 'TASK-044 QA';
          if (mode === 'buy' || mode === 'sell') button.dataset.quizDialog = mode;
          else button.dataset.leadPopup = mode;
          document.body.append(button); button.click(); button.remove();
        }, mode);
        await page.waitForFunction(() => !document.querySelector('#lead-dialog')?.classList.contains('is-opening'));
        await audit(page, route, width, 'popup:' + mode);
        await page.$eval('#lead-dialog', e => e.close());
      }
      await page.close();
    }
  }
  writeFileSync(`${out}/${replace ? 'replacement' : 'after'}.json`, JSON.stringify({ originalHash: hash(original), replacementHash, surfaceExpectations, results }, null, 2));
  const table = [...new Map(results.flatMap(r => r.surfaces.map(s => [s.selector, { selector: s.selector, expected: s.expected, reason: s.reason }]))).values()].sort((a, b) => a.selector.localeCompare(b.selector));
  writeFileSync(`${out}/surface-expectations.json`, JSON.stringify(table, null, 2));
  if (results.some(r => r.failures.length || r.overlays.length || (r.width === 390 && r.overflow > 0) || (r.width === 1440 && r.state === 'page' && expected[r.route] && r.height !== expected[r.route]))) process.exitCode = 1;
  console.log(JSON.stringify({ replace, states: results.length, failures: results.reduce((n, r) => n + r.failures.length, 0), overlays: results.reduce((n, r) => n + r.overlays.length, 0), outside: results.flatMap(r => r.beigeOutside), desktop: results.filter(r => r.width === 1440 && r.state === 'page').map(r => ({ route: r.route, height: r.height, expected: expected[r.route], surfaces: r.surfaces.length })), overflow: results.filter(r => r.state === 'page').map(r => [r.route, r.width, r.overflow]) }, null, 2));
} finally {
  if (replace) writeFileSync(asset, original);
  const restored = hash(readFileSync(asset));
  await browser.close();
  if (restored !== hash(original)) throw new Error('Texture restoration sha256 mismatch');
  console.log('Asset SHA-256:', restored);
}
// Standalone CLI: all reports are sync-written and Chrome is closed above.
// Exit with the audit result even if a dependency retains a worker handle.
process.exit(process.exitCode || 0);
