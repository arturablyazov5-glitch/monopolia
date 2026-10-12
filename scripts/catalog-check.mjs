import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCatalog} from '../src/lib/catalog-schema.mjs';
export function check(path='src/data/properties.json') {
  const data=JSON.parse(readFileSync(path,'utf8')),result=validateCatalog(data);
  if(!result.valid)throw Error(JSON.stringify(result.errors));
  return data;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {console.log('Каталог: '+check(process.argv[2]).objects.length+' карточки; схема корректна');}
  catch {console.error('Каталог не прошёл проверку схемы');process.exitCode=1;}
}
