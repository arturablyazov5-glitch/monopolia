import {randomBytes,createHash} from 'node:crypto';
import * as fs from 'node:fs/promises';
import {resolve} from 'node:path';
import {atomic,AdminError} from './admin-storage.mjs';
const digest=code=>createHash('sha256').update(code).digest('hex');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createRecovery({env,root,now=Date.now,fetcher=fetch,report=()=>{},deleteDelay=60000,ttl=600000}) {
  const codes=new Map(),limits=new Map();let stopped=false,controller,lockHandle,loop,finishBackoff;
  const timers=new Set(),deletions=new Map();
  const deletionKey=item=>`${item.chatId}:${item.messageId}`;
  const stateFile=resolve(root,'recovery-state.json'),lockFile=resolve(root,'recovery-bot.lock');
  let offset=0,stateQueue=Promise.resolve();
  const owner=String(env.ADMIN_TELEGRAM_ID || env.TELEGRAM_CHAT_ID || '');
  const call=async(method,data)=> {
    const response=await fetcher(`${env.TELEGRAM_API_BASE || 'https://api.telegram.org'}/bot${env.TELEGRAM_BOT_TOKEN}/${method}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller ? AbortSignal.any([controller.signal,AbortSignal.timeout(35000)]) : AbortSignal.timeout(35000)});
    const result=await response.json();if(!response.ok || !result.ok)throw Error('Telegram unavailable');return result.result;
  };
  const persist=()=>{
    const task=stateQueue.then(()=>atomic(stateFile,JSON.stringify({offset,deletions:[...deletions.values()],requests:[...codes]})));
    stateQueue=task.catch(()=>{});return task;
  };
  function schedule(item) {
    const timer=setTimeout(async()=>{
      timers.delete(timer);
      if(item.deleted) {
        const text=item.deleteFailed?'Пароль удалён. Чтобы получить его заново, отправьте запрос с сайта. Сообщение с паролем удалить не удалось — удалите его вручную.':'Пароль удалён. Чтобы получить его заново, отправьте запрос с сайта.';
        try {await call('sendMessage',{chat_id:item.chatId,text});deletions.delete(deletionKey(item));await persist();}
        catch {if(!stopped)schedule({...item,due:now()+60000});}
        return;
      }
      try {await call('deleteMessage',{chat_id:item.chatId,message_id:item.messageId});item.deleted=true;item.attempts=0;await persist();if(!stopped)schedule({...item,due:now()});}
      catch {const attempts=(item.attempts||0)+1;if(attempts>=3){item.deleted=true;item.deleteFailed=true;item.attempts=attempts;await persist();if(!stopped)schedule({...item,due:now()});}else if(!stopped)schedule({...item,attempts,due:now()+60000});}
    },Math.max(0,item.due-now()));timers.add(timer);
  }
  async function removeOwnerPrompt(entry) {
    if(!entry.promptId)return;
    try {await call('deleteMessage',{chat_id:owner,message_id:entry.promptId});}
    catch {try {await call('editMessageReplyMarkup',{chat_id:owner,message_id:entry.promptId,reply_markup:{inline_keyboard:[]}});}catch{}}
  }
  async function removeWaiting(entry) {
    if(!entry.waitingId || entry.chatId===null)return;
    try {await call('deleteMessage',{chat_id:entry.chatId,message_id:entry.waitingId});}catch{}
  }
  const valid=entry=>entry && !entry.used && now()<entry.expires;
  async function expire(entry) {
    if(entry.used)return;
    entry.used=true;
    await removeOwnerPrompt(entry);
    await removeWaiting(entry);
    if(entry.chatId!==null)try {
      await call('sendMessage',{chat_id:entry.chatId,text:'Время ожидания истекло, запросите заново на сайте'});
    } catch {report('recovery_expiry_unavailable');}
    if(entry.promptId)try {await call('sendMessage',{chat_id:owner,parse_mode:'HTML',text:`Запрос от ${entry.label} истёк`});}catch {report('recovery_expiry_unavailable');}
    await persist();
  }
  function start(ip) {
    if(env.ADMIN_RECOVERY_BOT==='0')throw new AdminError(503,'recovery-disabled','Получение пароля через бота отключено');
    for(const [key,value] of codes)if(value.expires<=now() || value.used){
      if(!value.used)void expire(value);
      codes.delete(key);
    }
    for(const [key,value] of limits)if(!value.some(t=>now()-t<3600000))limits.delete(key);
    const times=(limits.get(ip)||[]).filter(t=>now()-t<3600000);
    if(times.length>=3 || limits.size>=10000 || codes.size>=3)throw new AdminError(429,'recovery-limit','Попробуйте позже');
    times.push(now());limits.set(ip,times);
    const code=randomBytes(24).toString('hex'),key=digest(code);
    const entry={expires:now()+ttl,used:false,chatId:null,accountId:null,reference:randomBytes(16).toString('hex')};
    codes.set(key,entry);
    const timer=setTimeout(()=>{timers.delete(timer);void expire(entry);codes.delete(key);},ttl);timers.add(timer);
    const username=/^[A-Za-z0-9_]{5,32}$/.test(env.TELEGRAM_BOT_USERNAME || '')?env.TELEGRAM_BOT_USERNAME:'monopoly28_bot';
    return {url:`https://t.me/${username}?start=r_${code}`};
  }
  async function handleUpdate(update) {
    if(env.ADMIN_RECOVERY_BOT==='0' || !owner || stopped)return;
    const q=update.callback_query,m=q?.message || update.message,from=q?.from || update.message?.from;
    if(q) {
      const match=/^([yn])_([a-f0-9]{32})$/.exec(q.data || '');
      const entry=match && [...codes.values()].find(e=>e.reference===match[2]);
      if(String(from?.id)!==owner || m?.chat?.type!=='private' || String(m.chat.id)!==owner || !valid(entry) || !entry.chatId || entry.promptId!==m.message_id) {
        await call('answerCallbackQuery',{callback_query_id:q.id,text:'Запрос недоступен'});return;
      }
      entry.used=true;
      await call('answerCallbackQuery',{callback_query_id:q.id});
      if(match[1]==='n') {
        await removeOwnerPrompt(entry);
        await removeWaiting(entry);
        await call('sendMessage',{chat_id:entry.chatId,text:'Запрос отклонён администратором'});
        await call('sendMessage',{chat_id:owner,parse_mode:'HTML',text:`Отклонено: ${entry.label}`});await persist();return;
      }
      if(!env.ADMIN_PASSWORD) {
        await removeOwnerPrompt(entry);
        await removeWaiting(entry);
        const text='Пароль в открытом виде не хранится — смените его командой на сервере';
        await call('sendMessage',{chat_id:entry.chatId,text});await call('sendMessage',{chat_id:owner,text});await persist();return;
      }
      await removeWaiting(entry);
      const sent=await call('sendMessage',{chat_id:entry.chatId,parse_mode:'HTML',text:`Логин: <code>${escape(env.ADMIN_USER)}</code>\nПароль: <code>${escape(env.ADMIN_PASSWORD)}</code>\nСообщение удалится через 60 секунд`});
      const item={chatId:entry.chatId,messageId:sent.message_id,due:now()+deleteDelay};
      deletions.set(deletionKey(item),item);schedule(item);await persist();
      await removeOwnerPrompt(entry);
      await call('sendMessage',{chat_id:owner,parse_mode:'HTML',text:`Доступ выдан: ${entry.label}`});await persist();return;
    }
    if(m?.chat?.type!=='private' || !from?.id || String(m.chat.id)!==String(from.id))return;
    const chatId=m.chat.id;
    const match=/^\/start(?:@[A-Za-z0-9_]+)? r_([a-f0-9]{48})$/.exec(m.text || '');
    if(match) {
      const entry=codes.get(digest(match[1]));
      if(!valid(entry) || (entry.accountId!==null && entry.accountId!==String(from.id))) {
        await call('sendMessage',{chat_id:chatId,text:'Ссылка недействительна'});return;
      }
      if(entry.accountId!==null) {
        await call('sendMessage',{chat_id:chatId,text:'Запрос уже отправлен, ждём одобрения'});return;
      }
      entry.accountId=String(from.id);entry.chatId=chatId;
      const name=escape([from.first_name,from.last_name].filter(Boolean).join(' ') || 'Без имени');
      entry.label=from.username?`${name} (@${escape(from.username)})`:name;
      const waiting=await call('sendMessage',{chat_id:chatId,text:'Запрос отправлен. Ждём одобрения администратора.\nСсылка действует 10 минут с момента запроса на сайте.'});
      entry.waitingId=waiting.message_id;
      const prompt=await call('sendMessage',{chat_id:owner,parse_mode:'HTML',text:`${entry.label} запрашивает доступ в админку сайта. Выдать логин и пароль?`,reply_markup:{inline_keyboard:[[{text:'Да, выдать',callback_data:'y_'+entry.reference},{text:'Нет, отклонить',callback_data:'n_'+entry.reference}]]}});
      entry.promptId=prompt.message_id;
      // A slow Telegram response must not leave expired buttons active.
      if(!valid(entry))await removeOwnerPrompt(entry);
      await persist();
      return;
    }
    await call('sendMessage',{chat_id:chatId,text:'Для доступа откройте /admin/ на сайте и нажмите «Получить пароль»'});
  }
  let handleQueue=Promise.resolve();
  function handle(update) {
    const task=handleQueue.then(()=>handleUpdate(update));handleQueue=task.catch(()=>{});return task;
  }
  async function startPolling() {
    if(env.ADMIN_RECOVERY_BOT==='0' || !env.TELEGRAM_BOT_TOKEN || !owner)return;
    // Refuse a second live instance. Stale locks may be removed after a crash.
    for(let attempt=0;attempt<2;attempt++) {
      try {lockHandle=await fs.open(lockFile,'wx',0o600);await lockHandle.writeFile(String(process.pid));break;}
      catch(e) {
        if(e.code!=='EEXIST')throw e;
        const pid=Number(await fs.readFile(lockFile,'utf8'));
        if(!Number.isSafeInteger(pid)||pid<1){report('recovery_lock_invalid');return;}
        try {process.kill(pid,0);report('recovery_already_running');return;}
        catch(error){if(error.code!=='ESRCH'){report('recovery_already_running');return;}await fs.unlink(lockFile);}
      }
    }
    if(!lockHandle)return;
    controller=new AbortController();
    try {
      const webhook=await call('getWebhookInfo',{});
      if(webhook.url){report('recovery_webhook_present_polling_disabled');await release();return;}
      try {const state=JSON.parse(await fs.readFile(stateFile,'utf8'));offset=Number.isSafeInteger(state.offset)?state.offset:0;for(const [key,entry] of state.requests || [])if(typeof key==='string' && entry && typeof entry.reference==='string' && Number.isFinite(entry.expires)){codes.set(key,entry);if(!entry.used){const timer=setTimeout(()=>{timers.delete(timer);void expire(entry);codes.delete(key);},Math.max(0,entry.expires-now()));timers.add(timer);}}for(const item of state.deletions || [])if(Number.isSafeInteger(Number(item.chatId)) && Number(item.chatId)>0 && Number.isSafeInteger(item.messageId) && Number.isFinite(item.due)){deletions.set(deletionKey(item),item);schedule(item);}}
      catch(e){if(e.code!=='ENOENT')throw e;}
      loop=(async()=>{while(!stopped) {
        try {
          const updates=await call('getUpdates',{offset,timeout:25,allowed_updates:['message','callback_query']});
          for(const update of updates){if(stopped)break;await handle(update);offset=update.update_id+1;await persist();}
        }catch {if(!stopped)await new Promise(r=>{const timer=setTimeout(()=>{timers.delete(timer);finishBackoff=null;r();},2000);finishBackoff=()=>{clearTimeout(timer);timers.delete(timer);finishBackoff=null;r();};timers.add(timer);});}
      }})();
    } catch {report('recovery_start_unavailable');await release();}
  }
  async function release(){if(lockHandle){await lockHandle.close();lockHandle=null;await fs.rm(lockFile,{force:true});}}
  async function close(){stopped=true;controller?.abort();finishBackoff?.();await loop;await handleQueue;for(const timer of timers)clearTimeout(timer);timers.clear();await stateQueue;await release();}
  return {start,handle,startPolling,close};
}
