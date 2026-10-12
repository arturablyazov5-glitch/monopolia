import data from '../data/properties.json';
import illustration from '../data/closed-base-illustration.json';
import {validateCatalog,type Catalog} from './catalog-schema.mjs';
const validation=validateCatalog(data);
if(!validation.valid)throw Error('Некорректный каталог: '+JSON.stringify(validation.errors));
export const catalog=data as Catalog;
export function selectDeals(source:Catalog=catalog) {
  return source.objects.filter(p=>p.visible).map(p=>({...p,image:p.image.large,cardImage:p.image}));
}
export function selectPreview(){return Array.from({length:9},()=>illustration);}
