/* Health Trail recovery-baseline smoke — ChatGPT (OpenAI) */
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

// One extreme prior night must not become a fake personal HRV/RHR baseline.
{
  const thin=api.recoveryScore({
    '2026-09-02':{hrvMs:100,restingHR:50},
    '2026-09-03':{hrvMs:40,restingHR:75}
  },'2026-09-03');
  const hrv=thin.components.find(x=>x.key==='hrv');
  const rhr=thin.components.find(x=>x.key==='rhr');
  assert.equal(hrv.baseline,null,'fewer than five HRV history values produce no personal baseline');
  assert.equal(rhr.baseline,null,'fewer than five resting-HR history values produce no personal baseline');
  assert.equal(hrv.score,5,'thin-history HRV stays neutral instead of overreacting');
  assert.equal(rhr.score,5,'thin-history resting HR stays neutral instead of overreacting');
}

// Once five historical values exist, the personal baseline becomes active.
{
  const data={};
  for(let d=1;d<=5;d++)data['2026-09-0'+d]={hrvMs:80,restingHR:58};
  data['2026-09-06']={hrvMs:60,restingHR:64};
  const mature=api.recoveryScore(data,'2026-09-06');
  const hrv=mature.components.find(x=>x.key==='hrv');
  const rhr=mature.components.find(x=>x.key==='rhr');
  assert.equal(hrv.baseline,80,'five HRV values activate personal median baseline');
  assert.equal(rhr.baseline,58,'five resting-HR values activate personal median baseline');
  assert.ok(hrv.score<5,'lower-than-baseline HRV can affect recovery only after baseline maturity');
  assert.ok(rhr.score<5,'higher-than-baseline resting HR can affect recovery only after baseline maturity');
}

// The visible readout can disclose whether recovery is current, yesterday's
// pre-sync fallback, or older — without treating metadata keys as Fitbit days.
assert.equal(api.recoverySourceLabel('2026-09-04','2026-09-04'),'vandaag');
assert.equal(api.recoverySourceLabel('2026-09-03','2026-09-04'),'gisteren');
assert.equal(api.recoverySourceLabel('2026-08-31','2026-09-04'),'2026-08-31');
assert.equal(api.recoverySourceLabel(null,'2026-09-04'),'geen Fitbit-bron');

assert.match(source,/hrvValues\.length>=5/,'source locks five-value HRV baseline threshold');
assert.match(source,/rhrValues\.length>=5/,'source locks five-value resting-HR baseline threshold');
assert.match(source,/herstelsignalen ·.*recoverySourceLabel/,'visible recovery metadata includes the source-day label');
assert.doesNotMatch(source,/localStorage\.setItem/,'baseline/source-date hardening remains read-only');
console.log('Health Trail baseline smoke passed: mature HRV/RHR baselines and transparent recovery source day.');