import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { options, environment, sitePort, checkPort } from "./dev-all.mjs";
import { passwordHash } from "../server/admin-auth.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
test("dev command includes API; options and origins follow the selected site port", async () => {
  const pkg = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url)),
  );
  assert.equal(pkg.scripts.dev, "node scripts/dev-all.mjs");
  assert.equal(pkg.scripts["dev:all"], pkg.scripts.dev);
  assert.equal(options([]).port, 4321);
  assert.equal(options(["--port", "4330"]).port, 4330);
  assert.equal(options(["--port=4331"]).port, 4331);
  assert.throws(() => options(["--port", "bad"]));
  assert.throws(() => options(["--host", "0.0.0.0"]));
  const result = environment(
    { ADMIN_USER: "fixture", ALLOWED_ORIGINS: "https://example.test" },
    4331,
  );
  assert.equal(result.ADMIN_USER, "fixture");
  assert.equal(result.HOST, "127.0.0.1");
  assert.equal(result.PORT, "8787");
  assert.equal(
    result.ALLOWED_ORIGINS,
    "https://example.test,http://127.0.0.1:4331",
  );
  assert.throws(() =>
    environment({ PORT: "8787", ADMIN_API_PORT: "8788" }, 4321),
  );
});
test("occupied site port is skipped without stopping its listener", async () => {
  const listener = createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const busy = listener.address().port;
  try {
    const free = await sitePort(busy);
    assert(free > busy);
    await checkPort(free);
    assert(listener.listening);
  } finally {
    listener.close();
    await once(listener, "close");
  }
});
test(
  "integrated startup: frontend + authenticated API, busy-port refusal, graceful stop",
  { skip: process.env.DEV_ALL_INTEGRATION_TEST !== "1", timeout: 60000 },
  async () => {
    await checkPort(8788);
    const data = await mkdtemp(join(tmpdir(), "monopoly-dev-test-"));
    const blocker = createServer();
    blocker.listen(0, "127.0.0.1");
    await once(blocker, "listening");
    const requested = blocker.address().port;
    const env = {
      ...process.env,
      PORT: "8788",
      ADMIN_API_PORT: "8788",
      DATA_DIR: data,
      ADMIN_USER: "dev-fixture",
      ADMIN_PASSWORD_HASH: await passwordHash("dev-fixture-passphrase"),
      LEAD_DRY_RUN: "1",
      ASTRO_TELEMETRY_DISABLED: "1",
    };
    const child = spawn(
      process.execPath,
      ["scripts/dev-all.mjs", "--port", String(requested)],
      { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] },
    );
    let logs = "";
    child.stdout.on("data", (chunk) => {
      logs += chunk;
    });
    child.stderr.on("data", (chunk) => {
      logs += chunk;
    });
    const exit = once(child, "exit");
    try {
      const deadline = Date.now() + 20000;
      while (!logs.includes("[dev] Админка:")) {
        if (child.exitCode !== null) throw Error(logs);
        if (Date.now() > deadline) throw Error("Startup timed out: " + logs);
        await new Promise((r) => setTimeout(r, 100));
      }
      const origin = logs.match(
        /\[dev\] Админка: (http:\/\/127\.0\.0\.1:\d+)\/admin\//,
      )[1];
      assert.notEqual(Number(new URL(origin).port), requested);
      assert(blocker.listening);
      assert.equal((await fetch(origin + "/admin/")).status, 200);
      assert.equal((await fetch(origin + "/api/content")).status, 200);
      const logged = await fetch(origin + "/api/admin/session", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          "X-Admin-Request": "1",
        },
        body: JSON.stringify({
          username: "dev-fixture",
          password: "dev-fixture-passphrase",
        }),
      });
      assert.equal(logged.status, 200);
      const cookie = logged.headers.get("set-cookie").split(";")[0],
        csrf = (await logged.json()).csrfToken;
      const catalog = await fetch(origin + "/api/admin/catalog", {
        headers: {
          Cookie: cookie,
          "X-Admin-Request": "1",
          "X-Admin-CSRF": csrf,
        },
      });
      assert.equal(catalog.status, 200);
      const conflict = spawn(
        process.execPath,
        ["scripts/dev-all.mjs", "--port", String(requested)],
        { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] },
      );
      let conflictLogs = "";
      conflict.stderr.on("data", (c) => {
        conflictLogs += c;
      });
      conflict.stdout.resume();
      const [code] = await once(conflict, "exit");
      assert.equal(code, 1);
      assert.match(conflictLogs, /Порт API 8788 занят/);
      assert.equal((await fetch(origin + "/api/content")).status, 200);
      child.kill("SIGTERM");
      const [codeAfterStop] = await exit;
      assert.equal(codeAfterStop, 0);
      await checkPort(8788);
      await checkPort(Number(new URL(origin).port));
    } finally {
      if (child.exitCode === null) {
        child.kill("SIGTERM");
        await exit;
      }
      blocker.close();
      await once(blocker, "close");
      await rm(data, { recursive: true, force: true });
    }
  },
);
