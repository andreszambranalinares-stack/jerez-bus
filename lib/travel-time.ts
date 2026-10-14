import {madridClock,type Day} from './bus';
export function dayForDate(date:string):Day{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Elige una fecha válida.');
 const parsed=new Date(date+'T12:00:00Z');
 if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date)throw new Error('Elige una fecha válida.');
 const weekday=parsed.getUTCDay();return weekday===0?'festivos':weekday===6?'sabados':'laborables';
}
export function validDeparture(date:string,time:string){
 try{dayForDate(date);}catch{return false;}
 if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))return false;
 const now=madridClock();return date>now.date||date===now.date&&time>=now.time;
}
export function tomorrowDate(){const now=madridClock();const d=new Date(now.date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10);}
