'use client';
import {useEffect,useState} from 'react';
import {Share,SquarePlus,Check,Smartphone,X} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {shouldOfferSafariInstall} from '@/lib/install';
const dismissedKey='jerez-bus-install-guide-v1';
export default function InstallGuide(){
 const [open,setOpen]=useState(false),[installed,setInstalled]=useState(false);
 useEffect(()=>{
  const standalone=window.matchMedia('(display-mode: standalone)').matches||!!(navigator as Navigator&{standalone?:boolean}).standalone;
  setInstalled(standalone);
  if(shouldOfferSafariInstall(navigator.userAgent,navigator.maxTouchPoints,standalone)){
   let dismissed=false;try{dismissed=localStorage.getItem(dismissedKey)==='1';}catch{}
   if(!dismissed)setOpen(true);
  }
 },[]);
 const close=()=>{setOpen(false);try{localStorage.setItem(dismissedKey,'1');}catch{}};
 return <><button className="install-trigger" onClick={()=>setOpen(true)}><Smartphone size={17}/><span>{installed?'Ayuda':'Instalar'}</span></button><Dialog open={open} onOpenChange={v=>{if(v)setOpen(true);else close();}}><DialogContent className="install-dialog" showCloseButton={false}><button className="install-close" aria-label="Cerrar guía" onClick={close}><X size={22}/></button><DialogHeader><img src="/jerez-bus-symbol.png" className="install-logo" alt=""/><span className="small-label">JEREZ BUS EN TU IPHONE</span><DialogTitle className="install-title">Tu bus, en la pantalla de inicio.</DialogTitle><DialogDescription>Instálala gratis desde Safari para abrirla como una app.</DialogDescription></DialogHeader><ol className="install-steps"><li><Share/><div><strong>1. Abre Compartir</strong><p>En Safari, toca el cuadrado con la flecha hacia arriba. Si no lo ves, abre el menú de los tres puntos.</p></div></li><li><SquarePlus/><div><strong>2. Añadir a pantalla de inicio</strong><p>Busca esa opción en la lista; puede estar más abajo.</p></div></li><li><Check/><div><strong>3. Confirma con Añadir</strong><p>Si aparece «Abrir como app web», déjalo activado. Verás el icono de Jerez Bus en tu pantalla de inicio.</p></div></li></ol><p className="install-footnote">Si estás dentro de WhatsApp, Instagram u otra app, abre primero esta web en Safari. Los horarios necesitan conexión.</p><Button onClick={close}>Entendido</Button><a className="install-apple" href="https://support.apple.com/es-es/guide/iphone/iphea86e5236/ios" target="_blank" rel="noopener noreferrer">Ver instrucciones de Apple</a></DialogContent></Dialog></>;
}
