/* Health Trail stale-source smoke — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ids={};
function element(id){
  const el={id:id||'',dataset:{},style:{setProperty(){}},textContent:'',src:'',alt:'',innerHTML:'',children:[],appendChild(child){this.children.push(child);if(child.id)ids[child.id]=child;return child;},querySelector(){return null;}};
  if(id)ids[id]=el;return el;
}
['healthTrail','htLevel','htRunnerLevel','htCharacter','htTotal','htMissions','htMissionMeta','htRecovery','htRecoveryMeta','htMessage'].forEach(element);
const readout=element('htReadout');ids.healthTrail.querySelector=s=>s==='.ht-readout'?readout:null;
const window={RPG_DEFAULT_SKILLS:{},getHabits:()=>({}),addEventListener(){}};
const document={readyState:'loading',hidden:false,getElementById:id=>ids[id]||null,createElement:()=>element(''),addEventListener(){}};
const sandbox={window,document,localStorage:{getItem:()=>null},setInterval:()=>1,console,Date,Math,Number,Object,String,JSON,Promise};
const source=fs.readFileSync(path.join(__dirname,'..','health-trail.js'),'utf8');
vm.runInNewContext(source,sandbox,{filename:'health-trail.js'});
const api=window.GamenfyHealthTrail;

function series(endDate){
  const out={};
  const end=new Date(endDate+'T12:00:00');
  for(let i=6;i>=0;i--){
    const d=new Date(end);d.setDate(d.getDate()-i);
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    out[k]={hrvMs:i?80:58,restingHR:i?58:65,sleepMinutes:i?470:360,steps:i?9500:3200};
  }
  return out;
}

// Data older than yesterday must never create current-sounding recovery/activity advice.
{
  const stale=api.healthInsights(series('2026-09-01'),'2026-09-04',20);
  assert.equal(stale.length,1,'stale Fitbit history collapses to one transparent neutral state');
  assert.equal(stale[0].key,'stale_source');
  assert.equal(stale[0].tone,'neutral');
  assert.match(stale[0].body,/2026-09-01/,'the actual latest Fitbit date is disclosed');
  assert.match(stale[0].body,/geen herstel- of activiteitsadvies/,'stale data cannot masquerade as a current action');
  assert.doesNotMatch(stale[0].body,/lichtere trainingsdag|korte wandeling|vanavond de simpelste herstelactie/,'no current-sounding action survives stale-source gating');
}

// Yesterday remains a valid pre-sync source and every normal insight labels its source day.
{
  const yesterday=api.healthInsights(series('2026-09-03'),'2026-09-04',12);
  assert.notEqual(yesterday[0].key,'stale_source','yesterday remains usable before today\'s Fitbit sync');
  assert.ok(yesterday.every(item=>/bron gisteren/.test(item.meta)),'normal insights disclose that yesterday is the source');
}

// Today remains current and source transparency is still explicit.
{
  const current=api.healthInsights(series('2026-09-04'),'2026-09-04',20);
  assert.notEqual(current[0].key,'stale_source');
  assert.ok(current.every(item=>/bron vandaag/.test(item.meta)),'current insights label today as the source');
}

// Lock the behavior, not a specific prototype version number. Otherwise every
// healthy Health Trail iteration would create a false-negative regression run.
assert.match(source,/key:'stale_source'/,'source retains an explicit stale-source state');
assert.match(source,/sourceDate<previousDayKey\(today\)/,'older-than-yesterday gate is explicit');
assert.doesNotMatch(source,/localStorage\.setItem/,'stale-source hardening remains read-only');
console.log('Health Trail stale-source smoke passed: older Fitbit data cannot produce current-sounding advice.');