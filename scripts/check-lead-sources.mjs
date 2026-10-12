#!/usr/bin/env node
/** TASK-044. Проверяет также закрытое меню, FAQ и карточки вне окна карусели. */
import { launchBrowser } from "./check-baseline.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export async function checkLeadSources(base = "http://127.0.0.1:4321") {
  const browser = await launchBrowser();
  const rows = [];
  let failures = 0;
  try {
    for (const route of ["/", "/sell/", "/buy/", "/ui-kit/"]) {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(new URL(route, base).href, { waitUntil: "networkidle0" });
      await page.waitForFunction(() =>
        [...document.querySelectorAll("[data-lead]")].every(
          (e) => e.dataset.leadSourceReady === "1",
        ),
      );
      const points = await page.evaluate(() => {
        const clean = (value) => (value || "").replace(/\s+/g, " ").trim();
        return [...document.querySelectorAll("form,[data-lead]")].map(
          (element, index) => ({
            index,
            block: clean(
              element.dataset.leadSection ||
                element.closest(".sell-week, section")?.querySelector("h1,h2")
                  ?.textContent ||
                (element.closest("header")
                  ? "Шапка · Меню"
                  : "Модальная форма"),
            ),
            point: element.dataset.form || clean(element.dataset.lead),
            source: clean(element.dataset.leadSource),
            modal: element.hasAttribute("data-lead"),
          }),
        );
      });
      for (const point of points) {
        const row = {
          page: route,
          block: point.block,
          point: point.point,
          source: point.source,
        };
        if (!point.source || /не\s*определ[её]н|undefined/i.test(point.source))
          failures++;
        if (point.modal) {
          const captured = await page.evaluate((index) => {
            const button = document.querySelectorAll("form,[data-lead]")[index];
            button.click();
            const form = document.querySelector("#lead-dialog form");
            const value = {
              source: form?.dataset.leadSource,
              section: form?.dataset.leadSection,
              open: document.querySelector("#lead-dialog")?.open,
            };
            document.querySelector("#lead-dialog")?.close();
            return value;
          }, point.index);
          if (
            !captured.open ||
            captured.source !== point.source ||
            !captured.section
          )
            failures++;
        }
        rows.push(row);
      }
      failures += errors.length;
      for (const error of errors) console.error(`${route}: ${error}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log("страница · блок · форма/кнопка · источник");
  rows.forEach((row) =>
    console.log(`${row.page} · ${row.block} · ${row.point} · ${row.source}`),
  );
  console.log(`Точек: ${rows.length}; ошибок: ${failures}`);
  return { rows, failures };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const { rows, failures } = await checkLeadSources(process.argv[2]);
    if (process.argv[3])
      writeFileSync(process.argv[3], JSON.stringify(rows, null, 2) + "\n");
    process.exitCode = failures ? 1 : 0;
  } catch (error) {
    console.error(`Проверка источников не завершена: ${error.message}`);
    process.exitCode = 1;
  }
}
