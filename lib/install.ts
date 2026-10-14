export function shouldOfferSafariInstall(userAgent:string,touchPoints:number,standalone:boolean){
 const ios=/iPhone|iPad|iPod/.test(userAgent)||/Macintosh/.test(userAgent)&&touchPoints>1;
 const safari=/Safari/.test(userAgent)&&!/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA/.test(userAgent);
 return ios&&safari&&!standalone;
}
