/** Серверный контракт без сети, получателей и секретов. */
import assert from "node:assert/strict";
import { formatLeadMessage, handleLead } from "../server/lead-core.mjs";
const base = {
  form: "modal",
  source: "Оценка недвижимости · Получить консультацию",
  section: "Услуги",
  name: "Тест",
  phone: "+79991234567",
  consent: true,
  honeypot: "",
  page: "https://example.com/buy/",
  subject: "ТЕСТ TASK-044",
};
const env = { TELEGRAM_BOT_TOKEN: "mock", TELEGRAM_CHAT_ID: "mock" };
const original = globalThis.fetch;
let sent;
let count = 0;
globalThis.fetch = async (_, options) => {
  sent = JSON.parse(options.body);
  count++;
  return Response.json({ ok: true });
};
let index = 0;
async function submit(patch, overrides = {}) {
  return handleLead(
    new Request("http://localhost/lead", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://127.0.0.1:4321",
      },
      body: JSON.stringify({ ...base, ...patch }),
    }),
    { ...env, ...overrides },
    { ip: `contract-${index++}` },
  );
}
try {
  assert.equal((await submit({ source: "" })).status, 400);
  assert.equal((await submit({ source: undefined })).status, 400);
  assert.equal((await submit({ source: "не определён" })).status, 400);
  assert.equal(count, 0);
  assert.equal(
    (
      await submit({
        name: "",
        contactMethod: "",
        comment: "ТЕСТ TASK-044 <b>& \"' >",
      })
    ).status,
    200,
  );
  assert(!sent.text.includes("Имя:"));
  assert(!sent.text.includes("Способ связи:"));
  assert(sent.text.includes("&lt;b&gt;&amp; &quot;&#39; &gt;"));
  assert(sent.text.includes("<code>+7 (999) 123-45-67</code>"));
  assert(sent.text.includes("📍 <b>Откуда</b>"));
  assert(sent.text.includes('Страница: <a href="https://example.com/buy/">Покупка</a>'));
  assert.equal((sent.text.match(/Страница:/g) || []).length, 1);
  assert(!sent.text.replace(/<[^>]+>/g, "").includes("/buy/"));
  assert(!/Время:|Не указано/.test(sent.text));
  for (const contactMethod of ["По телефону", "Telegram", "Max", "WhatsApp"]) {
    assert.equal((await submit({ contactMethod, test: true })).status, 200);
    assert(sent.text.startsWith("🧪 <b>Тест</b> · Новая заявка"));
    assert(sent.text.includes(`Способ связи: ${contactMethod}`));
    assert.equal((sent.text.match(/[🆕🧪📍]/gu) || []).length, 2);
  }
  assert.equal(
    (
      await submit(
        {
          page: "http://localhost:4321/ui-kit/",
          source: "Новый блок <&>",
          name: "Тест",
          subject: "x".repeat(400),
          comment: "ТЕСТ TASK-044 " + "я".repeat(1180),
          city: "Благовещенск",
          propertyType: "Квартира",
          priceMillion: "10.9",
        },
        { LEAD_TEST: "1" },
      )
    ).status,
    200,
  );
  assert(!sent.text.includes("<a "));
  assert(sent.text.includes("Страница: UI-kit (тест)"));
  assert(!sent.text.includes("/ui-kit/"));
  assert(sent.text.includes("Блок: Новый блок &lt;&amp;&gt;"));
  assert(sent.text.includes("я…</blockquote>"));
  assert(sent.text.split("\n").length <= 15);
  assert.equal((await submit({ comment: "&".repeat(1200) })).status, 200);
  assert(sent.text.includes("&amp;".repeat(999) + "…"));
  const formatted = formatLeadMessage(
    {
      ...base,
      name: "Анна",
      contactMethod: "Max",
      page: "http://127.0.0.1:4321/sell/",
      source: "Хотите продать жилье на этой неделе? · Кнопка «Хочу срочно продать объект»",
      comment: "Комментарий",
      extras: {
        subject: "Срочная продажа объекта",
        city: "Белогорск",
        propertyType: "Квартира",
      },
    },
    {},
  );
  assert.equal(
    formatted,
    [
      "🆕 <b>Новая заявка</b>",
      "<b>Анна</b>\n<code>+7 (999) 123-45-67</code>\nСпособ связи: Max",
      "Тема: Срочная продажа объекта\n<blockquote>Комментарий</blockquote>\n\nГород — Белогорск\nТип объекта — Квартира",
      "📍 <b>Откуда</b>\nСтраница: Продажа\nБлок: Хотите продать жилье на этой неделе?\nКнопка: Хочу срочно продать объект",
    ].join("\n\n"),
  );
  for (const name of ["", "Анна"])
    for (const contactMethod of ["", "По телефону"])
      for (const subject of ["", "Тема"])
        for (const comment of ["", "Комментарий"])
          for (const city of ["", "Белогорск"]) {
            const message = formatLeadMessage({
              ...base,
              name,
              contactMethod,
              comment,
              extras: { subject, city },
            });
            assert(!message.startsWith("\n"));
            assert(!message.endsWith("\n"));
            assert(!message.includes("\n\n\n"));
            assert.equal((message.match(/Страница:/g) || []).length, 1);
            assert(!message.replace(/<[^>]+>/g, "").includes("/buy/"));
            if (comment && city)
              assert(message.includes("</blockquote>\n\nГород — Белогорск"));
          }
  assert.equal((await submit({ honeypot: "bot" })).status, 400);
  console.log("Контракт, HTML, источники, группы и ограничения длины: ОК");
} finally {
  globalThis.fetch = original;
}
