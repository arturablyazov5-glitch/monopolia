#!/usr/bin/env node
import {frameHeaders} from '../src/lib/frame-policy.mjs';
// TASK-071: production files only; admin is available through the same HTTPS tunnel.
import { createServer, request } from 'node:http';
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { homedir } from 'node:os';
import { mkdir, mkdtemp, readFile, realpath, rm, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { pipeline } from 'node:stream/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const flags = {};
for (const arg of args) {
  if (arg === '--keep') continue;
  const match = arg.match(/^--(tunnel|subdomain|key)=(.*)$/);
  if (!match || flags[match[1]] !== undefined) throw Error('Запуск: npm run share -- [--keep] [--tunnel=serveo|localhost.run|auto] [--subdomain=monopolia] [--key=~/.ssh/serveo_ed25519]');
  flags[match[1]] = match[2];
}
let shareSettings = {};
try { shareSettings = parseEnv(await readFile(resolve(root, '.share.env'), 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw Error('Не удалось прочитать .share.env'); }
const tunnelMode = flags.tunnel ?? process.env.SHARE_TUNNEL ?? shareSettings.SHARE_TUNNEL ?? 'auto';
const subdomain = flags.subdomain ?? process.env.SHARE_SUBDOMAIN ?? (tunnelMode === 'serveo' ? shareSettings.SHARE_SUBDOMAIN : undefined) ?? '';
const keySetting = flags.key ?? process.env.SHARE_SSH_KEY ?? (tunnelMode === 'serveo' ? shareSettings.SHARE_SSH_KEY : undefined) ?? '';
if (!['auto', 'localhost.run', 'serveo'].includes(tunnelMode)) throw Error('SHARE_TUNNEL: auto, localhost.run или serveo');
if (subdomain && !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(subdomain)) throw Error('SHARE_SUBDOMAIN: 1–63 строчных латинских букв, цифр или дефисов; края — буква/цифра');
if ((subdomain || keySetting) && tunnelMode !== 'serveo') throw Error('Для поддомена/ключа укажите SHARE_TUNNEL=serveo');
// Expand ~ ourselves: spawn does not invoke a shell. Never read the key.
const sshKey = keySetting.startsWith('~/') ? resolve(homedir(), keySetting.slice(2)) : keySetting;
if (sshKey.startsWith('~')) throw Error('SHARE_SSH_KEY: используйте ~/ или полный путь');
const expectedAddress = subdomain ? `https://${subdomain}.serveousercontent.com` : null;
const keep = args.includes('--keep');
const port = Number(process.env.SHARE_PORT || 8790);
if (!Number.isInteger(port) || port < 1024 || port > 65535 || [4321, 8787, 8788].includes(port)) {
  throw Error('SHARE_PORT: используйте свободный порт 1024–65535, кроме 4321/8787/8788');
}
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm',
};
let work, dist, tunnel, builder, stopping = false;
const children = new Set();
const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
const origins = new Set([...hosts].map(host => `http://${host}`));
if (expectedAddress) {
  hosts.add(new URL(expectedAddress).host);
  origins.add(expectedAddress);
}
const shutdown = new AbortController();
let healthTimer, healthAbort;
function delay(ms) {
  return new Promise(done => {
    if (stopping) return done();
    const finish = () => { clearTimeout(timer); shutdown.signal.removeEventListener('abort', finish); done(); };
    const timer = setTimeout(finish, ms);
    shutdown.signal.addEventListener('abort', finish, { once: true });
  });
}
// Read only server Host configuration, never print or pass .env to SSH.
let settings = {};
try { if (!process.env.ADMIN_API_ORIGIN) settings = parseEnv(await readFile(resolve(root, '.env'), 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw Error('Не удалось прочитать локальные настройки API'); }
const apiOrigin = process.env.ADMIN_API_ORIGIN || settings.ADMIN_API_ORIGIN || 'http://127.0.0.1:8787';
const apiHost = new URL(apiOrigin).host;
const apiPort = Number(process.env.SHARE_API_PORT || 8787);
if (!Number.isInteger(apiPort) || apiPort < 1024 || apiPort > 65535) throw Error('SHARE_API_PORT: используйте порт 1024–65535');
settings = undefined;

function json(res, status, error) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ ok: false, error }));
}
function tracked(command, args, options) {
  const child = spawn(command, args, options);
  children.add(child);
  child.once('close', () => children.delete(child));
  return child;
}
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  shutdown.abort();
  clearTimeout(healthTimer);
  healthAbort?.abort();
  process.exitCode = code;
  const exits = [...children].map(child => new Promise(done => {
    child.once('close', done);
    child.kill('SIGTERM');
    const timer = setTimeout(() => child.kill('SIGKILL'), 1500);
    timer.unref();
  }));
  server.close();
  server.closeAllConnections();
  await Promise.all(exits);
  if (work && !keep) await rm(work, { recursive: true, force: true });
  if (work && keep) console.log(`[share] Сборка сохранена: ${dist}`);
  console.log('[share] Свои сервер и туннель остановлены.');
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => void stop());

function proxy(req, res, pathname, admin = false) {
  // Keep the browser Origin intact; API verifies it against our forwarded origin.
  const publicHost = req.headers['x-forwarded-host'] ?? req.headers.host;
  if (typeof publicHost !== 'string' || !/^[a-z0-9.-]+(?::\d+)?$/.test(publicHost) ||
      !hosts.has(publicHost)) return json(res, 403, 'host_not_allowed');
  const proto = req.headers['x-forwarded-proto'] ??
    (origins.has(`https://${publicHost}`) ? 'https' : 'http');
  if (!['http', 'https'].includes(proto)) return json(res, 403, 'proto_not_allowed');
  if (pathname === '/lead' && (!origins.has(req.headers.origin) ||
      req.headers['sec-fetch-site'] === 'cross-site')) return json(res, 403, 'origin_not_allowed');
  if (admin && ((!['GET', 'HEAD'].includes(req.method) && !origins.has(req.headers.origin)) ||
      (req.headers.origin && !origins.has(req.headers.origin)) || req.headers['sec-fetch-site'] === 'cross-site')) {
    return json(res, 403, 'origin_not_allowed');
  }
  const headers = { host: apiHost, 'x-forwarded-host': publicHost, 'x-forwarded-proto': proto };
  if (req.headers.origin) headers.origin = req.headers.origin;
  for (const key of ['content-type', 'content-length', 'if-none-match', 'accept', 'cookie', 'x-admin-csrf', 'x-admin-request']) {
    if (req.headers[key]) headers[key] = req.headers[key];
  }
  if (admin) {
    // The tunnel supplies this header. The API accepts it only from loopback.
    if (typeof req.headers['x-forwarded-for'] === 'string') headers['x-forwarded-for'] = req.headers['x-forwarded-for'];
  }
  const upstream = request({ hostname: '127.0.0.1', port: apiPort, method: req.method, path: pathname, headers }, response => {
    const outgoing = {};
    for (const key of ['content-type', 'content-length', 'cache-control', 'etag', 'retry-after', 'set-cookie']) {
      if (response.headers[key]) outgoing[key] = response.headers[key];
    }
    res.writeHead(response.statusCode || 502, outgoing);
    response.pipe(res);
    response.on('error', () => res.destroy());
  });
  upstream.setTimeout(24000, () => upstream.destroy());
  upstream.on('error', () => {
    if (!res.headersSent) json(res, 503, 'API не запущен: заявки не отправятся. Попробуйте позже или позвоните нам.');
    else res.destroy();
  });
  req.on('aborted', () => upstream.destroy());
  res.on('close', () => { if (!res.writableFinished) upstream.destroy(); });
  req.pipe(upstream);
}
function encodingQuality(header, name) {
  const tokens = String(header || '').split(',').map(token => token.trim().split(';'));
  const token = tokens.find(([encoding]) => encoding === name) || tokens.find(([encoding]) => encoding === '*');
  if (!token) return 0;
  const q = token.slice(1).find(value => value.trim().startsWith('q='));
  const quality = q ? Number(q.trim().slice(2)) : 1;
  return Number.isFinite(quality) && quality >= 0 && quality <= 1 ? quality : 0;
}
async function safeFile(path) {
  const actual = await realpath(path);
  if (!actual.startsWith(dist + sep)) throw Error('outside build');
  const info = await stat(actual);
  if (!info.isFile()) throw Error('not a file');
  return { path: actual, size: info.size };
}
const server = createServer(async (req, res) => {
  for (const [name, value] of Object.entries(frameHeaders)) res.setHeader(name, value);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Referrer-Policy', 'same-origin');
  if (!hosts.has(req.headers.host)) return json(res, 404, 'not_found');
  try {
    const raw = (req.url || '/').split('?')[0];
    const pathname = decodeURIComponent(raw);
    // Validate before URL normalization: encoded traversal and backslashes too.
    if (!pathname.startsWith('/') || pathname.startsWith('//') || pathname.includes('\\') ||
        /[\x00-\x1f\x7f]/.test(pathname) || pathname.split('/').some(part => part.startsWith('.')) ||
        /\.(?:map|gz|br)$/i.test(pathname)) return json(res, 404, 'not_found');
    if (/^\/api\/admin\//.test(pathname) ||
        (req.method === 'POST' && pathname === '/lead') ||
        (req.method === 'GET' && (pathname === '/api/catalog' || pathname === '/api/content' || /^\/media\/[a-f0-9]{48}\.webp$/.test(pathname)))) {
      return proxy(req, res, pathname, /^\/api\/admin\//.test(pathname));
    }
    if (/^\/(?:api|media|lead)(?:\/|$)/i.test(pathname)) return json(res, 404, 'not_found');
    if (!['GET', 'HEAD'].includes(req.method)) return json(res, 404, 'not_found');
    let path = resolve(dist, '.' + pathname);
    if (!path.startsWith(dist + sep) && path !== dist) return json(res, 404, 'not_found');
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const original = await safeFile(path);
    const isVideo = /\.(?:mp4|webm)$/i.test(path);
    let file = original, encoding;
    const encodings = (isVideo ? [] : ['br', 'gzip']).map(name => ({ name, q: encodingQuality(req.headers['accept-encoding'], name) }))
      .filter(item => item.q > 0).sort((a, b) => b.q - a.q);
    for (const item of encodings) {
      try { file = await safeFile(path + (item.name === 'br' ? '.br' : '.gz')); encoding = item.name; break; }
      catch { /* No precompressed sidecar: serve ordinary bytes. */ }
    }
    res.setHeader('Content-Type', mime[extname(path).toLowerCase()] || 'application/octet-stream');
    let start = 0, end = file.size - 1;
    if (isVideo) {
      res.setHeader('Accept-Ranges', 'bytes');
      const range = req.headers.range;
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match || (!match[1] && !match[2])) {
          res.setHeader('Content-Range', `bytes */${file.size}`);
          res.writeHead(416);
          return res.end();
        }
        if (!match[1]) {
          const suffix = Number(match[2]);
          start = Math.max(0, file.size - suffix);
        } else {
          start = Number(match[1]);
          if (match[2]) end = Math.min(end, Number(match[2]));
        }
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= file.size) {
          res.setHeader('Content-Range', `bytes */${file.size}`);
          res.writeHead(416);
          return res.end();
        }
        res.statusCode = 206;
        res.setHeader('Content-Range', `bytes ${start}-${end}/${file.size}`);
      }
    }
    res.setHeader('Content-Length', end - start + 1);
    if (pathname === '/files/company-presentation.pdf') res.setHeader('Content-Disposition', 'attachment; filename="company-presentation.pdf"');
    res.setHeader('Vary', 'Accept-Encoding');
    if (encoding) res.setHeader('Content-Encoding', encoding);
    res.setHeader('Cache-Control', /^\/(?:assets|_astro)\//.test(pathname)
      ? 'public, max-age=31536000, immutable' : 'no-cache');
    if (req.method === 'HEAD') return res.end();
    await pipeline(createReadStream(file.path, { start, end }), res);
  } catch {
    if (!res.headersSent) json(res, 404, 'not_found');
    else res.destroy();
  }
});
server.requestTimeout = 30000;
server.headersTimeout = 10000;

function openTunnel(service) {
  return new Promise((done, reject) => {
    if (stopping) return reject(Error('Остановлено'));
    let ready = false, tail = '';
    const sshArgs = ['-T', '-o', 'ControlMaster=no', '-o', 'ControlPath=none',
      '-o', 'StrictHostKeyChecking=accept-new', '-o', 'ConnectTimeout=10',
      '-o', 'ExitOnForwardFailure=yes', '-o', 'ServerAliveInterval=20',
      '-o', 'ServerAliveCountMax=3', '-o', 'IdentitiesOnly=yes'];
    // Serveo uses a zero-prompt keyboard-interactive handshake; BatchMode blocks it.
    if (service !== 'serveo.net') sshArgs.push('-o', 'BatchMode=yes');
    if (service === 'serveo.net' && sshKey) sshArgs.push('-i', sshKey);
    sshArgs.push('-R', `${service === 'serveo.net' && subdomain ? subdomain + ':' : ''}80:127.0.0.1:${port}`, service);
    const child = tracked('ssh', sshArgs, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    tunnel = child;
    const timer = setTimeout(() => fail('HTTPS-адрес не получен за 20 с'), 20000);
    function fail(message) {
      if (ready) return;
      ready = true;
      clearTimeout(timer);
      child.kill('SIGTERM');
      // Wait for the previous SSH to release its forwarding before retrying.
      const killTimer = setTimeout(() => child.kill('SIGKILL'), 1500);
      killTimer.unref();
      if (child.exitCode !== null || child.signalCode !== null) reject(Error(`${service}: ${message}`));
      else child.once('close', () => { clearTimeout(killTimer); reject(Error(`${service}: ${message}`)); });
    }
    function output(chunk) {
      const clean = chunk.toString().replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
      tail = (tail + clean).slice(-16000);
      const address = service === 'serveo.net'
        ? tail.match(/Forwarding HTTP traffic from (https:\/\/[a-z0-9.-]+\.(?:serveousercontent\.com|serveo\.net))(?=[\s/]|$)/i)?.[1]
        : (tail.match(/https:\/\/[a-zA-Z0-9.-]+/g) || []).find(url => /\.lhr\.life$/.test(new URL(url).hostname));
      if (address && !ready) {
        const url = new URL(address);
        if (expectedAddress && url.origin !== expectedAddress) return fail('Serveo не подтвердил запрошенный поддомен; выберите свободный SHARE_SUBDOMAIN');
        ready = true;
        clearTimeout(timer);
        hosts.add(url.host); origins.add(url.origin);
        done({ child, address: url.origin });
      }
      for (const line of clean.split(/\r?\n/)) {
        if (/Permission denied|Connection (?:refused|closed|timed out)|Could not resolve|Host key verification failed|remote port forwarding failed|No route to host|Network is unreachable|kex_exchange_identification|ssh:/.test(line)) {
          console.error(`[share ssh] ${line.trim()}`);
        }
      }
    }
    child.stdout.on('data', output); child.stderr.on('data', output);
    child.once('error', error => fail(error.message));
    child.once('close', (code, signal) => {
      if (!ready) fail(`SSH завершился: ${signal || `код ${code}`}`);
    });
  });
}
function printAddress(address) {
  console.log(`\n========================================\n ПУБЛИЧНАЯ ССЫЛКА: ${address}\n АДМИНКА: ${address}/admin/\n ВНИМАНИЕ: админка доступна всем, у кого есть ссылка; защита — логин/пароль и лимит попыток.\n========================================\nCtrl+C — остановить сервер и туннель.\n`);
}
function monitorHealth(child, address) {
  async function check() {
    if (stopping || tunnel !== child || child.exitCode !== null || child.signalCode !== null) return;
    healthAbort = new AbortController();
    const timeout = setTimeout(() => healthAbort.abort(), 12000);
    try {
      // Every HTTP status (including Serveo's interstitial) proves connectivity.
      const response = await fetch(address + '/', { signal: healthAbort.signal, redirect: 'manual' });
      let body = '';
      const reader = response.body?.getReader();
      if (reader) {
        try {
          while (body.length < 8192) {
            const { value, done } = await reader.read();
            if (done) break;
            body += Buffer.from(value).toString();
          }
        } finally { await reader.cancel(); }
      }
      if (/\bno tunnel\b|tunnel (?:not found|is (?:closed|unavailable))/i.test(body)) throw Error('no tunnel');
    } catch {
      if (!stopping && tunnel === child) {
        console.warn('[share] Публичный адрес недоступен; переподключаю туннель.');
        child.kill('SIGTERM');
        const killTimer = setTimeout(() => { if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL'); }, 1500);
        killTimer.unref();
      }
    } finally {
      clearTimeout(timeout);
      healthAbort = undefined;
    }
    if (!stopping && child.exitCode === null && child.signalCode === null) healthTimer = setTimeout(check, 30000);
  }
  healthTimer = setTimeout(check, 30000);
}
async function superviseTunnel() {
  let service = tunnelMode === 'serveo' ? 'serveo.net' : 'nokey@localhost.run';
  let backoff = 5000, connected = false, fallback = tunnelMode === 'auto';
  while (!stopping) {
    let result, started;
    try {
      result = await openTunnel(service);
      if (stopping) break;
      started = Date.now();
      if (connected) console.log('[share] туннель переподключён');
      connected = true;
      printAddress(result.address);
      monitorHealth(result.child, result.address);
      if (result.child.exitCode === null && result.child.signalCode === null) {
        await new Promise(done => result.child.once('close', done));
      }
    } catch (error) {
      if (!stopping) console.warn(`[share] ${error.message}`);
      if (fallback) {
        fallback = false;
        service = 'serveo.net';
        console.warn('[share] Пробую запасной serveo.net…');
        continue;
      }
    } finally {
      clearTimeout(healthTimer);
      healthAbort?.abort();
      if (result && result.address !== expectedAddress) {
        hosts.delete(new URL(result.address).host); origins.delete(result.address);
      }
    }
    if (stopping) break;
    if (started && Date.now() - started >= 60000) backoff = 5000;
    console.warn(`[share] Туннель оборвался; повтор через ${backoff / 1000} с. Сервер раздачи продолжает работать.`);
    await delay(backoff);
    backoff = Math.min(backoff * 2, 60000);
  }
}

try {
  // Reserve our port first; never kill another process or build over dist.
  await new Promise((done, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', done);
  });
  if (stopping) throw Error('Остановлено');
  await mkdir(resolve(root, '.share'), { recursive: true });
  if (stopping) throw Error('Остановлено');
  work = await mkdtemp(resolve(root, '.share/session-'));
  dist = resolve(work, 'dist');
  if (stopping) {
    if (!keep) await rm(work, { recursive: true, force: true });
    throw Error('Остановлено');
  }
  console.log('[share] Собираю отдельный production-сайт…');
  builder = tracked(process.execPath, [resolve(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', dist], {
    cwd: root, stdio: 'inherit', env: { ...process.env, SITE_BASE: '/',
      PUBLIC_LEAD_ENDPOINT: '/lead', PUBLIC_CATALOG_ENDPOINT: '/api/catalog', PUBLIC_MEDIA_BASE: '' },
  });
  await new Promise((done, reject) => {
    builder.once('error', reject);
    builder.once('close', code => code === 0 ? done() : reject(Error('Production-сборка не завершена')));
  });
  if (stopping) throw Error('Остановлено');
  try {
    const response = await fetch(`http://127.0.0.1:${apiPort}/health`, { signal: AbortSignal.timeout(2000) });
    if (!response.ok) throw Error();
  } catch {
    console.warn('[share] API не запущен: заявки не отправятся');
    console.warn('[share] Запустите npm run dev:all (если сайт уже работает — node --env-file=.env server/lead-proxy.mjs).');
  }
  if (stopping) throw Error('Остановлено');
  console.log(`[share] Production-сервер: http://127.0.0.1:${port}`);
  if (tunnelMode === 'serveo') {
    console.warn('[share] serveo бесплатный: на первом заходе может показываться страница-предупреждение serveo; адрес стабилен, пока этот ключ держит поддомен; Mac не должен спать');
    if (!subdomain) console.warn('[share] Поддомен не задан: адрес Serveo случайный и может измениться после переподключения.');
  } else console.log('[share] Без закреплённого поддомена адрес может меняться при переподключении.');
  console.log('[share] Туннель — сторонний сервис. Ссылка не приватная: любой, у кого она есть, видит сайт и может открыть админку.');
  const awake = tracked('caffeinate', ['-i', '-w', String(process.pid)], { stdio: 'ignore' });
  awake.once('error', () => console.warn('[share] caffeinate недоступен: отключите сон Mac на время показа.'));
  awake.once('close', code => { if (!stopping && code) console.warn('[share] caffeinate завершился: отключите сон Mac вручную.'); });
  await superviseTunnel();
} catch (error) {
  if (!stopping) {
    console.error(`[share] ${error.code === 'EADDRINUSE' ? `Порт ${port} занят. Чужой процесс не трогаю; задайте SHARE_PORT.` : error.message}`);
    console.error('[share] Если SSH недоступен: SSH на свой VPS (nginx: server/README.md) или ngrok после регистрации по решению заказчика.');
    await stop(1);
  }
}
