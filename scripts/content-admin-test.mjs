// TASK-081. All writes and authentication belong to disposable fixtures.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {createServer} from 'node:http';
import {createAdminAPI} from '../server/admin-api.mjs';
import {passwordHash} from '../server/admin-auth.mjs';
import {siteTexts} from '../src/data/site-texts.mjs';
import {bindContent} from '../src/lib/content-bindings.mjs';
import {launchBrowser} from './check-baseline.mjs';
const username='content-fixture-editor',password='content-fixture-passphrase';
const site=process.env.CONTENT_TEST_SITE || 'http://127.0.0.1:4321';
const qa='/private/tmp/claude-501/admin-grid-qa';
const titleId='home-hero.text.3',buttonId='buyer-audience.label.10';
async function setup(){
 const root=await fs.mkdtemp('/private/tmp/claude-501/content-test-');let api;
 const server=createServer((req,res)=>api.handler(req,res));await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const origin='http://127.0.0.1:'+server.address().port;
 api=await createAdminAPI({env:{DATA_DIR:root,ADMIN_API_ORIGIN:origin,ALLOWED_ORIGINS:site,ADMIN_USER:username,ADMIN_PASSWORD_HASH:await passwordHash(password)}});
 let cookie='',csrf='';
 const request=(path,method='GET',data,headers={})=>fetch(origin+path,{method,headers:{Origin:site,'Content-Type':'application/json',Cookie:cookie,'X-Admin-CSRF':csrf,'X-Admin-Request':'1',...headers},...(data===undefined?{}:{body:JSON.stringify(data)})});
 return {root,api,origin,server,request,login:async()=>{const r=await request('/api/admin/session','POST',{username,password});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];csrf=(await r.json()).csrfToken;},cleanup:async()=>{await new Promise(done=>{server.close(done);server.closeAllConnections()});await api.close();await fs.rm(root,{recursive:true,force:true});}};
}
test('content: session, CSRF, Origin, partial save, typography, ETag, reset, validation, concurrency, persistence',async()=>{
 const s=await setup();try{
  assert.equal((await s.request('/api/admin/content')).status,401);
  assert.equal((await s.request('/api/admin/content','PUT',{baseRevision:0,changes:{}})).status,401);
  const empty=await s.request('/api/content');assert.equal(empty.status,200);assert.deepEqual((await empty.json()).overrides,{});
  const emptyTag=empty.headers.get('etag');assert.equal((await s.request('/api/content','GET',undefined,{'If-None-Match':emptyTag})).status,304);
  await s.login();const initial=await(await s.request('/api/admin/content')).json();assert.equal(initial.items.length,siteTexts.length);
  assert.equal(new Set(siteTexts.map(x=>x.id)).size,siteTexts.length);
  for(const item of siteTexts){assert(item.defaultValue);assert(item.defaultValue.length<=item.maxLength);}
  assert.equal((await s.request('/api/admin/content','PUT',{baseRevision:0,changes:{}},{'X-Admin-CSRF':'invalid'})).status,403);
  assert.equal((await s.request('/api/admin/content','PUT',{baseRevision:0,changes:{}},{Origin:'https://foreign.example'})).status,403);
  const changes={[titleId]:'Квартиры\u0000 и дома — для вас',[buttonId]:'Оценить объект'};
  let saved=await s.request('/api/admin/content','PUT',{baseRevision:0,changes});assert.equal(saved.status,200);saved=await saved.json();
  assert.equal(saved.revision,1);assert.match(saved.overrides[titleId],/и\u00a0дома/);assert.match(saved.overrides[titleId],/\u00a0—/);assert(!saved.overrides[titleId].includes('\u0000'));
  assert.deepEqual(Object.keys(saved.overrides).sort(),Object.keys(changes).sort());
  const publicResponse=await s.request('/api/content');const published=await publicResponse.json();assert.deepEqual(published.overrides,saved.overrides);assert(!('items'in published));assert.notEqual(publicResponse.headers.get('etag'),emptyTag);
  assert.equal((await s.request('/api/content','GET',undefined,{'If-None-Match':publicResponse.headers.get('etag')})).status,304);
  const disk=JSON.parse(await fs.readFile(s.root+'/content.json','utf8'));assert.deepEqual(disk,{revision:1,overrides:saved.overrides});
  assert.deepEqual((await s.api.content.read()).overrides,saved.overrides);
  for(const changes of [{unknown:'Текст'},{[titleId]:'<b>Текст</b>'},{[titleId]:''},{[titleId]:42},{[titleId]:'а'.repeat(401)},{[titleId]:'\u0000'},{'lead-form.title.1':'Одна строка'}]) assert.equal((await s.request('/api/admin/content','PUT',{baseRevision:1,changes})).status,422);
  assert.equal((await s.request('/api/admin/content','PUT',{baseRevision:1,changes:{},unknown:true})).status,422);
  assert.equal((await s.request('/api/admin/content','PUT',{baseRevision:1,changes:{[titleId]:'а'.repeat(270000)}})).status,413);
  assert.equal((await s.request('/api/admin/content','PUT',{baseRevision:0,changes:{[titleId]:null}})).status,409);
  assert.equal((await s.request('/api/admin/content','PUT',{baseRevision:1,changes:{[titleId]:null}})).status,200);
  let state=await s.api.content.read();assert(!Object.hasOwn(state.overrides,titleId));assert.equal(state.overrides[buttonId],'Оценить объект');
  assert.equal((await s.request('/api/admin/content','PUT',{baseRevision:2,changes:{[buttonId]:siteTexts.find(x=>x.id===buttonId).defaultValue}})).status,200);
  state=await s.api.content.read();assert.deepEqual(state.overrides,{});
  const results=await Promise.all([s.request('/api/admin/content','PUT',{baseRevision:3,changes:{[titleId]:'Объекты'}}),s.request('/api/admin/content','PUT',{baseRevision:3,changes:{[titleId]:'Квартиры'}})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 }finally{await s.cleanup()}
});
test('bindings preserve tags, direct mixed text nodes, escaped text, raw scripts and multline slots',()=>{
 const title=siteTexts.find(x=>x.id===titleId).defaultValue;
 const input=`<h1>${title}<img src="x"><span>Агентство</span></h1><script>const a="<h1>${title}</h1>";</script>`;
 const output=bindContent(input);assert.match(output,/data-content-id="home-hero.text.3"/);assert.equal(output.replace(/ data-content-(?:id|slots|parts)="[^"]*"/g,''),input);
 const multiline=bindContent('<h2>Остались вопросы?<br>Задайте их здесь</h2>');assert.match(multiline,/data-content-parts="0 1"/);
});
test('browser: edit home headline and sell button, reload visitor, reset, offline, admin widths/screenshots', {skip:process.env.CONTENT_BROWSER_TEST!=='1',timeout:240000},async()=>{
 const s=await setup();let browser;const errors=[],consoleErrors=[];try{
  await fs.mkdir(qa,{recursive:true});browser=await launchBrowser(['--disable-features=LocalNetworkAccessChecks,LocalNetworkAccessChecksWebSockets']);
  let offline=false;const page=await browser.newPage();
  const configure=async page=>{page.on('console',m=>{if(m.type()==='error' && !/Failed to load resource|net::ERR_/.test(m.text()))consoleErrors.push(m.text());});page.on('pageerror',e=>errors.push(e.message));await page.setRequestInterception(true);page.on('request',async req=>{const path=new URL(req.url()).pathname;if(path.startsWith('/api/')){
   if(offline)return req.abort('connectionrefused');
   try{const h=req.headers();const response=await fetch(s.origin+path,{method:req.method(),headers:{Origin:site,'Content-Type':h['content-type']||'application/json',Cookie:h.cookie||'','X-Admin-CSRF':h['x-admin-csrf']||'','X-Admin-Request':h['x-admin-request']||'',...(h['if-none-match']?{'If-None-Match':h['if-none-match']}:{})},...(['GET','HEAD'].includes(req.method())?{}:{body:req.postData()})});await req.respond({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});}catch{await req.abort('connectionrefused')}
  }else await req.continue();});};
  await configure(page);await page.setViewport({width:1440,height:1000});await page.goto(site+'/admin/',{waitUntil:'networkidle0'});
  await page.type('[name=username]',username);await page.type('[name=password]',password);await page.click('#login button[type=submit]');await page.waitForFunction(()=>!document.querySelector('#workspace').hidden);
  await page.click('#tab-texts');await page.waitForSelector('[data-text-id="'+titleId+'"] textarea');
  const set=async(id,value)=>page.$eval('[data-text-id="'+id+'"] textarea',(n,value)=>{n.value=value;n.dispatchEvent(new Event('input',{bubbles:true}))},value);
  await set(titleId,'Квартиры');await set(buttonId,'Оценить объект');await page.click('#tab-objects');await page.waitForSelector('#confirmation[open]');await page.click('#confirm-cancel');assert.equal(await page.$eval('#texts-panel',n=>n.hidden),false);await page.click('#content-save');await page.waitForFunction(()=>document.querySelector('#content-status').textContent.startsWith('Сохранено.'),{polling:'mutation'});
  const visitor=await browser.newPage();await configure(visitor);await visitor.setViewport({width:1440,height:900});
  await visitor.goto(site+'/',{waitUntil:'networkidle0'});assert.equal(await visitor.$eval('[data-content-id="'+titleId+'"]',n=>[...n.childNodes].filter(n=>n.nodeType===3)[Number(n.dataset.contentSlots)].textContent.trim()),'Квартиры');
  await visitor.goto(site+'/sell/',{waitUntil:'networkidle0'});assert((await visitor.$$eval('[data-content-id="'+buttonId+'"]',n=>n.map(x=>x.textContent))).some(t=>t.includes('Оценить объект')));
  for(const width of [1440,1024,768,390,360]){await page.setViewport({width,height:1000});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if([1440,390].includes(width))await page.screenshot({path:qa+'/admin-texts-'+width+'.png'});}
  // Reset and verify the actual public response and visitor DOM after reload.
  for(const id of [titleId,buttonId])await page.$eval('[data-text-id="'+id+'"] button',n=>n.click());
  await page.bringToFront();await page.$eval('#content-save',n=>n.click());await page.waitForFunction(()=>document.querySelector('#content-status').textContent.startsWith('Сохранено.'),{polling:'mutation'});
  assert.deepEqual((await s.api.content.read()).overrides,{});
  await visitor.goto(site+'/',{waitUntil:'networkidle0'});assert.equal(await visitor.$eval('[data-content-id="'+titleId+'"]',n=>[...n.childNodes].filter(n=>n.nodeType===3)[Number(n.dataset.contentSlots)].textContent.trim()),siteTexts.find(x=>x.id===titleId).defaultValue);
  await visitor.goto(site+'/sell/',{waitUntil:'networkidle0'});assert((await visitor.$$eval('[data-content-id="'+buttonId+'"]',n=>n.map(x=>x.textContent))).some(t=>t.includes(siteTexts.find(x=>x.id===buttonId).defaultValue)));
  offline=true;for(const route of ['/','/sell/','/buy/']){await visitor.goto(site+route,{waitUntil:'networkidle0'});assert(await visitor.$('[data-content-id]'));}
  assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);await fs.writeFile(qa+'/content-browser-results.json',JSON.stringify({passed:true,textCount:siteTexts.length,errors,consoleErrors,offline:true,adminWidths:[1440,1024,768,390,360]},null,2));
 }finally{await browser?.close();await s.cleanup()}
});
