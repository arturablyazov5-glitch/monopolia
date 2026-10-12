/** TASK-042: только личный тестовый получатель сервера. Никаких секретов/ПДн в выводе. */
import assert from "node:assert/strict";
import { launchBrowser } from "./check-baseline.mjs";
const mode = process.argv[2] || "real";
const browser = await launchBrowser();
let total = 0;
try {
  for (const route of ["/", "/sell/", "/buy/", "/ui-kit/"]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("http://127.0.0.1:4321" + route, {
      waitUntil: "networkidle0",
    });
    const forms = await page.$$eval(".lead-form", (es) =>
      es.map((e) => e.dataset.form),
    );
    for (const id of forms) {
      const selector = `.lead-form[data-form="${id}"]`;
      if (id === "modal") {
        const button = await page.$("[data-lead]");
        await button.evaluate((b) => b.click());
      }
      await page.$eval(selector, (f) => {
        f.reset();
        for (const el of f.querySelectorAll(
          "[name=name], [name=question], [name=phone]",
        )) {
          el.value =
            el.name === "phone"
              ? "+7 (999) 123-45-67"
              : "ТЕСТ TASK-042, не обрабатывать";
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
        const consent = f.querySelector("[name=consent]");
        consent.checked = true;
        consent.dispatchEvent(new Event("change", { bubbles: true }));
        f.querySelector("[name=phone]").focus();
      });
      if (mode === "invalid") {
        const result = await page.$eval(selector, (f) => {
          f.querySelector("[name=consent]").checked = false;
          f.querySelector("[name=consent]").dispatchEvent(
            new Event("change", { bubbles: true }),
          );
          f.querySelector("[name=phone]").value = "123";
          f.querySelector("[name=phone]").dispatchEvent(
            new Event("input", { bubbles: true }),
          );
          f.requestSubmit();
          return {
            valid: f.checkValidity(),
            busy: f.getAttribute("aria-busy"),
          };
        });
        assert.equal(result.valid, false);
        assert.notEqual(result.busy, "true");
        console.log(`OK invalid ${route} ${id}: rejected by browser`);
        if (id === "modal") await page.$eval("#lead-dialog", (d) => d.close());
        total++;
        continue;
      }
      if (mode === "honeypot")
        await page.$eval(selector, (f) => {
          f.querySelector("[name=honeypot]").value = "robot";
        });
      const heightBefore = await page.evaluate(
        () => document.documentElement.scrollHeight,
      );
      let count = 0;
      const listener = (request) => {
        if (request.url().endsWith("/lead") && request.method() === "POST")
          count++;
      };
      page.on("request", listener);
      // Две отправки в одном кадре: один POST, disabled/aria-busy синхронны.
      await page.$eval(selector, (f) => {
        f.requestSubmit();
        f.requestSubmit();
        if (
          f.getAttribute("aria-busy") !== "true" ||
          !f.querySelector("[type=submit]").disabled
        )
          throw new Error("busy state");
      });
      await page.waitForFunction(
        (sel) =>
          document.querySelector(sel).getAttribute("aria-busy") !== "true",
        { timeout: 30000 },
        selector,
      );
      const result = await page.$eval(selector, (f) => ({
        status: f.querySelector(".form-result").textContent,
        disabled: f.querySelector("[type=submit]").disabled,
      }));
      assert.equal(count, 1);
      assert.equal(result.disabled, false);
      if (mode === "dry") assert.match(result.status, /Заявка отправлена/);
      else if (mode === "honeypot") assert.match(result.status, /Проверьте/);
      else if (mode === "network") assert.match(result.status, /Нет связи/);
      else
        assert.match(result.status, /Заявка отправлена|Не удалось отправить/);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollHeight),
        heightBefore,
      );
      console.log(`OK ${mode} ${route} ${id}: single POST, busy, feedback`);
      total++;
      page.off("request", listener);
      if (id === "modal") await page.$eval("#lead-dialog", (d) => d.close());
    }
    await page.close();
  }
  console.log(`OK ${mode}: ${total} forms`);
} finally {
  await browser.close();
}
