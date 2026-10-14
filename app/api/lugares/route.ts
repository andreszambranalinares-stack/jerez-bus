import {NextResponse} from 'next/server';
export async function GET(request:Request){
 const q=new URL(request.url).searchParams.get('q')?.trim()??'';
 if(q.length<3||q.length>160)return NextResponse.json({error:'Escribe una dirección de al menos 3 caracteres.'},{status:400});
 try{
  const url=new URL('https://photon.komoot.io/api/');url.searchParams.set('q',q+' Jerez de la Frontera');url.searchParams.set('limit','6');url.searchParams.set('lat','36.686');url.searchParams.set('lon','-6.126');url.searchParams.set('bbox','-6.4,36.5,-5.9,36.9');
  const r=await fetch(url,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw new Error();
  const data=await r.json() as {features:Array<{geometry:{coordinates:number[]};properties:Record<string,string>}>};
  const places=data.features.map(f=>({lat:f.geometry.coordinates[1],lng:f.geometry.coordinates[0],name:[f.properties.name,f.properties.street,f.properties.housenumber,f.properties.city].filter(Boolean).join(', ')})).filter(p=>p.lat>36.5&&p.lat<36.9&&p.lng>-6.4&&p.lng<-5.9);
  return NextResponse.json({places},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'No se puede buscar la dirección ahora. Puedes introducir latitud, longitud.'},{status:503});}
}
