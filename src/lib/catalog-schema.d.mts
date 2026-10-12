export interface Image {small:string;large:string}
export interface Card {title:string;address:string;price:string;oldPrice:string;pricePerMeter:string;mortgage:string;discount:string;image:Image}
export interface Property extends Card {id:string;visible:boolean}
export interface Catalog {revision:number;objects:Property[]}
export interface FieldError {path:string;message:string}
export const cardFields:string[];
export const legacyImage:string;
export function isMediaPath(value:unknown):boolean;
export function validateCatalog(data:unknown):{valid:boolean;errors:FieldError[]};
export function publicCatalog(catalog:Catalog):{revision:number;objects:Card[]};
