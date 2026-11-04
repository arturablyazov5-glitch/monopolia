/** TASK-050: audit shared diamonds on the existing dev server; no server control.
 * node scripts/check-bullets.mjs [before|after|experiment|gap-before|gap-after]
 * TASK-050b: gap modes are read-only for the SVG; Range measurements, wrapping,
 * hanging indent and close-ups at 1440/390/360/320 go to task-050b/.
 * Evidence: design-reference/task-050/. puppeteer-core uses responsive-check's cache.
 * experiment replaces the actual SVG and restores its exact bytes in finally.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch { puppeteer = require('/private/tmp/claude-501/tools/node_modules/puppeteer-core'); }
const mode = process.argv[2] || 'after';
if (mode.startsWith('gap-')) {
  await checkGaps(mode);
  process.exit(0);
}
const out = new URL('../design-reference/task-050/', import.meta.url);
await mkdir(out, { recursive: true });
const asset = new URL('../public/assets/icons/bullet-diamond.svg', import.meta.url);
const source = new URL('../design-reference/bullet-diamond-source.svg', import.meta.url);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const original = mode === 'experiment' ? await readFile(asset) : null;
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox'] });
const report = [];
try {
  if (original) {
    assert.equal(hash(original), hash(await readFile(source)));
    await writeFile(asset, '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13"><circle cx="7" cy="6.5" r="6" fill="#00ff00"/></svg>');
  }
  for (const width of [1440, 390]) {
    const page = await browser.newPage();
    const testedModes = new Set();
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.setCacheEnabled(false);
    for (const route of ['/', '/sell/', '/buy/']) {
      await page.goto(`http://127.0.0.1:4321${route}`, { waitUntil: 'networkidle2' });
      await page.evaluate(() => document.fonts.ready);
      const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.evaluate(async () => {
        // Fixed consent banner otherwise obscures close-ups; browser-only QA.
        document.querySelector('[data-cookie-banner]')?.remove();
        await Promise.all([...document.images].map(async image => {
          image.loading = 'eager';
          await Promise.race([image.decode().catch(() => {}), new Promise(r => setTimeout(r, 5000))]);
        }));
      });
      const result = await page.evaluate(() => {
        const name = el => `${el.tagName.toLowerCase()}.${el.className} (parent: ${el.parentElement?.className})`;
        const markers = [...document.querySelectorAll('.bullet-list > li, .bullet-point')].map(el => {
          const s = getComputedStyle(el, '::before');
          return { selector: name(el), image: s.backgroundImage, width: s.width, height: s.height, top: s.top, lineHeight: getComputedStyle(el).lineHeight };
        });
        const leftovers = [];
        const exceptions = [];
        for (const el of document.querySelectorAll('body *')) for (const pseudo of [null, '::before', '::after']) {
          const s = getComputedStyle(el, pseudo);
          const polygon4 = s.clipPath.startsWith('polygon(') && s.clipPath.split(',').length === 4;
          const matrix = s.transform.match(/^matrix\(([^)]+)\)/)?.[1].split(',').map(Number);
          const rotated = matrix && Math.abs(Math.abs(matrix[0]) - Math.abs(matrix[1])) < .002 && Math.abs(matrix[0]) > .01;
          const color = s.backgroundColor.match(/[\d.]+/g)?.map(Number);
          const red = color && color[0] > 150 && color[1] < 80 && color[2] < 80 && (color[3] ?? 1) > 0;
          if (red && (polygon4 || rotated)) {
            const entry = { selector: name(el), pseudo, transform: s.transform, clipPath: s.clipPath };
            if (el.matches('.company-number i')) exceptions.push({ ...entry, reason: 'Trailing decoration beside company statistics, not a list bullet; CompanyAbout belongs to concurrent number-text task.' });
            else leftovers.push(entry);
          }
        }
        const expected = document.querySelectorAll('.case-columns li, .diamond-list > li, .sell-valuation-points li, .recruiting-list > li, .deal-step-list > li, .service-card h3').length;
        return { height: document.documentElement.scrollHeight, markers, expected, leftovers, exceptions,
          dialogs: [...document.querySelectorAll('dialog')].map(el => ({ id: el.id, diamonds: el.querySelectorAll('.bullet-list > li, .bullet-point').length })),
          nonDiamondLists: [...document.querySelectorAll('.faq-answer-text ul')].map(el => ({ style: getComputedStyle(el).listStyleType, count: el.children.length })) };
      });
      result.initialHeight = initialHeight;
      if (mode !== 'before') {
        assert.equal(result.markers.length, result.expected, `${width} ${route}: coverage`);
        assert(result.markers.length > 0 || route === '/buy/');
        for (const marker of result.markers) {
          assert(marker.image.includes('bullet-diamond.svg'), marker.selector);
          assert.equal(marker.width, '14px', marker.selector);
          assert.equal(marker.height, '13px', marker.selector);
          if (Number.isFinite(parseFloat(marker.lineHeight))) {
            assert(Math.abs(parseFloat(marker.top) - (parseFloat(marker.lineHeight) - 13) / 2) < .03, `${marker.selector}: first line alignment`);
          }
        }
        assert.equal(result.leftovers.length, 0, JSON.stringify(result.leftovers));
      }
      if (mode === 'experiment') {
        result.replacement = await page.evaluate(async () => {
          const nodes = [...document.querySelectorAll('.bullet-list > li, .bullet-point')];
          const urls = [...new Set(nodes.map(el => getComputedStyle(el, '::before').backgroundImage.match(/url\("?([^"\)]+)/)?.[1]))];
          const resources = [];
          for (const url of urls) {
            const image = new Image(); image.src = url; await image.decode();
            const canvas = document.createElement('canvas'); canvas.width = 14; canvas.height = 13;
            const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
            resources.push({ url, green: (await (await fetch(url, { cache: 'no-store' })).text()).includes('#00ff00'), renderedPixel: [...context.getImageData(7, 6, 1, 1).data] });
          }
          return { total: nodes.length, resources };
        });
        assert(result.replacement.resources.every(r => r.green && r.renderedPixel.join() === '0,255,0,255'));
      }
      const targets = route === '/' ? { cases: '.case-columns ul', services: '.service-card-title', staff: '.staff-card .diamond-list', faq: '.faq-answer-text' } : route === '/sell/' ? { steps: '.deal-step-list' } : {};
      for (const [name, selector] of Object.entries(targets)) {
        const el = await page.$(selector);
        if (el) {
          await el.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' }));
          await new Promise(r => setTimeout(r, 200));
          await el.screenshot({ path: fileURLToPath(new URL(`${mode}-${width}-${name}.png`, out)) });
        } else result[`missing-${name}`] = selector;
      }
      if (mode === 'after') {
        result.popupChecks = [];
        const modes = await page.$$eval('[data-lead]', nodes => [...new Set(nodes.map(el => el.dataset.leadPopup || el.dataset.quizDialog || 'callback'))]);
        for (const popup of modes) {
          if (testedModes.has(popup)) continue;
          await page.evaluate(popup => [...document.querySelectorAll('[data-lead]')].find(el => (el.dataset.leadPopup || el.dataset.quizDialog || 'callback') === popup)?.click(), popup);
          await new Promise(r => setTimeout(r, 500));
          const state = await page.evaluate(() => {
            const dialog = document.querySelector('#lead-dialog');
            return { open: dialog.open, diamonds: dialog.querySelectorAll('.bullet-list > li, .bullet-point').length,
              invalid: [...document.querySelectorAll('.bullet-list > li, .bullet-point')].filter(el => {
                const s = getComputedStyle(el, '::before');
                return s.width !== '14px' || s.height !== '13px' || !s.backgroundImage.includes('bullet-diamond.svg');
              }).length };
          });
          assert(state.open, popup); assert.equal(state.invalid, 0, popup);
          if (popup === 'callback') await page.screenshot({ path: fileURLToPath(new URL(`popup-${width}.png`, out)) });
          result.popupChecks.push({ popup, ...state }); testedModes.add(popup);
          await page.evaluate(() => document.querySelector('#lead-dialog .dialog-close').click());
          await new Promise(r => setTimeout(r, 500));
          assert.equal(await page.$eval('#lead-dialog', el => el.open), false);
        }
        const video = await page.$('button[data-video]:not([data-video=""])');
        if (video) {
          await video.evaluate(el => el.click());
          await new Promise(r => setTimeout(r, 500));
          result.videoLightbox = await page.$eval('#video-dialog', el => ({ open: el.open, diamonds: el.querySelectorAll('.bullet-list > li, .bullet-point').length }));
          assert(result.videoLightbox.open);
          await page.screenshot({ path: fileURLToPath(new URL(`lightbox-${width}-${route === '/' ? 'home' : route.split('/')[1]}.png`, out)) });
          await page.evaluate(() => document.querySelector('#video-dialog .video-dialog-close').click());
        }
      }
      report.push({ width, route, ...result });
    }
    await page.close();
  }
} finally {
  if (original) {
    await writeFile(asset, original);
    assert.equal(hash(await readFile(asset)), hash(await readFile(source)));
  }
  await browser.close();
}
await writeFile(new URL(`${mode}.json`, out), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.map(({ width, route, height, markers, leftovers, exceptions, replacement, ...rest }) => ({ width, route, height, markers: markers.length, leftovers, exceptions, replacement, ...rest })), null, 2));

async function checkGaps(mode) {
  const out = new URL('../design-reference/task-050b/', import.meta.url);
  await mkdir(out, { recursive: true });
  const baseline = mode === 'gap-after' ? JSON.parse(await readFile(new URL('gap-before.json', out))) : null;
  const asset = new URL('../public/assets/icons/bullet-diamond.svg', import.meta.url);
  const checksum = createHash('sha256').update(await readFile(asset)).digest('hex');
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const rows = [];
  try {
    for (const width of [1440, 390, 360, 320]) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      for (const route of ['/', '/sell/', '/buy/', '/ui-kit/']) {
        for (let attempt = 0; ; attempt++) {
          try {
            await page.goto(`http://127.0.0.1:4321${route}`, { waitUntil: 'networkidle2' });
            await page.evaluate(async () => {
              document.querySelector('[data-cookie-banner]')?.remove();
              await document.fonts.ready;
              await Promise.all([...document.images].map(async image => {
                image.loading = 'eager';
                await Promise.race([image.decode().catch(() => {}), new Promise(r => setTimeout(r, 4000))]);
              }));
            });
            break;
          } catch (error) {
            if (attempt >= 2 || !String(error).includes('Execution context was destroyed')) throw error;
          }
        }
        const oldGaps = baseline?.rows.find(r => r.width === width && r.route === route)?.markers.map(m => m.oldGap) || [];
        const result = await page.evaluate(oldGaps => {
          const selector = el => {
            const parts = [];
            while (el && el !== document.body) {
              parts.unshift(el.tagName.toLowerCase() + (el.id ? `#${el.id}` : [...el.classList].map(c => `.${c}`).join('')) + `:nth-of-type(${[...el.parentElement.children].filter(s => s.tagName === el.tagName).indexOf(el) + 1})`);
              el = el.parentElement;
            }
            return parts.join(' > ');
          };
          const height = document.documentElement.scrollHeight;
          // Inactive cases have display:none at mobile widths. Reveal only while
          // measuring, preserving their real container widths; restore each style.
          const changed = [];
          for (const el of document.querySelectorAll('.case-slide, .cases-content')) {
            if (getComputedStyle(el).display === 'none') {
              changed.push([el, el.getAttribute('style'), el.getAttribute('class')]);
              if (el.matches('.case-slide')) el.classList.add('is-in-category');
              el.style.setProperty('display', 'grid', 'important');
            }
          }
          const markers = [...document.querySelectorAll('.bullet-list > li, .bullet-point')].map((el, index) => {
            // Range rects are viewport aligned. Neutralize decorative rotations
            // while measuring CSS-space gaps, without changing wrapping widths.
            const transforms = [];
            for (let ancestor = el; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
              if (getComputedStyle(ancestor).transform !== 'none') {
                transforms.push([ancestor, ancestor.getAttribute('style')]);
                ancestor.style.setProperty('transform', 'none', 'important');
              }
            }
            const style = getComputedStyle(el);
            const pseudo = getComputedStyle(el, '::before');
            const probe = document.createElement('span');
            probe.style.cssText = `position:absolute;left:${pseudo.left};top:${pseudo.top};width:${pseudo.width};height:${pseudo.height};pointer-events:none;`;
            el.append(probe);
            const marker = probe.getBoundingClientRect(); probe.remove();
            const scale = marker.width / parseFloat(pseudo.width);
            const measureLines = () => {
            const lines = [];
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
              for (let i = 0; i < node.length; i++) {
                if (/\s/u.test(node.textContent[i])) continue;
                const range = document.createRange(); range.setStart(node, i); range.setEnd(node, i + 1);
                const rect = range.getBoundingClientRect();
                if (!rect.width || !rect.height) continue;
                let line = lines.find(line => Math.abs(line.y - rect.y) < Math.max(3, rect.height / 3));
                if (!line) { line = { y: rect.y, x: rect.x, text: '' }; lines.push(line); }
                line.x = Math.min(line.x, rect.x); line.text += node.textContent[i];
              }
            }
            lines.sort((a, b) => a.y - b.y);
            return lines;
            };
            const lines = measureLines();
            let beforeLines = null;
            if (oldGaps[index]) {
              const oldPadding = el.style.getPropertyValue('padding-left');
              const oldPriority = el.style.getPropertyPriority('padding-left');
              el.style.setProperty('padding-left', `${14 + parseFloat(oldGaps[index])}px`, 'important');
              beforeLines = measureLines().length;
              if (oldPadding) el.style.setProperty('padding-left', oldPadding, oldPriority); else el.style.removeProperty('padding-left');
            }
            const first = lines[0];
            const gap = first ? (first.x - marker.right) / scale : null;
            const token = parseFloat(style.getPropertyValue('--bullet-gap'));
            const result = { selector: selector(el), text: el.textContent.trim().replace(/\s+/g, ' '),
              gap, renderedGap: first ? first.x - marker.right : null, token: Number.isFinite(token) ? token : null,
              oldGap: style.getPropertyValue('--bullet-diamond-gap').trim(), lines: lines.length, beforeLines,
              lineText: lines.map(l => l.text), lineStartOffsets: first ? lines.map(l => (l.x - first.x) / scale) : [],
              width: pseudo.width, height: pseudo.height, image: pseudo.backgroundImage,
              centered: Math.abs(parseFloat(pseudo.top) - (parseFloat(style.lineHeight) - parseFloat(pseudo.height)) / 2) < .05,
              measurable: !!first, overflow: el.scrollWidth > el.clientWidth + 1 };
            for (const [ancestor, style] of transforms.reverse()) {
              if (style === null) ancestor.removeAttribute('style'); else ancestor.setAttribute('style', style);
            }
            return result;
          });
          for (const [el, style, classes] of changed) {
            if (style === null) el.removeAttribute('style'); else el.setAttribute('style', style);
            el.setAttribute('class', classes);
          }
          const lists = [...document.querySelectorAll('.bullet-list')].map((el, index) => ({
            index, selector: selector(el), gap: getComputedStyle(el).rowGap,
            parentGap: getComputedStyle(el.parentElement).rowGap,
          }));
          return { height, markers, lists, faq: [...document.querySelectorAll('.faq-answer-text ul')].map(el => getComputedStyle(el).listStyleType),
            footerMarkers: document.querySelectorAll('footer .bullet-list > li, footer .bullet-point').length,
            dialogMarkers: document.querySelectorAll('dialog .bullet-list > li, dialog .bullet-point').length };
        }, oldGaps);
        rows.push({ width, route, ...result });
        if ([1440, 390].includes(width)) {
          const targets = route === '/' ? { cases: '.case-columns ul', services: '.service-card-title', staff: '.staff-card .diamond-list', faq: '.faq-answer-text:has(ul)' } : route === '/sell/' ? { steps: '.deal-step-list', valuation: '.sell-valuation-points', dark: '.prepared-viewing-lists' } : {};
          for (const [name, selector] of Object.entries(targets)) {
            const el = await page.$(selector);
            if (!el) continue;
            if (name === 'faq') {
              await el.evaluate(el => {
                const button = el.closest('.faq-card-accordion').querySelector('.faq-toggle');
                if (button.getAttribute('aria-expanded') === 'false') button.click();
              });
              await new Promise(r => setTimeout(r, 400));
            }
            await el.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' }));
            await new Promise(r => setTimeout(r, 150));
            await el.screenshot({ path: fileURLToPath(new URL(`${mode}-${width}-${name}.png`, out)) });
          }
        }
      }
      await page.close();
    }
  } finally { await browser.close(); }
  assert.equal(createHash('sha256').update(await readFile(asset)).digest('hex'), checksum, 'SVG unchanged');
  await writeFile(new URL(`${mode}.json`, out), JSON.stringify({ checksum, rows }, null, 2));
  if (mode === 'gap-after') {
    const changed = [];
    const failures = [];
    const verticalBefore = JSON.parse(await readFile(new URL('vertical-before.json', out)));
    const vertical = ['width\tpage\tselector\tgap_before\tgap_after\tparent_gap_before\tparent_gap_after'];
    const table = ['width\tpage\tselector\tgap_css_px\tgap_rendered_px\ttoken\tlines_before\tlines_after'];
    for (const row of rows) {
      const oldListRow = verticalBefore.find(r => r.width === row.width && r.route === row.route);
      for (const list of row.lists) {
        const oldList = oldListRow?.result[list.index];
        vertical.push([row.width, row.route, list.selector, oldList?.gap || '', list.gap, oldList?.outerGap || '', list.parentGap].join('\t'));
      }
      for (const marker of row.markers) {
        const oldLines = marker.beforeLines;
        table.push([row.width, row.route, marker.selector, marker.gap?.toFixed(3), marker.renderedGap?.toFixed(3), marker.token, oldLines, marker.lines].join('\t'));
        if (oldLines && marker.lines > oldLines) changed.push({ width: row.width, route: row.route, selector: marker.selector, text: marker.text, before: oldLines, after: marker.lines });
        if (!marker.measurable || !Number.isFinite(marker.token) || Math.abs(marker.gap - marker.token) > 1 || !marker.centered || marker.lineStartOffsets.some(x => Math.abs(x) > 1) || marker.overflow || marker.width !== '14px' || marker.height !== '13px' || !marker.image.includes('bullet-diamond.svg')) failures.push({ width: row.width, route: row.route, ...marker });
      }
    }
    await writeFile(new URL('gap-table.tsv', out), table.join('\n'));
    await writeFile(new URL('vertical-table.tsv', out), vertical.join('\n'));
    await writeFile(new URL('wrapping.json', out), JSON.stringify(changed, null, 2));
    await writeFile(new URL('failures.json', out), JSON.stringify(failures, null, 2));
    console.log(JSON.stringify({ pages: rows.map(r => ({ width: r.width, route: r.route, height: r.height, count: r.markers.length })), increasedLines: changed.length, failures: failures.length }, null, 2));
    assert.equal(failures.length, 0, 'See task-050b/failures.json');
  } else console.log('Baseline saved:', rows.length, 'pages');
}
