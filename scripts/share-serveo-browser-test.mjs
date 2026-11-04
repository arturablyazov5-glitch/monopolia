// TASK-074: real HTTPS tunnel + Chrome, isolated API and fixture credentials only.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {passwordHash} from '../server/admin-auth.mjs';
import {launchBrowser} from './check-baseline.mjs';
import {execFileSync} from 'node:child_process';
import {randomInt} from 'node:crypto';
if (process.env.NODE_TEST_CONTEXT) {
  const {default: test} = await import('node:test');
  test('manual public tunnel browser suite', {skip:'Run this script directly for the external tunnel check'}, () => {});
} else {
const subdomain='monopolia-test'+randomInt(1000,10000);
const root=fileURLToPath(new URL('../',import.meta.url));
const work=await mkdtemp('/private/tmp/task-074-browser-');
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
  const api=start('server/lead-proxy.mjs',{PORT:'8788',HOST:'127.0.0.1',DATA_DIR:work,ADMIN_API_ORIGIN:'http://127.0.0.1:8788',ADMIN_USER:username,ADMIN_PASSWORD_HASH:await passwordHash(password),LEAD_DRY_RUN:'1',TRUST_PROXY:'1'});
  await new Promise((done,reject)=>{const timer=setTimeout(()=>reject(Error('Sandbox API timeout')),15000);api.stdout.on('data',chunk=>{if(chunk.toString().includes('ready port=8788')){clearTimeout(timer);done();}});api.once('exit',()=>reject(Error('Sandbox API exited')));});
  const share=start('scripts/share.mjs',{SHARE_PORT:'8791',SHARE_API_PORT:'8788',ADMIN_API_ORIGIN:'http://127.0.0.1:8788',SHARE_TUNNEL:'serveo',SHARE_SUBDOMAIN:subdomain,SHARE_SSH_KEY:'~/.ssh/serveo_ed25519'});
  let shareLog='';
  const log=chunk=>{const value=chunk.toString();shareLog=(shareLog+value).slice(-30000);for(const line of value.split('\n'))if(/\[share|ПУБЛИЧНАЯ|АДМИНКА/.test(line))console.log(line);};
  share.stdout.on('data',log);share.stderr.on('data',log);
  const address=await new Promise((done,reject)=>{let tail='';const timer=setTimeout(()=>reject(Error('Tunnel timeout')),150000);const output=chunk=>{tail=(tail+chunk.toString()).slice(-20000);const match=tail.match(/ПУБЛИЧНАЯ ССЫЛКА: (https:\/\/[a-z0-9.-]+)/);if(match){clearTimeout(timer);done(match[1]);}};share.stdout.on('data',output);share.stderr.on('data',output);share.once('exit',()=>{clearTimeout(timer);reject(Error('Share exited before public URL'));});});
  assert.equal(address,`https://${subdomain}.serveousercontent.com`);
  const get=path=>fetch(address+path,{headers:{'serveo-skip-browser-warning':'true'},signal:AbortSignal.timeout(20000)});
  for(const path of ['/', '/sell/', '/buy/']){const reply=await get(path);assert.equal(reply.status,200);assert.match(await reply.text(),/<!doctype html/i);console.log('TASK-074 public '+path+': 200');}
  console.log('TASK-074 tunnel: '+address);
  browser=await launchBrowser();const page=await browser.newPage();
  // Official automation header skips only Serveo interstitial; Chrome still sends real Origin.
  await page.setExtraHTTPHeaders({'serveo-skip-browser-warning':'true'});
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
  page.on('response',res=>{const u=new URL(res.url());if(u.pathname.startsWith('/api/') || u.pathname==='/lead'){responses.push({path:u.pathname,status:res.status()});console.log('TASK-074 response: '+res.request().method()+' '+u.pathname+' '+res.status());if(res.status()>=400 && res.status()!==401)void res.text().then(text=>{try{const data=JSON.parse(text);console.log('TASK-074 error: '+JSON.stringify(data.error));}catch{console.log('TASK-074 gateway error: non-JSON response');}});}});
  await page.goto(address+'/admin/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('#login button[type=submit]',{timeout:30000});
  console.log('TASK-074 admin page loaded');
  await page.type('[name=username]',username);await page.type('[name=password]',password);await page.click('#login button[type=submit]');
  await page.waitForFunction(()=>!document.querySelector('#workspace').hidden,{timeout:30000}).catch(async()=>{console.log('TASK-074 login notice: '+await page.$eval('#login-notice',n=>n.textContent));throw Error('Login workspace did not open');});
  const cookies=await page.cookies(address+'/api/admin/session');const cookie=cookies.find(c=>c.name==='monopoly_admin_session');
  assert(cookie?.secure);assert.equal(cookie.sameSite,'Strict');assert(cookie.httpOnly);
  assert(sentOrigin('/api/admin/session'));
  console.log('TASK-074 browser login: 200; real tunnel Origin; Secure/HttpOnly/SameSite=Strict');
  // Reload proves that Chrome stored and returns the Secure session cookie.
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.querySelector('#workspace').hidden);
  await page.goto(address+'/',{waitUntil:'domcontentloaded',timeout:60000});
  const form=await page.$('form.lead-form');assert(form);
  await form.evaluate(f=>{f.scrollIntoView();f.dataset.context=JSON.stringify({subject:'ТЕСТ TASK-074',test:true});});
  const name=await form.$('[name=name]');if(name)await name.type('ТЕСТ TASK-074');
  const question=await form.$('[name=question]');if(question)await question.type('ТЕСТ TASK-074');
  // Paste a complete number: focus already inserts +7, so typing a second 7 is invalid.
  await form.$eval('[name=phone]',n=>{n.value='+7 (999) 123-45-67';n.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertFromPaste'}));});
  await form.$eval('[name=consent]',n=>{n.checked=true;n.dispatchEvent(new Event('change',{bubbles:true}));});
  assert(await form.evaluate(f=>f.checkValidity()),'Fixture form is valid');
  const leadResponse=page.waitForResponse(r=>new URL(r.url()).pathname==='/lead' && r.request().method()==='POST',{timeout:30000});
  await (await form.$('[type=submit]')).click();const reply=await leadResponse;assert.equal(reply.status(),200);assert.equal((await reply.json()).ok,true);
  assert(sentOrigin('/lead'));
  assert(!responses.some(r=>r.status===403));assert.deepEqual(errors,[]);
  console.log('TASK-074 browser lead: 200; real tunnel Origin; dry-run, no Telegram delivery');
  // Find only this share process's SSH, never a user's process/port.
  const ownChildren=execFileSync('ps',['-axo','pid=,ppid=,comm='],{encoding:'utf8'}).split('\n').map(line=>line.trim().split(/\s+/));
  const ssh=ownChildren.find(([,ppid,command])=>Number(ppid)===share.pid && /(?:^|\/)ssh$/.test(command));
  assert(ssh,'Own SSH child exists');
  shareLog='';process.kill(Number(ssh[0]),'SIGKILL');
  await new Promise((done,reject)=>{
    const deadline=Date.now()+90000;
    const poll=setInterval(()=>{
      if(shareLog.includes('туннель переподключён')){clearInterval(poll);done();}
      else if(Date.now()>deadline){clearInterval(poll);reject(Error('Reconnect timeout'));}
    },200);
  });
  // Earlier connection failures may already have advanced the retry backoff.
  assert.match(shareLog,/повтор через (?:5|10|20|40|60) с/);
  assert(shareLog.includes('ПУБЛИЧНАЯ ССЫЛКА: '+address));
  assert.equal((await get('/')).status,200);
  await page.goto(address+'/admin/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!document.querySelector('#workspace').hidden,{timeout:30000});
  console.log('TASK-074 reconnect: own SSH killed, same URL restored; browser session survives');
  console.log('TASK-074 browser: PASS; no Origin rejection');
}finally{
  if(browser)await browser.close();
  for(const child of [...children].reverse())await stop(child);
  await rm(work,{recursive:true,force:true});
  console.log('TASK-074 own Chrome/API/share/tunnel stopped; sandbox removed');
}

}
