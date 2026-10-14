import type {Day} from './bus';
export type Place={lat:number;lng:number;name:string};
export type TripFavorite={id:string;name:string;origin:Place;destination:Place;day:Day};
export const tripStorageKey='jerez-bus-trip-favorites-v1';
function isPlace(value:unknown):value is Place{
 if(!value||typeof value!=='object')return false;
 const p=value as Place;
 return typeof p.name==='string'&&p.name.length<=250&&typeof p.lat==='number'&&typeof p.lng==='number'&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&p.lat>=36.5&&p.lat<=36.9&&p.lng>=-6.4&&p.lng<=-5.9;
}
export function readTripFavorites(raw:string|null):TripFavorite[]{
 try{const data:unknown=JSON.parse(raw??'[]');if(!Array.isArray(data))return [];
 return data.filter((f):f is TripFavorite=>!!f&&typeof f==='object'&&typeof f.id==='string'&&typeof f.name==='string'&&f.name.length<=50&&isPlace(f.origin)&&isPlace(f.destination)&&['laborables','sabados','festivos'].includes(f.day)).slice(-12);
 }catch{return [];}
}
export function saveTripFavorite(current:TripFavorite[],item:TripFavorite){
 const same=(p:Place,q:Place)=>Math.abs(p.lat-q.lat)<0.00001&&Math.abs(p.lng-q.lng)<0.00001;
 const existing=current.find(f=>same(f.origin,item.origin)&&same(f.destination,item.destination)&&f.day===item.day);
 return existing?current.map(f=>f.id===existing.id?{...item,id:f.id}:f):[...current,item].slice(-12);
}
