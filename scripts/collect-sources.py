import urllib.request,urllib.parse,re,html,json,concurrent.futures,pathlib,datetime
base='https://www.comujesa.es/autobuses-urbanos/paradas-y-horarios/'
def download(task):
 action,line,stop=task
 data={'valorLinea':str(line)}
 if stop:data['valorCaja1']=str(stop)
 req=urllib.request.Request(base+('listar-c' if action=='stops' else 'listar-b'), data=urllib.parse.urlencode(data).encode())
 for attempt in range(3):
  try:
   with urllib.request.urlopen(req,timeout=20) as r:s=r.read().decode('utf-8')
   if action=='stops':
    result=[{'id':a,'name':html.unescape(re.sub('<[^>]+>','',b)).strip()} for a,b in re.findall(r"<option[^>]*value=['\"](\d+)['\"][^>]*>(.*?)</option>",s,re.S) if a!='0']
    if not result:raise ValueError('empty stops')
   else:
    chunks=re.split(r'<STRONG>',s)[1:4]
    result={key:re.findall(r'\b(?:[01]\d|2[0-3]):[0-5]\d\b',chunk.split("<div style='clear:")[0]) for key,chunk in zip(['laborables','sabados','festivos'],chunks)}
    if len(result)!=3:raise ValueError('no schedule')
   return action,str(line),str(stop),result
  except Exception:
   if attempt==2:raise
jobs=[('stops',n,None) for n in range(1,19)]+[('times',8,109),('times',8,423),('times',11,422),('times',11,109)]
out={'fetchedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stops':{},'schedules':{}}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
 for action,line,stop,result in ex.map(download,jobs):
  if action=='stops':out['stops'][line]=result
  else:out['schedules'][line+'-'+stop]=result
pathlib.Path('lib/snapshot.json').write_text(json.dumps(out,ensure_ascii=False),encoding='utf-8')
print('Collected',sum(map(len,out['stops'].values())),'stop entries on',len(out['stops']),'lines;',len(out['schedules']),'schedules')
