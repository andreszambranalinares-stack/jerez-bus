'use client';
import {useEffect,useState} from 'react';
import {ExternalLink,Footprints} from 'lucide-react';
import type {Nearby} from '@/lib/location-journeys';
import type {Place} from '@/lib/trip-favorites';

export default function LastWalk({stop,destination}:{stop:Nearby;destination:Place}){
 const [open,setOpen]=useState(false),[address,setAddress]=useState<string|null>(null),[loading,setLoading]=useState(false);
 useEffect(()=>{
  if(!open)return;
  let active=true;const controller=new AbortController();setLoading(true);
  void fetch('/api/lugares/reverse',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lat:stop.lat,lng:stop.lng}),signal:controller.signal})
   .then(async r=>r.ok?await r.json() as {name?:string|null}:null).then(data=>{if(active)setAddress(typeof data?.name==='string'?data.name:null);})
   .catch(()=>{if(active)setAddress(null);}).finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;controller.abort();};
 },[open,stop.lat,stop.lng]);
 const route=`https://www.google.com/maps/dir/?api=1&origin=${stop.lat},${stop.lng}&destination=${destination.lat},${destination.lng}&travelmode=walking`;
 return <details className="last-walk" onToggle={e=>setOpen(e.currentTarget.open)}>
  <summary><Footprints size={17}/> Ver último tramo</summary>
  {open&&<div className="last-walk-content">
   <p><strong>Desde la parada {stop.name}</strong><span>Parada {stop.id} · Jerez de la Frontera</span><span aria-live="polite">{loading?'Buscando la calle de la parada…':address?`Calle cercana: ${address}`:'Dirección no disponible. El mapa usa la ubicación de la parada.'}</span></p>
   <p><strong>Camina desde {stop.name} hasta {destination.name}</strong><span>{stop.walk} min a pie aprox. desde esta parada hasta tu destino.</span></p>
   <a href={route} target="_blank" rel="noopener noreferrer">Ver recorrido a pie en el mapa <ExternalLink size={15}/></a>
   <p className="last-walk-note">El mapa calcula el recorrido por calles desde esta parada. El tiempo de aquí es aproximado.</p>
  </div>}
 </details>;
}
