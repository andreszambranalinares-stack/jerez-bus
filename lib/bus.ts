import institutes from './institutes.json';
export type Day = 'laborables' | 'sabados' | 'festivos';
export type Stop = {id:string;name:string};
export type Schedule = Record<Day,string[]>;
export type Line = {id:string;name:string;code:string;kind:"urbano"|"instituto";sourceUrl?:string;verifiedAt?:string;notice?:string};
const regularLines = [
 {id:'1',name:'Esteve · San Telmo'},{id:'2',name:'Esteve · Picadueñas'},{id:'3',name:'Esteve · Las Torres'},{id:'4',name:'Esteve · Maternidad · Hipercor'},
 {id:'5',name:'Angustias / Canal Sur · Guadalcacín'},{id:'6',name:'Esteve · La Granja'},{id:'7',name:'Angustias · Estella'},{id:'8',name:'Circular 1'},
 {id:'9',name:'Circular 2'},{id:'10',name:'La Canaleja · Esteve · Hospital'},{id:'11',name:'Esteve · Campus · La Marquesa'},{id:'12',name:'Angustias / Canal Sur · San José Obrero'},
 {id:'13',name:'Alcázar · Asisa · Moreno Mendoza'},{id:'14',name:'Esteve · Nueva Andalucía · El Encinar'},{id:'15',name:'Nueva Jarilla · Angustias · El Portal'},
 {id:'16',name:'Rotonda Casinos · Hipercor · Ortega y Gasset'},{id:'17',name:'Rotonda Casino · Parque Empresarial · Hospital'},{id:'18',name:'Angustias / Canal Sur · Luz Shopping'}
];
export const lines:Line[] = [...regularLines.map(l=>({...l,code:l.id,kind:"urbano" as const})), ...institutes as Line[]];
export const labels: Record<Day,string> = {laborables:'Laborables',sabados:'Sábados',festivos:'Domingos y festivos'};
export const official='https://www.comujesa.es/autobuses-urbanos/inf-util';
export function parseSchedules(html:string):Schedule {
 const parts=html.split(/<strong>/i).slice(1,4);
 if(parts.length!==3) throw new Error('No se ha podido leer el horario oficial.');
 const keys:Day[]=['laborables','sabados','festivos'];
 const result={} as Schedule;
 parts.forEach((chunk,i)=>{
  const body=chunk.split(/<div style=['"]clear:/i)[0];
  result[keys[i]]=[...new Set(body.match(/\b(?:[01]\d|2[0-3]):[0-5]\d\b/g)??[])].sort();
 });
 if(!Object.values(result).some(x=>x.length))throw new Error('Sin horarios publicados para esta parada.');
 return result;
}
export function minutes(time:string){const [h,m]=time.split(':').map(Number);return h*60+m;}
export function nextTimes(schedule:Schedule,day:Day,from:string){return schedule[day].filter(t=>minutes(t)>=minutes(from));}
export function madridClock(now=new Date()){
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);
 const weekday=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Madrid',weekday:'short'}).format(now);
 return {date,time,day:(weekday==='Sun'?'festivos':weekday==='Sat'?'sabados':'laborables') as Day};
}
