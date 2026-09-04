/* Health Trail calendar-baseline smoke — ChatGPT (OpenAI) */
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

// Five old records must not become a fake current HRV/RHR baseline after a long
// sync gap just because they are the last five available values.
{
  const data={
    '2026-07-01':{hrvMs:90,restingHR:55},
    '2026-07-02':{hrvMs:90,restingHR:55},
    '2026-07-03':{hrvMs:90,restingHR:55},
    '2026-07-04':{hrvMs:90,restingHR:55},
    '2026-07-05':{hrvMs:90,restingHR:55},
    '2026-09-04':{hrvMs:55,restingHR:68}
  };
  const recovery=api.recoveryScore(data,'2026-09-04');
  const hrv=recovery.components.find(x=>x.key==='hrv');
  const rhr=recovery.components.find(x=>x.key==='rhr');
  assert.equal(hrv.baseline,null,'weeks-old HRV values cannot create a personal baseline');
  assert.equal(rhr.baseline,null,'weeks-old resting-HR values cannot create a personal baseline');
  assert.equal(hrv.score,5,'stale-history HRV stays neutral');
  assert.equal(rhr.score,5,'stale-history resting HR stays neutral');
  const insights=api.healthInsights(data,'2026-09-04',12);
  assert.equal(insights.some(x=>x.key==='recovery_load'),false,'old physiology cannot trigger a current recovery warning');
}

// Recent continuous evidence still activates the personal-baseline warning path.
{
  const data={};
  ['2026-08-29','2026-08-30','2026-08-31','2026-09-01','2026-09-02','2026-09-03'].forEach((d,i)=>{data[d]={hrvMs:80+(i%2),restingHR:58+(i%2)};});
  data['2026-09-04']={hrvMs:60,restingHR:64};
  const insights=api.healthInsights(data,'2026-09-04',12);
  assert.equal(insights[0].key,'recovery_load','five-plus genuinely recent values still support a cautious recovery warning');
}

// "Recent sleep" means the latest three calendar days. Widely spaced available
// rows must not be averaged together and described as a recent multi-night trend.
{
  const data={
    '2026-08-20':{sleepMinutes:480},
    '2026-08-21':{sleepMinutes:480},
    '2026-08-22':{sleepMinutes:480},
    '2026-08-23':{sleepMinutes:480},
    '2026-08-24':{sleepMinutes:480},
    '2026-08-28':{sleepMinutes:390},
    '2026-09-01':{sleepMinutes:390},
    '2026-09-04':{sleepMinutes:390}
  };
  const insights=api.healthInsights(data,'2026-09-04',12);
  assert.equal(insights.some(x=>x.key==='sleep_trend'),false,'scattered old sleep rows cannot form a three-night trend');
  assert.equal(insights.some(x=>x.key==='sleep_consistency'),false,'scattered old sleep rows cannot form a recent consistency average');
  assert.equal(insights.some(x=>x.key==='sleep_short'),true,'the current short night may still receive a single-night practical nudge');
}

assert.match(source,/offsetDayKey\(sourceDate,-14\)/,'physiology baseline uses a calendar-window cutoff');
assert.match(source,/recentSleepFloor=offsetDayKey\(sourceDate,-2\)/,'sleep recent window is three actual calendar days');
assert.match(source,/sleepBaseFloor=offsetDayKey\(baselineEnd,-14\)/,'sleep baseline also uses a real calendar window');
assert.doesNotMatch(source,/localStorage\.setItem/,'calendar baseline hardening remains read-only');
console.log('Health Trail calendar-baseline smoke passed: stale historical gaps cannot manufacture current personal baselines.');