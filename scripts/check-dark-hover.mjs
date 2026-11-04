#!/usr/bin/env node
/** README: node scripts/check-dark-hover.mjs [baseURL] [--out directory]
 * Uses existing puppeteer-core + system Chrome; no installation/dependencies.
 * PUPPETEER_MODULE may point to an existing puppeteer-core module entry.
 * Every rendered .button (including CTA links) is scrolled into view. The PNG
 * ring 9–17px outside its box measures the actual composited surface (photos,
 * overlays and paper included), independently of data-surface annotations.
 * Brightness = mean weighted sRGB / 255; dark < .35. Nearest opaque ancestor
 * is recorded too. A nearer opaque card/pseudo-element takes priority so the
 * ring cannot mistake the surrounding dark section for a light paper card.
 * Checks hover + keyboard focus, desktop/mobile, menu and all lead popup types.
 *
 * TASK-042/042b summary, verified 2026-10-28 (system Chrome): 131 checks,
 * 0 FAIL, exit 0. Full states/computed/pixel table: agent-context/TASK-042b/.
 * Dark surfaces are container attributes; Paper/data-surface=light stop the
 * scope. Certificates' local hack is removed. CompanyAbout is dark;
 * ClientCases is dark with a light cases-container. White overrides surface.
 *
 * | Case                       | Surface | Normal bg/text | Hover + focus bg/text | Result |
 * | Download presentation      | dark    | ea1818/ffffff  | ffffff/1a1a1a         | OK, 17.40:1 |
 * | Subscribe (public white)   | dark    | ffffff/1a1a1a  | ea1818/ffffff         | OK, 4.52:1 |
 * | White variant fixtures     | both    | ffffff/1a1a1a  | ea1818/ffffff         | OK |
 * | ClientCases red CTA        | light   | ea1818/ffffff  | c91010/ffffff         | OK |
 * | Telegram / SVG / mask icon | both    | fixed colour   | same color/fill/filter| OK, 0 changed px |
 * | White CTA after actual tap | dark    | ffffff/1a1a1a  | ffffff/1a1a1a         | OK, no sticky hover |
 *
 * White inventory: public HomeRecruiting "Subscribe" (desktop + mobile).
 * No other public white CTAs in photos/dialogs/menu/footer. Admin additionally
 * defines Objects, Texts, Reload list, Reload texts, Fields, Preview: all six
 * tested on disposable DOM copies without login/actions/saving; Cancel all is
 * disabled (no hover/focus; see admin-white-inventory.json).
 * currentColor SVG + mask icons are also tested on light/dark fixtures.
 * Real Telegram brand SVG stays blue (#2AABEE) + white, filter none throughout;
 * its computed styles and isolated rendered pixels are identical in all states.
 * Mobile: hover:none retains base paint, keyboard focus uses variant/surface.
 * White actual tap proof: white-touch.json; full measured values: summary.json.
 * 1440 heights: / 17785, /sell/ 16105, /buy/ 15972 (unchanged).
 * npm check: only existing TS2307 node:crypto in HeroQuizCard; build: 8 pages OK.
 * Hover screenshots: hover-company-about.png, hover-white-home-recruiting.png.
 * Previous agent-context/TASK-042 report and Khariton-TASK-042b scratch removed.

 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
const base =
  process.argv.find((a) => /^https?:/.test(a)) || "http://127.0.0.1:4321";
const oi = process.argv.indexOf("--out");
const out = resolve(oi < 0 ? "agent-context/TASK-042b" : process.argv[oi + 1]);
mkdirSync(out, { recursive: true });
const candidates = [
  process.env.PUPPETEER_MODULE,
  "puppeteer-core",
  "/private/tmp/claude-501/tools/node_modules/puppeteer-core",
];
const cache = join(process.env.HOME, ".npm/_npx");
if (existsSync(cache))
  for (const d of readdirSync(cache))
    candidates.push(join(cache, d, "node_modules/puppeteer-core"));
let p;
for (const c of candidates.filter(Boolean)) {
  try {
    p = createRequire(import.meta.url)(c);
    break;
  } catch {}
}
if (!p)
  throw Error(
    "Existing puppeteer-core required; see scripts/README-responsive-check.md",
  );
const browser = await p.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const rows = [],
  heights = {},
  shots = new Set();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const page = await browser.newPage();
const iconPage = await browser.newPage();
await iconPage.setViewport({ width: 240, height: 100, deviceScaleFactor: 1 });
// Give isolated icon captures the site's origin without loading app scripts.
await iconPage.setRequestInterception(true);
iconPage.on("request", (r) =>
  r.isNavigationRequest()
    ? r.respond({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><html><body></body></html>",
      })
    : r.continue(),
);
await iconPage.goto(base + "/__hover_icon_audit__", {
  waitUntil: "domcontentloaded",
});

await page.bringToFront();
// Keep the real Vite client (including its CSS exports). Ignore only HMR
// messages in this isolated test tab; a blank /@vite/client breaks CSS modules.
await page.evaluateOnNewDocument(() => {
  const Native = window.WebSocket;
  window.WebSocket = class extends Native {
    constructor(url, protocols) {
      super(url, protocols);
      if (
        protocols === "vite-hmr" ||
        (Array.isArray(protocols) && protocols.includes("vite-hmr"))
      ) {
        const add = this.addEventListener.bind(this);
        this.addEventListener = (type, listener, options) => {
          if (type !== "message") return add(type, listener, options);
          return add(
            type,
            (event) => {
              let message;
              try {
                message = JSON.parse(event.data);
              } catch {}
              if (
                message &&
                message.type !== "connected" &&
                message.type !== "ping"
              )
                return;
              if (typeof listener === "function") listener.call(this, event);
              else listener?.handleEvent(event);
            },
            options,
          );
        };
      }
    }
  };
});
await page.evaluateOnNewDocument(() => {
  localStorage.setItem("monopoly-cookie-choice-v1", "rejected");
});
// Capture rendered icons on the same neutral backing. Raw screenshots on the
// button would count transparent corners changing from white to red as a false
// icon change. Computed styles are frozen only on disposable clones, never on
// the real icon; brand fills, currentColor, masks and filters are all retained.
async function iconSample(el) {
  const computed = await el.evaluate((e) =>
    [...e.querySelectorAll('img, svg, [class*="icon"], [data-button-icon]')]
      .flatMap((root) => [root, ...root.querySelectorAll("*")])
      .map((n) => {
        const c = getComputedStyle(n);
        return {
          tag: n.tagName,
          color: c.color,
          fill: c.fill,
          stroke: c.stroke,
          filter: c.filter,
          background: c.backgroundColor,
          mask: c.maskImage,
        };
      }),
  );
  const markup = await el.evaluate((e) => {
    const candidates = [
      ...e.querySelectorAll('img, svg, [class*="icon"], [data-button-icon]'),
    ];
    const roots = candidates.filter(
      (n) => !candidates.some((p) => p !== n && p.contains(n)),
    );
    if (!roots.length) return null;
    const host = document.createElement("div");
    host.id = "hover-icon-proof";
    host.style =
      "position:fixed!important;left:4px!important;top:4px!important;display:flex!important;gap:8px!important;padding:8px!important;background:#808080!important;z-index:2147483647!important;pointer-events:none!important;align-items:center!important";
    for (const original of roots) {
      const clone = original.cloneNode(true);
      const originals = [original, ...original.querySelectorAll("*")],
        clones = [clone, ...clone.querySelectorAll("*")];
      originals.forEach((n, i) => {
        if (n instanceof HTMLImageElement) {
          clones[i].src = n.currentSrc || n.src;
          clones[i].loading = "eager";
          clones[i].removeAttribute("srcset");
        }
        const cs = getComputedStyle(n);
        for (const prop of cs)
          clones[i].style.setProperty(
            prop,
            cs.getPropertyValue(prop),
            "important",
          );
        clones[i].style.setProperty("animation", "none", "important");
        clones[i].style.setProperty("transition", "none", "important");
      });
      for (const [prop, value] of Object.entries({
        position: "relative",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        transform: "none",
        margin: "0px",
      }))
        clone.style.setProperty(prop, value, "important");
      host.append(clone);
    }
    return host.outerHTML;
  });
  if (!markup) return { computed, png: null };
  // A separate fixed viewport avoids mobile visualViewport/clip artefacts.
  await iconPage.setContent(`<base href="${base}/">${markup}`);
  await iconPage.evaluate(async () =>
    Promise.all([...document.images].map((i) => i.decode())),
  );
  const png = await iconPage.screenshot({ encoding: "base64" });
  return { computed, png };
}
async function iconPixelDiff(a, b) {
  if (a === b) return 0;
  if (!a || !b) return -1;
  return page.evaluate(
    async ({ a, b }) => {
      const read = async (png) => {
        const i = new Image();
        i.src = "data:image/png;base64," + png;
        await i.decode();
        const c = document.createElement("canvas");
        c.width = i.width;
        c.height = i.height;
        const x = c.getContext("2d");
        x.drawImage(i, 0, 0);
        return {
          w: i.width,
          h: i.height,
          p: x.getImageData(0, 0, i.width, i.height).data,
        };
      };
      const x = await read(a),
        y = await read(b);
      if (x.w !== y.w || x.h !== y.h) return -1;
      let diff = 0;
      for (let i = 0; i < x.p.length; i += 4)
        if (
          x.p[i] !== y.p[i] ||
          x.p[i + 1] !== y.p[i + 1] ||
          x.p[i + 2] !== y.p[i + 2] ||
          x.p[i + 3] !== y.p[i + 3]
        )
          diff++;
      return diff;
    },
    { a, b },
  );
}
async function scan(route, context = "page", selector = ".button") {
  const modal = await page.$("dialog[open]");
  const elements = await page.$$(modal ? "dialog[open] .button" : selector);
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (
      !(await el.evaluate(
        (e) =>
          e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) &&
          !e.closest("[inert]") &&
          !e.disabled,
      ))
    )
      continue;
    await page.mouse.move(0, 0);
    await el.evaluate((e) =>
      e.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "instant",
      }),
    );
    await wait(80);
    await page.mouse.move(0, 0);
    await el.evaluate((e) => e.blur());
    await wait(80);
    const info = await el.evaluate((e) => {
      const r = e.getBoundingClientRect();
      const x = r.x + r.width / 2,
        y = r.y + r.height / 2;
      if (
        x < 0 ||
        x >= innerWidth ||
        y < 0 ||
        y >= innerHeight ||
        !e.contains(document.elementFromPoint(x, y))
      )
        return null;
      let ancestor = null;
      for (let a = e.parentElement; a; a = a.parentElement) {
        const c = getComputedStyle(a).backgroundColor;
        const v = c.match(/[\d.]+/g)?.map(Number);
        if (v && (v.length === 3 || v[3] >= 0.95)) {
          ancestor = { class: a.className, color: c };
          break;
        }
      }
      // Paper paint lives on ::after, while its own background is transparent.
      // Read actual paint, not the data-surface annotation being tested.
      let paintedSurface = null;
      for (
        let a = e.parentElement;
        a && !a.matches("section,footer,main,body");
        a = a.parentElement
      ) {
        const box = a.getBoundingClientRect();
        if (
          r.x < box.x ||
          r.y < box.y ||
          r.right > box.right ||
          r.bottom > box.bottom
        )
          continue;
        for (const pseudo of [null, "::after", "::before"]) {
          const st = getComputedStyle(a, pseudo);
          if (
            pseudo &&
            (st.content === "none" ||
              st.display === "none" ||
              Number(st.opacity) < 0.95)
          )
            continue;
          const v = st.backgroundColor.match(/[\d.]+/g)?.map(Number);
          if (v && (v.length === 3 || v[3] >= 0.95)) {
            paintedSurface = {
              class: a.className,
              pseudo,
              color: st.backgroundColor,
              brightness: (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255,
            };
            break;
          }
        }
        if (paintedSurface) break;
      }
      const section = e.closest(
        "main > section, main > .home-surface-run > section, footer",
      );
      return {
        isWhite: e.classList.contains("white"),
        text: e.textContent.trim().replace(/\s+/g, " "),
        section: section?.className || "",
        surface:
          e.closest("[data-surface],.paper")?.getAttribute("data-surface") ||
          (e.closest(".paper") ? "light (paper)" : null),
        rect: { x: r.x, y: r.y, width: r.width, height: r.height },
        neighbors: [...document.querySelectorAll(".button")]
          .filter((b) => b !== e && b.checkVisibility())
          .map((b) => {
            const q = b.getBoundingClientRect();
            return {
              x: q.x - 4,
              y: q.y - 4,
              right: q.right + 4,
              bottom: q.bottom + 4,
            };
          }),
        ancestor,
        paintedSurface,
      };
    });
    if (!info) continue;
    const normal = await el.evaluate((e) => ({
      background: getComputedStyle(e, "::before").backgroundColor,
      color: getComputedStyle(e).color,
    }));
    const basePaint = normal.background;
    const normalIcons = info.isWhite ? await iconSample(el) : null;
    const accent = await el.evaluate((e) => {
      const probe = document.createElement("span");
      probe.style.color =
        getComputedStyle(e).getPropertyValue("--color-accent");
      e.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    });
    const png = await page.screenshot({ encoding: "base64" });
    const ringBrightness = await page.evaluate(
      async ({ png, r, neighbors }) => {
        const img = new Image();
        img.src = "data:image/png;base64," + png;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        let sum = 0,
          n = 0;
        const left = Math.floor(r.x),
          top = Math.floor(r.y),
          right = Math.ceil(r.x + r.width),
          bottom = Math.ceil(r.y + r.height);
        for (
          let y = Math.max(0, top - 17);
          y < Math.min(c.height, bottom + 17);
          y += 2
        )
          for (
            let x = Math.max(0, left - 17);
            x < Math.min(c.width, right + 17);
            x += 2
          ) {
            if (x > left - 9 && x < right + 9 && y > top - 9 && y < bottom + 9)
              continue;
            // A nearby white CTA is not the surface behind this button.
            if (
              neighbors.some(
                (q) => x >= q.x && x <= q.right && y >= q.y && y <= q.bottom,
              )
            )
              continue;
            const d = ctx.getImageData(x, y, 1, 1).data;
            sum += (0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2]) / 255;
            n++;
          }
        return sum / n;
      },
      { png, r: info.rect, neighbors: info.neighbors },
    );
    const brightness = info.paintedSurface?.brightness ?? ringBrightness;
    const dark = brightness < 0.35;
    await el.hover();
    await wait(460);
    const paint = () =>
      el.evaluate((e) => ({
        background: getComputedStyle(e, "::before").backgroundColor,
        color: getComputedStyle(e).color,
      }));
    const hover = await paint();
    const hoverIcons = info.isWhite ? await iconSample(el) : null;
    const white = (c) => c === "rgb(255, 255, 255)";
    await page.mouse.move(0, 0);
    await page.keyboard.press("Tab");
    await el.evaluate((e) => e.focus());
    await wait(460);
    const focus = await paint();
    const focusIcons = info.isWhite ? await iconSample(el) : null;
    await el.evaluate((e) => e.blur());
    const touchLayout = await page.evaluate(
      () => matchMedia("(hover: none)").matches,
    );
    const iconDiffHover = info.isWhite
      ? await iconPixelDiff(normalIcons.png, hoverIcons.png)
      : null;
    const iconDiffFocus = info.isWhite
      ? await iconPixelDiff(normalIcons.png, focusIcons.png)
      : null;
    const iconComputedSame =
      !info.isWhite ||
      (JSON.stringify(normalIcons.computed) ===
        JSON.stringify(hoverIcons.computed) &&
        JSON.stringify(normalIcons.computed) ===
          JSON.stringify(focusIcons.computed));
    const expected = info.isWhite ? accent : dark ? "rgb(255, 255, 255)" : null;
    const stateOK = (state) =>
      expected
        ? state.background === expected &&
          (!info.isWhite || state.color === "rgb(255, 255, 255)")
        : !white(state.background);
    const ok =
      (touchLayout
        ? hover.background === normal.background && hover.color === normal.color
        : stateOK(hover)) &&
      stateOK(focus) &&
      iconComputedSame &&
      (!info.isWhite || (iconDiffHover === 0 && iconDiffFocus === 0));
    const row = {
      page: route,
      context,
      variant: info.isWhite ? "white" : "other",
      normal,
      icons: info.isWhite
        ? {
            normal: normalIcons.computed,
            hover: hoverIcons.computed,
            focus: focusIcons.computed,
            pixelDiffHover: iconDiffHover,
            pixelDiffFocus: iconDiffFocus,
            computedSame: iconComputedSame,
          }
        : null,
      button: info.text,
      section: info.section,
      surface:
        (dark ? "dark" : "light") +
        (info.paintedSurface ? " (nearest paint)" : " (pixels/photo)"),
      ringBrightness: +ringBrightness.toFixed(3),
      paintedSurface: info.paintedSurface,
      brightness: +brightness.toFixed(3),
      annotation: info.surface,
      hover: hover.background,
      color: hover.color,
      focus: focus.background,
      focusColor: focus.color,
      result: ok ? "OK" : "FAIL",
      ancestor: info.ancestor,
    };
    rows.push(row);
    console.log(
      `${row.page} · ${row.context} · ${row.button} · ${row.surface} · ${row.hover} · ${row.result}`,
    );
    writeFileSync(join(out, "partial.json"), JSON.stringify(rows, null, 2));
    if (info.isWhite && context === "page") {
      await el.hover();
      await wait(460);
      await page.screenshot({
        path: join(out, "hover-white-" + info.section + ".png"),
      });
    }
    const key = info.section.split(" ")[0];
    if (
      ((dark &&
        [
          "certificates",
          "equal-interests",
          "home-recruiting",
          "prepared-viewing",
          "trust-and-viewing",
          "office-consultation",
          "company-about",
        ].includes(key)) ||
        (!dark && ["home-hero", "fast-sale"].includes(key))) &&
      !shots.has(key)
    ) {
      shots.add(key);
      await el.hover();
      await wait(450);
      await page.screenshot({ path: join(out, `hover-${key}.png`) });
    }
  }
}
try {
  await page.setViewport({ width: 1440, height: 900 });
  for (const route of ["/", "/sell/", "/buy/", "/spasibo/"]) {
    await page.goto(base + route, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    // Load lazy images before recording geometry and sampling composited surfaces.
    await page.evaluate(async () => {
      const imgs = [...document.images];
      imgs.forEach((i) => (i.loading = "eager"));
      await Promise.race([
        Promise.all(imgs.map((i) => i.decode().catch(() => {}))),
        new Promise((r) => setTimeout(r, 4000)),
      ]);
    });
    heights[route] = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    await scan(route);
  }
  // Exercise the white variant on both surfaces, including currentColor SVG
  // and mask icons, independently of the current public content inventory.
  await page.goto(base + "/", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const host = document.createElement("div");
    host.id = "white-contract";
    host.style =
      "position:fixed;inset:100px 20px auto;z-index:999999;background:#ddd;padding:24px";
    host.innerHTML = ["dark", "light"]
      .map(
        (surface) =>
          `<div data-surface="${surface}" style="background:${surface === "dark" ? "#1c1c1c" : "#fff"};padding:24px"><button class="button white">white on ${surface}<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M0 0h16v16H0z"/></svg><span data-button-icon style="display:inline-block;width:16px;height:16px;background:currentColor;mask:url('/assets/icon-external-link.svg') center/contain no-repeat"></span></button></div>`,
      )
      .join("");
    document.body.append(host);
  });
  await scan("/", "white component contract", "#white-contract .button");
  // Admin defines additional white controls behind its login. Test disposable
  // DOM copies without logging in, changing data, clicking actions or saving.
  await page.goto(base + "/admin/", { waitUntil: "networkidle0" });
  const adminWhite = await page.evaluate(() => {
    const controls = [...document.querySelectorAll(".button.white")];
    const inventory = controls.map((e) => ({
      text: e.textContent.trim(),
      disabled: e.disabled,
      rendered: e.checkVisibility(),
    }));
    const host = document.createElement("div");
    host.id = "admin-white-audit";
    host.dataset.surface = "light";
    host.style =
      "position:fixed;inset:100px 20px auto;display:flex;gap:24px;flex-wrap:wrap;z-index:999999;background:#fff;padding:24px";
    controls.forEach((e) => {
      const clone = e.cloneNode(true);
      clone.removeAttribute("id");
      host.append(clone);
    });
    document.body.append(host);
    return inventory;
  });
  writeFileSync(
    join(out, "admin-white-inventory.json"),
    JSON.stringify(adminWhite, null, 2),
  );
  await scan("/admin/", "white admin DOM copies", "#admin-white-audit .button");
  await page.goto(base + "/", { waitUntil: "networkidle0" });
  for (const type of [
    "callback",
    "office",
    "analysis",
    "closed-base",
    "service",
    "team",
    "mortgage",
    "viewing",
    "new-build",
    "buy",
    "sell",
  ]) {
    await page.evaluate((type) => {
      const trigger = document.createElement("button");
      trigger.dataset.lead = "Hover audit";
      trigger.dataset.leadPopup = type;
      document.body.append(trigger);
      trigger.click();
      trigger.remove();
    }, type);
    await wait(350);
    await scan("/", `popup:${type}`);
    await page.keyboard.press("Escape");
    await wait(350);
  }
  await page.setViewport({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
  });
  // On touch, hovering must retain base paint; keyboard focus still follows surface.
  for (const route of ["/", "/sell/", "/buy/", "/spasibo/"]) {
    await page.goto(base + route, { waitUntil: "networkidle0" });
    await scan(route, "mobile touch + keyboard");
  }
  await page.goto(base + "/", { waitUntil: "networkidle0" });
  const menu = await page.$(".menu-button");
  if (menu) {
    await menu.click();
    await wait(400);
    await scan("/", "mobile menu");
    await page.keyboard.press("Escape");
  }
  const touch = await page.evaluate(() => {
    const host = document.createElement("div");
    host.dataset.surface = "dark";
    host.style =
      "position:fixed;top:300px;left:20px;z-index:999999;background:#1c1c1c;padding:20px";
    host.innerHTML = '<button class="button red">Touch probe</button>';
    document.body.append(host);
    return matchMedia("(hover: none)").matches;
  });
  const probe = await page.$("[data-surface=dark] > .button:last-child");
  if (probe) {
    await probe.tap();
    await wait(460);
    const tapped = await probe.evaluate((e) => ({
      background: getComputedStyle(e, "::before").backgroundColor,
      focusVisible: e.matches(":focus-visible"),
    }));
    rows.push({
      page: "/",
      context: "actual touch tap",
      button: "Touch probe",
      surface: "dark",
      hover: tapped.background,
      result:
        touch &&
        tapped.background === "rgb(234, 24, 24)" &&
        !tapped.focusVisible
          ? "OK"
          : "FAIL",
    });
    const client = await page.createCDPSession();
    await client.send("DOM.enable");
    await client.send("CSS.enable");
    const { root } = await client.send("DOM.getDocument");
    const { nodeId } = await client.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector: 'body > [data-surface="dark"] > .button',
    });
    await client.send("CSS.forcePseudoState", {
      nodeId,
      forcedPseudoClasses: ["hover"],
    });
    await wait(460);
    const bg = await probe.evaluate(
      (e) => getComputedStyle(e, "::before").backgroundColor,
    );
    rows.push({
      page: "/",
      context: "touch forced :hover",
      button: "Touch probe",
      surface: "dark",
      hover: bg,
      result: touch && bg === "rgb(234, 24, 24)" ? "OK" : "FAIL",
    });
  }
  writeFileSync(
    join(out, "results.json"),
    JSON.stringify({ heights, rows }, null, 2),
  );
  const table = [
    "| страница · контекст | кнопка · вариант | поверхность | обычное фон/текст | hover фон/текст | focus фон/текст | иконка Δpx hover/focus | результат |",
    "|---|---|---|---|---|---|---|---|---|",
    ...rows.map(
      (r) =>
        `| ${r.page} · ${r.context} | ${r.button} · ${r.variant ?? "probe"} | ${r.surface} | ${r.normal?.background ?? ""}/${r.normal?.color ?? ""} | ${r.hover}/${r.color ?? ""} | ${r.focus ?? ""}/${r.focusColor ?? ""} | ${r.icons ? `${r.icons.pixelDiffHover}/${r.icons.pixelDiffFocus}` : "—"} | ${r.result} |`,
    ),
  ];
  console.log(table.join("\n"));
  console.log("Heights:", heights);
  const failures = rows.filter((r) => r.result === "FAIL");
  console.log(`${rows.length} checks, ${failures.length} FAIL`);
  writeFileSync(join(out, "table.md"), table.join("\n") + "\n");
  process.exitCode = failures.length ? 1 : 0;
} finally {
  await browser.close();
}
