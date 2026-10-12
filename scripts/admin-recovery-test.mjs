import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import * as fs from 'node:fs/promises';
import {resolve} from 'node:path';
import {createRecovery} from '../server/admin-recovery.mjs';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const owner=12345,employee=67890;
const message=(code,id=employee)=>({message:{text:'/start r_'+code,chat:{id,type:'private'},from:{id,first_name:'Тест <Имя>',username:'fixture_employee'}}});
const callback=(prompt,yes=true,id=owner)=>({callback_query:{id:'fixture-callback',data:prompt.body.reply_markup.inline_keyboard[0][yes?0:1].callback_data,from:{id},message:{message_id:prompt.messageId,chat:{id:owner,type:'private'}}}});
async function fixture(extra={}) {
  const root=await fs.mkdtemp('/private/tmp/claude-501/recovery-test-'),calls=[];let nextId=1,updates=[],webhook='',deleteFailures=0;
  const server=createServer(async(req,res)=>{
    let bytes='';for await(const chunk of req)bytes+=chunk;
    const method=req.url.split('/').at(-1),body=JSON.parse(bytes),item={method,body};calls.push(item);
    if(method==='deleteMessage' && deleteFailures>0){deleteFailures--;res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false}));return;}
    let result={};if(method==='sendMessage'){item.messageId=nextId++;result={message_id:item.messageId};}
    if(method==='getWebhookInfo')result={url:webhook};
    if(method==='getUpdates'){await wait(20);result=updates;updates=[];}
    res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,result}));
  });await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const env={ADMIN_USER:'fixture<&>',ADMIN_PASSWORD:'fixture<&>password',TELEGRAM_CHAT_ID:String(owner),TELEGRAM_BOT_TOKEN:'fixture-token',TELEGRAM_API_BASE:'http://127.0.0.1:'+server.address().port,...extra};
  const bots=[];let ip=0;
  const make=options=>{const bot=createRecovery({env,root,...options});bots.push(bot);return bot;};
  const bot=make();
  const code=(b=bot)=>new URL(b.start('fixture-ip-'+ip++).url).searchParams.get('start').slice(2);
  const prompt=()=>calls.findLast(c=>c.body.reply_markup?.inline_keyboard?.length);
  return {root,env,calls,bot,make,code,prompt,setUpdates:u=>updates=u,setWebhook:u=>webhook=u,failDeletes:n=>deleteFailures=n,cleanup:async()=>{for(const b of bots)await b.close();await new Promise(r=>{server.close(r);server.closeAllConnections();});await fs.rm(root,{recursive:true,force:true});}};
}
test('employee request, owner approval, HTML escaping, 60-second deletion and replay',async()=>{
  const f=await fixture();try {
    const code=f.code();await f.bot.handle(message(code));
    assert.match(f.calls[0].body.text,/Запрос отправлен\. Ждём одобрения администратора/);
    assert.match(f.calls[0].body.text,/10 минут/);assert.equal(f.calls[0].body.chat_id,employee);
    const p=f.prompt();assert.equal(p.body.chat_id,String(owner));assert.equal(p.body.parse_mode,'HTML');assert.equal(p.body.text,'Тест &lt;Имя&gt; (@fixture_employee) запрашивает доступ в админку сайта. Выдать логин и пароль?');assert(!p.body.text.includes('67890'));
    assert(!p.body.text.includes(f.env.ADMIN_PASSWORD));assert(!p.body.text.includes(f.env.ADMIN_USER));
    assert.deepEqual(p.body.reply_markup.inline_keyboard[0].map(b=>b.text),['Да, выдать','Нет, отклонить']);
    assert.match(p.body.reply_markup.inline_keyboard[0][0].callback_data,/^y_[a-f0-9]{32}$/);
    const waiting=f.calls[0].messageId;const before=f.calls.length;await f.bot.handle(callback(p));
    const delivery=f.calls.find(c=>c.body.text?.startsWith('Логин:'));
    assert.equal(delivery.body.chat_id,employee);assert.equal(delivery.body.parse_mode,'HTML');assert.match(delivery.body.text,/<code>fixture&lt;&amp;&gt;password<\/code>/);
    assert.match(delivery.body.text,/удалится через 60 секунд/);
    const approval=f.calls.slice(before);assert.deepEqual(approval.map(c=>c.method),['answerCallbackQuery','deleteMessage','sendMessage','deleteMessage','sendMessage']);
    assert.equal(approval[1].body.chat_id,employee);assert.equal(approval[3].body.chat_id,String(owner));
    assert.equal(approval.at(-1).body.text,'Доступ выдан: Тест &lt;Имя&gt; (@fixture_employee)');assert.equal(approval.at(-1).body.chat_id,String(owner));
    const state=JSON.parse(await fs.readFile(resolve(f.root,'recovery-state.json'),'utf8'));
    assert.equal(state.deletions[0].chatId,employee);assert.equal(state.deletions[0].messageId,delivery.messageId);
    assert(state.deletions[0].due>Date.now()+58000);
    assert.equal(state.requests[0][1].waitingId,waiting);assert.equal(state.requests[0][1].promptId,p.messageId);
    assert(!JSON.stringify(state).includes('password'));
    await f.bot.handle(callback(p));await f.bot.handle(message(code));
    assert.equal(f.calls.filter(c=>c.body.text?.startsWith('Логин:')).length,1);assert.equal(f.calls.at(-1).body.text,'Ссылка недействительна');
  }finally{await f.cleanup();}
});
test('reject, foreign/stale callbacks, first account binding, repeated/concurrent starts',async()=>{
  const f=await fixture();try {
    const code=f.code();await Promise.all([f.bot.handle(message(code)),f.bot.handle(message(code))]);const p=f.prompt();
    assert.equal(f.calls.filter(c=>c.body.reply_markup?.inline_keyboard?.length).length,1);
    assert.equal(f.calls.at(-1).body.text,'Запрос уже отправлен, ждём одобрения');
    await f.bot.handle(message(code,999));assert.equal(f.calls.at(-1).body.text,'Ссылка недействительна');
    await f.bot.handle(callback(p,true,employee));assert.equal(f.calls.at(-1).method,'answerCallbackQuery');
    assert(!f.calls.some(c=>c.body.text?.startsWith('Логин:')));
    const bad=callback(p);bad.callback_query.message.message_id+=100;await f.bot.handle(bad);
    const before=f.calls.length;await f.bot.handle(callback(p,false));
    const rejection=f.calls.slice(before);assert.deepEqual(rejection.map(c=>c.method),['answerCallbackQuery','deleteMessage','deleteMessage','sendMessage','sendMessage']);
    assert.equal(rejection.at(-2).body.chat_id,employee);assert.equal(rejection.at(-2).body.text,'Запрос отклонён администратором');assert.equal(rejection.at(-1).body.text,'Отклонено: Тест &lt;Имя&gt; (@fixture_employee)');
    await f.bot.handle(callback(p));assert.equal(f.calls.at(-1).body.text,'Запрос недоступен');
  }finally{await f.cleanup();}
});
test('owner uses the same approval flow, no plaintext password, disabled bot',async()=>{
  const f=await fixture({ADMIN_PASSWORD:''});try {
    await f.bot.handle(message(f.code(),owner));const p=f.prompt();assert(p);
    await f.bot.handle(callback(p));
    const results=f.calls.filter(c=>c.body.text==='Пароль в открытом виде не хранится — смените его командой на сервере');assert.equal(results.length,2);
    assert(!f.calls.some(c=>c.body.text?.startsWith('Логин:')));
    await f.bot.handle(message(f.code(),employee));await f.bot.handle(callback(f.prompt()));
    assert.equal(f.calls.at(-2).body.chat_id,employee);assert.equal(f.calls.at(-1).body.chat_id,String(owner));
    assert.equal(f.calls.at(-2).body.text,'Пароль в открытом виде не хранится — смените его командой на сервере');
    const off=createRecovery({env:{...f.env,ADMIN_RECOVERY_BOT:'0'},root:f.root});
    assert.throws(()=>off.start('fixture'),e=>e.status===503);const n=f.calls.length;await off.handle(message('bad'));assert.equal(f.calls.length,n);await off.close();
  }finally{await f.cleanup();}
});
test('expiry timer notifies requester, old links/callbacks fail, max 3 active and 3/hour/IP',async()=>{
  const f=await fixture();try {
    let now=1000;const b=f.make({now:()=>now,ttl:60});const code=f.code(b);await b.handle(message(code));const p=f.prompt();now+=61;await wait(100);
    const expiry=f.calls.slice(-4);assert.deepEqual(expiry.map(c=>c.method),['deleteMessage','deleteMessage','sendMessage','sendMessage']);
    assert.equal(expiry[2].body.text,'Время ожидания истекло, запросите заново на сайте');assert.equal(expiry[3].body.text,'Запрос от Тест &lt;Имя&gt; (@fixture_employee) истёк');
    await b.handle(callback(p));await b.handle(message(code));assert.equal(f.calls.at(-1).body.text,'Ссылка недействительна');
    const rate=f.make({now:()=>now});for(let i=0;i<3;i++)rate.start('same-ip');assert.throws(()=>rate.start('same-ip'),e=>e.status===429);assert.throws(()=>rate.start('another-ip'),e=>e.status===429);
    now+=600001;assert.throws(()=>rate.start('same-ip'),e=>e.status===429);rate.start('another-ip');now+=3600001;rate.start('same-ip');
  }finally{await f.cleanup();}
});
test('deletion runs and restores for requester after restart; offset/lock/webhook retained',async()=>{
  const f=await fixture();try {
    const b=f.make({deleteDelay:30});await b.handle(message(f.code(b)));await b.handle(callback(f.prompt()));await wait(100);
    assert(f.calls.some(c=>c.method==='deleteMessage' && c.body.chat_id===employee));
    assert(f.calls.some(c=>c.body.text==='Пароль удалён. Чтобы получить его заново, отправьте запрос с сайта.'));
    await fs.writeFile(resolve(f.root,'recovery-state.json'),JSON.stringify({offset:0,deletions:[{chatId:employee,messageId:777,due:Date.now()-100}]}));
    f.setUpdates([{update_id:123,...message('help')}]);await f.bot.startPolling();await wait(150);
    assert(f.calls.some(c=>c.method==='deleteMessage' && c.body.chat_id===employee && c.body.message_id===777));
    assert.equal(JSON.parse(await fs.readFile(resolve(f.root,'recovery-state.json'),'utf8')).offset,124);
    const second=f.make();await second.startPolling();await second.close();assert((await fs.stat(resolve(f.root,'recovery-bot.lock'))).isFile());await f.bot.close();
    f.setWebhook('https://fixture.invalid/hook');const at=f.calls.length;await f.make().startPolling();assert(!f.calls.slice(at).some(c=>['getUpdates','deleteWebhook'].includes(c.method)));
  }finally{await f.cleanup();}
});
test('owner prompt falls back to removing buttons when deletion fails',async()=>{
  const f=await fixture();try {
    await f.bot.handle(message(f.code()));const p=f.prompt();f.failDeletes(1);const before=f.calls.length;
    await f.bot.handle(callback(p,false));const calls=f.calls.slice(before);
    assert.deepEqual(calls.map(c=>c.method),['answerCallbackQuery','deleteMessage','editMessageReplyMarkup','deleteMessage','sendMessage','sendMessage']);
    assert.deepEqual(calls[2].body.reply_markup,{inline_keyboard:[]});
    assert.equal(calls.at(-1).body.text,'Отклонено: Тест &lt;Имя&gt; (@fixture_employee)');
  }finally{await f.cleanup();}
});
