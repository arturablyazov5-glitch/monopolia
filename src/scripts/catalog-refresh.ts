// No network until the card region approaches the viewport. No user HTML.
import type { Card } from '../lib/catalog-schema.mjs';
for (const root of document.querySelectorAll<HTMLElement>('[data-catalog]')) {
  const target=root.closest('.buy-mortgage-deals')!;
  const observer=new IntersectionObserver(entries=>{
    if(!entries.some(e=>e.isIntersecting))return;
    observer.disconnect();
    void refresh(root);
  },{rootMargin:'300px'});
  observer.observe(target);
}
async function refresh(root:HTMLElement) {
  try {
    if(!root.dataset.endpoint)return;
    const base=new URL(root.dataset.mediaBase || location.origin,location.origin);
    const response=await fetch(root.dataset.endpoint,{credentials:'omit',signal:AbortSignal.timeout(6000)});
    if(!response.ok)return;
    const data=await response.json();
    if(data.ok!==true || !Number.isSafeInteger(data.revision) || data.revision<=Number(root.dataset.revision) || !Array.isArray(data.objects) || data.objects.length>100)return;
    const template=root.querySelector<HTMLTemplateElement>('template')!;
    const cards:DocumentFragment[]=[];
    for(const p of data.objects as Card[]) {
      if(!['title','address','price','oldPrice','pricePerMeter','mortgage','discount'].every(k=>typeof p[k as keyof Card]==='string') || !p.image)return;
      const imageURL=(src:string)=>{
        // Legacy placeholder is a site asset. Uploaded pictures stay on one allowed origin.
        if(src==='/assets/da35e.webp')return new URL(src,location.origin).href;
        const url=new URL(src,base);
        if(url.origin!==base.origin || !['https:','http:'].includes(url.protocol) || url.username || url.password || !/^\/media\/[a-f0-9]{48}\.webp$/.test(url.pathname) || url.search || url.hash)throw Error();
        return url.href;
      };
      const small=imageURL(p.image.small),large=imageURL(p.image.large);
      const fragment=template.content.cloneNode(true) as DocumentFragment;
      for(const k of ['title','address','price'])fragment.querySelector(`[data-card=${k}]`)!.textContent=p[k as 'title'];
      for(const [selector,value] of [['s',p.oldPrice],['.price p',p.pricePerMeter],['.mortgage',p.mortgage]]) {
        const node=fragment.querySelector(selector)!;node.textContent=value;node.setAttribute('aria-hidden',String(!value));
      }
      const discount=fragment.querySelector<HTMLElement>('.discount')!;
      discount.classList.toggle('badge',Boolean(p.discount));discount.textContent=p.discount;discount.setAttribute('aria-hidden',String(!p.discount));
      const img=fragment.querySelector<HTMLImageElement>('.property-photo img')!;
      img.src=large;img.alt=p.title;
      const source=fragment.querySelector<HTMLSourceElement>('source')!;
      if(p.image.large==='/assets/da35e.webp') {
        const picture=img.closest('picture')!;picture.replaceWith(img);img.width=336;img.height=252;
      } else source.srcset=small+' 360w, '+large+' 680w';
      const button=fragment.querySelector<HTMLElement>('[data-lead]')!;
      button.dataset.subject=p.title;
      button.dataset.leadSource=p.title+' · Кнопка «Записаться на просмотр»';
      cards.push(fragment);
    }
    root.querySelector('.carousel-track')!.replaceChildren(...cards);
    root.querySelector<HTMLElement>('[data-catalog-live]')!.hidden=cards.length===0;
    root.querySelector<HTMLElement>('[data-catalog-empty]')!.hidden=cards.length>0;
    root.querySelector('[data-carousel]')!.dispatchEvent(new Event('catalog-updated'));
    root.dataset.revision=String(data.revision);
  } catch { /* Offline, invalid data or timeout: keep the embedded cards. */ }
}
