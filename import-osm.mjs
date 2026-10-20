import fs from 'node:fs';
const query='[out:json][timeout:90];nwr["name"][~"^(amenity|tourism|shop|leisure)$"~"^(museum|attraction|gallery|viewpoint|zoo|library|theatre|cinema|hospital|clinic|pharmacy|bank|restaurant|cafe|university|community_centre|mall|supermarket|park|sports_centre)$"](-13.05,-38.60,-12.80,-38.30);out center tags;';
let raw;
if(fs.existsSync('osm-raw.json'))raw=JSON.parse(fs.readFileSync('osm-raw.json','utf8'));
else {const r=await fetch('https://overpass-api.de/api/interpreter?'+new URLSearchParams({data:query}),{headers:{'User-Agent':'AcessibilizeAcademicPrototype/1.0'},signal:AbortSignal.timeout(120000)});if(!r.ok)throw Error('Overpass '+r.status);raw=await r.json();fs.writeFileSync('osm-raw.json',JSON.stringify(raw));}
const groups={};const seen=new Set();
for(const e of raw.elements){const t=e.tags||{},lat=e.lat??e.center?.lat,lng=e.lon??e.center?.lon;if(!t.name||!Number.isFinite(lat)||!Number.isFinite(lng))continue;
 const key=t.name.toLowerCase()+'|'+lat.toFixed(3)+'|'+lng.toFixed(3);if(seen.has(key))continue;seen.add(key);
 const type=t.amenity||t.tourism||t.shop||t.leisure;
 const category=['restaurant','cafe'].includes(type)?'Alimentação':['mall','supermarket'].includes(type)?'Compras':['park','sports_centre'].includes(type)?'Parques e praças':['museum','attraction','gallery','viewpoint','zoo','theatre','cinema'].includes(type)?'Cultura e lazer':'Serviços';
 const resources={physical:[],visual:[],hearing:[]};
 if(t.wheelchair==='yes')resources.physical.push('OpenStreetMap informa acesso para cadeira de rodas (wheelchair=yes). Isso não confirma cada recurso do espaço.');
 if(t.wheelchair==='limited')resources.physical.push('OpenStreetMap informa acesso limitado para cadeira de rodas.');
 if(t.wheelchair==='no')resources.physical.push('OpenStreetMap informa ausência de acesso para cadeira de rodas.');
 if(t['toilets:wheelchair']==='yes')resources.physical.push('Sanitário acessível informado no OpenStreetMap.');
 if(t.tactile_paving==='yes')resources.visual.push('Piso tátil informado no OpenStreetMap.');
 if(t['name:braille']||t['braille']==='yes')resources.visual.push('Informação em braille registrada no OpenStreetMap.');
 if(t.hearing_loop==='yes')resources.hearing.push('Aro de indução para aparelhos auditivos informado no OpenStreetMap.');
 const address=[t['addr:street'],t['addr:housenumber'],t['addr:suburb']||t['addr:neighbourhood'],'Salvador, BA'].filter(Boolean).join(', ');
 const p={id:'osm-'+e.type+'-'+e.id,name:t.name,category,area:t['addr:suburb']||t['addr:neighbourhood']||'Salvador',address:address==='Salvador, BA'?'Endereço não informado na fonte · Salvador, BA':address,lat,lng,physical:t.wheelchair==='no'?3:t.wheelchair==='yes'?2:(resources.physical.length?1:0),visual:resources.visual.length?1:0,hearing:resources.hearing.length?1:0,art:({'Alimentação':'food','Compras':'shopping','Parques e praças':'park','Cultura e lazer':'culture','Serviços':'service'})[category],source:'osm',sourceUrl:`https://www.openstreetmap.org/${e.type}/${e.id}`,resources,wheelchair:t.wheelchair||null};
 (groups[category]??=[]).push(p);
}
// Balance categories, favoring records with accessibility information.
const result=[];for(const entries of Object.values(groups)){entries.sort((a,b)=>((b.physical+b.visual+b.hearing)-(a.physical+a.visual+a.hearing))||a.name.localeCompare(b.name,'pt-BR'));result.push(...entries.slice(0,160));}
const meta={retrievedAt:new Date().toISOString(),source:'OpenStreetMap via Overpass API',license:'ODbL 1.0',bounds:[-13.05,-38.60,-12.80,-38.30],count:result.length,counts:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,Math.min(v.length,160)])),accessibilityTagged:result.filter(p=>p.physical||p.visual||p.hearing).length};
fs.writeFileSync('public/places.js','// Dados © OpenStreetMap contributors · ODbL 1.0\nwindow.ACESSIBILIZE_DATA = '+JSON.stringify({meta,places:result},null,2)+';\n');
fs.writeFileSync('data/base-ids.json',JSON.stringify(result.map(p=>p.id)));
fs.writeFileSync('BASE-DE-DADOS.md',`# Base inicial do Acessibilize\n\n${result.length} locais importados do OpenStreetMap em ${meta.retrievedAt}.\n\n${meta.accessibilityTagged} locais possuem alguma informação explícita de acessibilidade na fonte. Ausência de informação não significa ausência de acessibilidade.\n\nCategorias: ${JSON.stringify(meta.counts)}.\n\nConsulta e transformação reproduzíveis em import-osm.mjs. Dados sob ODbL 1.0: https://www.openstreetmap.org/copyright. Os registros contêm links individuais para a fonte. Oito exemplos fictícios são mantidos separadamente para demonstrar os filtros.\n`);
console.log(JSON.stringify(meta));
