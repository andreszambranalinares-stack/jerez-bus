'use client';
import {useEffect,useRef,useState} from 'react';
import {BusFront,MapPin,RefreshCw,Clock3,ExternalLink,ChevronDown,Info,Star,Plus,Trash2,Check,X,Route,Waypoints} from 'lucide-react';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,SelectGroup,SelectLabel} from '@/components/ui/select';
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty} from '@/components/ui/combobox';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import MetropolitanBuses from '@/components/metropolitan-buses';
import StopSearch from '@/components/stop-search';
import JourneyPlanner from '@/components/journey-planner';
import InstallGuide from '@/components/install-guide';
import TripShortcuts from '@/components/trip-shortcuts';
import LocationPlanner from '@/components/location-planner';
import snapshot from '@/lib/snapshot.json';
import {lines,labels,madridClock,minutes,nextTimes,official,type Stop,type Schedule,type Day} from '@/lib/bus';

type Result={schedule:Schedule;fetchedAt:string;fallback?:boolean;notice?:string};
type Favorite={id:string;name:string;line:string;stop:string;day:Day};
const stopData=snapshot.stops as Record<string,Stop[]>;
const backups=snapshot.schedules as Record<string,Schedule>;
export default function Page(){
 const [network,setNetwork]=useState('urbano');
 const [consultOpen,setConsultOpen]=useState(false);
 const [line,setLine]=useState('1');const [stop,setStop]=useState('343');
 const [day,setDay]=useState<Day>('laborables');const [clock,setClock]=useState('');const [manual,setManual]=useState(false);const [from,setFrom]=useState('');
 const [result,setResult]=useState<Result|null>(null);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [tick,setTick]=useState(0);const [dateLabel,setDateLabel]=useState('');
 const [listOpen,setListOpen]=useState(false);const [routeSearch,setRouteSearch]=useState('');
 const [favorites,setFavorites]=useState<Favorite[]>([]);const [favoritesReady,setFavoritesReady]=useState(false);const [savingFavorite,setSavingFavorite]=useState(false);const [favoriteName,setFavoriteName]=useState('');
 const stops=stopData[line]??[];const selected=stops.find(s=>s.id===stop);const selectedLine=lines.find(l=>l.id===line)!;
 const ref=useRef({line,stop,day,from});ref.current={line,stop,day,from};
 const options=stops.map(s=>s.name);const time=manual?from:clock;
 const times=result?nextTimes(result.schedule,day,time||'00:00'):[];
 const next=times[0];const wait=next&&time?minutes(next)-minutes(time):null;
 const currentKey=line+'-'+stop;
 const choose=(nextLine:string,nextStop?:string)=>{
  setNetwork('urbano');setConsultOpen(true);setLine(nextLine);setStop(nextStop??stopData[nextLine]?.[0]?.id??'');setListOpen(false);setRouteSearch('');
 };
 useEffect(()=>{
  const update=()=>{const c=madridClock();setClock(c.time);setDateLabel(new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',weekday:'long',day:'numeric',month:'short'}).format(new Date()));};
  update();setDay(madridClock().day);
  try{const saved=JSON.parse(localStorage.getItem('jerez-bus-selection')??'null');if(saved&&stopData[saved.line]?.some(s=>s.id===saved.stop)){setLine(saved.line);setStop(saved.stop);}}catch{}
  try{const saved=JSON.parse(localStorage.getItem('jerez-bus-favorites')??'[]');if(Array.isArray(saved))setFavorites(saved.filter((f:Favorite)=>f&&typeof f.name==='string'&&stopData[f.line]?.some(s=>s.id===f.stop)&&['laborables','sabados','festivos'].includes(f.day)).slice(0,12));}catch{}
  setFavoritesReady(true);
  const id=setInterval(update,15000);return()=>clearInterval(id);
 },[]);
 useEffect(()=>{if(favoritesReady)try{localStorage.setItem('jerez-bus-favorites',JSON.stringify(favorites));}catch{}},[favorites,favoritesReady]);
 useEffect(()=>{
  const controller=new AbortController();let active=true;
  setError('');setBusy(true);
  const cacheKey='jerez-bus-times-'+currentKey;
  let initial:Result|null=null;
  try{const stored=JSON.parse(localStorage.getItem(cacheKey)??'null');if(stored?.schedule&&stored?.fetchedAt)initial={...stored,fallback:true};}catch{}
  if(!initial&&backups[currentKey])initial={schedule:backups[currentKey],fetchedAt:snapshot.fetchedAt,fallback:true};
  setResult(initial);
  try{localStorage.setItem('jerez-bus-selection',JSON.stringify({line,stop}));}catch{}
  fetch('/api/horarios?line='+line+'&stop='+stop+'&refresh='+(tick?'1':'0'),{signal:controller.signal})
   .then(async r=>{const json=await r.json() as Result & {error?:string};if(!r.ok)throw new Error(json.error??'No se puede consultar el horario.');return json as Result;})
   .then(data=>{if(!active)return;setResult(data);try{localStorage.setItem(cacheKey,JSON.stringify(data));}catch{}})
   .catch(e=>{if(active&&!controller.signal.aborted){setError(e.message);if(initial)setResult({...initial,notice:'Sin conexión con COMUJESA. Último horario guardado.',fallback:true});}})
   .finally(()=>{if(active)setBusy(false);});
  return()=>{active=false;controller.abort();};
 },[line,stop,tick,currentKey]);
 useEffect(()=>{
  const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options?:unknown)=>void|Promise<void>}}).modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  const register={name:'consultar_horarios_bus',title:'Consultar autobús de Jerez',description:'Selecciona una línea y parada y devuelve sus horarios programados de COMUJESA. No son llegadas en directo.',inputSchema:{type:'object',properties:{linea:{type:'string',enum:lines.map(l=>l.id)},paradaId:{type:'string'},tipoDia:{type:'string',enum:['laborables','sabados','festivos']}},required:['linea','paradaId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:async(input:unknown)=>{
   const x=input as {linea:string;paradaId:string;tipoDia?:Day};
   if(!x||!stopData[x.linea]?.some(s=>s.id===x.paradaId)||x.tipoDia&&!['laborables','sabados','festivos'].includes(x.tipoDia))throw new Error('Línea, parada o día no válidos.');
   const response=await fetch('/api/horarios?line='+x.linea+'&stop='+x.paradaId);const data=await response.json() as Result & {error?:string};if(!response.ok)throw new Error(data.error);
   choose(x.linea,x.paradaId);if(x.tipoDia)setDay(x.tipoDia);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
   return {linea:x.linea,parada:stopData[x.linea].find(s=>s.id===x.paradaId)?.name,horarios:data.schedule[x.tipoDia??ref.current.day],consulta:data.fetchedAt,guardado:!!data.fallback,tiempoReal:false};
  }};
  try{Promise.resolve(context.registerTool(register,{signal:lifecycle.signal})).catch(()=>{});}catch{}
  return()=>lifecycle.abort();
 },[]);
 const startSave=()=>{setFavoriteName(`${selectedLine.code} · ${selected?.name??selectedLine.name}`);setSavingFavorite(true);};
 const saveFavorite=()=>{
  if(!selected)return;
  const name=favoriteName.trim().slice(0,40)||`${selectedLine.code} · ${selected.name}`;
  setFavorites(current=>{
   const match=current.find(f=>f.line===line&&f.stop===stop&&f.day===day);
   if(match)return current.map(f=>f.id===match.id?{...f,name}:f);
   const id=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():String(Date.now());
   return [...current,{id,name,line,stop,day}].slice(-12);
  });
  setSavingFavorite(false);setFavoriteName('');
 };
 const openFavorite=(favorite:Favorite)=>{choose(favorite.line,favorite.stop);setDay(favorite.day);};
 const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return <main className="app-shell">
  <header className="topbar"><a className="brand" href="/" aria-label="Jerez Bus, inicio"><img className="brand-symbol" src="/jerez-bus-symbol.png" alt=""/><span>jerez<span className="brand-light">bus</span><small>JEREZ + BAHÍA</small></span></a><InstallGuide/></header>
  <Tabs value={network} onValueChange={setNetwork} className="network-tabs"><TabsList className="network-switch" aria-label="Consultas de autobús"><TabsTrigger value="urbano"><BusFront size={19}/><span>Líneas</span></TabsTrigger><TabsTrigger value="parada"><MapPin size={19}/><span>Paradas</span></TabsTrigger><TabsTrigger value="viaje"><Route size={19}/><span>Cómo llegar</span></TabsTrigger><TabsTrigger value="metro"><Waypoints size={19}/><span>Bahía</span></TabsTrigger></TabsList><TabsContent value="urbano">
  <TripShortcuts/>
  <LocationPlanner main onConsult={(selectedLine,selectedStop,selectedDay,selectedTime)=>{choose(selectedLine,selectedStop);setDay(selectedDay);setManual(true);setFrom(selectedTime);requestAnimationFrame(()=>document.getElementById('consult-title')?.scrollIntoView({behavior:'smooth',block:'start'}));}}/>
  <section className="favorites-section" aria-labelledby="favorites-title">
   <div className="favorites-head"><div><span className="small-label">A UN TOQUE</span><h2 id="favorites-title">Tus paradas favoritas</h2></div><button className="add-favorite" onClick={startSave}><Plus size={17}/> Guardar la actual</button></div>
   {savingFavorite&&<div className="favorite-form"><Star size={18}/><label className="sr-only" htmlFor="favorite-name">Nombre de la ruta favorita</label><input id="favorite-name" autoFocus maxLength={40} value={favoriteName} onChange={e=>setFavoriteName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')saveFavorite();if(e.key==='Escape')setSavingFavorite(false);}} placeholder="Ej. Ir a clase"/><button className="confirm-favorite" onClick={saveFavorite} aria-label="Guardar favorita"><Check size={18}/></button><button className="cancel-favorite" onClick={()=>setSavingFavorite(false)} aria-label="Cancelar"><X size={18}/></button></div>}
   {favorites.length?<div className="favorite-row">{favorites.map(f=>{const favoriteLine=lines.find(l=>l.id===f.line);const favoriteStop=stopData[f.line]?.find(s=>s.id===f.stop);const active=line===f.line&&stop===f.stop&&day===f.day;return <div className={'favorite-card '+(active?'active':'')} key={f.id}><button className="favorite-open" onClick={()=>openFavorite(f)}><Star size={17} fill="currentColor"/><span><strong>{f.name}</strong><small>{favoriteLine?.code} · {favoriteStop?.name} · {labels[f.day]}</small></span></button><button className="delete-favorite" onClick={()=>setFavorites(current=>current.filter(item=>item.id!==f.id))} aria-label={`Eliminar ${f.name}`} title="Eliminar favorita"><Trash2 size={16}/></button></div>})}</div>:favoritesReady&&!savingFavorite&&<p className="favorites-empty">Guarda la línea y parada que tengas seleccionadas para abrirlas luego con un toque.</p>}
  </section>
  <details className="manual-consult" open={consultOpen} onToggle={e=>setConsultOpen(e.currentTarget.open)}><summary><BusFront size={18}/> Consultar una línea concreta <ChevronDown size={17}/></summary><div className="workspace">
   <section className="consult-panel" aria-labelledby="consult-title">
    <div className="section-heading"><h1 id="consult-title">Consulta tu bus</h1><span className="today">{dateLabel}</span></div>
    <div className="fields">
     <div><label id="line-label">Línea</label><Select value={line} onValueChange={v=>choose(v)}><SelectTrigger aria-labelledby="line-label" className="bus-select"><SelectValue/></SelectTrigger><SelectContent position="popper">{["urbano","instituto"].map(kind=><SelectGroup key={kind}><SelectLabel>{kind==="urbano"?"18 líneas regulares":"Institutos · curso 2026–27"}</SelectLabel>{lines.filter(l=>l.kind===kind).map(l=><SelectItem key={l.id} value={l.id} className="line-option">{l.code} · {l.name}</SelectItem>)}</SelectGroup>)}</SelectContent></Select></div>
     <div className="stop-field"><label id="stop-label">Parada y sentido</label><Combobox items={options} value={selected?.name??null} onValueChange={v=>{const s=stops.find(s=>s.name===v);if(s){setStop(s.id);setListOpen(false);}}}><ComboboxInput aria-labelledby="stop-label" placeholder="Busca una parada…" className="stop-combobox"/><ComboboxContent><ComboboxEmpty>No hay paradas con ese nombre.</ComboboxEmpty><ComboboxList>{(name:string)=><ComboboxItem key={name} value={name} className="stop-option">{name}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></div>
    </div>
    <div className="day-row"><div><label id="day-label">Tipo de día</label><Select value={day} onValueChange={v=>{setDay(v as Day);setListOpen(false);}}><SelectTrigger aria-labelledby="day-label" className="day-select"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(labels).map(([id,label])=><SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent></Select></div><div className="from-field"><label htmlFor="from-time">Desde</label><div className="time-controls"><input id="from-time" type="time" value={time} onChange={e=>{setManual(Boolean(e.target.value));setFrom(e.target.value);}}/>{manual&&<button className="now-btn" onClick={()=>setManual(false)}>Ahora</button>}</div></div></div>
    <p className="day-note">{selectedLine.kind==='instituto'?'Solo días lectivos del curso 2026–27.':'Si es festivo, selecciona «Domingos y festivos».'}</p>
    <div className="result-top"><span className="small-label">PRÓXIMOS PASOS PROGRAMADOS</span><Button variant="ghost" size="icon" aria-label="Volver a consultar COMUJESA" title="Volver a consultar COMUJESA" disabled={busy} onClick={()=>setTick(t=>t+1)}><RefreshCw size={18} className={busy?'spinning':''}/></Button></div>
    <section className="next-card" aria-live="polite" aria-busy={busy}>
     <div className="next-card-top"><span className={"line-badge "+(selectedLine.kind==='instituto'?'institute-badge':'')}>{selectedLine.code}</span><div className="result-stop"><strong>{selected?.name??'Elige una parada'}</strong><small>{selectedLine.name}</small></div></div>
     {result&&clock?<><div className="departure"><span className="big-time">{next??'—'}</span><div className="wait-label">{next?<><strong>{wait===0?'A esta hora':`En ${wait} min`}</strong><span>según horario</span></>:<><strong>Sin más pasos</strong><span>desde las {time}</span></>}</div></div><div className="following">{times.slice(1,4).map((t,i)=><div key={t}><span>{i===0?'Después':'Más tarde'}</span><strong>{t}</strong></div>)}{times.length===1&&<p>Último paso publicado para este tipo de día.</p>}{!next&&<p>{result.schedule[day].length?'Consulta el horario completo para otro momento.':'No hay horarios publicados para este tipo de día.'}</p>}</div></>:<div className="loading-times"><Skeleton className="h-14 w-40 bg-white/20"/><p>{busy?'Consultando COMUJESA…':'Selecciona una parada.'}</p></div>}
     <p className="schedule-note"><Clock3 size={15}/> Horarios programados; el tráfico puede variar.</p>
    </section>
    {(error||result?.notice)&&<div className="notice" role="status"><Info size={18}/><p>{result?.notice??error}</p></div>}
    <div className="source-row"><span>{busy?'Comprobando horario…':result?(selectedLine.kind==='instituto'?'Horario oficial 2026–27':result.fallback?'Consulta guardada':'Consultado')+' · '+new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(result.fetchedAt)):'Horario no disponible'}</span><a href={selectedLine.sourceUrl??official} target="_blank" rel="noopener noreferrer">COMUJESA <ExternalLink size={13}/></a></div>
    <button className="all-times-toggle" aria-expanded={listOpen} onClick={()=>setListOpen(!listOpen)}>Ver horario completo <ChevronDown size={18} className={listOpen?'rotated':''}/></button>
    {listOpen&&<div className="all-times"><h2>{labels[day]}</h2>{result?<div className="time-grid">{result.schedule[day].map(t=><span key={t} className={t===next?'next':minutes(t)<minutes(time||'00:00')?'past':''}>{t}</span>)}{!result.schedule[day].length&&<p>Sin horas publicadas.</p>}</div>:<p>El horario no está disponible. Puedes consultar la fuente oficial.</p>}</div>}
   </section>
   <aside className="route-panel" aria-labelledby="route-title"><div className="route-head"><span className={"line-badge light "+(selectedLine.kind==='instituto'?'institute-badge':'')}>{selectedLine.code}</span><div><h2 id="route-title">Paradas de la línea</h2><p>{stops.length} paradas · {selectedLine.name}</p></div></div><label className="sr-only" htmlFor="route-search">Filtrar paradas del recorrido</label><input id="route-search" className="route-search" type="search" placeholder="Buscar en el recorrido" value={routeSearch} onChange={e=>setRouteSearch(e.target.value)}/><ol className="stop-list">{stops.filter(s=>normalize(s.name).includes(normalize(routeSearch))).map(s=><li key={s.id} className={s.id===stop?'selected':''}><button onClick={()=>{setStop(s.id);setListOpen(false);}} aria-current={s.id===stop?'true':undefined}><span className="route-dot"/><span>{s.name}</span>{s.id===stop&&<MapPin size={16}/>}</button></li>)}</ol>{!stops.some(s=>normalize(s.name).includes(normalize(routeSearch)))&&<p className="empty-route">No se encuentra esa parada.</p>}<a className="route-official" href={selectedLine.sourceUrl??'https://www.comujesa.es/autobuses-urbanos/lineas-paradas-y-horarios/linea-'+line} target="_blank" rel="noopener noreferrer">Ver mapa oficial <ExternalLink size={14}/></a></aside>
  </div>
  </details></TabsContent><TabsContent value="parada"><StopSearch/></TabsContent><TabsContent value="viaje"><JourneyPlanner/></TabsContent><TabsContent value="metro"><MetropolitanBuses/></TabsContent></Tabs>
  <footer><BusFront size={16}/><span>Jerez Bus · Datos de COMUJESA y Consorcio Bahía de Cádiz.</span><details><summary>Sobre los horarios</summary><p>Las horas se consultan en la web de COMUJESA. Son pasos programados, no posiciones GPS ni llegadas en directo. La lista de paradas se revisó el 30/09/2026. Los festivos se eligen manualmente. Incluye 18 líneas regulares, los dos especiales de institutos A/B con sus cinco recorridos y 63 líneas metropolitanas de la Bahía de Cádiz. Los especiales solo circulan en días lectivos.</p><p>En iPhone: abre en Safari, pulsa Compartir y «Añadir a pantalla de inicio».</p></details></footer>
 </main>;
}
