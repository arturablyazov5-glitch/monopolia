import * as fs from 'node:fs/promises';
import {constants} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {siteTexts} from '../src/data/site-texts.mjs';
import {officeHourTextIds,parseOfficeHoursLine} from '../src/lib/office-hours.mjs';
import {atomic,AdminError} from './admin-storage.mjs';
const require=createRequire(import.meta.url);
const {typografizeProtected}=require('../scripts/typograf/rules.cjs');
const definitions=new Map(siteTexts.map(item=>[item.id,item]));
const plain=value=>value.replace(/\t/g,' ').replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g,'').replace(/\r\n?/g,'\n').trim();
export class ContentStorage {
 constructor(root){this.file=resolve(root,'content.json');this.queue=Promise.resolve();}
 async read(){
  let h;try{h=await fs.open(this.file,constants.O_RDONLY|constants.O_NOFOLLOW);if((await h.stat()).size>256*1024)throw Error('Content too large');const data=JSON.parse(await h.readFile('utf8'));if(!Number.isSafeInteger(data.revision)||data.revision<0||!data.overrides||typeof data.overrides!=='object'||Array.isArray(data.overrides))throw Error('Invalid content');for(const [id,value] of Object.entries(data.overrides))if(!definitions.has(id)||typeof value!=='string'||!value.trim()||value.length>definitions.get(id).maxLength||/[<>]/.test(value))throw Error('Invalid text');return data;}catch(e){if(e.code==='ENOENT')return {revision:0,overrides:{}};throw e;}finally{await h?.close();}
 }
 async admin(){return {...await this.read(),items:siteTexts};}
 async public(){const data=await this.read();const tag='"content-'+createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0,24)+'"';return {data,tag};}
 save(input){const task=this.queue.then(async()=>{
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['baseRevision','changes'].includes(k))||!input.changes||typeof input.changes!=='object'||Array.isArray(input.changes)||Object.keys(input.changes).length>siteTexts.length)throw new AdminError(422,'fields','Некорректный список текстов');
  const current=await this.read();if(input.baseRevision!==current.revision)throw new AdminError(409,'revision','Тексты изменены в другой вкладке. Загрузите свежую версию; ваши поля останутся в форме.');
  const overrides={...current.overrides};
  for(const [id,raw] of Object.entries(input.changes)){
   const item=definitions.get(id);if(!item)throw new AdminError(422,'id','Неизвестный текст');
   if(raw===null){delete overrides[id];continue;}
   if(typeof raw!=='string'||raw.length>item.maxLength)throw new AdminError(422,'length','Превышен лимит текста: '+item.label);
   const clean=plain(raw);if(!clean)throw new AdminError(422,'empty','Текст не может быть пустым');
   if(item.lines && clean.split('\n').length!==item.lines)throw new AdminError(422,'lines','Сохраните число строк текста: '+item.lines);
   if(/[<>]/.test(clean))throw new AdminError(422,'html','HTML запрещён. Введите простой текст.');
   // Typography only here, once, with the site's existing rules.
   const value=typografizeProtected(clean, {}, []);if(typeof value!=='string'||value.length>item.maxLength)throw new AdminError(422,'length','Превышен лимит текста');
   if(officeHourTextIds.includes(id)){
    try{parseOfficeHoursLine(value);}catch(error){throw new AdminError(422,'hours',error.message);}
   }
   if(clean===item.defaultValue||value===item.defaultValue)delete overrides[id];else overrides[id]=value;
  }
  const next={revision:current.revision+1,overrides};
  if(Buffer.byteLength(JSON.stringify(next))>256*1024)throw new AdminError(413,'size','Превышен общий размер текстов');
  await atomic(this.file,JSON.stringify(next,null,2)+'\n');return {...next,items:siteTexts};
 });this.queue=task.catch(()=>{});return task;}
 async close(){await this.queue;}
}
