// TASK-082. Real browser + disposable same-origin server; fixture credentials only.
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import * as fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname } from "node:path";
import { createAdminAPI } from "../server/admin-api.mjs";
import { passwordHash } from "../server/admin-auth.mjs";
import { frameHeaders, adminCsp } from "../src/lib/frame-policy.mjs";
import { siteTexts } from "../src/data/site-texts.mjs";
import { launchBrowser } from "./check-baseline.mjs";
const qa = "/private/tmp/claude-501/admin-grid-qa";
const listen = (server) =>
  new Promise((done) => server.listen(0, "127.0.0.1", done));
const close = (server) =>
  new Promise((done) => {
    server.close(done);
    server.closeAllConnections();
  });
const root = fileURLToPath(new URL("..", import.meta.url));
const dist = resolve(root, "dist");
const username = "preview-fixture-editor",
  password = "preview-fixture-passphrase";
async function fixture() {
  const directory = await fs.mkdtemp(
    "/private/tmp/claude-501/content-preview-",
  );
  let api,
    leads = 0;
  const server = createServer(async (req, res) => {
    for (const [name, value] of Object.entries(frameHeaders))
      res.setHeader(name, value);
    if (req.url.startsWith("/api/")) return api.handler(req, res);
    if (req.url === "/lead") {
      leads++;
      res.writeHead(403);
      return res.end();
    }
    try {
      let path = resolve(
        dist,
        "." + new URL(req.url, "http://localhost").pathname,
      );
      if (!path.startsWith(dist + "/") && path !== dist) throw Error();
      if ((await fs.stat(path)).isDirectory())
        path = resolve(path, "index.html");
      const bytes = await fs.readFile(path);
      res.writeHead(200, {
        "Content-Type":
          {
            ".html": "text/html; charset=utf-8",
            ".js": "text/javascript",
            ".css": "text/css",
            ".svg": "image/svg+xml",
            ".webp": "image/webp",
            ".woff2": "font/woff2",
            ".json": "application/json",
            ".jpg": "image/jpeg",
            ".png": "image/png",
            ".mp4": "video/mp4",
          }[extname(path)] || "application/octet-stream",
      });
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await listen(server);
  const origin = "http://127.0.0.1:" + server.address().port;
  api = await createAdminAPI({
    env: {
      DATA_DIR: directory,
      ADMIN_API_ORIGIN: origin,
      ALLOWED_ORIGINS: origin,
      ADMIN_USER: username,
      ADMIN_PASSWORD_HASH: await passwordHash(password),
    },
  });
  return {
    api,
    origin,
    get leads() {
      return leads;
    },
    cleanup: async () => {
      await close(server);
      await api.close();
      await fs.rm(directory, { recursive: true, force: true });
    },
  };
}
test("same-origin framing headers and admin CSP remain narrow in all serving paths", async () => {
  assert.deepEqual(frameHeaders, {
    "Content-Security-Policy": "frame-ancestors 'self'",
    "X-Frame-Options": "SAMEORIGIN",
  });
  const directives = new Map(
    adminCsp("https://api.example", "https://media.example")
      .split("; ")
      .map((d) => [d.split(" ")[0], d.slice(d.indexOf(" ") + 1)]),
  );
  assert.equal(directives.get("frame-src"), "'self'");
  assert.equal(directives.get("script-src"), "'self'");
  assert.equal(directives.get("object-src"), "'none'");
  assert.equal(directives.get("connect-src"), "'self' https://api.example");
  assert(!adminCsp().includes("*"));
  const nginx = await fs.readFile(
    new URL("../server/nginx.conf.example", import.meta.url),
    "utf8",
  );
  assert.match(
    nginx,
    /add_header Content-Security-Policy "frame-ancestors 'self'" always;/,
  );
  assert.match(nginx, /add_header X-Frame-Options "SAMEORIGIN" always;/);
  for (const file of ["../src/middleware.ts", "./share.mjs"]) {
    const source = await fs.readFile(new URL(file, import.meta.url), "utf8");
    assert.match(source, /Object.entries\(frameHeaders\)/);
  }
});
test(
  "browser: live draft preview, page/block navigation, bidirectional focus, real viewport widths, save/reset, foreign frame blocked",
  { skip: process.env.CONTENT_PREVIEW_BROWSER_TEST !== "1", timeout: 240000 },
  async () => {
    const s = await fixture();
    let browser, foreignServer;
    let page;
    const errors = [],
      consoleErrors = [],
      measurements = [];
    try {
      await fs.mkdir(qa, { recursive: true });
      browser = await launchBrowser();
      page = await browser.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (
          message.type() === "error" &&
          !/Failed to load resource|net::ERR_/.test(message.text())
        )
          consoleErrors.push(message.text());
      });
      await page.setViewport({ width: 1440, height: 1100 });
      const response = await page.goto(s.origin + "/admin/", {
        waitUntil: "networkidle0",
      });
      assert.equal(response.headers()["x-frame-options"], "SAMEORIGIN");
      assert.equal(
        response.headers()["content-security-policy"],
        "frame-ancestors 'self'",
      );
      assert.match(
        await page.$eval(
          'meta[http-equiv="Content-Security-Policy"]',
          (node) => node.content,
        ),
        /frame-src 'self'/,
      );
      await page.type("[name=username]", username);
      await page.type("[name=password]", password);
      await page.click("#login button[type=submit]");
      await page.waitForFunction(
        () => !document.querySelector("#workspace").hidden,
      );
      await page.click("#tab-texts");
      await page.waitForFunction(
        () =>
          document.querySelector("#content-preview-frame").dataset.ready ===
          "true",
        { polling: "mutation" },
      );
      const getFrame = async () =>
        await (await page.$("#content-preview-frame")).contentFrame();
      const choose = async (key) => {
        await page.$eval(`[data-content-page="${key}"]`, (node) =>
          node.click(),
        );
        await page.waitForFunction(
          () =>
            document.querySelector("#content-preview-frame").dataset.ready ===
            "true",
          { polling: "mutation" },
        );
        assert.equal(
          await page.evaluate(() => document.activeElement.dataset.contentPage),
          key,
        );
      };
      const mode = async (view) => {
        await page.$eval(`[data-content-view="${view}"]`, (node) =>
          node.click(),
        );
        await new Promise((r) => setTimeout(r, 60));
      };
      const set = async (id, value) => {
        await page.$eval(
          `[data-text-id="${id}"] textarea`,
          (node, value) => {
            node.focus();
            node.value = value;
            node.dispatchEvent(new Event("input", { bubbles: true }));
          },
          value,
        );
      };
      const text = async (id) =>
        (await getFrame()).evaluate((id) => {
          const node = [...document.querySelectorAll("[data-content-id]")].find(
            (n) => n.dataset.contentId.split(" ").includes(id),
          );
          const i = node.dataset.contentId.split(" ").indexOf(id);
          return [...node.childNodes]
            .filter((n) => n.nodeType === 3)
            [
              Number(node.dataset.contentSlots.split(" ")[i])
            ].textContent.trim();
        }, id);
      const allIds = new Set();
      for (const key of ["home", "sell", "buy", "common"]) {
        await choose(key);
        (
          await page.$$eval("[data-text-id]", (nodes) =>
            nodes.map((node) => node.dataset.textId),
          )
        ).forEach((id) => allIds.add(id));
      }
      assert.equal(allIds.size, 510);
      await choose("home");
      await page.$eval("[data-content-block]:nth-child(2)", (node) =>
        node.click(),
      );
      assert(
        await page.$eval(
          "[data-content-block]:nth-child(2)",
          (node) =>
            node.getAttribute("aria-current") === "location" &&
            document.getElementById(node.getAttribute("aria-controls")).open,
        ),
      );
      await set("home-hero.text.5", "Ш".repeat(180));
      assert(
        await page.$eval(
          '[data-text-id="home-hero.text.5"] textarea',
          (node) =>
            node.clientHeight > 100 &&
            node.scrollHeight <= node.clientHeight + 2,
        ),
      );
      await page.$eval('[data-text-id="home-hero.text.5"] button', (node) =>
        node.click(),
      );
      await set("home-hero.text.3", "Квартиры");
      assert.equal(await text("home-hero.text.3"), "Квартиры");
      assert.deepEqual((await s.api.content.read()).overrides, {});
      // Late public API / other page scripts cannot replace the unsaved draft.
      await (
        await getFrame()
      ).$eval('[data-content-id~="home-hero.text.3"]', (node) => {
        [...node.childNodes].find((n) => n.nodeType === 3).textContent =
          "неверный поздний ответ";
      });
      await new Promise((r) => setTimeout(r, 50));
      assert.equal(await text("home-hero.text.3"), "Квартиры");
      for (const width of [1440, 1024, 768, 390, 360]) {
        await page.setViewport({ width, height: 1100 });
        if (width < 768) {
          // The complex text editor is desktop-only: phones get a notice instead.
          assert(
            await page.$eval(".admin-mobile-note", (node) =>
              getComputedStyle(node).display !== "none",
            ),
          );
          assert(
            await page.$eval(
              "#texts-panel .admin-content-workbench",
              (node) => getComputedStyle(node).display === "none",
            ),
          );
          assert(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          continue;
        }
        await choose("sell");
        await mode("fields");
        await set("sell.formtext.6", "Черновик вопроса");
        assert.equal(await text("sell.formtext.6"), "Черновик вопроса");
        await mode("preview");
        let frame = await getFrame();
        await page.$eval("#content-preview-viewport", (node) =>
          node.scrollIntoView({ block: "center", behavior: "instant" }),
        );
        const point = await frame.evaluate(() => {
          const node = document.querySelector(
            '[data-content-id~="sell.formtext.6"]',
          );
          const index = node.dataset.contentId
            .split(" ")
            .indexOf("sell.formtext.6");
          const text = [...node.childNodes].filter(
            (child) => child.nodeType === 3,
          )[Number(node.dataset.contentSlots.split(" ")[index])];
          const range = document.createRange();
          range.selectNodeContents(text);
          const rect = [...range.getClientRects()].find(
            (rect) => rect.width > 0 && rect.height > 0,
          );
          return {
            x: rect.x + Math.min(20, rect.width / 2),
            y: rect.y + rect.height / 2,
            width: innerWidth,
          };
        });
        const box = await (
          await page.$("#content-preview-frame")
        ).boundingBox();
        const scale = box.width / point.width;
        await page.mouse.click(
          box.x + point.x * scale,
          box.y + point.y * scale,
        );
        assert.equal(
          await page.evaluate(() => document.activeElement.id),
          "content-sell.formtext.6",
        );
        assert.equal(
          (await frame.$$eval(
            "[data-admin-text-selected]",
            (nodes) => nodes.length,
          )) > 0,
          true,
        );
        await mode("preview");
        for (const actualWidth of [1440, 768, 390]) {
          await page.$eval(`[data-preview-width="${actualWidth}"]`, (node) =>
            node.click(),
          );
          await frame.waitForFunction(
            (expected) => innerWidth === expected,
            {},
            actualWidth,
          );
          measurements.push({
            admin: width,
            preview: await frame.evaluate(() => innerWidth),
          });
          assert(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          if (width === 1440) {
            await page.$eval("#content-pages", (node) =>
              node.scrollIntoView({ block: "start", behavior: "instant" }),
            );
            await page.screenshot({
              path: qa + "/task082-width-" + actualWidth + ".png",
            });
          }
        }
        await page.$eval(
          `[data-preview-width="${width === 1440 ? 1440 : 390}"]`,
          (node) => node.click(),
        );
        if ([1440, 390].includes(width)) {
          await page.$eval("#content-pages", (node) =>
            node.scrollIntoView({ block: "start", behavior: "instant" }),
          );
          await page.$eval('[data-content-view="preview"]', (node) =>
            node.focus(),
          );
          await page.mouse.move(width - 8, 80);
          await page.screenshot({
            path: qa + "/task082-admin-" + width + ".png",
          });
        }
      }
      await page.setViewport({ width: 1440, height: 1100 });
      await mode("fields");
      await page.$eval("#content-search", (node) => {
        node.value = "buy.title.1";
        node.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await page.click(
        '[data-result-id="buy.title.1"][data-result-page="buy"]',
      );

      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "content-buy.title.1",
      );
      await page.$eval("#content-changed", (node) => node.click());
      assert(
        (
          await page.$$eval("[data-text-id]", (nodes) =>
            nodes.map((node) => node.dataset.textId),
          )
        ).every((id) => ["home-hero.text.3", "sell.formtext.6"].includes(id)),
      );
      await choose("home");
      assert.equal(
        await page.$$eval("[data-text-id]", (nodes) => nodes.length),
        1,
      );
      await page.$eval("#content-changed", (node) => node.click());
      // Ctrl+S keeps focus in the editor and never opens the browser Save dialog.
      await page.$eval('[data-text-id="home-hero.text.3"] textarea', (node) =>
        node.focus(),
      );
      await page.keyboard.down("Control");
      await page.keyboard.press("KeyS");
      await page.keyboard.up("Control");
      await page.waitForFunction(
        () =>
          document
            .querySelector("#content-status")
            .textContent.startsWith("Сохранено."),
        { polling: "mutation" },
      );
      assert.equal(
        Object.keys((await s.api.content.read()).overrides).length,
        2,
      );
      const visitor = await browser.newPage();
      await visitor.goto(s.origin + "/", { waitUntil: "networkidle0" });
      assert.match(
        await visitor.$eval("h1", (node) => node.textContent),
        /Квартиры/,
      );
      assert.equal(
        await visitor.$$eval(
          "[data-admin-text-selected],#admin-text-preview-style",
          (nodes) => nodes.length,
        ),
        0,
      );
      // Discard differs from resetting: it restores the last saved value.
      await page.bringToFront();
      await set("home-hero.text.3", "Другой черновик");
      await page.$eval("#content-discard", (node) => node.click());
      await page.waitForSelector("#confirmation[open]");
      await page.click("#confirm-ok");
      assert.equal(await text("home-hero.text.3"), "Квартиры");
      for (const [key, id] of [
        ["home", "home-hero.text.3"],
        ["sell", "sell.formtext.6"],
      ]) {
        await choose(key);
        await page.$eval(`[data-text-id="${id}"] button`, (node) =>
          node.click(),
        );
        assert.equal(
          await text(id),
          siteTexts.find((item) => item.id === id).defaultValue,
        );
      }
      await page.$eval("#content-save", (node) => node.click());
      await page.waitForFunction(
        () =>
          document
            .querySelector("#content-status")
            .textContent.startsWith("Сохранено."),
        { polling: "mutation" },
      );
      assert.deepEqual((await s.api.content.read()).overrides, {});
      await visitor.reload({ waitUntil: "networkidle0" });
      assert.doesNotMatch(
        await visitor.$eval("h1", (node) => node.textContent),
        /Квартиры/,
      );
      await choose("common");
      await mode("preview");
      await page.$eval('[data-preview-target="footer"]', (node) =>
        node.click(),
      );
      assert(
        await (
          await getFrame()
        ).evaluate(() => Boolean(document.querySelector(".site-footer"))),
      );
      assert.equal(s.leads, 0);
      assert.deepEqual(errors, []);
      assert.deepEqual(consoleErrors, []);
      // A different port is a foreign origin, even on the same loopback host.
      foreignServer = createServer((_req, res) => {
        res.setHeader("Content-Type", "text/html");
        res.end(`<iframe src="${s.origin}/"></iframe>`);
      });
      await listen(foreignServer);
      const foreign = await browser.newPage(),
        blocked = [];
      foreign.on("console", (message) => {
        if (
          /frame-ancestors|X-Frame-Options|Refused to frame/i.test(
            message.text(),
          )
        )
          blocked.push(message.text());
      });
      await foreign.goto("http://127.0.0.1:" + foreignServer.address().port, {
        waitUntil: "networkidle0",
      });
      assert(
        blocked.length > 0,
        "Foreign iframe must be blocked by response policy",
      );
      await fs.writeFile(
        qa + "/task082-browser-results.json",
        JSON.stringify(
          {
            passed: true,
            inventory: allIds.size,
            measurements,
            errors,
            consoleErrors,
            foreignFrameBlocked: true,
            fixtureOnly: true,
          },
          null,
          2,
        ),
      );
    } catch (error) {
      if (page) {
        await page
          .screenshot({ path: qa + "/task082-failure.png" })
          .catch(() => {});
        console.error(
          "preview diagnostics",
          await page
            .$eval("#content-status", (node) => node.textContent)
            .catch(() => ""),
          await page
            .$eval("#content-preview-status", (node) => node.textContent)
            .catch(() => ""),
          { errors, consoleErrors },
        );
      }
      throw error;
    } finally {
      await browser?.close();
      if (foreignServer) await close(foreignServer);
      await s.cleanup();
    }
  },
);
