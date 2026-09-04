/* Health Trail + Health Insights browserless smoke test — ChatGPT (OpenAI) */
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
const sandboxWindow={addEventListener:(type,fn)=>{listeners[type]=fn;},RPG_DEFAULT_SKILLS:{},getHabits:()=>({})};
const sandbox={window:sandboxWindow,document:{readyState:'loading',hidden:false,getElementById:id=>ids[id]||null,createElement:tag=>element(''),addEventListener:(type,fn)=>{listeners['document:'+type]=fn;}},localStorage:{getItem:()=>null},setInterval:()=>1,console,Date,Math,Number,Object,String,JSON,Promise};
const source=fs.readFileSync(path.join(__dirname,'..','health-trail.js'),'utf8');
vm.runInNewContext(source,sandbox,{filename:'health-trail.js'});
const api=sandboxWindow.GamenfyHealthTrail;

const defs={};const habits={};
for(let i=0;i<11;i++){defs['m'+i]={isHabit:true,active:true};habits['m'+i]={score:i<6?6:7};}
defs.private={isHabit:true,private:true};habits.private={score:0};
defs.disabled={isHabit:true,active:false};habits.disabled={score:10};
defs.skill={isHabit:false};habits.skill={score:0};
const missions=api.missionScore(defs,habits);
assert.equal(missions.count,11,'all eleven public dailies contribute');
assert.equal(missions.total,11,'private, disabled and regular skills are excluded');
assert.ok(Math.abs(missions.score-(71/11))<.001,'mission score is the real public-level average');

const recovery=api.recoveryScore({
  '2026-08-30':{hrvMs:60,restingHR:64},'2026-08-31':{hrvMs:64,restingHR:62},
  '2026-09-01':{hrvMs:62,restingHR:63},'2026-09-02':{sleepMinutes:390,hrvMs:62,restingHR:63}
},'2026-09-02');
assert.equal(recovery.components.length,3,'sleep, HRV and resting HR form recovery');
assert.ok(recovery.score>=4.9&&recovery.score<=5.1,'personal baselines keep normal recovery neutral');
assert.equal(api.totalScore(8,4),6.8,'overall score is 70% missions and 30% recovery');
assert.equal(api.totalScore(8,null),8,'missing Fitbit data never drags the score down');
assert.equal(api.band(2.9).label,'Noodstand');
assert.equal(api.band(9).label,'King mode');

// Before the first Fitbit sync after Amsterdam midnight, metadata keys must not
// displace yesterday as the latest real recovery date.
{
  const preSync=api.recoveryScore({
    '2026-09-02':{hrvMs:62,restingHR:63},
    '2026-09-03':{sleepMinutes:456,hrvMs:64,restingHR:61},
    source:'google-health-v13-secure',
    updated:'2026-09-03T22:15:00.000Z'
  },'2026-09-04');
  assert.equal(preSync.date,'2026-09-03','pre-sync midnight fallback uses the latest real Fitbit calendar date');
  assert.equal(preSync.components.length,3,'yesterday recovery remains visible before today Fitbit row exists');
}

function datedSeries(startDay,count,make){
  const out={};
  for(let i=0;i<count;i++){
    const d=new Date(2026,7,startDay+i);
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    out[k]=make(i);
  }
  return out;
}

// A recovery warning requires HRV AND resting HR to move together vs >=5 personal history days.
{
  const data=datedSeries(20,8,i=>i<7?{hrvMs:80+(i%2),restingHR:58+(i%2),sleepMinutes:470,steps:9000}:{hrvMs:60,restingHR:64,sleepMinutes:470,steps:8500});
  const insights=api.healthInsights(data,'2026-08-27',12);
  assert.equal(insights[0].key,'recovery_load','two aligned recovery signals create the highest-priority cautious warning');
  assert.match(insights[0].body,/eigen recente mediaan/,'recovery advice is explicitly personal-baseline based');
  assert.match(insights[0].body,/lichtere trainingsdag/,'recovery insight gives a concrete low-risk action rather than a diagnosis');
}

// A genuine multi-day sleep decline is distinct from simply living below the 7h mission.
{
  const data=datedSeries(10,10,i=>({sleepMinutes:i<7?480:390,steps:9000}));
  const insights=api.healthInsights(data,'2026-08-19',12);
  assert.equal(insights[0].key,'sleep_trend','a real drop versus older personal sleep is summarized as a decline');
  assert.match(insights[0].body,/eerdere persoonlijke mediaan/,'sleep decline compares the user with themselves');
  assert.match(insights[0].meta,/duidelijke daling/,'decline label is reserved for a meaningful personal-baseline drop');
  assert.doesNotMatch(insights[0].body,/ziekte|stoornis|diagnos/i,'sleep trend never invents a diagnosis');
}

// Stable-but-short sleep must not be mislabeled as a sudden decline.
{
  const data=datedSeries(10,10,i=>({sleepMinutes:i<7?400:402,steps:9000}));
  const insights=api.healthInsights(data,'2026-08-19',12);
  assert.equal(insights[0].key,'sleep_consistency','stable sub-7h sleep is a mission-consistency issue, not a fake deterioration');
  assert.match(insights[0].body,/niet automatisch op een plotselinge verslechtering/,'copy explicitly distinguishes goal gap from decline');
  assert.doesNotMatch(insights[0].title,/gedaald|achter/,'stable low sleep title must not claim a decline');
}

// Steps nudge only appears once the current day is mature enough to judge.
{
  const data=datedSeries(20,7,i=>i<6?{steps:10000}:{steps:3000});
  const early=api.healthInsights(data,'2026-08-26',10);
  const late=api.healthInsights(data,'2026-08-26',20);
  assert.equal(early.some(x=>x.key==='steps_evening'),false,'low morning steps never trigger a failure-style nudge');
  assert.equal(late.some(x=>x.key==='steps_evening'),true,'same low steps can become a practical evening mission nudge');
}

// High-stakes wearable fields are intentionally not interpreted from one isolated reading.
{
  const data=datedSeries(20,6,i=>({spo2:i<5?97:89,breathingRate:15,skinTempDelta:i<5?0:.8}));
  const insights=api.healthInsights(data,'2026-08-25',20);
  assert.equal(insights.some(x=>x.tone==='watch'),false,'isolated SpO2/breathing/temperature values cannot generate an automatic health warning');
  assert.equal(insights[0].key,'quiet','thin supported signals produce baseline-building/quiet output instead of alarm');
}

sandboxWindow.RPG_DEFAULT_SKILLS=defs;sandboxWindow.getHabits=()=>habits;
api.render({'2026-09-02':{sleepMinutes:480}});
assert.match(ids.htCharacter.src,/img\/lab\/park31\/steps\/l\d{2}\.webp\?v=1\.13$/,'the current Steps evolution supplies the runner');
assert.equal(ids.healthTrail.style.values['--ht-runner'].endsWith('%'),true,'the character position follows the score');
assert.equal(ids.healthTrail.style.values['--ht-progress'].endsWith('%'),true,'the health bar follows the score');
assert.ok(ids.htInsights,'Health Insights are injected directly into the existing Health Trail card');
assert.equal(readout.children.includes(ids.htInsights),true,'Health Insights live inside the read-only Health Trail readout');

listeners['document:DOMContentLoaded']();
assert.equal(typeof listeners['gamenfy:daily-mission-change'],'function','manual Daily Mission changes refresh the trail');
assert.equal(typeof listeners['gamenfy:auto-habits-changed'],'function','Fitbit retrospective reconciliation refreshes the trail immediately');
assert.equal(typeof listeners['gamenfy:remote-state-applied'],'function','remote RPG sync changes refresh the trail');
assert.equal(typeof listeners.focus,'function','returning to the Lab refreshes health inputs');
assert.equal(typeof listeners['document:visibilitychange'],'function','foregrounding the Lab refreshes health inputs');
assert.match(source,/refreshInFlight/,'rapid events coalesce Fitbit reads instead of fanning out requests');
assert.doesNotMatch(source,/localStorage\.setItem/,'Health Trail + Health Insights remain read-only');
assert.match(source,/>=5 historical values/,'insight source documents the minimum personal-baseline evidence rule');
assert.match(source,/intentionally do not interpret SpO2\/breathing\/skin-temperature as diagnosis/,'high-stakes wearable fields are explicitly excluded from automated interpretation');
assert.equal(api.healthInsights({},'2026-09-02',12)[0].key,'waiting','missing Fitbit data creates a waiting state, never a penalty');

const lab=fs.readFileSync(path.join(__dirname,'..','lab.html'),'utf8');
const section=lab.match(/<section class="ht-card"[\s\S]*?<\/section>/)[0];
const chatgptPanel=lab.match(/<section class="lab-panel" id="labPanelChatgpt"[\s\S]*?<section class="lab-panel" id="labPanelOther"/)[0];
assert.doesNotMatch(section,/href=/,'Health Trail is built directly in Lab, not hidden behind a link');
assert.doesNotMatch(chatgptPanel,/<a class="chatgpt-lab-card"/,'ChatGPT Lab creation cards are status cards, not preview links');
assert.match(lab,/health-trail\.js\?v=1\.0/,'existing Lab loader remains valid; Vercel revalidates the updated file at the same path');
assert.match(lab,/health-trail\.css\?v=1\.0/);
console.log('Health Trail smoke test passed: scoring, cautious personal-baseline insights, midnight fallback, sleep distinction, Fitbit refresh and direct Lab mount.');