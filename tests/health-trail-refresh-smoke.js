/* Health Trail refresh stability smoke — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ids={};
function element(id){
  const el={id:id||'',dataset:{},className:'',style:{values:{},setProperty(k,v){this.values[k]=String(v);}},textContent:'',src:'',alt:'',innerHTML:'',children:[],
    appendChild(child){this.children.push(child);if(child.id)ids[child.id]=child;return child;},querySelector(){return null;}};
  if(id)ids[id]=el;return el;
}
['healthTrail','htLevel','htRunnerLevel','htCharacter','htTotal','htMissions','htMissionMeta','htRecovery','htRecoveryMeta','htMessage'].forEach(element);
const readout=element('htReadout');
ids.healthTrail.querySelector=selector=>selector==='.ht-readout'?readout:null;

const listeners={};
const window={
  RPG_DEFAULT_SKILLS:{sleep:{isHabit:true,active:true}},
  getHabits:()=>({sleep:{score:5}}),
  addEventListener:(type,fn)=>{listeners[type]=fn;}
};
const document={
  readyState:'loading',hidden:false,
  getElementById:id=>ids[id]||null,
  createElement:()=>element(''),
  addEventListener:(type,fn)=>{listeners['document:'+type]=fn;}
};
const sandbox={window,document,localStorage:{getItem:()=>null},setInterval:()=>1,console,Date,Math,Number,Object,String,JSON,Promise};
const source=fs.readFileSync(path.join(__dirname,'..','health-trail.js'),'utf8');
vm.runInNewContext(source,sandbox,{filename:'health-trail.js'});
const api=window.GamenfyHealthTrail;

function responseFor(data){return {ok:true,json:async()=>[{data}]};}
const firstData={
  '2026-09-02':{sleepMinutes:450,hrvMs:60,restingHR:62},
  '2026-09-03':{sleepMinutes:480,hrvMs:62,restingHR:61},
  source:'google-health-v13-secure',updated:'2026-09-03T22:15:00.000Z'
};

(async()=>{
  window.gamenfyAuthedFetch=async()=>responseFor(firstData);
  await api.refresh();
  const recoveryBefore=ids.htRecovery.textContent;
  const totalBefore=ids.htTotal.textContent;
  assert.notEqual(recoveryBefore,'—','first successful Fitbit refresh renders recovery');

  let release;
  window.gamenfyAuthedFetch=()=>new Promise(resolve=>{release=resolve;});
  const pending=api.refresh();

  assert.equal(ids.htRecovery.textContent,recoveryBefore,'a delayed refresh keeps the last good recovery visible');
  assert.equal(ids.htTotal.textContent,totalBefore,'a delayed refresh does not temporarily change the combined Trail score');
  assert.notEqual(ids.htRecoveryMeta.textContent,'Fitbit nog niet geladen','refresh-in-flight does not flash a false unloaded state');

  release(responseFor(firstData));
  await pending;
  assert.equal(ids.htRecovery.textContent,recoveryBefore,'same fetched snapshot remains stable after refresh completes');
  assert.equal(ids.htTotal.textContent,totalBefore,'combined score remains stable after refresh completes');

  // Failed refresh also keeps the previous snapshot instead of erasing it.
  window.gamenfyAuthedFetch=async()=>({ok:false,json:async()=>[]});
  await api.refresh();
  assert.equal(ids.htRecovery.textContent,recoveryBefore,'failed fetch preserves last known recovery');
  assert.equal(ids.htTotal.textContent,totalBefore,'failed fetch preserves last known combined score');

  assert.match(source,/var lastFitbit=null/,'Health Trail maintains only an in-memory last-good Fitbit snapshot');
  assert.doesNotMatch(source,/localStorage\.setItem/,'refresh stability remains read-only and writes no user state');
  console.log('Health Trail refresh smoke passed: last-known Fitbit recovery stays stable through slow and failed refreshes.');
})().catch(err=>{console.error(err);process.exitCode=1;});