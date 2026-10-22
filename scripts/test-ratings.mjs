import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { reportSchema } from '../lib/community-validation.ts';

const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('public/community-summary.js','utf8'),context);
const mixed=context.summarizeResources([{features:{ramp:'present'}},{features:{ramp:'absent'}},{features:{ramp:'unknown'}}]).ramp;
assert.equal(mixed.status,'mixed');assert.equal(mixed.total,2);assert.equal(mixed.counts.present,1);assert.equal(mixed.counts.absent,1);
const example={id:crypto.randomUUID(),placeId:'example',authorName:'Teste',visitedAt:new Date().toISOString().slice(0,10),features:{},observation:'',ratings:{physical:5}};
assert(reportSchema.safeParse(example).success);
for(const value of [0,6,2.5,'5',NaN])assert(!reportSchema.safeParse({...example,ratings:{physical:value}}).success);
assert(!reportSchema.safeParse({...example,ratings:{},features:{ramp:'unknown'}}).success);
assert(reportSchema.safeParse({...example,ratings:{},features:{ramp:'present'}}).success);

const root=process.argv[2]||'http://127.0.0.1:5173';
if(!['127.0.0.1','localhost'].includes(new URL(root).hostname))throw Error('Teste permitido somente na prévia local.');
const login=await fetch(root+'/api/session',{method:'POST',headers:{'Content-Type':'application/json',Origin:root},body:JSON.stringify({username:process.env.ACESSIBILIZE_TEST_USER,password:process.env.ACESSIBILIZE_TEST_PASSWORD})});
const cookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
const headers={'Content-Type':'application/json',Origin:root,Cookie:cookie};
async function post(type,data,expected=201){const response=await fetch(root+'/api/community',{method:'POST',headers,body:JSON.stringify({type,data})});const json=await response.json();assert.equal(response.status,expected,JSON.stringify(json));return json;}
const place=await post('place',{id:crypto.randomUUID(),name:'Teste de médias por categoria',category:'Serviços',area:'Centro',address:'Endereço fictício do teste local',lat:-12.98,lng:-38.51});
const make=(ratings,features={},visitedAt=example.visitedAt)=>({...example,id:crypto.randomUUID(),placeId:place.id,visitedAt,ratings,features});
await post('report',make({physical:5,visual:4}));
const second=make({physical:1,hearing:2},{},'2026-10-19');
await post('report',second);await post('report',second);
await post('report',make({visual:2,physical:null,hearing:null}));
const legacy=make(undefined,{ramp:'present'});delete legacy.ratings;
await post('report',legacy);
await post('report',make({physical:0}),400);
await post('report',make({physical:6}),400);
const data=await(await fetch(root+'/api/community')).json();
const ratings=data.ratingsByPlace[place.id];
assert.equal(ratings.physical.average,3);assert.equal(ratings.physical.count,2);
assert.equal(ratings.visual.average,3);assert.equal(ratings.visual.count,2);
assert.equal(ratings.hearing.average,2);assert.equal(ratings.hearing.count,1);
assert.equal(data.reports.filter(r=>r.placeId===place.id).length,4);
assert.equal(data.reports.find(r=>r.id===legacy.id).ratings.physical,null);
console.log('Médias validadas: física (5+1)/2 = 3; visual (4+2)/2 = 3; auditiva 2/1 = 2. Notas ausentes, registros antigos e reenvios não alteram denominadores. Relatos divergentes são agregados.');
