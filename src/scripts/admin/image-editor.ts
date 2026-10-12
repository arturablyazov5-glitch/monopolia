// Originals remain in the browser. Canvas exports pixels without EXIF.
export async function preparePhoto(file:File,preview:HTMLCanvasElement):Promise<Blob[]> {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>15*1024*1024)throw Error('Выберите JPEG, PNG или WebP до 15 МБ');
  const bitmap=await createImageBitmap(file);
  try {
    if(bitmap.width*bitmap.height>24e6)throw Error('Фото должно быть не больше 24 мегапикселей');
    const w=Math.min(bitmap.width,bitmap.height*4/3),h=w*3/4,x=(bitmap.width-w)/2,y=(bitmap.height-h)/2;
    if(w<680)throw Error('Ширина кадра должна быть не меньше 680 пикселей');
    preview.getContext('2d')!.drawImage(bitmap,x,y,w,h,0,0,680,510);
    const blobs=[];
    for(const width of [360,680]) {
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=width*3/4;
      canvas.getContext('2d')!.drawImage(bitmap,x,y,w,h,0,0,canvas.width,canvas.height);
      const blob=await new Promise<Blob|null>(done=>canvas.toBlob(done,'image/webp',0.86));
      if(!blob || blob.type!=='image/webp' || blob.size>1572864)throw Error('Не удалось подготовить WebP до 1,5 МБ');
      blobs.push(blob);
    }
    return blobs;
  } finally {bitmap.close();}
}
