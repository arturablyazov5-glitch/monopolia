import { createServer } from "node:http";
import { handleLead } from "./lead-core.mjs";

import { createAdminAPI } from "./admin-api.mjs";
const admin = await createAdminAPI();
void admin.recovery.startPolling().catch(() => console.warn('[admin] recovery_start_unavailable'));

const port = Number(process.env.PORT || 8787);
const server = createServer(async (incoming, outgoing) => {
  if (incoming.url?.startsWith("/api/") || incoming.url?.startsWith("/media/")) {
    return admin.handler(incoming, outgoing);
  }
  const reply = (status, error) => {
    outgoing.writeHead(status, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    outgoing.end(JSON.stringify({ ok: false, error }));
  };
  try {
    let size = 0;
    const chunks = [];
    for await (const chunk of incoming) {
      size += chunk.length;
      if (size > 10 * 1024) {
        const headers = new Headers(incoming.headers);
        // Общий обработчик добавляет CORS и отвергает заведомо большое тело.
        headers.set("content-length", String(size));
        const response = await handleLead(
          new Request("http://localhost/lead", {
            method: "POST",
            headers,
            body: "{}",
          }),
          process.env,
          { ip: incoming.socket.remoteAddress },
        );
        outgoing.writeHead(
          response.status,
          Object.fromEntries(response.headers),
        );
        outgoing.end(await response.text());
        incoming.resume();
        return;
      }
      chunks.push(chunk);
    }
    const request = new Request(new URL(incoming.url, "http://localhost"), {
      method: incoming.method,
      headers: incoming.headers,
      ...(incoming.method === "POST" ? { body: Buffer.concat(chunks) } : {}),
    });
    // X-Forwarded-For игнорируется. Только собственный HTTPS-прокси должен
    // перезаписывать X-Real-IP, а Node оставаться закрытым от внешнего доступа.
    const peer = incoming.socket.remoteAddress;
    const trusted =
      process.env.TRUST_PROXY === "1" &&
      ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(peer);
    const ip =
      trusted && typeof incoming.headers["x-real-ip"] === "string"
        ? incoming.headers["x-real-ip"]
        : peer;
    const response = await handleLead(request, process.env, {
      ip,
      report: (event) => console.log(`[lead-proxy] ${event}`),
    });
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(await response.text());
  } catch {
    if (!outgoing.headersSent) reply(400, "invalid_lead");
    else outgoing.end();
  }
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(port, process.env.HOST || "127.0.0.1", () =>
  console.log(`[lead-proxy] ready port=${port}`),
);
server.on("error", () => {
  console.error("[lead-proxy] startup_failed");
  process.exitCode = 1;
});
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => server.close(async () => { if (admin) await admin.close(); }));
