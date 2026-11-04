import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { loadEnvFile } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
export function options(args) {
  let port = 4321;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--port" || arg.startsWith("--port=")) {
      const value = arg.includes("=") ? arg.slice(7) : args[++i];
      port = Number(value);
      if (!Number.isInteger(port) || port < 1024 || port > 65535)
        throw Error("Укажите корректный --port (1024–65535).");
    } else if (arg === "--host" && args[i + 1] === "127.0.0.1") i++;
    else
      throw Error(
        `Неизвестный аргумент: ${arg}. Доступен --port. Для отдельного Astro используйте npm run dev:site.`,
      );
  }
  return { port };
}
export function checkPort(port) {
  return new Promise((done, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(port, "127.0.0.1", () => probe.close(done));
  });
}
export async function sitePort(preferred) {
  for (let port = preferred; port <= Math.min(preferred + 30, 65535); port++) {
    try {
      await checkPort(port);
      return port;
    } catch (error) {
      if (error.code !== "EADDRINUSE") throw error;
    }
  }
  throw Error("Не найден свободный порт для сайта. Укажите другой --port.");
}
export function environment(env, port) {
  const apiPort = env.ADMIN_API_PORT || env.PORT || "8787";
  if (!["8787", "8788"].includes(apiPort))
    throw Error("PORT/ADMIN_API_PORT: используйте 8787 или 8788.");
  if (env.PORT && env.ADMIN_API_PORT && env.PORT !== env.ADMIN_API_PORT)
    throw Error("PORT и ADMIN_API_PORT должны совпадать.");
  const origin = `http://127.0.0.1:${port}`;
  const origins = new Set([
    ...(env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    origin,
  ]);
  return {
    ...env,
    HOST: "127.0.0.1",
    MONOPOLY_LOCAL_DEV: "1",
    PORT: apiPort,
    ADMIN_API_PORT: apiPort,
    ALLOWED_ORIGINS: [...origins].join(","),
  };
}
function prefix(stream, label, ready) {
  let tail = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    const lines = (tail + chunk).split(/\r?\n/);
    tail = lines.pop();
    for (const line of lines) {
      console.log(`[${label}] ${line}`);
      ready?.(line);
    }
  });
  stream.on("end", () => {
    if (tail) console.log(`[${label}] ${tail}`);
  });
}
export async function start(args = process.argv.slice(2)) {
  try {
    loadEnvFile(resolve(root, ".env"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const { port: preferred } = options(args);
  const port = await sitePort(preferred);
  const env = environment(process.env, port);
  try {
    await checkPort(Number(env.PORT));
  } catch (error) {
    if (error.code === "EADDRINUSE")
      throw Error(
        `Порт API ${env.PORT} занят. Возможно, API уже работает. Остановите прежний запуск или используйте ADMIN_API_PORT=${env.PORT === "8787" ? "8788" : "8787"}. Чужие процессы не остановлены.`,
      );
    throw error;
  }
  if (port !== preferred)
    console.log(
      `[dev] Порт ${preferred} занят. Использую ${port}; другие серверы не трогаю.`,
    );
  let site,
    siteExit,
    stopping = false;
  const api = spawn(
    process.execPath,
    [resolve(root, "server/lead-proxy.mjs")],
    { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] },
  );
  let exited = false;
  const apiExit = new Promise((done) => {
    const complete = () => {
      exited = true;
      done();
    };
    api.once("exit", complete);
    api.once("error", complete);
  });
  async function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    if (site && site.exitCode === null && !site.killed) site.kill("SIGTERM");
    if (!exited) api.kill("SIGTERM");
    await Promise.all([apiExit, siteExit]);
    process.exitCode = code;
  }
  for (const signal of ["SIGINT", "SIGTERM"])
    process.once(signal, () => {
      void stop();
    });
  try {
    await new Promise((done, reject) => {
      const timer = setTimeout(
        () => reject(Error("API не запустился за 15 секунд.")),
        15000,
      );
      const finish = (line) => {
        if (!line.includes("[lead-proxy] ready")) return;
        clearTimeout(timer);
        done();
      };
      api.once("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      api.once("exit", (code) => {
        clearTimeout(timer);
        reject(Error(`API остановился при запуске (код ${code}).`));
      });
      prefix(api.stdout, "api", finish);
      prefix(api.stderr, "api");
    });
    api.once("exit", () => {
      if (!stopping) {
        console.error("[dev] API остановился. Останавливаю сайт.");
        void stop(1);
      }
    });
    // Keep Astro in a supervised foreground child. Astro 7 otherwise detaches
    // in agent terminals; its own signal handlers must not own the API process.
    site = spawn(
      process.execPath,
      [
        resolve(root, "node_modules/astro/bin/astro.mjs"),
        "dev",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--ignore-lock",
      ],
      {
        cwd: root,
        env: { ...env, ASTRO_DEV_BACKGROUND: "1" },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    siteExit = new Promise((done) => {
      site.once("exit", done);
      site.once("error", done);
    });
    await new Promise((done, reject) => {
      const timer = setTimeout(
        () => reject(Error("Сайт не запустился за 20 секунд.")),
        20000,
      );
      site.once("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      site.once("exit", (code) => {
        clearTimeout(timer);
        reject(Error(`Сайт остановился при запуске (код ${code}).`));
      });
      prefix(site.stdout, "site", (line) => {
        if (!line.includes("Local")) return;
        const match = line.match(/http:\/\/127\.0\.0\.1:(\d+)/);
        if (!match) return;
        clearTimeout(timer);
        if (Number(match[1]) !== port)
          reject(
            Error("Порт сайта изменился во время запуска. Повторите запуск."),
          );
        else done();
      });
      prefix(site.stderr, "site");
    });
    site.once("exit", (code) => {
      if (!stopping) {
        console.error("[dev] Сайт остановился. Останавливаю API.");
        void stop(code || 1);
      }
    });
    if (stopping) return;
    console.log(`\n[dev] Сайт:    http://127.0.0.1:${port}/`);
    console.log(`[dev] Админка: http://127.0.0.1:${port}/admin/`);
    console.log(`[dev] API:     http://127.0.0.1:${env.PORT}`);
    if (!env.ADMIN_USER || !env.ADMIN_PASSWORD_HASH)
      console.warn(
        "[dev] Для входа задайте ADMIN_USER и ADMIN_PASSWORD_HASH в .env: см. server/admin-set-password.mjs.",
      );
    console.log("[dev] Ctrl+C останавливает сайт и API вместе.\n");
  } catch (error) {
    await stop(1);
    throw error;
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  start().catch((error) => {
    console.error("[dev] " + error.message);
    process.exitCode = 1;
  });
}
