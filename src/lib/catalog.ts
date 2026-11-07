import data from '../data/properties.json';
import illustration from '../data/closed-base-illustration.json';
import {validateCatalog,normalizeCatalog,type Catalog} from './catalog-schema.mjs';
const normalized=normalizeCatalog(data);
const validation=validateCatalog(normalized);
if(!validation.valid)throw Error('Некорректный каталог: '+JSON.stringify(validation.errors));
export const catalog=normalized as Catalog;
export function selectDeals(source:Catalog=catalog) {
  return source.objects.filter(p=>p.visible&&p.image).map(p=>({...p,image:p.image!.large,cardImage:p.image}));
}
export function selectPreview(){return illustration;}
