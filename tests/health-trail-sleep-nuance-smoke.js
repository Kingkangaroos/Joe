/* Health Trail sleep nuance smoke — ChatGPT (OpenAI) */
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

function key(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
function sleepSeries(baseline,recent){
  const out={};
  const start=new Date(2026,7,15);
  for(let i=0;i<14;i++){const d=new Date(start);d.setDate(d.getDate()+i);out[key(d)]={sleepMinutes:baseline};}
  ['2026-09-02','2026-09-03','2026-09-04'].forEach((d,i)=>{out[d]={sleepMinutes:recent[i]};});
  return out;
}

// Realistic current shape: 6u03, 7u36 and 6u57 averages 6u52.
// That is below the exact 7h mission, but only by 8 minutes and above the prior
// baseline in this fixture, so it should not become a recovery warning.
{
  const insights=api.healthInsights(sleepSeries(399,[363,456,417]),'2026-09-04',16);
  assert.equal(insights[0].key,'sleep_near_goal','a <=15 minute miss becomes a neutral near-goal insight');
  assert.equal(insights[0].tone,'neutral');
  assert.match(insights[0].body,/6u52/,'the recent average is shown');
  assert.match(insights[0].body,/8 minuten/,'the small gap to 7h is explicit');
  assert.match(insights[0].body,/missie blijft exact 7 uur/,'advice nuance cannot silently change mission logic');
  assert.match(insights[0].meta,/adviesbuffer 15 min/,'the advice-only margin is transparent');
}

// A meaningfully short recent average still produces the existing watch state.
{
  const insights=api.healthInsights(sleepSeries(399,[385,390,395]),'2026-09-04',16);
  assert.equal(insights[0].key,'sleep_consistency','well below the advice floor still creates a sleep consistency warning');
  assert.equal(insights[0].tone,'watch');
}

// A clear decline versus a much higher personal baseline must outrank near-goal
// tolerance even if the absolute value lands within 15 minutes of the 7h mission.
{
  const insights=api.healthInsights(sleepSeries(480,[417,417,417]),'2026-09-04',16);
  assert.equal(insights[0].key,'sleep_trend','personal-baseline decline still wins over near-goal tolerance');
  assert.equal(insights[0].tone,'watch');
  assert.match(insights[0].body,/persoonlijke mediaan/);
}

assert.match(source,/Health Trail Lab prototype v1\.27/,'source version records sleep-advice nuance');
assert.match(source,/SLEEP_MISSION_MINUTES=420/,'the exact mission reference remains 420 minutes');
assert.match(source,/SLEEP_ADVICE_MARGIN=15/,'the advice-only margin is explicit');
assert.doesNotMatch(source,/localStorage\.setItem/,'sleep nuance remains read-only');
console.log('Health Trail sleep nuance smoke passed: near-7h misses are neutral without changing the exact mission threshold.');