// TASK-072: real HTTPS tunnel + Chrome, isolated API and fixture credentials only.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {passwordHash} from '../server/admin-auth.mjs';
import {launchBrowser} from './check-baseline.mjs';
if (process.env.NODE_TEST_CONTEXT) {
  const {default: test} = await import('node:test');
  test('manual public tunnel browser suite', {skip:'Run this script directly for the external tunnel check'}, () => {});
} else {
const root=fileURLToPath(new URL('../',import.meta.url));
const work=await mkdtemp('/private/tmp/task-072-browser-');
const username='fixture-editor',password='fixture-only-passphrase';
const children=[];
let browser;
function start(script,env){
  const child=spawn(process.execPath,[resolve(root,script)],{cwd:root,env:{PATH:process.env.PATH,HOME:process.env.HOME,...env},stdio:['ignore','pipe','pipe']});
  children.push(child);return child;
}
async function stop(child){
  if(child.exitCode!==null || child.signalCode!==null)return;
  await new Promise(done=>{child.once('close',done);child.kill('SIGTERM');const timer=setTimeout(()=>child.kill('SIGKILL'),5000);timer.unref();});
}
try {
  const api=start('server/lead-proxy.mjs',{PORT:'8788',HOST:'127.0.0.1',DATA_DIR:work,ADMIN_API_ORIGIN:'http://127.0.0.1:8788',ALLOWED_ORIGINS:'http://127.0.0.1:4321',ADMIN_USER:username,ADMIN_PASSWORD_HASH:await passwordHash(password),LEAD_DRY_RUN:'1',TRUST_PROXY:'1'});
  await new Promise((done,reject)=>{const timer=setTimeout(()=>reject(Error('Sandbox API timeout')),15000);api.stdout.on('data',chunk=>{if(chunk.toString().includes('ready port=8788')){clearTimeout(timer);done();}});api.once('exit',()=>reject(Error('Sandbox API exited')));});
  const share=start('scripts/share.mjs',{SHARE_TUNNEL:'localhost.run',SHARE_SUBDOMAIN:'',SHARE_SSH_KEY:'',SHARE_PORT:'8791',SHARE_API_PORT:'8788',ADMIN_API_ORIGIN:'http://127.0.0.1:8788'});
  const address=await new Promise((done,reject)=>{let tail='';const timer=setTimeout(()=>reject(Error('Tunnel timeout')),150000);const output=chunk=>{tail=(tail+chunk.toString()).slice(-20000);const match=tail.match(/ПУБЛИЧНАЯ ССЫЛКА: (https:\/\/[a-z0-9.-]+)/);if(match){clearTimeout(timer);done(match[1]);}};share.stdout.on('data',output);share.stderr.on('data',output);share.once('exit',()=>{clearTimeout(timer);reject(Error('Share exited before public URL'));});});
  assert.match(address,/\.lhr\.life$/);
  console.log('TASK-072 tunnel: '+address);
  browser=await launchBrowser();const page=await browser.newPage();
  const responses=[],errors=[],wireRequests=new Map(),wireOrigins=new Map();
  const cdp=await page.createCDPSession();await cdp.send('Network.enable');
  cdp.on('Network.requestWillBeSent',({requestId,request})=>{
    const path=new URL(request.url).pathname;
    if(path.startsWith('/api/') || path==='/lead')wireRequests.set(requestId,{path,method:request.method});
  });
  cdp.on('Network.requestWillBeSentExtraInfo',({requestId,headers})=>{
    const origin=Object.entries(headers).find(([key])=>key.toLowerCase()==='origin')?.[1];
    if(origin)wireOrigins.set(requestId,origin);
  });
  const sentOrigin=path=>[...wireRequests].some(([id,r])=>r.path===path && r.method==='POST' && wireOrigins.get(id)===address);
  page.on('pageerror',()=>errors.push('pageerror'));
  page.on('response',res=>{const u=new URL(res.url());if(u.pathname.startsWith('/api/') || u.pathname==='/lead'){responses.push({path:u.pathname,status:res.status()});console.log('TASK-072 response: '+res.request().method()+' '+u.pathname+' '+res.status());if(res.status()>=400 && res.status()!==401)void res.text().then(text=>{try{const data=JSON.parse(text);console.log('TASK-072 error: '+JSON.stringify(data.error));}catch{console.log('TASK-072 gateway error: non-JSON response');}});}});
  await page.goto(address+'/admin/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('#login button[type=submit]',{timeout:30000});
  console.log('TASK-072 admin page loaded');
  await page.type('[name=username]',username);await page.type('[name=password]',password);await page.click('#login button[type=submit]');
  await page.waitForFunction(()=>!document.querySelector('#workspace').hidden,{timeout:30000}).catch(async()=>{console.log('TASK-072 login notice: '+await page.$eval('#login-notice',n=>n.textContent));throw Error('Login workspace did not open');});
  const cookies=await page.cookies(address+'/api/admin/session');const cookie=cookies.find(c=>c.name==='monopoly_admin_session');
  assert(cookie?.secure);assert.equal(cookie.sameSite,'Strict');assert(cookie.httpOnly);
  assert(sentOrigin('/api/admin/session'));
  console.log('TASK-072 browser login: 200; real tunnel Origin; Secure/HttpOnly/SameSite=Strict');
  // Reload proves that Chrome stored and returns the Secure session cookie.
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.querySelector('#workspace').hidden);
  await page.waitForSelector('#add:not([disabled])',{timeout:30000});
  await page.click('#add');await page.type('#form [name=title]','ТЕСТ TASK-072');await page.type('#form [name=address]','Тестовый адрес');await page.type('#form [name=price]','6 000 000 ₽');
  const jpeg=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=1000;c.height=750;const x=c.getContext('2d');x.fillStyle='#ddd3ba';x.fillRect(0,0,c.width,c.height);const b=await new Promise(r=>c.toBlob(r,'image/jpeg'));return [...new Uint8Array(await b.arrayBuffer())];});
  const image=resolve(work,'fixture.jpg');await writeFile(image,Buffer.from(jpeg));await (await page.$('#image-file')).uploadFile(image);
  await page.waitForFunction(()=>document.querySelector('#message').textContent.includes('Фото готово'));
  await page.click('#form button[type=submit]');await page.waitForFunction(()=>document.querySelector('#message').textContent.includes('Сохранено'));
  let catalog=JSON.parse(await readFile(resolve(work,'properties.json'),'utf8'));const card=catalog.objects.find(c=>c.title==='ТЕСТ TASK-072');assert(card);
  await page.evaluate(id=>{const row=document.querySelector(`[data-id="${id}"]`);[...row.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Удалить' || b.textContent.trim()==='Удалить').click();},card.id);
  await page.waitForSelector('#confirmation[open]');await page.click('#confirm-ok');
  await page.waitForFunction(id=>!document.querySelector(`[data-id="${id}"]`),{},card.id);
  catalog=JSON.parse(await readFile(resolve(work,'properties.json'),'utf8'));assert(!catalog.objects.some(c=>c.id===card.id));
  console.log('TASK-072 browser card: added with photo and deleted via HTTPS UI');
  await page.goto(address+'/',{waitUntil:'domcontentloaded',timeout:60000});
  const form=await page.$('form.lead-form');assert(form);
  await form.evaluate(f=>{f.scrollIntoView();f.dataset.context=JSON.stringify({subject:'ТЕСТ TASK-072',test:true});});
  const name=await form.$('[name=name]');if(name)await name.type('ТЕСТ TASK-072');
  const question=await form.$('[name=question]');if(question)await question.type('ТЕСТ TASK-072');
  // Paste a complete number: focus already inserts +7, so typing a second 7 is invalid.
  await form.$eval('[name=phone]',n=>{n.value='+7 (999) 123-45-67';n.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertFromPaste'}));});
  await form.$eval('[name=consent]',n=>{n.checked=true;n.dispatchEvent(new Event('change',{bubbles:true}));});
  const leadResponse=page.waitForResponse(r=>new URL(r.url()).pathname==='/lead' && r.request().method()==='POST',{timeout:30000});
  await (await form.$('[type=submit]')).click();const reply=await leadResponse;assert.equal(reply.status(),200);assert.equal((await reply.json()).ok,true);
  assert(sentOrigin('/lead'));
  assert(!responses.some(r=>r.status===403));assert.deepEqual(errors,[]);
  console.log('TASK-072 browser lead: 200; real tunnel Origin; dry-run, no Telegram delivery');
  console.log('TASK-072 browser: PASS; no Origin rejection');
}finally{
  if(browser)await browser.close();
  for(const child of [...children].reverse())await stop(child);
  await rm(work,{recursive:true,force:true});
  console.log('TASK-072 own Chrome/API/share/tunnel stopped; sandbox removed');
}

}
