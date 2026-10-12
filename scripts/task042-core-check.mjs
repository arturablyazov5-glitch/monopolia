import assert from "node:assert/strict";
import { handleLead } from "../server/lead-core.mjs";
import { handler } from "../server/yandex-cloud-function.mjs";
const payload = {
  form: "test",
  name: "<b>Тест</b>",
  phone: "8 (999) 123-45-67",
  consent: true,
  page: "https://example.ru/",
  honeypot: "",
  comment: "<script>&",
  city: "Благовещенск",
};
const env = {
  TELEGRAM_BOT_TOKEN: "test-placeholder",
  TELEGRAM_CHAT_ID: "test-placeholder",
};
const req = (data, origin = "http://127.0.0.1:4321") =>
  new Request("http://localhost/lead", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
const originalFetch = globalThis.fetch;
let calls = 0;
try {
  globalThis.fetch = async (_url, init) => {
    calls++;
    const body = JSON.parse(init.body);
    assert.equal(body.parse_mode, "HTML");
    assert.ok(body.text.includes("&lt;b&gt;Тест&lt;/b&gt;"));
    assert.ok(body.text.includes("+79991234567"));
    assert.ok(body.text.includes("(Благовещенск, UTC+9)"));
    return Response.json({ ok: true });
  };
  assert.equal(
    (await handleLead(req(payload), env, { ip: "valid" })).status,
    200,
  );
  assert.equal(calls, 1);
  for (const invalid of [
    { name: "" },
    { name: "x".repeat(81) },
    { phone: "+12025550123" },
    { consent: false },
    { honeypot: "robot" },
    { page: "javascript:alert(1)" },
    { comment: "x".repeat(11000) },
    { form: [] },
    { city: {} },
    { honeypot: " " },
  ]) {
    assert.equal(
      (
        await handleLead(req({ ...payload, ...invalid }), env, {
          ip: "invalid",
        })
      ).status,
      400,
    );
  }
  assert.equal(
    (await handleLead(req(payload, "https://evil.ru"), env)).status,
    400,
  );
  assert.equal(calls, 1);
  assert.equal(
    (await handleLead(new Request("http://localhost/health"), env)).status,
    200,
  );
  assert.equal(
    (
      await handleLead(
        new Request("http://localhost/lead", {
          method: "OPTIONS",
          headers: { Origin: "http://localhost:4321" },
        }),
        env,
      )
    ).status,
    204,
  );
  for (let i = 0; i < 16; i++)
    assert.equal(
      (await handleLead(req(payload), { LEAD_DRY_RUN: "1" }, { ip: "limited" }))
        .status,
      i < 15 ? 200 : 429,
    );
  calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ ok: false }, { status: 503 });
  };
  assert.equal(
    (await handleLead(req(payload), env, { ip: "retry" })).status,
    502,
  );
  assert.equal(calls, 3);
  calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json(
      { ok: false, description: "Bad Request: chat not found" },
      { status: 400 },
    );
  };
  assert.equal(
    (await handleLead(req(payload), env, { ip: "not-started" })).status,
    502,
  );
  assert.equal(calls, 1);
  const event = {
    httpMethod: "POST",
    path: "/lead",
    headers: {
      Origin: "http://127.0.0.1:4321",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...payload, honeypot: "robot" }),
    requestContext: { identity: { sourceIp: "function-test" } },
  };
  assert.equal((await handler(event)).statusCode, 400);
  event.path = "/health";
  event.httpMethod = "GET";
  assert.equal((await handler(event)).statusCode, 200);
  const previousDryRun = process.env.LEAD_DRY_RUN;
  try {
    process.env.LEAD_DRY_RUN = "1";
    event.httpMethod = "POST";
    event.path = "/lead";
    event.body = Buffer.from(JSON.stringify(payload)).toString("base64");
    event.isBase64Encoded = true;
    assert.equal((await handler(event)).statusCode, 200);
    event.body = Buffer.from("x".repeat(11000)).toString("base64");
    assert.equal((await handler(event)).statusCode, 400);
  } finally {
    if (previousDryRun === undefined) delete process.env.LEAD_DRY_RUN;
    else process.env.LEAD_DRY_RUN = previousDryRun;
  }
  console.log(
    "OK core: validation, escaping, phone, CORS, health, honeypot/no delivery, rate-limit, 2 retries/502, chat_not_found, Yandex adapter",
  );
} finally {
  globalThis.fetch = originalFetch;
}
