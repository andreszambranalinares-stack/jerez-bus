import type {Schedule} from './bus';
export type ClientSchedule={schedule?:Schedule;notice?:string;error?:string};
const requests=new Map<string,{expires:number;promise:Promise<ClientSchedule>}>();
// Coalesce simultaneous requests from nearby stops, route cards and favorites.
// Keep this short; the official-source endpoint owns its own freshness policy.
export function getClientSchedule(line:string,stop:string):Promise<ClientSchedule>{
 const key=line+'-'+stop,current=requests.get(key);
 if(current&&current.expires>Date.now())return current.promise;
 if(requests.size>250)requests.clear();
 const promise=fetch(`/api/horarios?line=${encodeURIComponent(line)}&stop=${encodeURIComponent(stop)}`,{signal:AbortSignal.timeout(15000)})
  .then(r=>r.json() as Promise<ClientSchedule>).catch(()=>({error:'Horario no disponible. Reintenta la consulta.'}));
 const entry={promise,expires:Date.now()+30000};requests.set(key,entry);
 void promise.then(data=>{if(data.error&&requests.get(key)===entry)requests.delete(key);});
 return promise;
}
