import urllib.request, concurrent.futures, re, json, pathlib, xml.etree.ElementTree as ET, datetime
ns={'k':'http://www.opengis.net/kml/2.2'}
def collect(line):
    url=f'https://www.comujesa.es/autobuses-urbanos/lineas-paradas-y-horarios/linea-{line}'
    with urllib.request.urlopen(url,timeout=30) as r: page=r.read().decode()
    mids=list(dict.fromkeys(re.findall(r'maps/d/embed\?mid=([^&"<>]+)',page)))
    points=[]
    for mid in mids:
        with urllib.request.urlopen('https://www.google.com/maps/d/kml?mid='+mid+'&forcekml=1',timeout=30) as r: root=ET.fromstring(r.read())
        for placemark in root.findall('.//k:Placemark',ns):
            coords=placemark.find('k:Point/k:coordinates',ns)
            if coords is None: continue
            data=' '.join(placemark.itertext())
            code=re.search(r'COD\.?\s*(?:DE\s*)?PARADA\s*:\s*(\d+)',data,re.I)
            if not code: continue
            lng,lat=map(float,coords.text.strip().split(',')[:2])
            if 36.5<lat<36.9 and -6.4<lng<-5.9: points.append((code.group(1),{'lat':lat,'lng':lng}))
    print('line',line,'points',len(points),flush=True)
    return points
points={}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    for result in ex.map(collect,range(1,19)):
        for code,coord in result: points.setdefault(code,coord)
output={'source':'COMUJESA · mapas oficiales de líneas','fetchedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stops':points}
pathlib.Path('lib/stop-coordinates.json').write_text(json.dumps(output,ensure_ascii=False),encoding='utf-8')
print('Total',len(points))
