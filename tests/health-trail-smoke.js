/* Health Trail browserless smoke test — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ids={};
function element(id){return ids[id]={id,dataset:{},style:{values:{},setProperty(k,v){this.values[k]=String(v);}},textContent:'',src:'',alt:''};}
['healthTrail','htLevel','htRunnerLevel','htCharacter','htTotal','htMissions','htMissionMeta','htRecovery','htRecoveryMeta','htMessage'].forEach(element);
const listeners={};
const sandboxWindow={addEventListener:(type,fn)=>{listeners[type]=fn;},RPG_DEFAULT_SKILLS:{},getHabits:()=>({})};
const sandbox={window:sandboxWindow,document:{readyState:'loading',hidden:false,getElementById:id=>ids[id]||null,addEventListener:(type,fn)=>{listeners['document:'+type]=fn;}},localStorage:{getItem:()=>null},setInterval:()=>1,console,Date,Math,Number,Object,String,JSON,Promise};
const source=fs.readFileSync(path.join(__dirname,'..','health-trail.js'),'utf8');
vm.runInNewContext(source,sandbox,{filename:'health-trail.js'});
const api=sandboxWindow.GamenfyHealthTrail;

const defs={};const habits={};
for(let i=0;i<11;i++){defs['m'+i]={isHabit:true,active:true};habits['m'+i]={score:i<6?6:7};}
defs.private={isHabit:true,private:true};habits.private={score:0};
defs.skill={isHabit:false};habits.skill={score:0};
const missions=api.missionScore(defs,habits);
assert.equal(missions.count,11,'all eleven public dailies contribute');
assert.equal(missions.total,11,'private and regular skills are excluded');
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

sandboxWindow.RPG_DEFAULT_SKILLS=defs;sandboxWindow.getHabits=()=>habits;
api.render({'2026-09-02':{sleepMinutes:480}});
assert.match(ids.htCharacter.src,/img\/lab\/park31\/steps\/l\d{2}\.webp\?v=1\.13$/,'the current Steps evolution supplies the runner');
assert.equal(ids.healthTrail.style.values['--ht-runner'].endsWith('%'),true,'the character position follows the score');
assert.equal(ids.healthTrail.style.values['--ht-progress'].endsWith('%'),true,'the health bar follows the score');

listeners['document:DOMContentLoaded']();
assert.equal(typeof listeners['gamenfy:daily-mission-change'],'function','manual Daily Mission changes refresh the trail');
assert.equal(typeof listeners['gamenfy:auto-habits-changed'],'function','Fitbit retrospective reconciliation refreshes the trail immediately');
assert.equal(typeof listeners['gamenfy:remote-state-applied'],'function','remote RPG sync changes refresh the trail');
assert.equal(typeof listeners.focus,'function','returning to the Lab refreshes health inputs');
assert.equal(typeof listeners['document:visibilitychange'],'function','foregrounding the Lab refreshes health inputs');
assert.match(source,/refreshInFlight/,'rapid events coalesce Fitbit reads instead of fanning out requests');

const lab=fs.readFileSync(path.join(__dirname,'..','lab.html'),'utf8');
const section=lab.match(/<section class="ht-card"[\s\S]*?<\/section>/)[0];
const chatgptPanel=lab.match(/<section class="lab-panel" id="labPanelChatgpt"[\s\S]*?<section class="lab-panel" id="labPanelOther"/)[0];
assert.doesNotMatch(section,/href=/,'Health Trail is built directly in Lab, not hidden behind a link');
assert.doesNotMatch(chatgptPanel,/<a class="chatgpt-lab-card"/,'ChatGPT Lab creation cards are status cards, not preview links');
assert.match(lab,/health-trail\.js\?v=1\.0/,'existing Lab loader remains valid; Vercel serves the updated file at the same path');
assert.match(lab,/health-trail\.css\?v=1\.0/);
console.log('Health Trail smoke test passed: scoring, Fitbit fallback, reconciliation refresh, runner and direct Lab mount.');