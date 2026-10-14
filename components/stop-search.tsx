'use client';
import {useEffect,useMemo,useState} from 'react';
import {MapPin,Clock3,Info,Search} from 'lucide-react';
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty} from '@/components/ui/combobox';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {Skeleton} from '@/components/ui/skeleton';
import snapshot from '@/lib/snapshot.json';
import {lines,labels,madridClock,nextTimes,type Day,type Schedule,type Stop} from '@/lib/bus';

type Service={lineId:string;stopId:string};
type StopGroup={key:string;name:string;label:string;services:Service[]};
type Result={schedule:Schedule;fetchedAt:string;fallback?:boolean;notice?:string};
const stopData=snapshot.stops as Record<string,Stop[]>;
const normalize=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

function buildStopGroups():StopGroup[]{
 const urban=new Map<string,{name:string;services:Service[];codes:Set<string>}>();
 for(const line of lines.filter(item=>item.kind==='urbano'))for(const stop of stopData[line.id]??[]){
  const group=urban.get(stop.id)??{name:stop.name,services:[],codes:new Set<string>()};
  group.services.push({lineId:line.id,stopId:stop.id});group.codes.add(line.code);urban.set(stop.id,group);
 }
 const bases=[...urban].map(([id,group])=>({id,group,base:`${group.name} · líneas ${[...group.codes].join(', ')}`}));
 const counts=new Map<string,number>();for(const item of bases)counts.set(item.base,(counts.get(item.base)??0)+1);
 const result:StopGroup[]=bases.map(({id,group,base})=>({key:`urban-${id}`,name:group.name,label:counts.get(base)!>1?`${base} · parada ${id}`:base,services:group.services}));
 const institutes=new Map<string,{name:string;services:Service[]}>();
 for(const line of lines.filter(item=>item.kind==='instituto'))for(const stop of stopData[line.id]??[]){
  const key=normalize(stop.name);const group=institutes.get(key)??{name:stop.name,services:[]};
  if(!group.services.some(service=>service.lineId===line.id&&service.stopId===stop.id))group.services.push({lineId:line.id,stopId:stop.id});
  institutes.set(key,group);
 }
 for(const [key,group] of institutes)result.push({key:`institute-${key}`,name:group.name,label:`${group.name} · especiales de institutos`,services:group.services});
 return result.sort((a,b)=>a.name.localeCompare(b.name,'es',{sensitivity:'base'}));
}

const groups=buildStopGroups();

export default function StopSearch(){
 const [selectedKey,setSelectedKey]=useState('');const [day,setDay]=useState<Day>('laborables');const [clock,setClock]=useState('');
 const [results,setResults]=useState<Record<string,Result>>({});const [errors,setErrors]=useState<Record<string,string>>({});const [busy,setBusy]=useState(false);
 const selected=groups.find(group=>group.key===selectedKey);const options=groups.map(group=>group.label);
 const today=madridClock();const reference=day===today.day?clock||today.time:'00:00';
 const services=useMemo(()=>selected?.services.map(service=>({...service,line:lines.find(item=>item.id===service.lineId)!}))??[],[selected]);
 useEffect(()=>{const update=()=>setClock(madridClock().time);update();setDay(madridClock().day);const id=setInterval(update,15000);return()=>clearInterval(id);},[]);
 useEffect(()=>{
  if(!selected)return;
  let active=true;const controller=new AbortController();setBusy(true);setResults({});setErrors({});
  Promise.all(selected.services.map(async service=>{
   const key=`${service.lineId}-${service.stopId}`;
   try{const response=await fetch(`/api/horarios?line=${encodeURIComponent(service.lineId)}&stop=${encodeURIComponent(service.stopId)}`,{signal:controller.signal});const data=await response.json() as Result&{error?:string};if(!response.ok)throw new Error(data.error??'Horario no disponible.');if(active)setResults(current=>({...current,[key]:data}));}
   catch(error){if(active&&!controller.signal.aborted)setErrors(current=>({...current,[key]:error instanceof Error?error.message:'Horario no disponible.'}));}
  })).finally(()=>{if(active)setBusy(false);});
  return()=>{active=false;controller.abort();};
 },[selected]);
 return <section className="stop-search-panel" aria-labelledby="stop-search-title">
  <div className="stop-search-heading"><div><span className="small-label">CONSULTA INVERSA</span><h1 id="stop-search-title">Busca una parada</h1><p>Consulta todas las líneas y horarios que pasan por el mismo punto.</p></div><span className="stop-search-mark"><MapPin size={25}/></span></div>
  <div className="stop-search-controls"><div><label id="global-stop-label">Nombre de la parada</label><Combobox items={options} value={selected?.label??null} onValueChange={value=>{const group=groups.find(item=>item.label===value);if(group)setSelectedKey(group.key);}}><ComboboxInput aria-labelledby="global-stop-label" placeholder="Ej. Minotauro, Esteve, Almunia…" className="stop-combobox"/><ComboboxContent><ComboboxEmpty>No hay paradas con ese nombre.</ComboboxEmpty><ComboboxList>{(label:string)=><ComboboxItem key={label} value={label} className="stop-option">{label}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></div><div><label id="global-day-label">Tipo de día</label><Select value={day} onValueChange={value=>setDay(value as Day)}><SelectTrigger aria-labelledby="global-day-label" className="day-select"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(labels).map(([value,label])=><SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></div>
  {!selected&&<div className="stop-search-empty"><Search size={24}/><strong>Escribe una parada para empezar.</strong><p>Elige también el sentido correcto para ver únicamente los autobuses de ese lado de la calle.</p></div>}
  {selected&&<div className="stop-search-results" aria-live="polite" aria-busy={busy}><div className="stop-result-heading"><div><span className="small-label">PARADA SELECCIONADA</span><h2>{selected.name}</h2></div><strong>{services.length} {services.length===1?'línea':'líneas'}</strong></div>
   {busy&&!Object.keys(results).length&&<div className="stop-result-loading"><Skeleton className="h-28 w-full"/><Skeleton className="h-28 w-full"/></div>}
   <div className="stop-service-grid">{services.map(service=>{const key=`${service.lineId}-${service.stopId}`;const result=results[key];const all=result?.schedule[day]??[];const upcoming=result?nextTimes(result.schedule,day,reference):[];return <article className="stop-service-card" key={key}><div className="stop-service-head"><span className={'line-badge light '+(service.line.kind==='instituto'?'institute-badge':'')}>{service.line.code}</span><div><h3>{service.line.name}</h3><p>{service.line.kind==='instituto'?'Especial de institutos':'Línea urbana'}</p></div></div>{result?<><div className="stop-next-times"><span>Próximos pasos</span><div>{upcoming.slice(0,4).map(time=><strong key={time}>{time}</strong>)}{!upcoming.length&&<em>Sin más pasos</em>}</div></div><details className="stop-full-schedule"><summary>Ver horario completo ({all.length})</summary><div className="time-grid">{all.map(time=><span key={time}>{time}</span>)}{!all.length&&<p>Sin horarios publicados.</p>}</div></details>{result.notice&&<p className="stop-source-note">{result.notice}</p>}</>:errors[key]?<div className="stop-service-error"><Info size={16}/><span>{errors[key]}</span></div>:<Skeleton className="h-20 w-full"/>}</article>})}</div>
   <p className="stop-search-note"><Clock3 size={15}/> Son horarios programados; el paso real puede variar por el tráfico.</p>
  </div>}
 </section>;
}
