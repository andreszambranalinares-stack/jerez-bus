import json,datetime
p='lib/snapshot.json';db=json.load(open(p));now=datetime.datetime.now(datetime.timezone.utc).isoformat()
# Exact transcription of COMUJESA's 2026-27 posters, retrieved 2026-09-30.
routes={
'ia-ida':('Institutos A · Ida desde Angustias','IN A',[
('Angustias','07:20'),('Madre de Dios','07:21'),('Minotauro','07:22'),('Retiro','07:23'),('Blas Infante','07:24'),('Glorieta Arlés','07:26'),('Plaza Cárpita','07:27'),('Las Palmeras','07:28'),('Fresa','07:29'),('Macedonia','07:30'),('Cala del Aceite','07:30'),('La Canaleja','07:33'),('Playas Caño de Meca','07:34'),('IES Caballero Bonald','07:36'),('Centro Salud Asunción','07:38'),('Asunción','07:39'),('Torres Blancas','07:40'),('Biarritz','07:41'),('Amsterdam','07:42'),('IES Seritium','07:45'),('Residencia Pensionistas','07:46'),('Piscinas Jerez','07:47'),('Suite la Marquesa','07:50'),('IES Almunia','07:51'),('IES Lola Flores','07:54'),('IES La Granja','07:57'),('Entreparques','07:59'),('Carrefour Norte','08:00'),('Edificio Congreso','08:01'),('El Bosque','08:03'),('Plaza Caballo','08:05'),('IES Coloma','08:10'),('Rotonda Casinos','08:20')]),
'ia-casinos':('Institutos A · Vuelta desde Casinos','IN A',[
('Rotonda Casinos','14:55'),('IES Coloma','14:59'),('Plaza Caballo','15:00'),('El Bosque / Feria','15:01'),('Edificio Congreso','15:03'),('Carrefour Norte','15:04'),('Entreparques','15:05'),('IES La Granja','15:15'),('IES Lola Flores','15:18'),('Suite la Marquesa','15:20'),('Piscina Jerez','15:21'),('Residencia Pensionistas','15:22'),('Amsterdam','15:24'),('IES Seritium','15:25'),('Lola Flores','15:26'),('Biarritz','15:28'),('Torres Blancas','15:29'),('Asunción','15:30'),('IES Caballero Bonald','15:32'),('Parque Canaleja','15:33'),('La Canaleja','15:34'),('Cala del Aceite','15:36'),('Macedonia','15:37'),('Fresa','15:38'),('Cárpita','15:40'),('Glorieta Arlés','15:41'),('Blas Infante','15:42'),('Retiro','15:43'),('Minotauro','15:44'),('Diego Fernández Herrera','15:45'),('Angustias','15:45')]),
'ia-granja':('Institutos A · Vuelta desde La Granja','IN A',[
('IES La Granja','14:50'),('IES Lola Flores','14:53'),('Suite la Marquesa','14:56'),('Piscina Jerez','14:57'),('Residencia Pensionistas','14:58'),('Amsterdam','14:58'),('IES Seritium','15:01'),('Lola Flores','15:02'),('Biarritz','15:02'),('Torres Blancas','15:03'),('Asunción','15:06'),('IES Caballero Bonald','15:08'),('La Canaleja','15:10'),('Cala del Aceite','15:12'),('Macedonia','15:16'),('Fresa','15:17'),('Las Palmeras','15:18'),('Cárpita','15:19'),('Glorieta Arlés','15:21'),('Blas Infante','15:22'),('Retiro','15:23'),('Minotauro','15:23'),('Diego Fernández Herrera','15:26'),('Angustias','15:27')]),
'ib-ida':('Institutos B · Ida desde Angustias','IN B',[
('Angustias','07:25'),('Parque Cartuja','07:35'),('Majón','07:36'),('Avenida Mediterráneo','07:38'),('Parque Atlántico','07:39'),('Avenida Nazaret','07:41'),('IES Fernando Savater','07:42'),('Glorieta nº 4','07:43'),('Glorieta nº 6','07:46'),('Ronda Este La Pita','07:47'),('La Marquesa','07:49'),('IES Almunia','07:54'),('IES Lola Flores','07:59'),('IES Elena García Armada','08:04')]),
'ib-vuelta':('Institutos B · Vuelta desde Elena G. Armada','IN B',[
('IES Elena García Armada','14:55'),('IES Lola Flores','14:58'),('Zurbarán','14:59'),('IES Almunia','15:01'),('Piscinas','15:02'),('Los Jardines','15:04'),('Ronda Este La Pita','15:06'),('El Encinar','15:12'),('Glorieta nº 4','15:11'),('IES Fernando Savater','15:14'),('Club Nazaret','15:15'),('Parque Atlántico','15:16'),('Avenida Mediterráneo','15:17'),('Majón','15:18'),('Parque Cartuja','15:20'),('Vallesequillo I','15:21'),('Angustias','15:29')])
}
meta=[]
for line,(name,code,rows) in routes.items():
 db['stops'][line]=[{'id':str(i+1),'name':name} for i,(name,time) in enumerate(rows)]
 for i,(stop,time) in enumerate(rows):db['schedules'][line+'-'+str(i+1)]={'laborables':[time],'sabados':[],'festivos':[]}
 meta.append({'id':line,'name':name,'code':code,'kind':'instituto','sourceUrl':'https://www.comujesa.es/autobuses-urbanos/lineas-paradas-y-horarios/especial-institutos','verifiedAt':now,'notice':'Solo días lectivos del curso 2026–27. No circula en fines de semana, festivos ni vacaciones escolares.'})
# The original B poster gives El Encinar 15:12 before Glorieta nº4 15:11; preserve its exact source values.
meta[-1]['notice']+=' El cartel oficial sitúa El Encinar a las 15:12 y la siguiente parada a las 15:11; ese dato necesita confirmación de COMUJESA.'
open(p,'w').write(json.dumps(db,ensure_ascii=False))
open('lib/institutes.json','w').write(json.dumps(meta,ensure_ascii=False,indent=2))
print('Added 5 institute routes, 119 scheduled stop entries')
