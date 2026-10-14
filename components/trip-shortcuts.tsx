'use client';
import {useEffect,useState} from 'react';
import {Star,Trash2,X} from 'lucide-react';
import {readTripFavorites,tripStorageKey,type TripFavorite} from '@/lib/trip-favorites';
import LocationPlanner from '@/components/location-planner';
export default function TripShortcuts(){
 const [favorites,setFavorites]=useState<TripFavorite[]>([]),[selected,setSelected]=useState<TripFavorite|null>(null),[request,setRequest]=useState(0),[error,setError]=useState('');
 useEffect(()=>{const read=()=>{try{setFavorites(readTripFavorites(localStorage.getItem(tripStorageKey)));}catch{}};read();window.addEventListener('jerez-trips-changed',read);window.addEventListener('storage',read);return()=>{window.removeEventListener('jerez-trips-changed',read);window.removeEventListener('storage',read);};},[]);
 const remove=(id:string)=>{const next=favorites.filter(f=>f.id!==id);try{localStorage.setItem(tripStorageKey,JSON.stringify(next));setFavorites(next);if(selected?.id===id)setSelected(null);setError('');}catch{setError('No se pudo eliminar el favorito.');}};
 if(!favorites.length&&!selected&&!error)return null;
 return <section className="favorites-section trip-shortcuts" aria-labelledby="trip-shortcuts-title"><div className="favorites-head"><div><span className="small-label">A UN TOQUE</span><h2 id="trip-shortcuts-title">Tus rutas favoritas</h2></div></div>{favorites.length?<div className="favorite-row">{favorites.map(f=><div className={'favorite-card '+(selected?.id===f.id?'active':'')} key={f.id}><button className="favorite-open" onClick={()=>{setSelected(f);setRequest(r=>r+1);}}><Star size={17} fill="currentColor"/><span><strong>{f.name}</strong><small>{f.origin.name} → {f.destination.name}</small></span></button><button className="delete-favorite" onClick={()=>remove(f.id)} aria-label={`Eliminar ruta ${f.name}`}><Trash2 size={16}/></button></div>)}</div>:<p className="favorites-empty">Guarda un viaje en «Cómo llegar» y aparecerá aquí, con su ruta y sus horas a un toque.</p>}{error&&<p role="alert">{error}</p>}{selected&&<div className="shortcut-result"><button className="shortcut-close" onClick={()=>setSelected(null)} aria-label="Cerrar ruta favorita"><X size={18}/></button><LocationPlanner key={request} favorite={selected} compact/></div>}</section>;
}
