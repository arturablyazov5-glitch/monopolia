import assert from "node:assert/strict";
import { launchBrowser } from "./check-baseline.mjs";
const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  const modules = [];
  page.on("request", (r) => {
    if (r.url().includes("lead-submit")) modules.push(r.url());
  });
  await page.goto("http://127.0.0.1:4321/buy/", { waitUntil: "networkidle0" });
  assert.equal(modules.length, 0, "lead-submit must stay lazy");
  await page.$eval(".buy-mortgage-calc input[type=range]", (e) => {
    e.value = "12";
    e.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.$eval(".buy-mortgage-calc [data-lead]", (b) => b.click());
  assert.equal(
    await page.$eval(
      "#lead-dialog form",
      (f) => JSON.parse(f.dataset.context).priceMillion,
    ),
    "12",
  );
  await page.focus("#lead-dialog [name=phone]");
  await page.waitForFunction(() =>
    performance
      .getEntriesByType("resource")
      .some((e) => e.name.includes("lead-submit")),
  );
  await page.$eval("#lead-dialog", (d) => d.close());
  await page.$eval(".inner-hero-card [data-lead]", (b) => b.click());
  const quiz = await page.$eval("#lead-dialog form", (f) =>
    JSON.parse(f.dataset.context),
  );
  assert.equal(typeof quiz.city, "string");
  assert.ok(quiz.city.length);
  assert.equal(typeof quiz.propertyType, "string");
  assert.ok(quiz.propertyType.length);
  await page.$eval("#lead-dialog", (d) => d.close());
  await page.$eval("[data-lead]", (b) => b.click());
  assert.deepEqual(
    await page.$eval("#lead-dialog form", (f) => JSON.parse(f.dataset.context)),
    {},
  );
  console.log(
    "OK context: mortgage price, quiz city/type, cleared stale values, lazy module",
  );
  await page.goto("http://127.0.0.1:4397/", { waitUntil: "networkidle0" });
  const selector = '.lead-form[data-form="home-question"]';
  assert.equal(await page.$eval(selector, (f) => f.dataset.endpoint), "");
  await page.$eval(selector, (f) => {
    f.querySelector("[name=question]").value = "ТЕСТ TASK-042";
    f.querySelector("[name=phone]").value = "+7 (999) 123-45-67";
    for (const e of f.querySelectorAll("input,textarea"))
      e.dispatchEvent(new Event("input", { bubbles: true }));
    f.querySelector("[name=consent]").checked = true;
    f.querySelector("[name=consent]").dispatchEvent(
      new Event("change", { bubbles: true }),
    );
    f.requestSubmit();
  });
  await page.waitForFunction(
    (sel) => document.querySelector(sel).getAttribute("aria-busy") !== "true",
    {},
    selector,
  );
  assert.match(
    await page.$eval(
      selector,
      (f) => f.querySelector(".form-result").textContent,
    ),
    /Отправка пока не настроена/,
  );
  console.log("OK static production: unset endpoint reports honest error");
} finally {
  await browser.close();
}
