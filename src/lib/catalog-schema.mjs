// Shared plain-text card contract. Array position is the display order.
export const cardFields = ['title','address','price','oldPrice','pricePerMeter','mortgage','discount'];
export const legacyImage = '/assets/da35e.webp';
export const isMediaPath = value => typeof value === 'string' && /^\/media\/[a-f0-9]{48}\.webp$/.test(value);
export function validateCatalog(data) {
  const errors=[];
  const fail=(path,message)=>errors.push({path,message});
  const object=v=>v && typeof v==='object' && !Array.isArray(v);
  const keys=(v,allowed,path)=>{if(!object(v)){fail(path,'Ожидается объект');return false;}for(const k of Object.keys(v))if(!allowed.includes(k))fail(path+'.'+k,'Неизвестное поле');return true;};
  if(!keys(data,['revision','objects'],'catalog')) return {valid:false,errors};
  if(!Number.isSafeInteger(data.revision) || data.revision<0)fail('revision','Некорректная версия');
  if(!Array.isArray(data.objects) || data.objects.length>100)fail('objects','Не более 100 карточек');
  const ids=new Set();
  for(const [i,p] of (Array.isArray(data.objects)?data.objects:[]).entries()) {
    const path='objects.'+i;
    if(!keys(p,['id','visible','image',...cardFields],path))continue;
    if(typeof p.id!=='string' || !/^[a-zA-Z0-9-]{1,64}$/.test(p.id) || ids.has(p.id))fail(path+'.id','Некорректный или повторный ID');
    ids.add(p.id);
    if(typeof p.visible!=='boolean')fail(path+'.visible','Выберите видимость');
    for(const k of cardFields) {
      const max={title:100,address:160,price:32,oldPrice:32,pricePerMeter:40,mortgage:100,discount:8}[k];
      if(typeof p[k]!=='string' || p[k].length>max || /[\u0000-\u001f\u007f-\u009f]/.test(p[k]) || (['title','address','price'].includes(k) && !p[k].trim()))fail(path+'.'+k,'Заполните поле обычным текстом (до '+max+' символов)');
    }
    if(keys(p.image,['small','large'],path+'.image')) {
      const legacy=p.image.small===legacyImage && p.image.large===legacyImage;
      if(!legacy && (!isMediaPath(p.image.small) || !isMediaPath(p.image.large) || p.image.small===p.image.large))fail(path+'.image','Выберите фотографию');
    }
  }
  return {valid:errors.length===0,errors};
}
export function publicCatalog(catalog) {
  return {revision:catalog.revision,objects:catalog.objects.filter(p=>p.visible).map(({id,visible,...card})=>card)};
}
