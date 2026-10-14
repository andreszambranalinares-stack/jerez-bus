import {NextResponse} from 'next/server';

// POST avoids including a visitor's GPS coordinates in the request URL.
export async function POST(request:Request){
 const headers={'Cache-Control':'no-store'};
 let point:{lat:number;lng:number};
 try{point=await request.json() as typeof point;}catch{return NextResponse.json({error:'Punto no válido.'},{status:400,headers});}
 if(!point||typeof point.lat!=='number'||typeof point.lng!=='number'||!Number.isFinite(point.lat)||!Number.isFinite(point.lng)||point.lat<36.5||point.lat>36.9||point.lng< -6.4||point.lng> -5.9)return NextResponse.json({error:'Punto fuera del entorno de Jerez.'},{status:400,headers});
 try{
  const url=new URL('https://photon.komoot.io/reverse');
  url.searchParams.set('lat',String(point.lat));url.searchParams.set('lon',String(point.lng));url.searchParams.set('radius','0.15');url.searchParams.set('limit','1');
  const response=await fetch(url,{signal:AbortSignal.timeout(5000),cache:'no-store'});
  if(!response.ok)throw new Error();
  const data=await response.json() as {features?:Array<{properties:Record<string,string>}>};
  const p=data.features?.[0]?.properties;
  const street=p?.street??p?.name;
  const name=street?[street,p?.housenumber,p?.city].filter(Boolean).join(', '):null;
  return NextResponse.json({name},{headers});
 }catch{return NextResponse.json({name:null},{headers});}
}
