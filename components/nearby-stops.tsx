'use client';
import {useEffect,useState} from 'react';
import {MapPin,Footprints} from 'lucide-react';
import {nearbyStops} from '@/lib/location-journeys';
import {lines,minutes,type Day} from '@/lib/bus';
import type {Place} from '@/lib/trip-favorites';
import {getClientSchedule,type ClientSchedule as Result} from '@/lib/client-schedules';
export default function NearbyStops({origin,day,time,onConsult}:{origin:Place;day:Day;time:string;onConsult?:(line:string,stop:string,day:Day,time:string)=>void}){
 const stops=nearbyStops(origin).slice(0,3);const key=stops.map(s=>s.id).join('-');const [results,setResults]=useState<Record<string,Result>>({});
 useEffect(()=>{let active=true;setResults({});
  for(const stop of stops)for(const line of stop.lineIds){const id=line+'-'+stop.id;getClientSchedule(line,stop.id).then(data=>{if(active)setResults(current=>({...current,[id]:data}));}).catch(()=>{if(active)setResults(current=>({...current,[id]:{error:'Horario no disponible'} }));});}
  return()=>{active=false;};
 },[key]);
 return <section className="nearby-section" aria-label="Paradas cercanas"><h3><MapPin size={18}/> Paradas cerca de tu salida</h3><p>Estos buses pasan por aquí. Busca un destino para ver cuáles te llevan.</p>{!stops.length&&<p>No hay paradas con coordenadas disponibles a menos de 1,2 km. Prueba otra zona o busca por parada.</p>}<div className="nearby-grid">{stops.map(stop=><article className="nearby-card" key={stop.id}><div className="nearby-heading"><strong>{stop.name}</strong><span><Footprints size={13}/> {stop.walk} min aprox.</span></div><div className="nearby-lines">{stop.lineIds.map(id=>{const result=results[id+'-'+stop.id];const next=result?.schedule?.[day]?.find(t=>minutes(t)>=minutes(time)+stop.walk+3);return <button key={id} disabled={!onConsult} onClick={()=>onConsult?.(id,stop.id,day,time)} title="Consultar esta línea y parada"><b>{lines.find(l=>l.id===id)?.code??id}</b><span>{!result?'Consultando…':result.error?'Sin datos':next??'Sin más salidas'}<small>programado</small></span></button>;})}</div>{stop.lineIds.some(id=>results[id+'-'+stop.id]?.notice)&&<p className="nearby-notice">{stop.lineIds.map(id=>results[id+'-'+stop.id]?.notice).find(Boolean)}</p>}</article>)}</div><p className="nearby-note">Horas con margen para el paseo. Si quieres salir otro día, cambia la fecha y hora.</p></section>;
}
