import { handleLead } from "./lead-core.mjs";

// Архив содержит оба .mjs; entry point: yandex-cloud-function.handler, Node 22+.
export async function handler(event) {
  try {
    const headers = new Headers(event.headers || {});
    const body = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64")
      : Buffer.from(event.body || "");
    if (body.length > 10 * 1024)
      headers.set("content-length", String(body.length));
    const method =
      event.httpMethod || event.requestContext?.http?.method || "POST";
    const path = event.path || event.rawPath || "/lead";
    const request = new Request(new URL(path, "https://function.local"), {
      method,
      headers,
      ...(method === "POST" ? { body } : {}),
    });
    const response = await handleLead(request, process.env, {
      ip:
        event.requestContext?.identity?.sourceIp ||
        event.requestContext?.http?.sourceIp ||
        "unknown",
      report: (event) => console.log(`[lead-function] ${event}`),
    });
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.text(),
      isBase64Encoded: false,
    };
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "invalid_lead" }),
      isBase64Encoded: false,
    };
  }
}
