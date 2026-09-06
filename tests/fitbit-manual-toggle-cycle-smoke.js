/* Fitbit-backed Daily Mission manual toggle integration regression
   Performed-by: ChatGPT (OpenAI), 2026-09-03
   Run with: node tests/fitbit-manual-toggle-cycle-smoke.js */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

class Storage{
  constructor(seed={}){this.map=new Map(Object.entries(seed).map(([k,v])=>[k,String(v)]));}
  get length(){return this.map.size;}
  key(i){return Array.from(this.map.keys())[i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}
function CustomEvent(type,init){this.type=type;this.detail=init&&init.detail;}
function Event(type){this.type=type;}
async function settle(turns=16){for(let i=0;i<turns;i++)await Promise.resolve();}

const now=new Date();
const DAY=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
const ledgerKey='__xp_awarded_v1:walking:'+DAY;
const stateKey='walking:'+DAY;
const seed={
  rpg_autohabit_v1:JSON.stringify({
    __retrospective_v2_migrated:true,
    __xp_ledger_v1_migrated:true,
    [stateKey]:true,
    [ledgerKey]:true
  }),
  rpg_habitlog_v1:JSON.stringify({walking:{[DAY]:true}}),
  rpg_streak_v1:JSON.stringify({days:{[DAY]:true}})
};
const localStorage=new Storage(seed);
const xpRows=[{skill:'walking',amount:15,reason:'Auto: 10k stappen gehaald ('+DAY+')',date:DAY}];
const xpCalls=[];
const timers=[];
const listeners={};
function addListener(type,fn){(listeners[type]=listeners[type]||[]).push(fn);}
function dispatch(event){(listeners[event.type]||[]).slice().forEach(fn=>fn(event));return true;}

const window={
  localStorage,
  addEventListener:addListener,
  dispatchEvent:dispatch,
  gamenfyAuthReady:Promise.resolve(),
  gamenfyUserId:'owner-1',
  gamenfySupabase:{
    from(table){return{
      select(){return this;},
      eq(){return this;},
      in(){return Promise.resolve({data:[
        {key:'health_fitbit',data:{[DAY]:{steps:12000,sleepMinutes:0}},updated_at:new Date().toISOString()},
        {key:'rpg',data:{
          rpg_autohabit_v1:JSON.parse(localStorage.getItem('rpg_autohabit_v1')||'{}'),
          rpg_habitlog_v1:JSON.parse(localStorage.getItem('rpg_habitlog_v1')||'{}'),
          rpg_streak_v1:JSON.parse(localStorage.getItem('rpg_streak_v1')||'{"days":{}}')
        },updated_at:new Date(Date.now()-1000).toISOString()}
      ],error:null});}
    };}
  },
  getCharacter:()=>({xpLog:xpRows}),
  recomputeHabitFromLog(){},
  renderMissions(){},renderCharStrip(){},renderStreakPill(){},renderCheckinCard(){},renderArc(){},
  Streak:{},
  toggleMission(){},
  addXP(key,amount,reason){xpCalls.push({key,amount,reason});xpRows.unshift({skill:key,amount,reason,date:DAY});}
};
const document={readyState:'complete',hidden:false,addEventListener(type,fn){addListener('document:'+type,fn);}};
const context={
  window,document,localStorage,CustomEvent,Event,Date,Number,Object,String,JSON,RegExp,Array,Promise,Math,console,
  setTimeout(fn,ms=0){const t={fn,ms,cancelled:false,ran:false};timers.push(t);return t;},
  clearTimeout(t){if(t)t.cancelled=true;},setInterval(){return 1;},fetch:async()=>({ok:true})
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8'),context,{filename:'sync.js'});

// Simulate xp.js arriving after sync.js, matching the real page order.
window.uncheckHabit=function(key){return {kind:'uncheck',key};};
window.checkHabit=function(key){return {kind:'check',key};};
for(const timer of timers.filter(t=>!t.cancelled&&!t.ran)){timer.ran=true;timer.fn();}
assert.equal(window.uncheckHabit.__gamenfyAutoUncheckGuard,true);
assert.equal(window.checkHabit.__gamenfyAutoCheckGuard,true);

function readState(){return JSON.parse(localStorage.getItem('rpg_autohabit_v1')||'{}');}
function readLog(){return JSON.parse(localStorage.getItem('rpg_habitlog_v1')||'{}');}
function writeLog(log){localStorage.setItem('rpg_habitlog_v1',JSON.stringify(log));}
function manualXp(amount,reason){window.addXP('walking',amount,reason);}

(async()=>{
  // Character-style uncheck: shared uncheck engine first, then canonical log + XP.
  window.uncheckHabit('walking');
  let log=readLog();delete log.walking[DAY];writeLog(log);
  manualXp(-15,'10k Steps habit unchecked');
  assert.equal(readState()[stateKey],'manual-off','Character uncheck immediately suppresses Fitbit');
  assert.equal(readState()[ledgerKey],true,'earned XP ledger remains historical evidence after uncheck');

  // Load the reconciler only now, as if Joey navigated from Character to Main.
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','autohabit-reconcile.js'),'utf8'),context,{filename:'autohabit-reconcile.js'});
  const beforeFight=xpCalls.length;
  await window.autoCheckHealthHabits();
  await settle();
  assert.equal(readLog().walking[DAY],undefined,'qualified Fitbit data may not restore a deliberate manual-off day');
  assert.equal(xpCalls.length,beforeFight,'suppressed Fitbit retry creates no XP side effect');

  // Character-style deliberate re-check clears suppression via central check guard.
  window.checkHabit('walking');
  log=readLog();log.walking=log.walking||{};log.walking[DAY]=true;writeLog(log);
  manualXp(15,'10k Steps habit');
  assert.notEqual(readState()[stateKey],'manual-off','manual re-check re-enables the date for normal reconciliation');

  const beforeReconcile=xpCalls.length;
  await window.autoCheckHealthHabits();
  await settle();
  const finalState=readState();
  assert.equal(readLog().walking[DAY],true,'manual re-check remains canonical after Fitbit reconciliation');
  assert.equal(finalState[stateKey],true,'reconciler records the re-checked qualified day as confirmed');
  assert.equal(finalState[ledgerKey],true,'original reward ledger survives the whole toggle cycle');
  assert.equal(xpCalls.length,beforeReconcile,'Fitbit never adds a second +15 after deliberate manual re-check');

  const net=xpRows.filter(row=>row.skill==='walking').reduce((sum,row)=>sum+Number(row.amount||0),0);
  assert.equal(net,15,'auto +15, manual -15, manual +15 leaves exactly one completion reward net');
  const autoRewards=xpRows.filter(row=>row.skill==='walking'&&Number(row.amount)===15&&String(row.reason).startsWith('Auto:'));
  assert.equal(autoRewards.length,1,'only the original Fitbit reward exists after the full cycle');

  console.log('Fitbit manual toggle cycle smoke: auto reward, uncheck suppression, re-check and no double pay passed.');
})().catch(err=>{console.error(err);process.exitCode=1;});