#!/usr/bin/env node

/**
 * Smoke-test responsive pages in the system Chrome without adding a project
 * dependency. See README-responsive-check.md for the bootstrap details.
 */
import { existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_URL = "http://127.0.0.1:4321";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TOOL_PREFIX = "/private/tmp/claude-501/tools";
const PUPPETEER_PACKAGE = "puppeteer-core";
const WIDTHS = [360, 390, 768, 1024, 1199, 1440];
const ROUTES = [
  { path: "/", name: "home" },
  { path: "/sell/", name: "sell" },
  { path: "/buy/", name: "buy" },
];
const VIEWPORT_HEIGHT = 900;
const FULL_PAGE_LIMIT = 17_000;

function usage() {
  console.log(
    "Использование: node scripts/responsive-check.mjs [baseUrl] [--out dir]",
  );
}

function dateStamp() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .replace("Z", "");
}

function parseArgs(argv) {
  let baseUrl = DEFAULT_URL;
  let outDir = join("/private/tmp/claude-501/responsive-check", dateStamp());
  let baseUrlSet = false;
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--help" || value === "-h") {
      usage();
      process.exit(0);
    }
    if (value === "--out") {
      const next = argv[++index];
      if (!next) throw new Error("После --out нужна папка.");
      outDir = resolve(next);
    } else if (value.startsWith("--out=")) {
      outDir = resolve(value.slice("--out=".length));
    } else if (!value.startsWith("-") && !baseUrlSet) {
      baseUrl = value;
      baseUrlSet = true;
    } else {
      throw new Error(`Неизвестный аргумент: ${value}`);
    }
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), outDir };
}

async function loadPuppeteer() {
  const localRequire = createRequire(import.meta.url);
  try {
    return await import(localRequire.resolve(PUPPETEER_PACKAGE));
  } catch {
    // The cache is deliberately outside the repository: package.json and its
    // lock file stay untouched. A second run simply reuses this installation.
    const moduleEntry = join(TOOL_PREFIX, "node_modules", PUPPETEER_PACKAGE);
    if (!existsSync(moduleEntry)) {
      mkdirSync(TOOL_PREFIX, { recursive: true });
      console.log("Однократно устанавливаю puppeteer-core во временную папку…");
      const result = spawnSync(
        "npm",
        [
          "install",
          "--no-save",
          "--prefix",
          TOOL_PREFIX,
          `${PUPPETEER_PACKAGE}@latest`,
        ],
        {
          stdio: "inherit",
          env: {
            ...process.env,
            npm_config_cache: join(TOOL_PREFIX, "npm-cache"),
          },
        },
      );
      if (result.status !== 0)
        throw new Error("Не удалось временно установить puppeteer-core.");
    }
    const temporaryRequire = createRequire(join(TOOL_PREFIX, "package.json"));
    return import(temporaryRequire.resolve(PUPPETEER_PACKAGE));
  }
}

function markdownCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function failureLabel(item) {
  const parts = [];
  if (item.consoleErrors.length)
    parts.push(`console: ${item.consoleErrors.length}`);
  if (item.pageErrors.length)
    parts.push(`pageerror: ${item.pageErrors.length}`);
  if (item.httpErrors.length) parts.push(`HTTP: ${item.httpErrors.length}`);
  if (item.failedRequests.length)
    parts.push(`network: ${item.failedRequests.length}`);
  return parts.join(", ") || "—";
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const isRendered = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const hasClippingAncestor = (element) => {
      for (
        let parent = element.parentElement;
        parent;
        parent = parent.parentElement
      ) {
        const overflowX = getComputedStyle(parent).overflowX;
        if (["hidden", "clip", "auto", "scroll"].includes(overflowX))
          return true;
      }
      return false;
    };
    const label = (element) => {
      const classNames = [...element.classList]
        .filter((name) => name && name.length < 50)
        .slice(0, 3);
      return `${element.tagName.toLowerCase()}${classNames.length ? `.${classNames.join(".")}` : ""}`;
    };
    const path = (element) => {
      const ancestors = [];
      for (
        let parent = element.parentElement;
        parent && ancestors.length < 3;
        parent = parent.parentElement
      )
        ancestors.push(label(parent));
      return ancestors.reverse().join(" > ");
    };
    const overflow = [...document.querySelectorAll("body *")]
      .filter((element) => isRendered(element) && !hasClippingAncestor(element))
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(
        ({ rect }) => rect.right > window.innerWidth + 1 || rect.left < -1,
      )
      .sort(
        (a, b) =>
          Math.max(b.rect.right - window.innerWidth, -b.rect.left) -
          Math.max(a.rect.right - window.innerWidth, -a.rect.left),
      )
      .slice(0, 15)
      .map(({ element, rect }) => ({
        selector: label(element),
        path: path(element),
        left: Math.round(rect.left * 10) / 10,
        right: Math.round(rect.right * 10) / 10,
        width: Math.round(rect.width * 10) / 10,
      }));
    const brokenImages = [...document.images]
      .filter(
        (image) =>
          isRendered(image) && image.complete && image.naturalWidth === 0,
      )
      .map((image) => image.currentSrc || image.src || "(без src)");
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      documentHeight: Math.max(
        document.documentElement.scrollHeight,
        document.body?.scrollHeight || 0,
      ),
      overflow,
      brokenImages,
    };
  });
}

async function warmLazyContent(page) {
  // Скриншоты должны показывать ленивые картинки (loading="lazy"): прокручиваем
  // до низа, на каждом шаге ждём картинки около экрана, затем — сеть и все
  // начатые загрузки. Без этого карточки отзывов/кейсов на снимках пустые.
  await page.evaluate(async () => {
    const waitImages = (images, ms) =>
      Promise.race([
        Promise.all(
          images.map((image) =>
            image.complete
              ? null
              : new Promise((done) => {
                  image.addEventListener("load", done, { once: true });
                  image.addEventListener("error", done, { once: true });
                }),
          ),
        ),
        new Promise((done) => setTimeout(done, ms)),
      ]);
    const bottom =
      Math.max(
        document.documentElement.scrollHeight,
        document.body?.scrollHeight || 0,
      ) - innerHeight;
    const steps = Math.max(1, Math.ceil(bottom / 700));
    for (let step = 0; step <= steps; step += 1) {
      // behavior: 'instant' — у сайта scroll-behavior: smooth, обычный scrollTo
      // анимируется, и снимок делался посреди прокрутки (шапка посреди кадра)
      scrollTo({
        top: Math.round((bottom * step) / steps),
        behavior: "instant",
      });
      await new Promise((done) => setTimeout(done, 120));
      const near = [...document.images].filter((image) => {
        const rect = image.getBoundingClientRect();
        // Скрытые (display: none, мобильные/десктопные варианты) не грузятся — не ждём их
        if (!rect.width || !rect.height) return false;
        // Карточки каруселей за правым краем остаются ленивыми (их и не видно)
        if (rect.right <= 0 || rect.left >= innerWidth) return false;
        return rect.bottom > -innerHeight && rect.top < innerHeight * 2;
      });
      await waitImages(near, 3_000);
    }
    const rendered = [...document.images].filter((image) => {
      const rect = image.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.right > 0 &&
        rect.left < innerWidth
      );
    });
    await waitImages(rendered, 8_000);
    scrollTo({ top: 0, behavior: "instant" });
  });
  await page
    .waitForNetworkIdle({ idleTime: 500, timeout: 8_000 })
    .catch(() => {});
  await new Promise((done) => setTimeout(done, 400));
}

async function takeScreenshots(page, outputPrefix, documentHeight) {
  await page.screenshot({
    path: `${outputPrefix}-top.png`,
    type: "png",
    optimizeForSpeed: true,
  });
  if (documentHeight <= FULL_PAGE_LIMIT) {
    await page.screenshot({
      path: `${outputPrefix}.png`,
      type: "png",
      fullPage: true,
      optimizeForSpeed: true,
    });
    return {
      mode: "fullPage",
      files: [`${outputPrefix}-top.png`, `${outputPrefix}.png`],
    };
  }
  // Chrome's maximum screenshot height varies by version. Split only tall
  // documents into height-limited vertical slices, rather than issuing dozens
  // of 900px captures (which makes this 18-page audit impractically slow).
  const sliceHeight = 16_000;
  const viewport = page.viewport();
  const count = Math.ceil(documentHeight / sliceHeight);
  const files = [`${outputPrefix}-top.png`];
  for (let part = 0; part < count; part += 1) {
    const y = part * sliceHeight;
    const height = Math.min(sliceHeight, documentHeight - y);
    const filename = `${outputPrefix}-part-${String(part + 1).padStart(2, "0")}.png`;
    await page.screenshot({
      path: filename,
      type: "png",
      clip: { x: 0, y, width: viewport.width, height },
      optimizeForSpeed: true,
    });
    files.push(filename);
  }
  return { mode: "heightLimitedSlices", files };
}

function reportMarkdown(report) {
  const lines = [
    "# Проверка адаптива",
    "",
    `Базовый URL: ${report.baseUrl}`,
    `Создан: ${report.createdAt}`,
    "",
    "## Сводка",
    "",
    "| Страница | Ширина | scrollWidth / innerWidth | Вылезающих | Битые картинки | Ошибки |",
    "| --- | ---: | --- | ---: | ---: | --- |",
  ];
  for (const item of report.results) {
    lines.push(
      `| ${item.route} | ${item.width} | ${item.scrollWidth} / ${item.innerWidth} | ${item.overflow.length} | ${item.brokenImages.length} | ${markdownCell(failureLabel(item))} |`,
    );
  }
  lines.push("", "## Детали");
  for (const item of report.results) {
    lines.push(
      "",
      `### ${item.route} — ${item.width}px`,
      "",
      `Скриншоты: ${item.screenshots.mode === "fullPage" ? "верх и полная страница" : "верх и серия вертикальных фрагментов до 16 000 px"}.`,
    );
    if (item.overflow.length) {
      lines.push(
        "",
        "Вылезающие элементы:",
        "",
        "| Элемент | Путь | left | right | width |",
        "| --- | --- | ---: | ---: | ---: |",
      );
      for (const entry of item.overflow)
        lines.push(
          `| ${markdownCell(entry.selector)} | ${markdownCell(entry.path)} | ${entry.left} | ${entry.right} | ${entry.width} |`,
        );
    }
    if (item.brokenImages.length)
      lines.push(
        "",
        `Битые изображения: ${item.brokenImages.map(markdownCell).join(", ")}`,
      );
    if (item.consoleErrors.length)
      lines.push(
        "",
        `Ошибки консоли: ${item.consoleErrors.map(markdownCell).join("<br>")}`,
      );
    if (item.pageErrors.length)
      lines.push(
        "",
        `Ошибки страницы: ${item.pageErrors.map(markdownCell).join("<br>")}`,
      );
    if (item.httpErrors.length)
      lines.push(
        "",
        `HTTP >= 400: ${item.httpErrors.map((error) => `${error.status} ${markdownCell(error.url)}`).join("<br>")}`,
      );
    if (item.failedRequests.length)
      lines.push(
        "",
        `Неудачные запросы: ${item.failedRequests.map(markdownCell).join("<br>")}`,
      );
    if (
      !item.overflow.length &&
      !item.brokenImages.length &&
      !failureLabel(item).replace("—", "")
    )
      lines.push("", "Проблем не найдено.");
  }
  lines.push(
    "",
    `Код завершения: ${report.failed ? "1 (есть горизонтальная прокрутка до 1199px или битые изображения)" : "0"}.`,
    "",
  );
  return lines.join("\n");
}

async function main() {
  const { baseUrl, outDir } = parseArgs(process.argv.slice(2));
  if (!existsSync(CHROME))
    throw new Error(`Системный Chrome не найден: ${CHROME}`);
  mkdirSync(outDir, { recursive: true });
  const puppeteerModule = await loadPuppeteer();
  const puppeteer = puppeteerModule.default ?? puppeteerModule;
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-first-run", "--no-default-browser-check"],
  });
  const report = {
    createdAt: new Date().toISOString(),
    baseUrl,
    outDir,
    viewport: { height: VIEWPORT_HEIGHT, widths: WIDTHS },
    results: [],
    failed: false,
  };
  try {
    for (const route of ROUTES) {
      for (const width of WIDTHS) {
        const page = await browser.newPage();
        await page.setViewport({
          width,
          height: VIEWPORT_HEIGHT,
          deviceScaleFactor: 1,
        });
        const consoleErrors = [];
        const pageErrors = [];
        const httpErrors = [];
        const failedRequests = [];
        page.on("console", (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });
        page.on("pageerror", (error) => pageErrors.push(error.message));
        page.on("response", (response) => {
          if (response.status() >= 400)
            httpErrors.push({ status: response.status(), url: response.url() });
        });
        page.on("requestfailed", (request) =>
          failedRequests.push(
            `${request.failure()?.errorText || "failed"} ${request.url()}`,
          ),
        );
        const url = `${baseUrl}${route.path}`;
        try {
          // Some analytics/third-party connections never become "network idle".
          // The bounded idle wait in warmLazyContent below is enough for this QA.
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30_000,
          });
          await warmLazyContent(page);
          const inspection = await inspectPage(page);
          const prefix = join(outDir, `${route.name}-${width}`);
          const screenshots = await takeScreenshots(
            page,
            prefix,
            inspection.documentHeight,
          );
          const item = {
            route: route.path,
            page: route.name,
            width,
            url,
            ...inspection,
            consoleErrors,
            pageErrors,
            httpErrors,
            failedRequests,
            screenshots,
          };
          report.results.push(item);
          if (
            (width <= 1199 && inspection.scrollWidth > inspection.innerWidth) ||
            inspection.brokenImages.length
          )
            report.failed = true;
          console.log(
            `${route.path} ${width}px: ${inspection.scrollWidth}/${inspection.innerWidth}, overflow ${inspection.overflow.length}, images ${inspection.brokenImages.length}`,
          );
        } catch (error) {
          const item = {
            route: route.path,
            page: route.name,
            width,
            url,
            scrollWidth: null,
            innerWidth: width,
            documentHeight: null,
            overflow: [],
            brokenImages: [],
            consoleErrors,
            pageErrors: [...pageErrors, error.message],
            httpErrors,
            failedRequests,
            screenshots: { mode: "failed", files: [] },
          };
          report.results.push(item);
          report.failed = true;
          console.error(`${route.path} ${width}px: ${error.message}`);
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  const { writeFileSync } = await import("node:fs");
  writeFileSync(
    join(outDir, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  writeFileSync(join(outDir, "report.md"), reportMarkdown(report));
  console.log(`Отчёт: ${outDir}`);
  process.exitCode = report.failed ? 1 : 0;
}

main().catch((error) => {
  console.error(`Ошибка проверки: ${error.stack || error.message}`);
  process.exitCode = 1;
});
