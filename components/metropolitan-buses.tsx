'use client';
import {useEffect,useState} from 'react';
import {ExternalLink,RefreshCw,Info,CalendarDays} from 'lucide-react';
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty} from '@/components/ui/combobox';
import {Checkbox} from '@/components/ui/checkbox';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {Table,TableBody,TableRow,TableHead,TableCell} from '@/components/ui/table';
import catalogue from '@/lib/metropolitan-lines.json';
import {madridClock} from '@/lib/bus';
import type {MetroResult} from '@/lib/metropolitan';
export default function MetropolitanBuses(){
 const [onlyJerez,setOnlyJerez]=useState(true);const [line,setLine]=useState('16');const [date,setDate]=useState('');
 const [result,setResult]=useState<MetroResult|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [refresh,setRefresh]=useState(0);
 const selected=catalogue.find(l=>l.id===line)!;
 const options=catalogue.filter(l=>!onlyJerez||l.jerez).map(l=>l.code+' · '+l.name);
 useEffect(()=>setDate(madridClock().date),[]);
 useEffect(()=>{
  if(!date)return;
  let active=true;const controller=new AbortController();const key='jerez-bus-metro-'+line+'-'+date;
  let saved:MetroResult|null=null;
  try{saved=JSON.parse(localStorage.getItem(key)??'null');}catch{}
  setResult(saved?{...saved,fallback:true}:null);setBusy(true);setError('');
  fetch('/api/metropolitanos?line='+line+'&date='+date+'&refresh='+(refresh?'1':'0'),{signal:controller.signal})
   .then(async r=>{const data=await r.json() as MetroResult&{error?:string};if(!r.ok)throw new Error(data.error);return data;})
   .then(data=>{if(!active)return;setResult(data);try{localStorage.setItem(key,JSON.stringify(data));}catch{}})
   .catch(e=>{if(active&&!controller.signal.aborted){setError(e.message);if(saved)setResult({...saved,fallback:true,notice:'Sin conexión con el Consorcio. Consulta guardada para esta fecha.'});}})
   .finally(()=>{if(active)setBusy(false);});
  return()=>{active=false;controller.abort();};
 },[line,date,refresh]);
 return <section className="metro-panel" aria-labelledby="metro-title">
  <div className="metro-heading"><div><span className="small-label">CONSORCIO BAHÍA DE CÁDIZ</span><h1 id="metro-title">Autobuses metropolitanos</h1><p>{catalogue.length} líneas · {catalogue.filter(l=>l.jerez).length} conectan con Jerez</p></div><span className="metro-mark">M</span></div>
  <div className="metro-filter"><Checkbox id="only-jerez" checked={onlyJerez} onCheckedChange={value=>{setOnlyJerez(value===true);if(value===true&&!selected.jerez)setLine('16');}}/><label htmlFor="only-jerez">Mostrar solo conexiones de Jerez</label></div>
  <div className="metro-controls"><div><label id="metro-line-label">Línea y recorrido</label><Combobox items={options} value={selected.code+' · '+selected.name} onValueChange={value=>{const item=catalogue.find(l=>l.code+' · '+l.name===value);if(item)setLine(item.id);}}><ComboboxInput aria-labelledby="metro-line-label" placeholder="Busca línea o destino…" className="stop-combobox"/><ComboboxContent><ComboboxEmpty>No hay líneas con ese nombre.</ComboboxEmpty><ComboboxList>{(name:string)=><ComboboxItem key={name} value={name} className="stop-option">{name}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></div><div><label htmlFor="metro-date">Día del viaje</label><div className="date-input"><CalendarDays size={17}/><input id="metro-date" type="date" value={date} onChange={e=>{if(e.target.value)setDate(e.target.value);}}/></div></div></div>
  <div className="metro-source-head"><p>Horarios oficiales para el día elegido, con frecuencia y observaciones.</p><Button variant="ghost" size="icon" disabled={busy} onClick={()=>setRefresh(r=>r+1)} aria-label="Volver a consultar el Consorcio"><RefreshCw size={18} className={busy?'spinning':''}/></Button></div>
  <div aria-live="polite" aria-busy={busy}>
   {busy&&!result&&<div className="metro-loading"><Skeleton className="h-12 w-full"/><Skeleton className="h-24 w-full"/><p>Consultando el Consorcio…</p></div>}
   {(error||result?.notice)&&<div className="notice"><Info size={18}/><p>{result?.notice??error}</p></div>}
   {result?.blocks.map((block,index)=><section className="metro-table-block" key={index}><div className="table-title"><h2>{block.direction}</h2><span>{block.period}</span></div><p className="scroll-tip">Desliza la tabla para ver todas las paradas.</p><Table className="metro-timetable"><TableBody>{block.rows.map((row,i)=><TableRow key={i}>{row.map((cell,j)=>cell.header?<TableHead key={j} colSpan={cell.colSpan} rowSpan={cell.rowSpan}>{cell.text}</TableHead>:<TableCell key={j} colSpan={cell.colSpan} rowSpan={cell.rowSpan}>{cell.text||'—'}</TableCell>)}</TableRow>)}</TableBody></Table></section>)}
   {result&&!result.blocks.length&&<div className="metro-empty"><strong>Sin servicio publicado para esta fecha.</strong><p>El Consorcio no devuelve horarios para el día seleccionado. Puedes cambiar la fecha o consultar la fuente.</p></div>}
  </div>
  <div className="source-row metro-source"><span>{busy?'Comprobando horarios…':result?(result.fallback?'Consulta guardada':'Consultado')+' · '+new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(result.fetchedAt)):''}</span><a href={selected.url} target="_blank" rel="noopener noreferrer">Horario oficial {selected.code} <ExternalLink size={14}/></a></div>
  <p className="metro-disclaimer">Las salidas de cabecera son fijas; los pasos intermedios dependen del tráfico. Estos datos son horarios programados, sin seguimiento GPS. L-V = lunes a viernes; S = sábados; D/F = domingos y festivos. Conservamos las observaciones oficiales.</p>
 </section>;
}
