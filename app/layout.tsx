import type {Metadata,Viewport} from 'next';
import './globals.css';
import './brand.css';
export const metadata:Metadata={title:'Jerez Bus',description:'Consulta buses y paradas, busca destinos y guarda tus rutas favoritas en Jerez y la Bahía de Cádiz.',manifest:'/manifest.webmanifest?v=3',icons:{icon:[{url:'/jerez-favicon-v3.png',type:'image/png',sizes:'32x32'},{url:'/jerez-icon-v3.svg',type:'image/svg+xml'}],shortcut:'/jerez-favicon-v3.png',apple:{url:'/jerez-apple-v3.png',sizes:'180x180',type:'image/png'}},appleWebApp:{capable:true,title:'Jerez Bus',statusBarStyle:'default'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#122B39'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
