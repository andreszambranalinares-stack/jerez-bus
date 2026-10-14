import catalogue from '@/lib/metropolitan-lines.json';
import {madridClock} from '@/lib/bus';
import {parseMetroTimetable,type MetroResult} from '@/lib/metropolitan';
const cache=new Map<string,MetroResult & {expires:number}>();
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;const id=params.get('line')??'';const date=params.get('date')??madridClock().date;
 const line=catalogue.find(l=>l.id===id);
 if(!line||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(new Date(date).getTime())||new Date(date).toISOString().slice(0,10)!==date)return Response.json({error:'Línea o fecha no válida.'},{status:400});
 const key=id+'-'+date;const saved=cache.get(key);
 if(saved&&saved.expires>Date.now()&&params.get('refresh')!=='1')return Response.json(saved);
 try{
  const [y,m,d]=date.split('-');const query=new URLSearchParams({linea:id,sentido:'0',fecha:d+'/'+m+'/'+y});
  const response=await fetch('https://siu.cmtbc.es/es/pinta_horario.php?'+query,{method:'POST',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('El Consorcio no responde.');
  const blocks=parseMetroTimetable(await response.text());
  const result={blocks,date,fetchedAt:new Date().toISOString(),fallback:false,expires:Date.now()+5*60*1000};
  if(cache.size>500)cache.clear();cache.set(key,result);return Response.json(result);
 }catch{
  if(saved)return Response.json({...saved,fallback:true,notice:'El Consorcio no responde. Mostramos la última consulta guardada para esta fecha.'});
  return Response.json({error:'El Consorcio no responde ahora. Puedes abrir el horario oficial o reintentar.'},{status:503});
 }
}
