import {findJourneys,plannerStops,type Journey} from './journeys';
import coordinates from './stop-coordinates.json';
import type {Place} from './trip-favorites';
export type Nearby={id:string;name:string;lat:number;lng:number;distance:number;walk:number;lineIds:string[]};
export type LocationOption={journey:Journey;start:Nearby;end:Nearby;times:string[];notice?:string};
const points=coordinates.stops as Record<string,{lat:number;lng:number}>;
function distance(a:Place,b:{lat:number;lng:number}){const rad=Math.PI/180;const dlat=(b.lat-a.lat)*rad,dlng=(b.lng-a.lng)*rad;const h=Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlng/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}
export function nearbyStops(place:Place):Nearby[]{return plannerStops.filter(s=>points[s.id]).map(s=>{const p=points[s.id];const d=distance(place,p);return {...p,id:s.id,name:s.name,lineIds:s.lineIds,distance:Math.round(d),walk:Math.max(1,Math.ceil(d*1.35/75))};}).filter(s=>s.distance<=1200).sort((a,b)=>a.distance-b.distance).slice(0,7);}
export function locationCandidates(starts:Nearby[],ends:Nearby[]):LocationOption[]{
 const candidates:LocationOption[]=[];
 for(const start of starts)for(const end of ends)for(const journey of findJourneys(start.id,end.id))candidates.push({journey,start,end,times:[]});
 candidates.sort((a,b)=>a.journey.legs.length-b.journey.legs.length||(a.start.walk+a.end.walk+a.journey.totalStops)-(b.start.walk+b.end.walk+b.journey.totalStops));
 const groups=new Map<string,LocationOption[]>();
 for(const candidate of candidates){const key=candidate.journey.legs.map(l=>l.lineId).join('-');const group=groups.get(key)??[];if(group.length<2&&!group.some(c=>c.start.id===candidate.start.id)){group.push(candidate);groups.set(key,group);}}
 // First cover different buses, then include another boarding stop for each bus.
 const all=[...groups.values()].slice(0,9);return [...all.map(g=>g[0]),...all.flatMap(g=>g.slice(1))];
}
