import snapshot from '@/lib/snapshot.json';
import {lines, parseSchedules, type Schedule} from '@/lib/bus';
const cached=new Map<string,{schedule:Schedule;fetchedAt:string;expires:number}>();
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const line=params.get('line')??'';const stop=params.get('stop')??'';
 const stops=(snapshot.stops as Record<string,{id:string;name:string}[]>)[line];
 if(!stops?.some(s=>s.id===stop))return Response.json({error:'Elige una línea y una parada válidas.'},{status:400});
 const key=line+'-'+stop;
 const meta=lines.find(l=>l.id===line);
 if(meta?.kind==='instituto')return Response.json({schedule:(snapshot.schedules as Record<string,Schedule>)[key],fetchedAt:meta.verifiedAt,source:'COMUJESA',fallback:false,notice:meta.notice,kind:'instituto'});
 const previous=cached.get(key);
 if(previous&&previous.expires>Date.now()&&params.get("refresh")!=="1")return Response.json({...previous,source:'COMUJESA',fallback:false});
 try {
  const response=await fetch('https://www.comujesa.es/autobuses-urbanos/paradas-y-horarios/listar-b',{
   method:'POST',body:new URLSearchParams({valorLinea:line,valorCaja1:stop}),
   headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:AbortSignal.timeout(12000)
  });
  if(!response.ok)throw new Error('El servicio de COMUJESA no responde.');
  const schedule=parseSchedules(await response.text());
  const result={schedule,fetchedAt:new Date().toISOString(),expires:Date.now()+5*60*1000};
  if(cached.size>700)cached.clear();
  cached.set(key,result);
  return Response.json({...result,source:'COMUJESA',fallback:false});
 }catch{
  const backup=previous??((snapshot.schedules as Record<string,Schedule>)[key]?{schedule:(snapshot.schedules as Record<string,Schedule>)[key],fetchedAt:snapshot.fetchedAt}:null);
  if(backup)return Response.json({...backup,source:'COMUJESA',fallback:true,notice:'COMUJESA no responde. Mostramos la última consulta guardada.'});
  return Response.json({error:'COMUJESA no responde ahora. Reintenta o abre el horario oficial.'},{status:503});
 }
}
