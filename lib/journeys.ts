import snapshot from './snapshot.json';
import {lines,type Stop} from './bus';

export type PlannerStop={id:string;name:string;label:string;lineIds:string[]};
export type JourneyLeg={lineId:string;from:PlannerStop;to:PlannerStop;fromStopId:string;toStopId:string;stopCount:number};
export type Journey={id:string;kind:'direct'|'transfer';legs:JourneyLeg[];totalStops:number};

const stopData=snapshot.stops as Record<string,Stop[]>;
const normalize=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const urbanLines=lines.filter(line=>line.kind==='urbano');
const routeNodes:Record<string,{nodeId:string;stopId:string}[]>={};
const stopMap=new Map<string,{name:string;lineIds:Set<string>}>();
for(const line of lines){routeNodes[line.id]=(stopData[line.id]??[]).map(stop=>{
 const nodeId=line.kind==='urbano'?stop.id:`institute-${normalize(stop.name)}`;const item=stopMap.get(nodeId)??{name:stop.name,lineIds:new Set<string>()};item.lineIds.add(line.id);stopMap.set(nodeId,item);return {nodeId,stopId:stop.id};
});
}
const rawStops=[...stopMap].map(([id,item])=>{const lineIds=[...item.lineIds];const codes=[...new Set(lineIds.map(lineId=>lines.find(line=>line.id===lineId)?.code??lineId))];const institute=id.startsWith('institute-');return {id,name:item.name,lineIds,base:`${item.name} · ${institute?'especiales de institutos':'líneas '+codes.join(', ')}`};});
const labelCounts=new Map<string,number>();for(const stop of rawStops)labelCounts.set(stop.base,(labelCounts.get(stop.base)??0)+1);
export const plannerStops:PlannerStop[]=rawStops.map(stop=>({id:stop.id,name:stop.name,lineIds:stop.lineIds,label:labelCounts.get(stop.base)!>1?`${stop.base} · parada ${stop.id}`:stop.base})).sort((a,b)=>a.name.localeCompare(b.name,'es',{sensitivity:'base'}));
const plannerMap=new Map(plannerStops.map(stop=>[stop.id,stop]));

function leg(lineId:string,fromId:string,toId:string):JourneyLeg|null{
 const route=routeNodes[lineId]??[];let best:{from:number;to:number}|null=null;
 for(let from=0;from<route.length;from++)if(route[from].nodeId===fromId)for(let to=from+1;to<route.length;to++)if(route[to].nodeId===toId&&(!best||to-from<best.to-best.from))best={from,to};
 if(!best)return null;const from=plannerMap.get(fromId);const to=plannerMap.get(toId);return from&&to?{lineId,from,to,fromStopId:route[best.from].stopId,toStopId:route[best.to].stopId,stopCount:best.to-best.from}:null;
}

export function findJourneys(fromId:string,toId:string):Journey[]{
 if(!fromId||!toId||fromId===toId)return [];
 const direct:Journey[]=[];const transferBest=new Map<string,Journey>();
 for(const line of lines){const item=leg(line.id,fromId,toId);if(item)direct.push({id:`direct-${line.id}`,kind:'direct',legs:[item],totalStops:item.stopCount});}
 for(const first of urbanLines){
  const route=routeNodes[first.id]??[];const originIndexes=route.map((stop,index)=>stop.nodeId===fromId?index:-1).filter(index=>index>=0);
  for(const originIndex of originIndexes)for(let transferIndex=originIndex+1;transferIndex<route.length-1;transferIndex++){
   const transferId=route[transferIndex].nodeId;if(transferId===toId)continue;
   for(const second of urbanLines){if(second.id===first.id)continue;const secondLeg=leg(second.id,transferId,toId);if(!secondLeg)continue;
    const firstLeg=leg(first.id,fromId,transferId);if(!firstLeg)continue;const pair=`${first.id}-${second.id}`;const candidate:Journey={id:`transfer-${pair}-${transferId}`,kind:'transfer',legs:[firstLeg,secondLeg],totalStops:firstLeg.stopCount+secondLeg.stopCount};const current=transferBest.get(pair);if(!current||candidate.totalStops<current.totalStops)transferBest.set(pair,candidate);
   }
  }
 }
 const byQuality=(a:Journey,b:Journey)=>a.totalStops-b.totalStops||a.legs.map(item=>Number(item.lineId)).reduce((x,y)=>x+y,0)-b.legs.map(item=>Number(item.lineId)).reduce((x,y)=>x+y,0);
 return [...direct.sort(byQuality),...[...transferBest.values()].sort(byQuality)].slice(0,12);
}
