import { defineConfig } from 'astro/config';
import { request } from 'node:http';
const adminPort = process.env.ADMIN_API_PORT || '8787';
if (!['8787', '8788'].includes(adminPort)) throw new Error('ADMIN_API_PORT: use 8787 or 8788');
export default defineConfig({
  output: 'static',
  vite: {
    // Astro 7's route guard runs before Vite's ordinary proxy middleware.
    // Put this dev-only loopback proxy before that guard. It never enters dist.
    plugins: [{
      name: 'monopoly-admin-dev-proxy', apply: 'serve',
      configureServer(server) {
        return () => server.middlewares.stack.unshift({ route: '', handle(req, res, next) {
          if (req.url?.startsWith('/admin/')) res.setHeader('X-Robots-Tag', 'noindex,nofollow');
          const pathname = new URL(req.url || '/', 'http://localhost').pathname;
          const isApi = pathname.startsWith('/api/');
          const isMedia = pathname.startsWith('/media/');
          if (!isApi && !isMedia && pathname !== '/lead') return next();
          const upstream = request({ hostname: '127.0.0.1', port: Number(adminPort), path: req.url, method: req.method, headers: req.headers }, response => {
            res.writeHead(response.statusCode || 502, response.headers); response.pipe(res);
          });
          upstream.setTimeout(120000, () => upstream.destroy());
          upstream.on('error', () => {
            if (!res.headersSent) res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
            res.end(JSON.stringify({ error: { code: 'offline', message: 'Запустите сервер' } }));
          });
          req.pipe(upstream);
        } });
      },
    }],
  },
  // Последовательные mobile-замеры: always не дал общего выигрыша LCP.
  build: { inlineStylesheets: 'auto' },
  site: process.env.SITE_URL,
  base: process.env.SITE_BASE || '/',
  devToolbar: { enabled: false },
});
