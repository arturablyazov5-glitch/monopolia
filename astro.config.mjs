import { defineConfig } from "astro/config";
import { request } from "node:http";
import { connect } from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const adminPort = process.env.ADMIN_API_PORT || "8787";
if (!["8787", "8788"].includes(adminPort))
  throw new Error("ADMIN_API_PORT: use 8787 or 8788");
const projectRoot = fileURLToPath(new URL(".", import.meta.url));
// Dev-only: any `astro dev` (npm run dev:site, IDE preview) gets the API
// automatically. npm run dev already starts it first, so this is a no-op then.
function ensureApi(server) {
  const probe = connect({ host: "127.0.0.1", port: Number(adminPort) });
  probe.once("connect", () => {
    probe.destroy();
    return;
  });
  probe.once("error", () => {
    try {
      process.loadEnvFile(resolve(projectRoot, ".env"));
    } catch {}
    const child = spawn(
      process.execPath,
      [resolve(projectRoot, "server/lead-proxy.mjs")],
      {
        cwd: projectRoot,
        env: {
          ...process.env,
          HOST: "127.0.0.1",
          PORT: adminPort,
          MONOPOLY_LOCAL_DEV: "1",
        },
        stdio: ["ignore", "inherit", "inherit"],
      },
    );
    child.on("error", (error) =>
      console.error("[dev] API не запустился:", error.message),
    );
    const stop = () => {
      if (child.exitCode === null && !child.killed) child.kill("SIGTERM");
    };
    server.httpServer?.once("close", stop);
    process.once("exit", stop);
  });
}
export default defineConfig({
  output: "static",
  vite: {
    // Astro 7's route guard runs before Vite's ordinary proxy middleware.
    // Put this dev-only loopback proxy before that guard. It never enters dist.
    plugins: [
      {
        name: "monopoly-admin-dev-proxy",
        apply: "serve",
        configureServer(server) {
          ensureApi(server);
          return () =>
            server.middlewares.stack.unshift({
              route: "",
              handle(req, res, next) {
                if (req.url?.startsWith("/admin/"))
                  res.setHeader("X-Robots-Tag", "noindex,nofollow");
                const pathname = new URL(req.url || "/", "http://localhost")
                  .pathname;
                if (pathname === "/files/company-presentation.pdf")
                  res.setHeader(
                    "Content-Disposition",
                    'attachment; filename="company-presentation.pdf"',
                  );
                const isApi = pathname.startsWith("/api/");
                const isMedia = pathname.startsWith("/media/");
                if (!isApi && !isMedia && pathname !== "/lead") return next();
                const upstream = request(
                  {
                    hostname: "127.0.0.1",
                    port: Number(adminPort),
                    path: req.url,
                    method: req.method,
                    headers: req.headers,
                  },
                  (response) => {
                    res.writeHead(response.statusCode || 502, response.headers);
                    response.pipe(res);
                  },
                );
                upstream.setTimeout(120000, () => upstream.destroy());
                upstream.on("error", () => {
                  if (!res.headersSent)
                    res.writeHead(503, {
                      "Content-Type": "application/json",
                      "Cache-Control": "no-store",
                    });
                  res.end(
                    JSON.stringify({
                      error: { code: "offline", message: "Запустите сервер" },
                    }),
                  );
                });
                req.pipe(upstream);
              },
            });
        },
      },
    ],
  },
  // Последовательные mobile-замеры: always не дал общего выигрыша LCP.
  build: { inlineStylesheets: "auto" },
  site: process.env.SITE_URL,
  base: process.env.SITE_BASE || "/",
  devToolbar: { enabled: false },
});
