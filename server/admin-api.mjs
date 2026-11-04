import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {isIP} from 'node:net';
import {forwardedOrigin,trustedProxy,localDevOrigin} from './proxy-origin.mjs';
import {Storage,AdminError} from './admin-storage.mjs';
import {ContentStorage} from './admin-content.mjs';
import {publicCatalog} from '../src/lib/catalog-schema.mjs';
import {equal,secret,verifyPassword} from './admin-auth.mjs';
const project=fileURLToPath(new URL('../',import.meta.url));
const fail=(status,code,message)=>{throw new AdminError(status,code,message);};
export async function createAdminAPI({root=project,env=process.env,now=Date.now}={}) {
  const storage=new Storage(env.DATA_DIR || resolve(root,'.local-admin'));await storage.init();
  const content=new ContentStorage(storage.root);
  const origins=new Set((env.ALLOWED_ORIGINS || env.PUBLIC_SITE_ORIGIN || 'http://127.0.0.1:4321').split(',').map(s=>s.trim()).filter(Boolean));
  const apiOrigin=env.ADMIN_API_ORIGIN || 'http://127.0.0.1:'+String(env.PORT || 8787);
  for(const origin of [...origins,apiOrigin]) {const u=new URL(origin);if(u.origin!==origin || (u.protocol!=='https:' && !(u.protocol==='http:' && u.hostname==='127.0.0.1')))throw Error('Use exact HTTPS origins or 127.0.0.1');}
  const hosts=new Set([new URL(apiOrigin).host,...[...origins].map(o=>new URL(o).host)]);
  const sessions=new Map(),attempts=new Map();
  async function body(req,binary=false) {
    const limit=binary?1572864:256*1024;
    if(req.headers['content-type']!==(binary?'application/octet-stream':'application/json'))fail(422,'content-type','Недопустимый формат запроса');
    if(Number(req.headers['content-length'])>limit)fail(413,'size','Превышен размер запроса');
    let size=0;const chunks=[];
    for await(const chunk of req){size+=chunk.length;if(size>limit)fail(413,'size','Превышен размер запроса');chunks.push(chunk);}
    const bytes=Buffer.concat(chunks);if(binary)return bytes;
    try{return JSON.parse(bytes.toString('utf8'));}catch{fail(422,'json','Некорректный JSON');}
  }
  const send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
  const handler=async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex,nofollow');res.setHeader('X-Content-Type-Options','nosniff');
    try {
      const devOrigin=localDevOrigin(req.headers,env,req.socket.remoteAddress);
      if(!hosts.has(req.headers.host) && !devOrigin)fail(403,'host','Недопустимый Host');
      const origin=req.headers.origin,raw=req.url || '';
      const proxyOrigin=forwardedOrigin(req.headers,env,req.socket.remoteAddress);
      const allowedOrigin=typeof origin==='string' && (origins.has(origin) || origin===proxyOrigin || origin===devOrigin);
      if(origin && !allowedOrigin)fail(403,'origin','Недопустимый Origin');
      if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
      const isPublic=raw==='/api/catalog' || raw==='/api/content' || /^\/media\/[a-f0-9]{48}\.webp$/.test(raw);
      if(!isPublic && origin)res.setHeader('Access-Control-Allow-Credentials','true');
      if(req.method==='OPTIONS') {
        if(!allowedOrigin)fail(403,'origin','Недопустимый Origin');
        res.setHeader('Access-Control-Allow-Methods',isPublic?'GET, OPTIONS':'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Admin-CSRF, X-Admin-Request');res.writeHead(204);return res.end();
      }
      if(req.method==='GET' && raw==='/api/content') {
        const {data,tag}=await content.public();
        res.setHeader('Cache-Control','public, max-age=0, must-revalidate');res.setHeader('ETag',tag);
        if(req.headers['if-none-match']===tag){res.writeHead(304);return res.end();}
        return send(res,200,{ok:true,...data});
      }
      if(req.method==='GET' && raw==='/api/catalog') {
        const catalog=publicCatalog(await storage.catalog()),tag='"catalog-'+catalog.revision+'"';
        res.setHeader('Cache-Control','public, max-age=60');res.setHeader('ETag',tag);
        if(req.headers['if-none-match']===tag){res.writeHead(304);return res.end();}
        return send(res,200,{ok:true,...catalog});
      }
      if(req.method==='GET' && /^\/media\/[a-f0-9]{48}\.webp$/.test(raw)) {
        const bytes=await storage.readMedia(raw);res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'public, max-age=31536000, immutable'});return res.end(bytes);
      }
      if(!raw.startsWith('/api/admin/'))fail(404,'route','Маршрут отсутствует');
      if(req.method!=='GET' && !allowedOrigin)fail(403,'origin','Недопустимый Origin');
      const cookie=(id,age)=>'monopoly_admin_session='+id+'; HttpOnly; SameSite=Strict; Path=/api/admin/; Max-Age='+age+((String(req.headers.host).split(':')[0]==='127.0.0.1' && !(trustedProxy(env,req.socket.remoteAddress) && req.headers['x-forwarded-proto']==='https'))?'':'; Secure');
      const peer=req.socket.remoteAddress;
      const trusted=trustedProxy(env,peer);
      const forwarded=typeof req.headers['x-forwarded-for']==='string'?req.headers['x-forwarded-for'].split(',')[0].trim():'';
      const ip=trusted && isIP(forwarded)?forwarded:peer;
      if(req.method==='POST' && raw==='/api/admin/session') {
        const key='login:'+ip,times=(attempts.get(key)||[]).filter(t=>now()-t<60000);
        if(times.length>=5){res.setHeader('Retry-After','60');fail(429,'login-limit','Слишком много попыток. Подождите минуту.');}
        times.push(now());attempts.set(key,times);
        const b=await body(req);
        if(!b || Object.keys(b).some(k=>!['username','password'].includes(k)) || typeof b.username!=='string' || typeof b.password!=='string' || b.username.length>80 || b.password.length>256)fail(401,'login','Неверный логин или пароль');
        const valid=await verifyPassword(b.password,env.ADMIN_PASSWORD_HASH);
        if(!valid || !env.ADMIN_USER || !equal(b.username,env.ADMIN_USER))fail(401,'login','Неверный логин или пароль');
        for(const [id,s] of sessions)if(now()>s.expires)sessions.delete(id);
        if(sessions.size>=100)sessions.delete(sessions.keys().next().value);
        const id=secret(),s={csrf:secret(),expires:now()+28800000};sessions.set(id,s);
        res.setHeader('Set-Cookie',cookie(id,28800));return send(res,200,{csrfToken:s.csrf});
      }
      const cookies=String(req.headers.cookie || '').split(';').map(s=>s.trim()).filter(s=>s.startsWith('monopoly_admin_session='));
      const id=cookies.length===1?cookies[0].slice('monopoly_admin_session='.length):'',s=sessions.get(id);
      if(!s || now()>s.expires){sessions.delete(id);fail(401,'session','Войдите в редактор');}
      if(req.method==='GET' && raw==='/api/admin/session') {
        if(req.headers['x-admin-request']!=='1')fail(403,'csrf','Недопустимый запрос');
        return send(res,200,{csrfToken:s.csrf});
      }
      if(!equal(req.headers['x-admin-csrf'],s.csrf))fail(403,'csrf','Недопустимый CSRF');
      if(req.method==='DELETE' && raw==='/api/admin/session'){sessions.delete(id);res.setHeader('Set-Cookie',cookie('',0));return send(res,200,{loggedOut:true});}
      if(req.method==='GET' && raw==='/api/admin/content')return send(res,200,await content.admin());
      if(req.method==='PUT' && raw==='/api/admin/content')return send(res,200,await content.save(await body(req)));
      if(req.method==='GET' && raw==='/api/admin/catalog')return send(res,200,await storage.catalog());
      if(req.method==='PUT' && raw==='/api/admin/catalog')return send(res,200,await storage.save(await body(req)));
      if(req.method==='POST' && raw==='/api/admin/media')return send(res,200,await storage.upload(await body(req,true)));
      fail(404,'route','Маршрут отсутствует');
    } catch(e){send(res,e instanceof AdminError?e.status:e.code==='ENOENT'?404:500,{error:{code:e instanceof AdminError?e.code:'operation',message:e instanceof AdminError?e.message:'Операция не выполнена',...(e.fields?{fields:e.fields}:{})}});}
  };
  return {handler,storage,content,close:async()=>{sessions.clear();await Promise.all([storage.close(),content.close()]);}};
}
