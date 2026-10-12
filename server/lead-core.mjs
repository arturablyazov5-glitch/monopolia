import { sourceName, pageName } from "./lead-sources.mjs";
/** Общая логика Node и Yandex Cloud Functions. Без зависимостей. */
const LIMIT = 10 * 1024;
const WINDOW = 10 * 60 * 1000;
const MAX_ATTEMPTS = 15;
const buckets = new Map();
const escapeHTML = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

function limited(ip) {
  const now = Date.now();
  for (const [key, value] of buckets)
    if (value.until <= now) buckets.delete(key);
  let bucket = buckets.get(ip);
  if (!bucket) {
    // Ограничиваем память; при переполнении новые IP временно не принимаем.
    if (buckets.size >= 10000) return true;
    bucket = { count: 0, until: now + WINDOW };
    buckets.set(ip, bucket);
  }
  return ++bucket.count > MAX_ATTEMPTS;
}

async function readJSON(request) {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new Error();
  if (Number(request.headers.get("content-length")) > LIMIT) throw new Error();
  const reader = request.body?.getReader();
  if (!reader) throw new Error();
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > LIMIT) {
      await reader.cancel();
      throw new Error();
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(body));
}

function validate(data) {
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error();
  const text = (key, min, max) => {
    if (typeof data[key] !== "string") throw new Error();
    const value = data[key].trim();
    if (value.length < min || value.length > max) throw new Error();
    return value;
  };
  const name = data.name === undefined ? "" : text("name", 0, 80);
  const source = text("source", 1, 2000);
  if (/^(?:не\s*определ[её]н|undefined)$/i.test(source)) throw new Error();
  const section = data.section === undefined ? "" : text("section", 0, 1000);
  const contactMethod =
    data.contactMethod === undefined ? "" : text("contactMethod", 0, 300);
  if (data.test !== undefined && typeof data.test !== "boolean")
    throw new Error();
  const form = text("form", 1, 80);
  const rawPhone = text("phone", 10, 40);
  if (!/^[+\d()\s-]+$/.test(rawPhone)) throw new Error();
  let phone = rawPhone.replace(/\D/g, "");
  if (phone.length === 10) phone = "7" + phone;
  if (phone[0] === "8") phone = "7" + phone.slice(1);
  if (!/^7[349]\d{9}$/.test(phone)) throw new Error();
  if (data.consent !== true || data.honeypot !== "") throw new Error();
  const page = text("page", 1, 1000);
  if (!["http:", "https:"].includes(new URL(page).protocol)) throw new Error();
  const comment = data.comment === undefined ? "" : text("comment", 0, 1200);
  // Разрешённые поля конкретных форм, не произвольные объекты из запроса.
  const extras = {};
  for (const key of [
    "subject",
    "channel",
    "city",
    "propertyType",
    "priceMillion",
  ]) {
    if (data[key] !== undefined) extras[key] = text(key, 0, 2000);
  }
  return {
    name,
    form,
    source,
    section,
    contactMethod,
    test: data.test === true,
    phone: "+" + phone,
    page,
    comment,
    extras,
  };
}

const shorten = (value, max = 300) => {
  const chars = Array.from(String(value).replace(/\s+/g, " ").trim());
  return chars.length > max
    ? chars.slice(0, max - 1).join("") + "…"
    : chars.join("");
};
const display = (value, max) => escapeHTML(shorten(value, max));

/** Только представление уже вычисленного источника: не меняет его контракт. */
function sourceLines(source) {
  const parts = sourceName(source)
    .split(/\s*·\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  const buttonIndex = parts.findIndex((part) => /^Кнопка\s+/i.test(part));
  const button =
    buttonIndex === -1
      ? ""
      : parts[buttonIndex]
          .replace(/^Кнопка\s+/i, "")
          .replace(/^«(.+)»$/, "$1");
  const block = (buttonIndex === -1 ? parts : parts.slice(0, buttonIndex))
    .join(" — ");
  return { block, button };
}

export function formatLeadMessage(data, env = {}) {
  const phone = data.phone.replace(/\D/g, "");
  const formatted = `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`;
  const url = new URL(data.page);
  const page = pageName(data.page);
  const local = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  // Не показываем технический URL: название страницы — единственное её упоминание.
  const pageLabel = page.startsWith("/") ? "Страница сайта" : page;
  const pageLine = local
    ? `Страница: ${display(pageLabel)}`
    : `Страница: <a href="${escapeHTML(url.origin + url.pathname)}">${display(pageLabel)}</a>`;
  const channel = data.contactMethod;
  const labels = {
    city: "Город",
    propertyType: "Тип объекта",
    priceMillion: "Стоимость, млн ₽",
  };
  const params = Object.entries(labels)
    .filter(([key]) => data.extras[key])
    .map(([key, label]) => `${label} — ${display(data.extras[key])}`);
  const source = sourceLines(data.source);
  const who = [
    ...(data.name ? [`<b>${display(data.name)}</b>`] : []),
    `<code>${formatted}</code>`,
    ...(channel ? [`Способ связи: ${display(channel)}`] : []),
  ];
  const details = [
    ...(data.extras.subject
      ? [`Тема: ${display(data.extras.subject)}`]
      : []),
    ...(data.comment
      ? [
          `<blockquote>${display(data.comment, 1000)}</blockquote>${
            params.length ? `\n\n${params.join("\n")}` : ""
          }`,
        ]
      : params.length
        ? [params.join("\n")]
        : []),
  ];
  const origin = [
    "📍 <b>Откуда</b>",
    pageLine,
    ...(source.block ? [`Блок: ${display(source.block)}`] : []),
    ...(source.button ? [`Кнопка: ${display(source.button)}`] : []),
  ];
  return [
    env.LEAD_TEST === "1" || data.test
      ? "🧪 <b>Тест</b> · Новая заявка"
      : "🆕 <b>Новая заявка</b>",
    who.join("\n"),
    ...(details.length ? [details.join("\n")] : []),
    origin.join("\n"),
  ].join("\n\n");
}

export async function handleLead(
  request,
  env,
  { ip = "unknown", report = () => {} } = {},
) {
  const origin = request.headers.get("origin");
  const allowed = [
    "http://127.0.0.1:4321",
    "http://localhost:4321",
    env.PUBLIC_SITE_ORIGIN,
    ...(env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()),
  ].filter(Boolean);
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
  const reply = (status, error) =>
    new Response(JSON.stringify(error ? { ok: false, error } : { ok: true }), {
      status,
      headers,
    });
  // Origin обязателен: серверные тесты также передают origin разрешённого сайта.
  if (new URL(request.url).pathname === "/health" && request.method === "GET")
    return reply(200);
  if (!origin || !allowed.includes(origin))
    return reply(400, "origin_not_allowed");
  headers["Access-Control-Allow-Origin"] = origin;
  headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type";
  if (new URL(request.url).pathname !== "/lead")
    return reply(400, "invalid_path");
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return reply(400, "invalid_method");
  if (limited(ip)) {
    headers["Retry-After"] = "600";
    return reply(429, "rate_limit");
  }
  let data;
  try {
    data = validate(await readJSON(request));
  } catch {
    return reply(400, "invalid_lead");
  }
  const message = formatLeadMessage(data, env);
  // Telegram считает текст после разбора HTML, а не длину &amp;/&quot;.
  const visibleLength = message
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:amp|lt|gt|quot|#39);/g, "_").length;
  if (visibleLength > 4096) return reply(400, "invalid_lead");
  if (env.LEAD_DRY_RUN === "1") {
    report("dry_run lead=*** recipient=***");
    return reply(200);
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID)
    return reply(502, "delivery_unavailable");
  const base = env.TELEGRAM_API_BASE || "https://api.telegram.org";
  try {
    if (new URL(base).protocol !== "https:") throw new Error();
  } catch {
    return reply(502, "delivery_unavailable");
  }
  // Одна попытка + два повтора при временной ошибке. Никогда не логируем URL/исключение.
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt)
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    try {
      const telegram = await fetch(
        `${base.replace(/\/$/, "")}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "HTML",
            link_preview_options: { is_disabled: true },
          }),
          signal: AbortSignal.timeout(6000),
        },
      );
      const result = await telegram.json();
      if (telegram.ok && result.ok === true) {
        report("delivered lead=*** recipient=***");
        return reply(200);
      }
      if (result.description === "Bad Request: chat not found") {
        report("chat_not_found");
        return reply(502, "delivery_unavailable");
      }
      if (telegram.status < 500 && telegram.status !== 429) break;
    } catch {
      /* Повторяем без вывода исключения с секретным URL. */
    }
  }
  report("delivery_failed");
  return reply(502, "delivery_unavailable");
}
