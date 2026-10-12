import { createServer } from "node:net";
import { spawn } from "node:child_process";

const apiPort = process.env.PORT || process.env.ADMIN_API_PORT || "8787";
if (!['8787', '8788'].includes(apiPort)) {
  console.error("[dev:all] PORT/ADMIN_API_PORT: use 8787 or 8788");
  process.exit(1);
}
if (process.env.ADMIN_API_PORT && process.env.ADMIN_API_PORT !== apiPort) {
  console.error("[dev:all] PORT and ADMIN_API_PORT must be the same");
  process.exit(1);
}

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        reject(Error(`Порт ${port} уже занят. Чужой процесс не трогаю.`));
      } else reject(error);
    });
    probe.listen(Number(port), "127.0.0.1", () => probe.close(resolve));
  });
}

function prefix(stream, label) {
  let tail = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    const lines = (tail + chunk).split(/\r?\n/);
    tail = lines.pop();
    for (const line of lines) console.log(`[${label}] ${line}`);
  });
  stream.on("end", () => { if (tail) console.log(`[${label}] ${tail}`); });
}

await Promise.all([checkPort(4321), checkPort(apiPort)]).catch((error) => {
  console.error(`[dev:all] ${error.message}`);
  process.exit(1);
});

const environment = { ...process.env, PORT: apiPort, ADMIN_API_PORT: apiPort };
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [
  { label: "site", child: spawn(npm, ["run", "dev"], { env: environment, stdio: ["ignore", "pipe", "pipe"] }) },
  { label: "api", child: spawn(process.execPath, ["--env-file=.env", "server/lead-proxy.mjs"], { env: environment, stdio: ["ignore", "pipe", "pipe"] }) },
];
let stopping = false;
let remaining = children.length;
function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const { child } of children) if (!child.killed) child.kill("SIGTERM");
  if (remaining === 0) process.exit(code);
  process.exitCode = code;
}
for (const { label, child } of children) {
  prefix(child.stdout, label);
  prefix(child.stderr, label);
  child.on("error", (error) => {
    console.error(`[dev:all] ${label}: ${error.message}`);
    stop(1);
  });
  child.on("exit", (code, signal) => {
    remaining -= 1;
    if (!stopping) {
      console.error(`[dev:all] ${label} остановился (${signal || `код ${code}`}); останавливаю второй процесс.`);
      stop(code || 1);
    }
    if (remaining === 0) process.exit();
  });
}
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => stop(0));
