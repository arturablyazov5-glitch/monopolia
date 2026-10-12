import * as fs from 'node:fs/promises';
import {constants} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateCatalog,isMediaPath,legacyImage} from '../src/lib/catalog-schema.mjs';
import {inspectWebP} from './admin-media.mjs';
export class AdminError extends Error {
  constructor(status,code,message,fields){super(message);Object.assign(this,{status,code,fields});}
}
export async function atomic(path,bytes) {
  const tmp=path+'.'+randomBytes(12).toString('hex')+'.tmp';
  let handle;
  try {
    handle=await fs.open(tmp,constants.O_CREAT|constants.O_EXCL|constants.O_WRONLY,0o600);
    await handle.writeFile(bytes);await handle.sync();await handle.close();handle=null;
    await fs.rename(tmp,path);
    const dir=await fs.open(dirname(path),'r');try{await dir.sync();}finally{await dir.close();}
  } finally {if(handle)await handle.close();await fs.rm(tmp,{force:true});}
}
export class Storage {
  constructor(root){this.root=resolve(root);this.file=resolve(this.root,'properties.json');this.media=resolve(this.root,'media');this.queue=Promise.resolve();}
  async init() {
    await fs.mkdir(this.root,{recursive:true,mode:0o700});
    if((await fs.lstat(this.root)).isSymbolicLink())throw Error('DATA_DIR must not be a symlink');
    await fs.mkdir(this.media,{recursive:true,mode:0o700});
    if((await fs.lstat(this.media)).isSymbolicLink())throw Error('media must not be a symlink');
    try{await fs.lstat(this.file);}catch(e){if(e.code!=='ENOENT')throw e;await atomic(this.file,await fs.readFile(fileURLToPath(new URL('../src/data/properties.json',import.meta.url))));}
    await this.catalog();
  }
  async catalog() {
    const h=await fs.open(this.file,constants.O_RDONLY|constants.O_NOFOLLOW);
    try {
      if((await h.stat()).size>256*1024)throw Error('Catalog too large');
      const data=JSON.parse(await h.readFile('utf8'));
      if(!validateCatalog(data).valid)throw Error('Invalid catalog');
      return data;
    } finally {await h.close();}
  }
  save(input) {
    const task=this.queue.then(async()=>{
      if(!input || Object.keys(input).some(k=>!['baseRevision','objects'].includes(k)))throw new AdminError(422,'fields','Неизвестные поля запроса');
      const previous=await this.catalog();
      if(input.baseRevision!==previous.revision)throw new AdminError(409,'revision','Каталог изменён в другой вкладке. Поля остались в форме; загрузите свежую версию.');
      const next={revision:previous.revision+1,objects:input.objects},v=validateCatalog(next);
      if(!v.valid)throw new AdminError(422,'validation','Исправьте поля',v.errors);
      for(const p of next.objects)if(p.image.large!==legacyImage) {
        for(const [k,w] of [['small',360],['large',680]]) {
          const bytes=await this.readMedia(p.image[k]);inspectWebP(bytes,w);
        }
      }
      await atomic(this.file+'.bak',JSON.stringify(previous,null,2)+'\n');
      await atomic(this.file,JSON.stringify(next,null,2)+'\n');
      return next;
    });
    this.queue=task.catch(()=>{});return task;
  }
  async upload(bytes) {
    const info=inspectWebP(bytes);
    const name=randomBytes(24).toString('hex')+'.webp';
    await fs.writeFile(resolve(this.media,name),bytes,{flag:'wx',mode:0o600});
    return {src:'/media/'+name,...info};
  }
  async readMedia(src) {
    if(!isMediaPath(src))throw new AdminError(404,'media','Фото отсутствует');
    const h=await fs.open(resolve(this.media,src.slice('/media/'.length)),constants.O_RDONLY|constants.O_NOFOLLOW);
    try{const s=await h.stat();if(!s.isFile() || s.size>1572864)throw new AdminError(413,'size','Фото превышает лимит');return await h.readFile();}finally{await h.close();}
  }
  async close(){await this.queue;}
}
