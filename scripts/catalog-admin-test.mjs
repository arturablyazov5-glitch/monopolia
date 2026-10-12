// One integration/browser suite. All writes and credentials are sandbox fixtures.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {createServer,request as httpRequest} from 'node:http';
import {resolve} from 'node:path';
import {createAdminAPI} from '../server/admin-api.mjs';
import {passwordHash} from '../server/admin-auth.mjs';
import {inspectWebP} from '../server/admin-media.mjs';
import {validateCatalog,publicCatalog} from '../src/lib/catalog-schema.mjs';
import {launchBrowser,wait} from './check-baseline.mjs';
const qa='/private/tmp/claude-501/admin-qa';
const username='fixture-editor',password='fixture-only-passphrase';
const listen=(s,port=0)=>new Promise((done,reject)=>{s.once('error',reject);s.listen(port,'127.0.0.1',done);});
const close=s=>new Promise(done=>{s.close(done);s.closeAllConnections();});
const sandbox=()=>fs.mkdtemp('/private/tmp/claude-501/admin-test-');
async function setup(now=Date.now) {
  const root=await sandbox();
  const env={DATA_DIR:root,PORT:'8788',ADMIN_API_ORIGIN:'http://127.0.0.1:8788',ALLOWED_ORIGINS:'http://127.0.0.1:4321',ADMIN_USER:username,ADMIN_PASSWORD_HASH:await passwordHash(password),ADMIN_RECOVERY_BOT:'1'};
  const api=await createAdminAPI({env,now}),server=createServer(api.handler);await listen(server,8788);
  let cookie='',csrf='';
  const request=async(path,method='GET',data,headers={})=>{
    const response=await fetch('http://127.0.0.1:8788'+path,{method,headers:{Origin:'http://127.0.0.1:4321','Content-Type':'application/json',Cookie:cookie,'X-Admin-CSRF':csrf,'X-Admin-Request':'1',...headers},...(data===undefined?{}:{body:Buffer.isBuffer(data)?data:JSON.stringify(data)})});
    return response;
  };
  const login=async()=>{const r=await request('/api/admin/session','POST',{username,password});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];csrf=(await r.json()).csrfToken;return r;};
  return {root,env,api,server,request,login,cleanup:async()=>{await close(server);await api.close();await fs.rm(root,{recursive:true,force:true});}};
}
test('schema, scrypt session, CORS/Host/CSRF, revisions, one backup and public catalog',async()=>{
  let now=100000;const s=await setup(()=>now);
  try {
    assert.equal((await s.request('/api/admin/catalog')).status,401);
    assert.equal((await s.request('/api/admin/session','POST',{username,password:'wrong'})).status,401);
    const login=await s.login();const cookie=login.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);assert.match(cookie,/Max-Age=28800/);assert(!cookie.includes('Secure'));
    assert.equal((await s.request('/api/admin/catalog','GET',undefined,{'X-Admin-CSRF':'wrong'})).status,403);
    assert.equal((await s.request('/api/admin/catalog','GET',undefined,{Origin:'https://other.example'})).status,403);
    assert.equal(await new Promise((done,reject)=>{const req=httpRequest('http://127.0.0.1:8788/api/admin/catalog',{headers:{Host:'evil.example'}},r=>{r.resume();done(r.statusCode);});req.on('error',reject);req.end();}),403);
    let catalog=await (await s.request('/api/admin/catalog')).json();assert.equal(catalog.objects.length,3);
    const invalid=structuredClone(catalog);invalid.objects[0].title='';assert(!validateCatalog(invalid).valid);
    assert.equal((await s.request('/api/admin/catalog','PUT',{baseRevision:0,objects:invalid.objects})).status,422);
    const first=structuredClone(catalog.objects);first[0].visible=false;
    const results=await Promise.all([s.request('/api/admin/catalog','PUT',{baseRevision:0,objects:first}),s.request('/api/admin/catalog','PUT',{baseRevision:0,objects:first})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
    const pub=await s.request('/api/catalog');assert.equal(pub.headers.get('cache-control'),'public, max-age=60');assert.equal(pub.headers.get('access-control-allow-origin'),'http://127.0.0.1:4321');const data=await pub.json();assert.equal(data.objects.length,2);assert(!('id' in data.objects[0]));assert(!('visible' in data.objects[0]));
    assert.equal((await s.request('/api/catalog','GET',undefined,{'If-None-Match':pub.headers.get('etag')})).status,304);
    assert.equal((await s.request('/api/admin/media','POST',Buffer.from('not webp'),{'Content-Type':'application/octet-stream'})).status,422);
    catalog=await s.api.storage.catalog();assert.equal((await s.request('/api/admin/catalog','PUT',{baseRevision:catalog.revision,objects:[]})).status,200);
    assert.deepEqual((await (await s.request('/api/catalog')).json()).objects,[]);
    assert.equal(JSON.parse(await fs.readFile(resolve(s.root,'properties.json.bak'),'utf8')).revision,1);
    assert.equal((await fs.readdir(s.root)).filter(x=>x.endsWith('.bak')).length,1);
    assert.equal((await s.request('/api/admin/session','DELETE')).status,200);assert.equal((await s.request('/api/admin/catalog')).status,401);
    now+=60001;await s.login();now+=28800001;assert.equal((await s.request('/api/admin/catalog')).status,401);
    for(let i=0;i<5;i++)assert.equal((await s.request('/api/admin/session','POST',{username,password:'bad'})).status,401);
    assert.equal((await s.request('/api/admin/session','POST',{username,password:'bad'})).status,429);
    for(let i=0;i<3;i++)assert.equal((await s.request('/api/admin/recovery/start','POST',{})).status,200);
    assert.equal((await s.request('/api/admin/recovery/start','POST',{})).status,429);
  }finally{await s.cleanup();}
});
test('browser: add real Canvas photo, update /buy/ lazily, CRUD/order/empty/offline, admin desktop/mobile', {skip:process.env.ADMIN_BROWSER_TEST!=='1',timeout:240000},async()=>{
  await fs.mkdir(qa,{recursive:true});const s=await setup();let browser;
  const errors=[],trace=[],diagnostics=[];let debugPage;
  try {
    // Intercepted navigation has no remoteIPAddress; allow loopback in this test browser.
    browser=await launchBrowser(['--disable-features=LocalNetworkAccessChecks,LocalNetworkAccessChecksWebSockets']);const page=await browser.newPage();debugPage=page;page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')diagnostics.push(m.text());});
    page.on('response',r=>{if(r.url().includes('/api/'))diagnostics.push({status:r.status(),path:new URL(r.url()).pathname});});
    await page.setRequestInterception(true);
    page.on('request',async req=>{
      const u=new URL(req.url());
      if(u.pathname==='/admin/' && req.isNavigationRequest()) {
        const response=await fetch(req.url());let html=await response.text();
        html=html.replace(/data-api-base(?:="")?(?= )/,'data-api-base="http://127.0.0.1:8788"').replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/,'<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' blob: data: http://127.0.0.1:8787; connect-src \'self\' http://127.0.0.1:8788; object-src \'none\'">');
        await req.respond({status:200,contentType:'text/html',body:html});
      }else if(u.hostname==='127.0.0.1' && u.port==='8787' && u.pathname.startsWith('/media/')) {
        try{const response=await fetch('http://127.0.0.1:8788'+u.pathname);await req.respond({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});}catch{await req.abort('connectionrefused');}
      }else await req.continue();
    });
    await page.setViewport({width:1440,height:1000});await page.goto('http://127.0.0.1:4321/admin/',{waitUntil:'networkidle0'});
    for(const width of [1440,390]){await page.setViewport({width,height:1000});assert.equal(await page.$eval('#recovery',n=>n.textContent),'Получить пароль');await page.screenshot({path:qa+'/admin-login-'+width+'.png'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
    await page.evaluate(()=>{window.open=()=>null;});await page.click('#recovery');await page.waitForFunction(()=>!document.querySelector('#recovery-link').hidden);assert.match(await page.$eval('#recovery-link',n=>n.href),/^https:\/\/t\.me\//);assert.match(await page.$eval('#message',n=>n.textContent),/10 минут.*одобряет администратор/);
    await page.type('[name=username]',username);await page.type('[name=password]',password);await page.click('#login button');await page.waitForFunction(()=>!document.querySelector('#workspace').hidden);
    await page.click('#add');await page.type('#form [name=title]','Тестовая квартира с фотографией');await page.type('#form [name=address]','Тестовый адрес');await page.type('#form [name=price]','6 000 000 ₽');
    const jpeg=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=1000;c.height=750;const x=c.getContext('2d');x.fillStyle='#ddd3ba';x.fillRect(0,0,1000,750);x.fillStyle='#ea1818';x.fillRect(140,100,300,550);const b=await new Promise(r=>c.toBlob(r,'image/jpeg'));return [...new Uint8Array(await b.arrayBuffer())];});
    const file=resolve(s.root,'fixture.jpg');const raw=Buffer.from(jpeg),marker=Buffer.from('Exif\0\0GPS-FIXTURE-ONLY'),app=Buffer.alloc(marker.length+4);app[0]=255;app[1]=225;app.writeUInt16BE(marker.length+2,2);marker.copy(app,4);await fs.writeFile(file,Buffer.concat([raw.subarray(0,2),app,raw.subarray(2)]));await (await page.$('#image-file')).uploadFile(file);await page.waitForFunction(()=>document.querySelector('#message').textContent.includes('Фото готово'));
    await page.click('#form button[type=submit]');await page.waitForFunction(()=>document.querySelector('#message').textContent.includes('Сохранено'));
    let catalog=await s.api.storage.catalog();assert.equal(catalog.objects.length,4);const newCard=catalog.objects.at(-1);
    for(const [k,width] of [['small',360],['large',680]]){const bytes=await s.api.storage.readMedia(newCard.image[k]);assert.equal(inspectWebP(bytes,width).height,width*3/4);assert(!bytes.includes(Buffer.from('EXIF')));assert(!bytes.includes(Buffer.from('GPS-FIXTURE-ONLY')));}
    await page.click('#objects article:last-child button');await page.$eval('#form [name=price]',n=>n.value='6 100 000 ₽');await page.click('#form button[type=submit]');await page.waitForFunction(()=>document.querySelector('#editor').hidden);assert.equal((await s.api.storage.catalog()).objects.at(-1).price,'6 100 000 ₽');
    for(const width of [1440,390]){await page.setViewport({width,height:1000});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:qa+'/admin-list-'+width+'.png'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
    await page.click('#objects article:last-child button');await page.$eval('#editor',n=>n.scrollIntoView());await page.screenshot({path:qa+'/admin-form-390.png'});await page.click('#cancel');
    // A second tab reads the actual public API response, with only the transport redirected to our sandbox.
    const publicConsole=[];const buy=await browser.newPage();buy.on('console',m=>{if(m.type()==='error')publicConsole.push(m.text());});buy.on('pageerror',e=>errors.push(e.message));await buy.setViewport({width:1440,height:900});await buy.setRequestInterception(true);
    let publicRequests=0,mode='live';
    buy.on('request',async req=>{
      const u=new URL(req.url());if(u.hostname==='127.0.0.1' && u.port==='8787' && /^\/(api|media)\//.test(u.pathname)) {
        if(u.pathname==='/api/catalog'){publicRequests++;trace.push({path:u.pathname,phase:mode});}
        try{const response=await fetch('http://127.0.0.1:8788'+u.pathname,{headers:{Origin:'http://127.0.0.1:4321'}});await req.respond({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});}catch{await req.abort('connectionrefused');}
      }else await req.continue();
    });
    const open=async()=>{await buy.bringToFront();console.log('browser open phase='+mode);publicRequests=0;await buy.goto('http://127.0.0.1:4321/buy/',{waitUntil:'domcontentloaded',timeout:15000});await wait(500);assert.equal(publicRequests,0);assert.equal(await buy.$$eval('.buy-mortgage-carousel .property-card',n=>n.length),3);await buy.$eval('.buy-mortgage-deals',n=>n.scrollIntoView({behavior:'instant',block:'start'}));};
    const cdp=await buy.createCDPSession();await cdp.send('Tracing.start',{categories:'devtools.timeline,loading',transferMode:'ReturnAsStream'});
    await open();const complete=new Promise(done=>cdp.once('Tracing.tracingComplete',done));await cdp.send('Tracing.end');const {stream}=await complete;let traceJSON='';for(;;){const part=await cdp.send('IO.read',{handle:stream});traceJSON+=part.data;if(part.eof)break;}await cdp.send('IO.close',{handle:stream});await fs.writeFile(qa+'/buy-trace.json',traceJSON);
    await buy.waitForFunction(()=>document.querySelectorAll('.buy-mortgage-carousel .property-card').length===4);assert.equal(publicRequests,1);await buy.$eval('.buy-mortgage-carousel .carousel-track',n=>n.scrollLeft=n.scrollWidth);await wait(250);await buy.screenshot({path:qa+'/buy-new-card-1440.png'});assert.equal(await buy.$$eval('.buy-mortgage-carousel .carousel-pagination button',n=>n.length),4);
    const clickAction=async(text,last=true)=>{const revision=(await s.api.storage.catalog()).revision;await page.evaluate((text,last)=>{const rows=[...document.querySelectorAll('#objects article')],row=last?rows.at(-1):rows[0];[...row.querySelectorAll('button')].find(b=>b.textContent===text).click();},text,last);for(let i=0;i<100 && (await s.api.storage.catalog()).revision===revision;i++)await wait(30);assert.equal((await s.api.storage.catalog()).revision,revision+1);await wait(50);};
    await clickAction('Скрыть');assert.equal(publicCatalog(await s.api.storage.catalog()).objects.length,3);await open();await buy.waitForFunction(revision=>Number(document.querySelector('[data-catalog]').dataset.revision)===revision,{},(await s.api.storage.catalog()).revision);assert.equal(await buy.$$eval('.property-card',n=>n.length),3);
    await clickAction('Показать');assert.equal(publicCatalog(await s.api.storage.catalog()).objects.length,4);
    await clickAction('Выше');catalog=await s.api.storage.catalog();assert.equal(catalog.objects[2].id,newCard.id);
    await page.bringToFront();page.on('dialog',d=>d.accept());await page.evaluate(id=>{const row=document.querySelector(`[data-id="${id}"]`);[...row.querySelectorAll('button')].find(b=>b.textContent==='Удалить').click();},newCard.id);await page.waitForFunction(id=>!document.querySelector(`[data-id="${id}"]`),{},newCard.id);assert.equal((await s.api.storage.catalog()).objects.length,3);
    catalog=await s.api.storage.catalog();await s.api.storage.save({baseRevision:catalog.revision,objects:[]});await open();console.log('browser awaiting empty');await buy.waitForFunction(()=>!document.querySelector('[data-catalog-empty]').hidden);console.log('browser empty passed');assert.equal(await buy.$$eval('.buy-mortgage-carousel .property-card',n=>n.length),0);
    assert.deepEqual(publicConsole,[]);console.log('browser logout');await page.bringToFront();await page.evaluate(()=>document.querySelector('#logout').click());await page.waitForFunction(()=>document.querySelector('#workspace').hidden);
    await close(s.server);mode='offline';await open();await wait(500);assert.equal(await buy.$$eval('.buy-mortgage-carousel .property-card',n=>n.length),3);assert.deepEqual(errors,[]);
    await fs.writeFile(qa+'/browser-results.json',JSON.stringify({passed:true,errors,trace,requestsBeforeScroll:0,offlineBrowserDiagnostics:publicConsole},null,2));
  } catch(e){await fs.writeFile(qa+'/browser-failure.json',JSON.stringify({message:await debugPage?.$eval('#message',n=>n.textContent).catch(()=>null),body:await debugPage?.$eval('body',n=>n.dataset.apiBase).catch(()=>null),diagnostics,errors},null,2));throw e;} finally {if(browser)await browser.close();await s.cleanup();}
});
