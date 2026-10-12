#!/usr/bin/env node
// TASK-011: системный Chrome, puppeteer-core из кеша responsive-check; без зависимостей проекта.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
const loadPuppeteer = createRequire(
  "/private/tmp/claude-501/tools/package.json",
);
const puppeteer = loadPuppeteer("puppeteer-core");
const out = process.argv[2] ?? "/private/tmp/claude-501/agafon-qa";
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-first-run", "--no-default-browser-check"],
});
let staticServer;
let base = process.env.QA_BASE_URL ?? "http://127.0.0.1:4321";
// Не запускает dev-сервер: временно обслуживает неизменяемый результат сборки.
if (process.env.QA_DIST) {
  const { createServer } = await import("node:http");
  const { resolve, extname } = await import("node:path");
  const root = resolve(process.env.QA_DIST);
  const mime = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".png": "image/png",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ico": "image/x-icon",
  };
  staticServer = createServer((req, res) => {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const file = resolve(
      root,
      "." + path + (path.endsWith("/") ? "index.html" : ""),
    );
    if (!file.startsWith(root + "/") || !existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.setHeader(
      "Content-Type",
      mime[extname(file)] ?? "application/octet-stream",
    );
    res.end(readFileSync(file));
  });
  await new Promise((r) => staticServer.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${staticServer.address().port}`;
}
const results = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ids = {};
for (const route of ["/", "/sell/", "/buy/"]) {
  const p = await browser.newPage();
  await p.goto(base + route, { waitUntil: "networkidle0" });
  ids[route] = await p.evaluate(() =>
    [...document.querySelectorAll("[id]")].map((e) => e.id),
  );
  await p.close();
}
try {
  for (const route of ["/", "/sell/", "/buy/"])
    for (const width of [1440, 390]) {
      const page = await browser.newPage();
      await page.setViewport({
        width,
        height: 900,
        hasTouch: width === 390,
        isMobile: width === 390,
      });
      const r = {
        route,
        width,
        cases: [],
        knownConsole: [],
        console: [],
        failed: [],
        http: [],
        external: [],
        submissions: [],
      };
      results.push(r);
      page.on("console", (m) => {
        if (["error", "warn"].includes(m.type()))
          (m.text().includes("WebSocket connection") &&
          m.text().includes("Page entered Back-Forward Cache.")
            ? r.knownConsole
            : r.console
          ).push(m.type() + ": " + m.text());
      });
      page.on("pageerror", (e) => r.console.push(e.message));
      page.on("requestfailed", (q) =>
        r.failed.push(q.failure()?.errorText + " " + q.url()),
      );
      page.on("response", (q) => {
        if (q.status() >= 400) r.http.push(q.status() + " " + q.url());
      });
      page.on("request", (q) => {
        if (/^https?:/.test(q.url()) && !q.url().startsWith(base))
          r.external.push(q.url());
        if (q.method() !== "GET")
          r.submissions.push(q.method() + " " + q.url());
      });
      const record = (scenario, ok, detail = "") =>
        r.cases.push({ scenario, ok, detail });
      await page.goto(base + route, { waitUntil: "networkidle0" });
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
          scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 65));
        }
        scrollTo({ top: 0, behavior: "instant" });
      });
      await wait(500);
      r.height = await page.evaluate(
        () => document.documentElement.scrollHeight,
      );
      const links = await page.evaluate(() =>
        [...document.querySelectorAll("a[href]")].map((e) =>
          e.getAttribute("href"),
        ),
      );
      const bad = links.filter((h) => {
        if (/^(tel:|mailto:)/.test(h)) return false;
        const u = new URL(h, base + route);
        return (
          u.origin !== base ||
          !ids[u.pathname] ||
          (u.hash &&
            !ids[u.pathname].includes(decodeURIComponent(u.hash.slice(1)))) ||
          h === "#"
        );
      });
      record(
        "Все a[href]: страницы и id существуют; нет пустых #",
        bad.length === 0,
        `${links.length} ссылок; ошибки: ${bad.join(", ")}`,
      );
      const leads = await page.$$("[data-lead]");
      let leadFailures = [];
      for (let i = 0; i < leads.length; i++) {
        const result = await leads[i].evaluate((b) => {
          b.click();
          const d = document.querySelector("#lead-dialog");
          const ok =
            d.open &&
            d.querySelector("#lead-purpose").textContent === b.dataset.lead &&
            d.querySelector("[name=subject]").value ===
              (b.dataset.subject ?? b.dataset.lead);
          d.close();
          return { ok, subject: b.dataset.subject, label: b.dataset.lead };
        });
        if (!result.ok) leadFailures.push(result);
        await wait(60);
      }
      record(
        "Все data-lead открывают диалог с правильной темой",
        !leadFailures.length,
        `${leads.length} кнопок; ${JSON.stringify(leadFailures)}`,
      );
      if (leads.length) {
        await leads[0].evaluate((b) => b.click());
        await page.keyboard.press("Escape");
        await wait(60);
        record(
          "Диалог: Escape и возврат фокуса",
          await leads[0].evaluate(
            (b) =>
              !document.querySelector("#lead-dialog").open &&
              document.activeElement === b,
          ),
        );
        await leads[0].evaluate((b) => b.click());
        await page.click("#lead-dialog .dialog-close");
        record(
          "Диалог: крестик",
          await page.$eval("#lead-dialog", (d) => !d.open),
        );
        await leads[0].evaluate((b) => b.click());
        await page.mouse.click(2, 2);
        record("Диалог: фон", await page.$eval("#lead-dialog", (d) => !d.open));
      }
      const forms = await page.$$(".lead-form");
      for (let i = 0; i < forms.length; i++) {
        const f = forms[i];
        const modal = await f.evaluate((f) => !!f.closest("dialog"));
        if (modal) await leads[0].evaluate((b) => b.click());
        const res = await f.evaluate((f) => {
          const status = f.querySelector(".form-result");
          const fields = [...f.querySelectorAll("[required]")];
          const phone = f.querySelector("[name=phone]");
          const set = (el, v) => {
            if (el.type === "checkbox") el.checked = v;
            else el.value = v;
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          };
          f.requestSubmit();
          const empty =
            !f.checkValidity() &&
            fields.some((e) => e.getAttribute("aria-invalid") === "true") &&
            status.hidden;
          for (const e of fields)
            set(
              e,
              e.type === "checkbox"
                ? true
                : e.name === "phone"
                  ? "123"
                  : "Тестовый вопрос",
            );
          f.requestSubmit();
          const short = !phone.validity.valid && status.hidden;
          set(phone, "+7 (924) 580-45-55");
          set(f.querySelector("[name=consent]"), false);
          f.requestSubmit();
          const consent = !f.checkValidity() && status.hidden;
          set(f.querySelector("[name=consent]"), true);
          f.requestSubmit();
          const success =
            !status.hidden &&
            status.textContent.includes("демонстрация") &&
            fields.every((e) => !e.hasAttribute("aria-invalid"));
          const inputs = ["abc1234567890", "123456789012345", "   "];
          const invalid = inputs.map((v) => {
            set(phone, v);
            return { v, valid: phone.checkValidity(), value: phone.value };
          });
          set(phone, "89245804555");
          const mask = phone.value;
          const mode = phone.inputMode;
          const text = fields.find((e) =>
            ["question", "name"].includes(e.name),
          );
          let whitespace = null;
          if (text) {
            set(text, "   ");
            whitespace = !text.checkValidity();
          }
          return {
            empty,
            short,
            consent,
            success,
            invalid,
            mask,
            mode,
            whitespace,
            channel: f.querySelector("[name=channel]")?.value,
            alert: f.querySelector("[role=alert]")?.textContent,
          };
        });
        record(
          `Форма ${i + 1}: пустая, короткий телефон, согласие, демо-успех`,
          res.empty && res.short && res.consent && res.success,
          JSON.stringify(res),
        );
        record(
          `Форма ${i + 1}: неверный телефон и пробельный текст`,
          res.invalid.every((x) => !x.valid) && res.whitespace !== false,
        );
        record(
          `Форма ${i + 1}: маска и inputmode`,
          res.mask === "+7 (924) 580-45-55" && res.mode === "tel",
          res.mask + " / " + res.mode,
        );
        if (modal) {
          await page.$eval("#lead-dialog", (d) => d.close());
          await leads[0].evaluate((b) => b.click());
          const reset = await f.evaluate(
            (f) =>
              [...f.querySelectorAll("[required]")].every((e) =>
                e.type === "checkbox" ? !e.checked : !e.value,
              ) &&
              f.querySelector(".form-result").hidden &&
              ![...f.querySelectorAll("[aria-invalid]")].length &&
              !f.querySelector("[role=alert]").textContent,
          );
          record(
            "Диалог: повторное открытие сбрасывает поля, успех и ошибки",
            reset,
          );
          await page.$eval("#lead-dialog", (d) => d.close());
        }
      }
      const groups = await page.$$("[data-choice-group]");
      for (let i = 0; i < groups.length; i++) {
        const res = await groups[i].evaluate((g) => {
          const bs = [...g.querySelectorAll("button")];
          const initial = bs.find(
            (b) => b.getAttribute("aria-pressed") === "true",
          );
          let ok = true;
          for (const b of bs) {
            b.click();
            ok &&=
              bs.filter((b) => b.getAttribute("aria-pressed") === "true")
                .length === 1 && b.getAttribute("aria-pressed") === "true";
            const hero = g.closest(".inner-hero-card");
            if (hero)
              ok &&= hero
                .querySelector("[data-lead]")
                .dataset.subject.includes(b.dataset.value);
            const form = g.closest("form");
            if (form)
              ok &&=
                form.querySelector("[name=channel]").value === b.dataset.value;
            const cases = g.closest(".client-cases");
            if (cases)
              ok &&=
                cases.querySelector("[data-case-content]").hidden ===
                (b.dataset.value !== "Помогли продать");
          }
          initial?.click();
          return { ok, label: g.getAttribute("aria-label") };
        });
        record("ChoiceGroup: " + res.label, res.ok);
      }
      const faq = await page.$$(".faq-toggle");
      const faqOk = [];
      for (const b of faq)
        faqOk.push(
          await b.evaluate((b) => {
            const panel = document.getElementById(
              b.getAttribute("aria-controls"),
            );
            const start = b.getAttribute("aria-expanded");
            b.click();
            const ok =
              panel.hidden === (b.getAttribute("aria-expanded") === "false") &&
              b.getAttribute("aria-expanded") !== start;
            b.click();
            return ok && b.getAttribute("aria-expanded") === start;
          }),
        );
      record(
        "FAQ: все раскрываются/сворачиваются, aria-expanded",
        faqOk.every(Boolean),
        `${faq.length} вопросов`,
      );
      const placeholders = await page.evaluate(() => {
        const selectors = [
          "[data-company-presentation]",
          ".telegram-subscribe",
          ".recruiting-channel",
          ".footer-doc",
          "[data-video]",
        ];
        return selectors.flatMap((s) =>
          [...document.querySelectorAll(s)].map((_button, i) => ({ s, i })),
        );
      });
      let stubOk = true;
      for (const { s, i } of placeholders) {
        const ok = await page.evaluate(
          ({ s, i }) => {
            const b = document.querySelectorAll(s)[i];
            b.click();
            if (s === "[data-company-presentation]")
              return !document.querySelector(".company-download-status").hidden;
            if (s === ".telegram-subscribe")
              return !document.querySelector("#telegram-link-status").hidden;
            if (s === ".recruiting-channel")
              return !document.querySelector("#recruiting-channel-status")
                .hidden;
            if (s === ".footer-doc")
              return !b.closest(".footer-policy").querySelector("[role=status]")
                .hidden;
            return !!(
              b.closest(".review-card") ?? b.parentElement
            ).querySelector("[data-video-status]")?.textContent;
          },
          { s, i },
        );
        stubOk &&= ok;
      }
      record(
        "Заглушки PDF/Telegram/видео/документы: своё сообщение",
        stubOk,
        `${placeholders.length} кнопок`,
      );
      const carousels = await page.$$("[data-carousel]");
      for (let i = 0; i < carousels.length; i++) {
        const c = carousels[i];
        await c.evaluate((c) =>
          c.scrollIntoView({ block: "center", behavior: "instant" }),
        );
        await wait(80);
        let start = await c.evaluate((c) => {
          const t = c.querySelector(".carousel-track");
          t.scrollTo({ left: 0, behavior: "instant" });
          return { max: t.scrollWidth - t.clientWidth, n: t.children.length };
        });
        await wait(120);
        const disabledStart = await c.evaluate(
          (c) => c.querySelector("[data-direction=prev]").disabled,
        );
        await c.evaluate((c) =>
          c.querySelector("[data-direction=next]").click(),
        );
        await wait(700);
        const arrow = await c.evaluate(
          (c) => c.querySelector(".carousel-track").scrollLeft,
        );
        let dots = true;
        for (let d = 0; d < start.n; d++) {
          await c.evaluate(
            (c, d) =>
              c.querySelectorAll(".carousel-pagination button")[d].click(),
            d,
          );
          await wait(650);
          dots &&= await c.evaluate((c, d) => {
            const t = c.querySelector(".carousel-track"),
              card = t.children[d];
            const expected = Math.min(
              t.scrollWidth - t.clientWidth,
              Math.max(
                0,
                card.offsetLeft -
                  t.offsetLeft -
                  (parseFloat(getComputedStyle(t).scrollPaddingLeft) || 0),
              ),
            );
            return Math.abs(t.scrollLeft - expected) < 3;
          }, d);
        }
        const end = await c.evaluate((c) => ({
          next: c.querySelector("[data-direction=next]").disabled,
          current: [
            ...c.querySelectorAll(".carousel-pagination button"),
          ].findIndex((b) => b.getAttribute("aria-current") === "true"),
        }));
        record(
          `Карусель ${i + 1}: стрелки/точки/disabled`,
          disabledStart &&
            (start.max <= 4 ? arrow === 0 : arrow > 0) &&
            dots &&
            end.next,
          JSON.stringify({ start, arrow, dots, end }),
        );
        await c.evaluate((c) =>
          c
            .querySelector(".carousel-track")
            .scrollTo({ left: 0, behavior: "instant" }),
        );
        await wait(150);
        if (width === 390 && start.max > 4) {
          const rect = await c.evaluate((c) => {
            const r = c
              .querySelector(".carousel-track")
              .getBoundingClientRect();
            return {
              x: Math.max(40, r.left + 40),
              y: Math.min(700, Math.max(120, r.top + 100)),
            };
          });
          const client = await page.createCDPSession();
          await client.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [{ x: 330, y: rect.y }],
          });
          for (let x = 300; x >= 70; x -= 30) {
            await client.send("Input.dispatchTouchEvent", {
              type: "touchMove",
              touchPoints: [{ x, y: rect.y }],
            });
            await wait(25);
          }
          await client.send("Input.dispatchTouchEvent", {
            type: "touchEnd",
            touchPoints: [],
          });
          await wait(700);
          record(
            `Карусель ${i + 1}: нативный свайп`,
            await c.evaluate(
              (c) => c.querySelector(".carousel-track").scrollLeft > 0,
            ),
          );
          await client.detach();
        }
      }
      const ranges = await page.$$("input[type=range]");
      for (const range of ranges) {
        const res = await range.evaluate((e) => {
          const calc = e.closest(".buy-mortgage-calc");
          const vals = [e.min, "12.5", e.max].map((v) => {
            e.value = v;
            e.dispatchEvent(new Event("input", { bubbles: true }));
            const out = calc.querySelector("[data-base-payment]");
            return {
              v: e.value,
              payment: out.textContent,
              expected: (
                Math.round(
                  (Number(out.dataset.basePayment) * Number(v)) /
                    Number(e.defaultValue) /
                    10,
                ) * 10
              ).toLocaleString("ru-RU"),
              subject: calc.querySelector("[data-lead]").dataset.subject,
              progress: e
                .closest(".range-field")
                .style.getPropertyValue("--range-progress"),
            };
          });
          return vals;
        });
        record(
          "Ипотека: min/12,5/max, платёж, тема, прогресс",
          res.every(
            (x) =>
              x.payment === x.expected &&
              x.subject.includes(Number(x.v).toLocaleString("ru-RU")),
          ) &&
            res[0].progress === "0" &&
            res.at(-1).progress === "1",
          JSON.stringify(res),
        );
      }
      for (const section of await page.$$("[data-deal-steps]")) {
        const vals = [];
        for (const fraction of [0, 0.5, 1]) {
          await section.evaluate((s, f) => {
            const list = s.querySelector("[data-deal-steps-list]");
            scrollTo({
              top:
                scrollY +
                list.getBoundingClientRect().top +
                list.offsetHeight * f -
                innerHeight / 2,
              behavior: "instant",
            });
          }, fraction);
          await wait(100);
          vals.push(
            await section.evaluate((s) => ({
              value: Number(
                s
                  .querySelector("[data-deal-progress]")
                  .getAttribute("aria-valuenow"),
              ),
              text: s.querySelector("[data-deal-progress-value]").textContent,
              sticky: getComputedStyle(s.querySelector(".deal-mission"))
                .position,
              top: s.querySelector(".deal-mission").getBoundingClientRect().top,
            })),
          );
        }
        record(
          "Шаги сделки: прогресс 0→50→100, sticky",
          vals.every((v, i) => Math.abs(v.value - i * 50) <= 1) &&
            vals.every((v) => v.text === v.value + "%"),
          JSON.stringify(vals),
        );
      }
      if (width === 390) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        await page.click(".menu-button");
        record(
          "Меню: бургер открывает",
          await page.$eval(
            ".menu-button",
            (b) => b.getAttribute("aria-expanded") === "true",
          ),
        );
        await page.keyboard.press("Escape");
        record(
          "Меню: Escape закрывает",
          await page.$eval(
            ".menu-button",
            (b) => b.getAttribute("aria-expanded") === "false",
          ),
        );
        await page.click(".menu-button");
        await page.mouse.click(20, 800);
        record(
          "Меню: вне шапки закрывает",
          await page.$eval(
            ".menu-button",
            (b) => b.getAttribute("aria-expanded") === "false",
          ),
        );
      }
      // Реальные переходы по каждой навигационной ссылке шапки/footer, включая повторные и якоря.
      const navs = await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            ".site-header a[href],.site-footer a[href]",
          ),
        ]
          .filter(
            (a) =>
              !a.getAttribute("href").startsWith("tel:") &&
              !a.getAttribute("href").startsWith("mailto:"),
          )
          .map((a) => ({
            href: a.getAttribute("href"),
            footer: !!a.closest("footer"),
          })),
      );
      const navIssues = [];
      for (const n of navs) {
        await page.goto(base + route, { waitUntil: "networkidle0" });
        if (width === 390 && !n.footer && n.href !== "/")
          await page.click(".menu-button");
        const selector = n.footer
          ? ".site-footer a[href]"
          : ".site-header a[href]";
        await page.evaluate(
          ({ selector, href }) =>
            [...document.querySelectorAll(selector)]
              .find((a) => a.getAttribute("href") === href)
              .click(),
          { selector, href: n.href },
        );
        await wait(850);
        const expected = new URL(n.href, base + route);
        if (page.url() !== expected.href)
          navIssues.push("URL " + n.href + " " + page.url());
        if (expected.hash && expected.hash !== "#top") {
          const pos = await page.evaluate((hash) => {
            const target = document.getElementById(hash.slice(1));
            const title = target.matches("h1,h2,h3")
              ? target
              : (target.querySelector("h1,h2,h3") ?? target);
            return {
              top: title.getBoundingClientRect().top,
              bottom: document
                .querySelector(".site-header")
                .getBoundingClientRect().bottom,
            };
          }, expected.hash);
          if (pos.top < pos.bottom - 1)
            navIssues.push(n.href + " скрыт " + JSON.stringify(pos));
        }
        if (expected.href !== base + route)
          await page
            .goBack({ waitUntil: "domcontentloaded", timeout: 3000 })
            .catch(() => {});
        await wait(150);
        const alive = await page.evaluate(() => {
          const b = document.querySelector("[data-lead]");
          b.click();
          const d = document.querySelector("#lead-dialog");
          const ok = d.open;
          d.close();
          return ok;
        });
        if (!alive) navIssues.push("Назад " + n.href);
      }
      record(
        "Навигация шапки/footer, якоря, Назад",
        !navIssues.length,
        `${navs.length} переходов; ${navIssues.join("; ")}`,
      );
      record(
        "Консоль и сеть: нет ошибок/warn/404/failed/внешних/отправок",
        !r.console.length &&
          !r.failed.length &&
          !r.http.length &&
          !r.external.length &&
          !r.submissions.length,
        JSON.stringify({
          console: r.console,
          failed: r.failed,
          http: r.http,
          external: r.external,
          submissions: r.submissions,
        }),
      );
      console.log(
        route,
        width,
        `${r.cases.filter((c) => c.ok).length}/${r.cases.length}`,
        r.cases.filter((c) => !c.ok),
      );
      await page.close();
    }
} finally {
  await browser.close();
  if (staticServer) await new Promise((r) => staticServer.close(r));
  writeFileSync(out + "/results.json", JSON.stringify(results, null, 2) + "\n");
}
process.exitCode = results.some((r) => r.cases.some((c) => !c.ok)) ? 1 : 0;
