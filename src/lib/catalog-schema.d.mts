export interface Image {small:string;large:string}
export interface Card {title:string;address:string;price:string;oldPrice:string;pricePerMeter:string;mortgage:string;discount:string;image:Image;city?:string}
export interface Property {
  id:string;visible:boolean;image:Image|null;
  kind:string;rooms:number|null;area:number|null;floor:number|null;floors:number|null;landArea:number|null;
  settlement:string;settlementKind:string;street:string;streetKind:string;house:string;
  city:string;price:number;oldPrice:number|null;mortgage:string;title:string;address:string;
}
export interface TrashItem extends Property {deletedAt:number}
export interface Catalog {revision:number;objects:Property[];trash?:TrashItem[]}
export interface FieldError {path:string;message:string}
export const cardFields:string[];
export const legacyImage:string;
export const TRASH_TTL:number;
export const propertyKinds:Record<string,string>;
export const kindOptions:[string,string][];
export const settlementPrefixes:Record<string,string>;
export const settlementOptions:[string,string][];
export const streetPrefixes:Record<string,string>;
export const streetOptions:[string,string][];
export const displayCities:string[];
export function isMediaPath(value:unknown):boolean;
export function parseMoney(value:unknown):number|null;
export function formatMoney(value:unknown):string;
export function pricePerMeterValue(p:Property):string;
export function discountValue(p:Property):string;
export function buildTitle(p:Partial<Property>):string;
export function buildAddress(p:Partial<Property>):string;
export function parseLegacyAddress(address:string):{settlement:string;settlementKind:string;street:string;streetKind:string;house:string}|null;
export function parseLegacyTitle(title:string):{kind:string;rooms:number|null;area:number|null;floor:number|null;floors:number|null;landArea:number|null};
export function normalizeProperty(p:any):Property;
export function normalizeCatalog(data:any):Catalog;
export function validateCatalog(data:unknown):{valid:boolean;errors:FieldError[]};
export function publicCatalog(catalog:Catalog):{revision:number;objects:Card[]};
