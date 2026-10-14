export type MetroCell={text:string;header:boolean;colSpan:number;rowSpan:number};
export type MetroBlock={period:string;direction:string;rows:MetroCell[][]};
export type MetroResult={blocks:MetroBlock[];fetchedAt:string;fallback?:boolean;notice?:string;date:string};
const entities:Record<string,string>={nbsp:' ',amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",aacute:'á',eacute:'é',iacute:'í',oacute:'ó',uacute:'ú',ntilde:'ñ',uuml:'ü',Aacute:'Á',Eacute:'É',Iacute:'Í',Oacute:'Ó',Uacute:'Ú',Ntilde:'Ñ',Uuml:'Ü',ordm:'º',ordf:'ª',ndash:'–',mdash:'—',deg:'°'};
export function textOf(source:string){return source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi,(_,entity:string)=>{if(entity[0]==='#'){const n=entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}return entities[entity]??' ';}).replace(/\s+/g,' ').trim();}
export function parseMetroTimetable(source:string):MetroBlock[]{
 const tables=[...source.matchAll(/<table\b[^>]*class=["'][^"']*tabla_horario[^"']*["'][^>]*>([\s\S]*?)<\/table>/gi)];
 if(!tables.length){if(source.trim()==='0'||/no circula|no hay horarios/i.test(textOf(source)))return[];throw new Error('No se ha podido leer el horario del Consorcio.');}
 let previousEnd=0,period='';
 return tables.map(table=>{
  const prefix=source.slice(previousEnd,table.index);const headings=[...prefix.matchAll(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi)].map(x=>textOf(x[1]));
  const latestPeriod=headings.filter(x=>/desde|hasta/i.test(x)).at(-1);if(latestPeriod)period=latestPeriod;
  const direction=headings.filter(x=>/^(ida|vuelta|regreso)$/i.test(x)).at(-1)??'Horario';
  previousEnd=(table.index??0)+table[0].length;
  const rows=[...table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(row=>[...row[1].matchAll(/<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>/gi)].map(cell=>{
   const span=(name:string)=>Math.min(30,Math.max(1,Number(cell[2].match(new RegExp(name+'=["\']?(\\d+)','i'))?.[1]??1)));
   return {text:textOf(cell[3]),header:cell[1].toLowerCase()==='th',colSpan:span('colspan'),rowSpan:span('rowspan')};
  })).filter(x=>x.length);
  return {period,direction,rows};
 }).filter(x=>x.rows.length);
}
