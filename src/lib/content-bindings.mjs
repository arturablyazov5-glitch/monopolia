import {siteTexts} from '../data/site-texts.mjs';
import { plainE } from './user-copy.mjs';
export { plainE, normalizeVisibleCopy } from './user-copy.mjs';
export const normalizeText = text => plainE(text).replace(/[\t\r\n ]+/g,' ').trim();
const decode = text => text.replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&nbsp;/g,'\u00a0').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#(?:39|x27);/g,"'");
const byText = new Map();
for (const item of siteTexts) {
 byText.set(normalizeText(item.defaultValue), {id:item.id,part:-1});
 if(item.lines) item.defaultValue.split('\n').forEach((line,part)=>byText.set(normalizeText(line),{id:item.id,part}));
}
// Bind direct text nodes, including mixed headings/buttons, without new elements.
// Source defaults have already been escaped by Astro. Never rewrite script/style,
// attributes, comments or raw user HTML. Each slot is a direct child text index.
export function bindContent(html) {
 const tokens=html.match(/<!--[\s\S]*?-->|<(script|style|textarea)\b[^>]*>[\s\S]*?<\/\1\s*>|<[^>]*(?:"[^"]*"[^>]*|'[^']*'[^>]*)*>|[^<]+/gi)||[];
 const stack=[],bindings=new Map();
 for(let i=0;i<tokens.length;i++) {
  const token=tokens[i];
  if(token.startsWith('<!--')||/^<(script|style|textarea)\b/i.test(token)||/^<!/i.test(token))continue;
  if(token.startsWith('</')) { const name=token.match(/^<\/([^\s>]+)/)?.[1]?.toLowerCase();for(let j=stack.length-1;j>=0;j--)if(stack[j].name===name){stack.length=j;break;}continue; }
  if(token.startsWith('<')) {const name=token.match(/^<([^\s/>]+)/)?.[1]?.toLowerCase();if(name&&!/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(name)&&!token.endsWith('/>'))stack.push({name,index:i,textIndex:0,blocked:stack.at(-1)?.blocked||['svg','template'].includes(name),manual:/data-content-id\s*=/.test(token),off:stack.at(-1)?.off||/data-content-bind\s*=\s*["']?off/i.test(token)});continue;}
  const parent=stack.at(-1);if(!parent)continue;const slot=parent.textIndex++;
  if(parent.blocked||parent.manual||parent.off)continue;
  const match=byText.get(normalizeText(decode(token)));if(!match)continue;
  const list=bindings.get(parent.index)||[];list.push({...match,slot});bindings.set(parent.index,list);
 }
 for(const [index,list] of bindings)tokens[index]=tokens[index].replace(/>$/,` data-content-id="${list.map(x=>x.id).join(' ')}" data-content-slots="${list.map(x=>x.slot).join(' ')}" data-content-parts="${list.map(x=>x.part).join(' ')}">`);
 return tokens.join('');
}
