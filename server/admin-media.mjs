import { AdminError } from './admin-storage.mjs';
export const budgets={360:1572864,680:1572864};
const bad=()=>{throw new AdminError(422,'webp','Нужен статический WebP без метаданных, с допустимыми размерами');};
export function inspectWebP(b, expected) {
  if(!Buffer.isBuffer(b) || b.length<20 || b.toString('ascii',0,4)!=='RIFF' || b.toString('ascii',8,12)!=='WEBP' || b.readUInt32LE(4)+8!==b.length) bad();
  let offset=12, image=null, extended=null, alpha=false; const chunks=[];
  while(offset<b.length) {
    if(offset+8>b.length) bad();
    const tag=b.toString('ascii',offset,offset+4),size=b.readUInt32LE(offset+4),start=offset+8,end=start+size;
    if(end>b.length || !['VP8 ','VP8L','VP8X','ALPH','ICCP'].includes(tag) || chunks.includes(tag)) bad();
    const p=b.subarray(start,end); chunks.push(tag);
    if(tag==='VP8X') {
      if(offset!==12 || size!==10 || (p[0]&~0x30)!==0 || p[1] || p[2] || p[3]) bad();
      extended={width:p.readUIntLE(4,3)+1,height:p.readUIntLE(7,3)+1};
    } else if(tag==='VP8 ') {
      if(image || size<10 || (p[0]&1)!==0 || p[3]!==0x9d || p[4]!==1 || p[5]!==0x2a) bad();
      image={width:p.readUInt16LE(6)&0x3fff,height:p.readUInt16LE(8)&0x3fff};
    } else if(tag==='VP8L') {
      if(image || size<5 || p[0]!==0x2f) bad();
      const bits=p.readUInt32LE(1); if(bits>>>29) bad();
      image={width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1};
    } else if(tag==='ICCP') {
      // Canvas includes a colour profile; it is not EXIF or animation data.
      if(!extended || image || size<128 || !(b[20]&0x20)) bad();
    } else { if(!extended || image || size<1) bad(); alpha=true; }
    offset=end+(size%2); if(offset>b.length || (size%2 && b[end]!==0)) bad();
  }
  if(!image || offset!==b.length || (extended && (image.width!==extended.width || image.height!==extended.height)) || (alpha && !chunks.includes('VP8 '))) bad();
  const {width,height}=image;
  if(!budgets[width] || b.length>budgets[width] || (expected && width!==expected) || height!==width*3/4) bad();
  return {width,height,bytes:b.length};
}
