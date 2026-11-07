// Opt-in browser regression. Every write goes to a disposable local Admin API.
// The dev server supplies the current UI; credentials and catalogue are fixtures.
import test from "node:test";
import assert from "node:assert/strict";
import { createServer, request } from "node:http";
import * as fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAdminAPI } from "../server/admin-api.mjs";
import { passwordHash } from "../server/admin-auth.mjs";
import { launchBrowser } from "./check-baseline.mjs";

const enabled = process.env.ADMIN_UX_BROWSER_TEST === "1";
const artifacts =
  process.env.ADMIN_UX_ARTIFACTS ||
  join(tmpdir(), "monopoly-admin-ux-regression");
const dev = new URL(process.env.ADMIN_DEV_ORIGIN || "http://127.0.0.1:4328");
const username = "ux-fixture-editor",
  password = "ux-fixture-only-passphrase";
async function fixture() {
  const directory = await fs.mkdtemp(join(tmpdir(), "monopoly-admin-ux-data-"));
  let api,
    failNext = "",
    unauthorizedNext = false;
  const writes = [];
  const server = createServer((req, res) => {
    if (req.url.startsWith("/lead")) {
      res.writeHead(403);
      return res.end();
    }
    if (req.url.startsWith("/api/") || req.url.startsWith("/media/")) {
      if (req.method === "PUT") {
        writes.push(req.url);
        if (unauthorizedNext || failNext === req.url) {
          const status = unauthorizedNext ? 401 : 503;
          unauthorizedNext = false;
          failNext = "";
          res.writeHead(status, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              error: {
                message:
                  status === 401
                    ? "Войдите снова"
                    : "Тестовая ошибка сохранения. Попробуйте ещё раз.",
              },
            }),
          );
        }
      }
      return api.handler(req, res);
    }
    const proxy = request(
      new URL(req.url, dev),
      { method: req.method, headers: { ...req.headers, host: dev.host } },
      (up) => {
        res.writeHead(up.statusCode, up.headers);
        up.pipe(res);
      },
    );
    proxy.on("error", () => {
      res.writeHead(502);
      res.end();
    });
    req.pipe(proxy);
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
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
    origin,
    api,
    writes,
    fail: (path) => {
      failNext = path;
    },
    expire: () => {
      unauthorizedNext = true;
    },
    cleanup: async () => {
      server.closeAllConnections();
      await new Promise((done) => server.close(done));
      await api.close();
      await fs.rm(directory, { recursive: true, force: true });
    },
  };
}
const fill = (page, selector, value) =>
  page.$eval(
    selector,
    (input, next) => {
      input.value = next;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    },
    value,
  );
const click = (page, selector) => page.$eval(selector, (node) => node.click());
const login = async (page) => {
  await fill(page, "[name=username]", username);
  await fill(page, "[name=password]", password);
  await click(page, "#login button[type=submit]");
  await page.waitForSelector(".admin-object");
};
async function layout(page, name, widths) {
  for (const width of widths) {
    await page.setViewport({ width, height: 940 });
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 120));
    const geometry = await page.evaluate(() => ({
      width: innerWidth,
      document: document.documentElement.scrollWidth,
      dialog: document.querySelector("#editor[open]")?.scrollWidth,
      dialogWidth: document.querySelector("#editor[open]")?.clientWidth,
    }));
    assert(
      geometry.document <= width + 1,
      name + ": document overflow " + JSON.stringify(geometry),
    );
    if (geometry.dialogWidth)
      assert(
        geometry.dialog <= geometry.dialogWidth + 1,
        name + ": dialog overflow",
      );
    await page.screenshot({ path: join(artifacts, `${name}-${width}.png`) });
  }
}
test(
  "admin UX: editing, safe drafts, validation, photo recovery, errors, responsive layout and keyboard",
  { skip: !enabled, timeout: 240000 },
  async () => {
    await fs.mkdir(artifacts, { recursive: true });
    const s = await fixture();
    let browser;
    const errors = [],
      checks = [];
    try {
      browser = await launchBrowser();
      const page = await browser.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewport({ width: 1440, height: 940 });
      await page.goto(s.origin + "/admin/", { waitUntil: "networkidle2" });
      assert.equal(
        await page.$eval("body", (e) => e.dataset.apiBase),
        "",
        "fixture must remain same-origin",
      );
      await layout(page, "login", [1440, 390]);
      await fill(page, "[name=password]", "wrong");
      await click(page, "#password-toggle");
      assert.equal(await page.$eval("[name=password]", (e) => e.type), "text");
      await click(page, "#password-toggle");
      await fill(page, "[name=username]", username);
      await click(page, "#login button[type=submit]");
      await page.waitForFunction(
        () => !document.querySelector("#login-notice").hidden,
      );
      assert.equal(await page.$eval(".admin-login", (e) => e.hidden), false);
      await login(page);
      assert.equal(
        await page.$$(".admin-header-label").then((nodes) => nodes.length),
        0,
      );
      assert.equal(
        await page.$$("#logout svg").then((nodes) => nodes.length),
        1,
      );
      assert.equal(
        await page.$eval(
          ".admin-object",
          (e) => getComputedStyle(e).borderTopWidth,
        ),
        "0px",
      );
      assert.equal(
        await page.$eval(
          ".admin-catalog-controls",
          (e) => getComputedStyle(e).borderTopWidth,
        ),
        "0px",
      );
      checks.push("Login: password toggle and persistent inline login error");
      await layout(page, "objects", [1440, 1024, 768, 390, 360, 320]);
      await fill(page, "#search", "Ленина");
      assert.equal(await page.$$(".admin-object").then((x) => x.length), 1);
      await fill(page, "#search", "");
      await click(page, "[data-object-filter=hidden]");
      assert.equal(await page.$$(".admin-object").then((x) => x.length), 0);
      await click(page, ".admin-state button");
      assert.equal(await page.$$(".admin-object").then((x) => x.length), 3);
      checks.push(
        "Search by address; visibility filter and clear empty results",
      );
      await click(page, "#add");
      // A new object has no photo yet: publication stays off and cannot be enabled.
      assert.equal(
        await page.$eval("#object-visible", (e) =>
          e.getAttribute("aria-checked"),
        ),
        "false",
      );
      await click(page, "#object-visible");
      assert.equal(
        await page.$eval("#object-visible", (e) =>
          e.getAttribute("aria-checked"),
        ),
        "false",
      );
      assert.match(
        await page.$eval("#visibility-help", (e) => e.textContent),
        /фотографи/,
      );
      await page.focus("#object-visible");
      await page.keyboard.press("Space");
      assert.equal(
        await page.$eval("#object-visible", (e) =>
          e.getAttribute("aria-checked"),
        ),
        "false",
      );
      await page.focus("#edit-title");
      await page.keyboard.press("Tab");
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "editor-close",
      );
      await page.keyboard.down("Shift");
      await page.keyboard.press("Tab");
      await page.keyboard.up("Shift");
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "object-save",
        "dialog focus must wrap without leaving the editor",
      );
      const writesBefore = s.writes.length;
      await click(page, "#object-save");
      assert.equal(
        await page.$$("#object-error-summary a").then((x) => x.length),
        5,
      );
      assert.equal(
        s.writes.length,
        writesBefore,
        "invalid form must not reach the server",
      );
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "object-error-summary",
      );
      await click(page, "#object-error-summary a");
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "object-kind",
      );
      checks.push(
        "Object validation: five linked inline errors, focus, no write",
      );
      await page.select("#object-kind", "flat");
      await fill(page, "#object-rooms", "2");
      await fill(page, "#object-area", "52");
      await fill(page, "#object-settlement", "Благовещенск");
      await fill(page, "#object-street", "Ленина");
      await fill(page, "#object-house", "10");
      await fill(page, "#object-city", "Благовещенск");
      await fill(page, "#object-price", "6 400 000 ₽");
      for (const [name, raw, formatted] of [
        ["price", "4900000", "4 900 000 ₽"],
        ["oldPrice", "7000000", "7 000 000 ₽"],
      ]) {
        await page.focus(`[name="${name}"]`);
        await fill(page, `[name="${name}"]`, raw);
        assert.equal(await page.$eval(`[name="${name}"]`, (e) => e.value), raw);
        await page.$eval(`[name="${name}"]`, (e) => e.blur());
        assert.equal(
          await page.$eval(`[name="${name}"]`, (e) => e.value),
          formatted,
        );
        await page.focus(`[name="${name}"]`);
        assert.equal(await page.$eval(`[name="${name}"]`, (e) => e.value), raw);
        await page.$eval(`[name="${name}"]`, (e) => e.blur());
      }
      await fill(page, "#object-price", "6 400 000 ₽");
      await fill(page, "#object-oldPrice", "");
      checks.push(
        "iOS-style visibility switch with Space support; currency formatting only on blur",
      );
      assert.match(
        await page.$eval("#preview-title", (e) => e.textContent),
        /2-комнатная квартира/,
      );
      assert.match(
        await page.$eval("#preview-address", (e) => e.textContent),
        /Ленина/,
      );
      await fill(page, "#object-oldPrice", "7 000 000 ₽");
      assert.match(
        await page.$eval("#preview-price-per-meter", (e) => e.textContent),
        /₽\/м²/,
      );
      assert.match(
        await page.$eval("#preview-discount", (e) => e.textContent),
        /−/,
      );
      await fill(page, "#object-oldPrice", "");
      await page.$eval("#image-file", (node) =>
        node.dispatchEvent(new Event("cancel", { bubbles: true })),
      );
      assert.equal(await page.$eval("#confirmation", (e) => e.open), false);
      assert.equal(await page.$eval("#editor", (e) => e.open), true);
      assert.equal(
        await page.$eval(
          "#object-visible",
          (e) => e.getBoundingClientRect().width,
        ),
        44,
      );
      await click(page, "#editor-close");
      await page.waitForSelector("#confirmation[open]");
      await click(page, "#confirm-close");
      assert.equal(await page.$eval("#editor", (e) => e.open), true);
      const photo = await page.evaluate(async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 750;
        const ctx = canvas.getContext("2d");
        const grad = ctx.createLinearGradient(0, 0, 1000, 750);
        grad.addColorStop(0, "#d7c3a0");
        grad.addColorStop(1, "#647e84");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1000, 750);
        ctx.fillStyle = "#f8f5ee";
        ctx.fillRect(140, 120, 320, 430);
        ctx.fillStyle = "#adc5cc";
        ctx.fillRect(160, 140, 280, 390);
        ctx.fillStyle = "#393d36";
        ctx.fillRect(580, 420, 260, 180);
        return canvas.toDataURL("image/png").split(",")[1];
      });
      const photoPath = join(artifacts, "fixture-photo.png");
      await fs.writeFile(photoPath, Buffer.from(photo, "base64"));
      await (await page.$("#image-file")).uploadFile(photoPath);
      await page.waitForFunction(
        () =>
          !document.querySelector("#object-save").disabled &&
          document
            .querySelector("#image-status")
            .textContent.includes("готова"),
      );
      assert.equal(await page.$eval("#current-image", (e) => e.hidden), false);
      await fill(page, "#object-settlement", "Населенный пункт".repeat(8));
      await fill(page, "#object-street", "Улица".repeat(24));
      await fill(page, "#object-mortgage", "Ипотека".repeat(24));
      await layout(page, "long-object", [1440, 390, 320]);
      await fill(page, "#object-settlement", "Благовещенск");
      await fill(page, "#object-street", "Ленина");
      await fill(page, "#object-mortgage", "");
      await layout(page, "object-editor", [1440, 768, 390, 320]);
      await page.setViewport({ width: 1440, height: 940 });
      s.fail("/api/admin/catalog");
      await (
        await page.$(".admin-visibility")
      ).screenshot({ path: join(artifacts, "visibility-switch.png") });
      await page.mouse.move(0, 0);
      const uploadBase = await page.$eval(
        ".admin-upload",
        (e) => getComputedStyle(e).backgroundColor,
      );
      await page.hover(".admin-upload");
      await new Promise((done) => setTimeout(done, 220));
      assert.notEqual(
        await page.$eval(
          ".admin-upload",
          (e) => getComputedStyle(e).backgroundColor,
        ),
        uploadBase,
      );
      await (
        await page.$(".admin-upload")
      ).screenshot({ path: join(artifacts, "photo-hover.png") });
      await click(page, "#object-save");
      await page.waitForFunction(
        () =>
          !document.querySelector("#object-save").disabled &&
          !document.querySelector("#object-error-summary").hidden,
      );
      assert.equal(
        await page.$eval("#object-settlement", (e) => e.value),
        "Благовещенск",
      );
      assert.equal(await page.$eval("#object-kind", (e) => e.value), "flat");
      await page.screenshot({ path: join(artifacts, "object-save-error.png") });
      await click(page, "#object-save");
      await page.waitForFunction(() => !document.querySelector("#editor").open);
      assert.equal((await s.api.storage.catalog()).objects.length, 4);
      checks.push(
        "Photo upload, live card preview, discard cancel, failed save preserves fields, retry saves once",
      );
      await click(page, ".admin-object:last-child [data-action=edit]");
      const oldImage = await page.$eval("#current-image", (e) => e.src);
      const badPhoto = join(artifacts, "invalid-photo.txt");
      await fs.writeFile(badPhoto, "not an image");
      await (await page.$("#image-file")).uploadFile(badPhoto);
      await page.waitForFunction(
        () =>
          document.querySelector("#error-image").textContent.length > 0 &&
          !document.querySelector("#image-file").disabled,
      );
      assert.equal(await page.$eval("#current-image", (e) => e.src), oldImage);
      await fill(page, "#object-mortgage", "Карточка после повторного входа");
      s.expire();
      await click(page, "#object-save");
      await page.waitForFunction(
        () => !document.querySelector(".admin-login").hidden,
      );
      await login(page);
      await page.waitForFunction(() => document.querySelector("#editor").open);
      assert.equal(
        await page.$eval("#object-mortgage", (e) => e.value),
        "Карточка после повторного входа",
      );
      await click(page, "#object-save");
      await page.waitForFunction(() => !document.querySelector("#editor").open);
      checks.push(
        "Invalid replacement preserves previous image; expired session resumes the unsaved object",
      );
      await click(page, ".admin-object:first-child [data-action=eyeOff]");
      // Wait for the hide request to finish: save() disables every button meanwhile,
      // and the new photo-backed draft already counts as hidden.
      await page.waitForFunction(
        () =>
          document.querySelector("#object-hidden-count").textContent === "2" &&
          document.querySelector('.admin-object [data-action="eye"]') &&
          !document.querySelector('.admin-object [data-action="eye"]').disabled,
      );
      await click(page, "[data-object-filter=hidden]");
      assert.equal(await page.$$(".admin-object").then((x) => x.length), 2);
      await click(page, "[data-object-filter=all]");
      const originalFirst = (await s.api.storage.catalog()).objects[0].id;
      await click(page, ".admin-object:first-child [data-action=down]");
      await page.waitForFunction(
        (id) => document.querySelectorAll(".admin-object")[1].dataset.id === id,
        {},
        originalFirst,
      );
      await page.waitForFunction(
        () =>
          !document.querySelector('.admin-object [data-action="eye"]')
            ?.disabled && document.querySelectorAll(".admin-object").length > 0,
      );
      await click(page, ".admin-object:last-child [data-action=trash]");
      await page.waitForSelector("#confirmation[open]");
      await click(page, "#confirm-cancel");
      assert.equal((await s.api.storage.catalog()).objects.length, 4);
      checks.push("Visibility, ordering, and cancelled deletion");
      await click(page, "#tab-texts");
      await page.waitForSelector("#content-groups textarea");
      await page.waitForFunction(
        () =>
          document.querySelector("#content-preview-frame").dataset.ready ===
          "true",
      );
      // The sale page and preview must agree on the derived referral prefix.
      // Otherwise their MutationObservers repeatedly restore/strip the month.
      for (const key of ["sell", "buy", "home"]) {
        await click(page, `[data-content-page="${key}"]`);
        await page.waitForFunction(
          () =>
            document.querySelector("#content-preview-frame").dataset.ready ===
            "true",
        );
        if (key === "sell") {
          const prefix = await page.$eval(
            "#content-preview-frame",
            async (frame) => {
              const doc = frame.contentDocument;
              let changes = 0;
              const observer = new MutationObserver(
                (records) => (changes += records.length),
              );
              observer.observe(doc.querySelector("[data-referral-prefix]"), {
                childList: true,
                characterData: true,
                subtree: true,
              });
              await new Promise((resolve) => setTimeout(resolve, 200));
              observer.disconnect();
              return {
                changes,
                text: doc.querySelector("[data-referral-prefix]").textContent,
              };
            },
          );
          assert.equal(
            prefix.changes,
            0,
            "referral preview must settle without a mutation loop",
          );
          assert.doesNotMatch(prefix.text, /сентября/);
          await layout(page, "sale-preview-tabs", [1440, 430]);
          await page.setViewport({ width: 1440, height: 940 });
        }
      }
      checks.push(
        "All page tabs remain responsive; referral prefix settles without observer feedback",
      );
      await layout(page, "texts", [1440, 1024, 768, 390, 360, 320]);
      await page.setViewport({ width: 1440, height: 940 });
      const id = await page.$eval("#content-groups textarea", (e) => e.id);
      const draft = "Обновлённый текст для проверки";
      await fill(page, `[id="${id}"]`, draft);
      assert.equal(
        await page.$eval("#text-draft-badge", (e) => e.textContent),
        "1",
      );
      const textId = id.replace("content-", "");
      assert.equal(
        await page.$eval(
          "#content-preview-frame",
          (frame, id) =>
            [...frame.contentDocument.querySelectorAll("[data-content-id]")]
              .find((e) => e.dataset.contentId.split(" ").includes(id))
              .textContent.includes("Обновлённый текст"),
          textId,
        ),
        true,
      );
      const previewFrame = await (
        await page.$("#content-preview-frame")
      ).contentFrame();
      await previewFrame.$eval(`[data-content-id~="${textId}"]`, (node) =>
        node.click(),
      );
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        id,
        "preview text must focus its editable field",
      );
      await click(page, "#tab-objects");
      await page.waitForSelector("#confirmation[open]");
      await click(page, "#confirm-cancel");
      await click(page, "#tab-texts");
      assert.equal(await page.$eval(`[id="${id}"]`, (e) => e.value), draft);
      await click(page, "#content-review summary");
      assert.match(
        await page.$eval("#content-review-list", (e) => e.textContent),
        /После сохранения/,
      );
      await page.screenshot({ path: join(artifacts, "text-review.png") });
      checks.push(
        "Live preview, draft badge, preserved drafts across sections, before/after review",
      );
      await fill(page, `[id="${id}"]`, "");
      const writes = s.writes.length;
      await click(page, "#content-save");
      assert.equal(s.writes.length, writes);
      assert.equal(
        await page.$eval(`[id="${id}"]`, (e) => e.getAttribute("aria-invalid")),
        "true",
      );
      await fill(page, `[id="${id}"]`, draft);
      s.fail("/api/admin/content");
      await click(page, "#content-save");
      await page.waitForFunction(
        () =>
          !document.querySelector("#content-save").disabled &&
          document.querySelector("#content-status").classList.contains("error"),
      );
      assert.equal(await page.$eval(`[id="${id}"]`, (e) => e.value), draft);
      await page.focus(`[id="${id}"]`);
      await page.keyboard.down("Control");
      await page.keyboard.press("s");
      await page.keyboard.up("Control");
      await page.waitForFunction(
        () =>
          document.querySelector("#content-save").disabled &&
          document
            .querySelector("#content-dirty-count")
            .textContent.includes("Нет несохраненных"),
      );
      assert.equal(
        (await s.api.content.read()).overrides[textId].replace(/\s/g, " "),
        draft,
      );
      checks.push(
        "Empty text validation; failed save retains draft; Ctrl+S persists changes",
      );
      await fill(page, "#content-search", "несуществующий-запрос-ux");
      assert.match(
        await page.$eval("#content-results", (e) => e.textContent),
        /Ничего не найдено/,
      );
      await fill(page, "#content-search", "");
      await click(page, "#content-block-picker summary");
      const blockButtons = await page.$$("[data-content-block]");
      assert(blockButtons.length > 4);
      await blockButtons[2].click();
      assert.equal(
        await page.$eval("#content-block-picker", (e) => e.open),
        false,
      );
      await click(page, "[data-content-page=common]");
      await page.waitForFunction(
        () => !document.querySelector("#content-common-targets").hidden,
      );
      await click(page, "[data-content-page=home]");
      await page.setViewport({ width: 390, height: 844 });
      // Below 768px the text workbench is replaced by a desktop-only notice.
      assert.equal(
        await page.$eval(
          ".admin-mobile-note",
          (e) => getComputedStyle(e).display,
        ),
        "block",
      );
      assert.equal(
        await page.$eval(
          ".admin-content-workbench",
          (e) => getComputedStyle(e).display,
        ),
        "none",
      );
      await page.screenshot({ path: join(artifacts, "mobile-editor.png") });
      await page.setViewport({ width: 1440, height: 940 });
      await click(page, "[data-content-view=preview]");
      await click(page, "[data-preview-width='390']");
      assert.equal(
        await page.$eval("#content-preview-frame", (e) => e.style.width),
        "390px",
      );
      await page.screenshot({ path: join(artifacts, "mobile-preview.png") });
      await click(page, "[data-content-view=fields]");
      const edited = await page.$eval("#content-groups textarea", (e) => e.id);
      await fill(page, `[id="${edited}"]`, "Несохранённая правка");
      await click(page, "#content-discard");
      await page.waitForSelector("#confirmation[open]");
      await click(page, "#confirm-ok");
      await page.waitForFunction(
        () => document.querySelector("#content-save").disabled,
      );
      assert.equal(
        await page.$eval("#text-draft-badge", (e) => e.hidden),
        true,
      );
      checks.push(
        "Search empty state, block picker, common pages, mobile preview, confirmed discard",
      );
      await page.setViewport({ width: 1440, height: 940 });
      await fill(page, "#content-search", "Каждый проверили");
      await click(page, '[data-result-id="private-catalog.text.17"]');
      const joinedInput = await page.$eval(
        '[data-text-id="private-catalog.text.17"] textarea',
        (e) => e.id,
      );
      assert.match(
        await page.$eval(`[id="${joinedInput}"]`, (e) => e.value),
        /Каждый проверили[\s\S]*чтобы\sисключить/,
      );
      await fill(
        page,
        `[id="${joinedInput}"]`,
        "Проверили каждый объект,\nчтобы защитить вашу сделку",
      );
      await click(page, "#content-save");
      await page.waitForFunction(
        () =>
          document.querySelector("#content-save").disabled &&
          document
            .querySelector("#content-dirty-count")
            .textContent.includes("Нет несохраненных"),
      );
      const joinedSaved = (await s.api.content.read()).overrides;
      assert.equal(
        joinedSaved["private-catalog.text.17"].replace(/\s/g, " "),
        "Проверили каждый объект,",
      );
      assert.equal(
        joinedSaved["private-catalog.text.18"].replace(/\s/g, " "),
        "чтобы защитить вашу сделку",
      );
      assert.equal(
        await page.$('[data-text-id="private-catalog.text.18"]'),
        null,
      );
      await fill(page, "#content-search", "Проверили каждый объект");
      await click(page, '[data-result-id="private-catalog.text.17"]');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: join(artifacts, "joined-text.png") });
      await page.$eval(
        '[data-text-id="private-catalog.text.17"] button',
        (button) => button.click(),
      );
      await click(page, "#content-save");
      await page.waitForFunction(
        () =>
          document.querySelector("#content-save").disabled &&
          document
            .querySelector("#content-dirty-count")
            .textContent.includes("Нет несохраненных"),
      );
      const resetSaved = (await s.api.content.read()).overrides;
      assert.equal(resetSaved["private-catalog.text.17"], undefined);
      assert.equal(resetSaved["private-catalog.text.18"], undefined);
      assert.ok(resetSaved[textId]);

      checks.push(
        "File picker cancel leaves editor open; smaller switch; sentence fragments edit and save together",
      );
      await click(page, "#logout");
      await page.waitForFunction(
        () => !document.querySelector(".admin-login").hidden,
      );
      assert.deepEqual(errors, []);
      await fs.writeFile(
        join(artifacts, "results.json"),
        JSON.stringify({ checks, errors, testDataOnly: true }, null, 2),
      );
    } finally {
      await browser?.close();
      await s.cleanup();
    }
  },
);
