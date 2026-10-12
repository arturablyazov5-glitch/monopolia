#!/usr/bin/env node
/** TASK-016. Эталон проверяется, но никогда автоматически не перезаписывается. */
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export const widths = [1440, 1366, 1280, 1199, 1024, 768, 390, 360];
export const routes = ["/", "/sell/", "/buy/"];
export const baselinePath = new URL(
  "../design-reference/baseline-1440.json",
  import.meta.url,
);
export const wait = (ms) => new Promise((done) => setTimeout(done, ms));
export async function launchBrowser(extraArgs = []) {
  // Тот же Chrome и уже существующий кеш responsive-check; ничего не устанавливаем.
  const chrome =
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (!existsSync(chrome)) throw new Error(`Chrome не найден: ${chrome}`);
  let puppeteer;
  for (const location of [
    import.meta.url,
    "/private/tmp/claude-501/tools/package.json",
  ]) {
    try {
      puppeteer = createRequire(location)("puppeteer-core");
      break;
    } catch {}
  }
  if (!puppeteer)
    throw new Error(
      "Не найден существующий puppeteer-core из scripts/responsive-check.mjs. Зависимости проекта не изменены.",
    );
  return puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ["--no-first-run", "--no-default-browser-check", ...extraArgs],
  });
}
export async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Загружаем также изображения в закрытых ответах и за краем каруселей.
    await Promise.all(
      [...document.images].map(async (img) => {
        img.loading = "eager";
        await Promise.race([
          img.decode().catch(() => {}),
          new Promise((r) => setTimeout(r, 8000)),
        ]);
      }),
    );
    // Прокрутка запускает код секций; instant исключает промежуточный кадр smooth.
    for (let y = 0; y < document.documentElement.scrollHeight; y += 800) {
      scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 20));
    }
    scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  });
}
export async function measure(page) {
  return page.evaluate(() => {
    const label = (e) =>
      `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : "." + [...e.classList].join(".")}`;
    const sections = [
      ...document.querySelectorAll("main > section, footer"),
    ].map((e) => {
      const r = e.getBoundingClientRect();
      return {
        selector: label(e),
        class: e.className,
        top: r.top + scrollY,
        height: r.height,
        offsetTop: e.offsetTop,
        offsetHeight: e.offsetHeight,
      };
    });
    const faq = [...document.querySelectorAll(".faq-section .faq-toggle")].map(
      (b) => {
        const panel = document.getElementById(b.getAttribute("aria-controls"));
        return {
          id: b.id,
          expanded: b.getAttribute("aria-expanded") === "true",
          visible:
            !!panel &&
            !panel.classList.contains("is-closed") &&
            !panel.inert &&
            panel.getBoundingClientRect().height > 0,
        };
      },
    );
    return {
      height: Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      ),
      scrollWidth: Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth,
      ),
      innerWidth,
      sections,
      faqOpen: faq.filter((f) => f.expanded).length,
      faq,
      brokenImages: [...document.images]
        .filter((i) => !i.complete || i.naturalWidth === 0)
        .map((i) => i.currentSrc || i.src),
    };
  });
}
export function differences(actual, expected, width) {
  const errors = [];
  const compare = (label, got, wanted) => {
    if (!Number.isFinite(got) || !Number.isFinite(wanted))
      errors.push(`${label}: нет числового эталона/замера`);
    else if (Math.abs(got - wanted) > 2)
      errors.push(
        `${label}: ${got} вместо ${wanted}; Δ ${got - wanted > 0 ? "+" : ""}${(got - wanted).toFixed(3)} px (допуск 2 px)`,
      );
  };
  if (width === 1440) {
    compare("высота страницы", actual.height, expected.height);
    if (actual.sections.length !== expected.sections.length)
      errors.push(
        `число секций/footer: ${actual.sections.length} вместо ${expected.sections.length}`,
      );
    for (
      let i = 0;
      i < Math.max(actual.sections.length, expected.sections.length);
      i++
    ) {
      const a = actual.sections[i],
        e = expected.sections[i];
      if (!a || !e) {
        errors.push(
          `секция ${i + 1}: ${a ? "лишняя " + a.selector : "отсутствует " + e.selector}`,
        );
        continue;
      }
      if (a.selector !== e.selector)
        errors.push(
          `порядок/селектор ${i + 1}: ${a.selector} вместо ${e.selector}`,
        );
      for (const key of ["top", "height", "offsetTop", "offsetHeight"])
        compare(`${e.selector} ${key}`, a[key], e[key]);
    }
  }
  if (actual.scrollWidth > actual.innerWidth)
    errors.push(
      `горизонтальная прокрутка: ${actual.scrollWidth} вместо ${actual.innerWidth}; Δ +${actual.scrollWidth - actual.innerWidth} px`,
    );
  if (
    !actual.faq.length ||
    actual.faqOpen !== 1 ||
    !actual.faq[0]?.expanded ||
    actual.faq.some(
      (f, i) => f.visible !== (i === 0) || f.expanded !== (i === 0),
    )
  )
    errors.push(
      `FAQ: должен быть открыт и виден только первый ответ; раскрыто ${actual.faqOpen} (Δ ${actual.faqOpen - 1}); ${JSON.stringify(actual.faq)}`,
    );
  for (const src of actual.brokenImages)
    errors.push(`битое/не загруженное изображение: ${src}`);
  return errors;
}
export async function run(base = "http://127.0.0.1:4321") {
  const url = new URL(base);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("URL должен начинаться с http:// или https://");
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  const browser = await launchBrowser();
  const started = Date.now();
  let failures = 0;
  try {
    for (const route of routes)
      for (const width of widths) {
        const page = await browser.newPage(),
          errors = [];
        page.setDefaultTimeout(15000);
        page.on("console", (m) => {
          if (m.type() === "error") errors.push(`консоль: ${m.text()}`);
        });
        page.on("pageerror", (e) => errors.push(`JavaScript: ${e.message}`));
        page.on("response", (r) => {
          if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`);
        });
        try {
          await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
          await page.goto(new URL(route, url).href, {
            waitUntil: "load",
            timeout: 20000,
          });
          await settle(page);
          const actual = await measure(page);
          errors.push(...differences(actual, baseline[route], width));
          if (!errors.length)
            console.log(
              `ОК ${route} ${width}: высота ${actual.height}, прокрутка 0, FAQ 1, изображения и консоль чистые`,
            );
        } catch (e) {
          errors.push(`проверка не завершена: ${e.message}`);
        } finally {
          await page.close();
        }
        for (const error of errors)
          console.error(`ОШИБКА ${route} ${width}: ${error}`);
        failures += errors.length;
      }
  } finally {
    await browser.close();
  }
  console.log(
    `Проверка завершена за ${((Date.now() - started) / 1000).toFixed(1)} с; расхождений: ${failures}`,
  );
  return failures ? 1 : 0;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv.includes("--help"))
    console.log(
      "Запуск: node scripts/check-baseline.mjs [http://127.0.0.1:4321 или URL preview]",
    );
  else if (process.argv.length > 3) {
    console.error("Ожидается один необязательный аргумент URL");
    process.exitCode = 1;
  } else
    try {
      process.exitCode = await run(process.argv[2]);
    } catch (e) {
      console.error(`Ошибка проверки: ${e.message}`);
      process.exitCode = 1;
    }
}
