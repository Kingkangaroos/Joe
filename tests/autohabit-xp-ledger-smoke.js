/* Fitbit retrospective XP exactly-once regression
   Performed-by: ChatGPT (OpenAI), 2026-09-03
   Run with: node tests/autohabit-xp-ledger-smoke.js */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const code=fs.readFileSync(path.join(__dirname,'..','autohabit-reconcile.js'),'utf8');
const DAY='2026-09-01';

function CustomEvent(type,init){this.type=type;this.detail=init&&init.detail;}
async function settle(turns=12){for(let i=0;i<turns;i++)await Promise.resolve();}

function makeHarness({state={},habitlog={},xpLog=[],health={steps:12000,sleepMinutes:0}}={}){
  const store={
    rpg_autohabit_v1:JSON.stringify(state),
    rpg_habitlog_v1:JSON.stringify(habitlog),
    rpg_streak_v1:JSON.stringify({days:{}})
  };
  const xpRows=xpLog.map(row=>Object.assign({},row));
  const xpCalls=[];
  const scheduled=[];
  const localStorage={
    getItem:key=>Object.prototype.hasOwnProperty.call(store,key)?store[key]:null,
    setItem:(key,value)=>{store[key]=String(value);},
    removeItem:key=>{delete store[key];}
  };
  function remoteRpg(){
    return {
      rpg_autohabit_v1:JSON.parse(store.rpg_autohabit_v1||'{}'),
      rpg_habitlog_v1:JSON.parse(store.rpg_habitlog_v1||'{}'),
      rpg_streak_v1:JSON.parse(store.rpg_streak_v1||'{"days":{}}')
    };
  }
  const window={
    localStorage,
    gamenfyAuthReady:Promise.resolve(),
    getCharacter:()=>({xpLog:xpRows}),
    gamenfyAuthedFetch:async()=>({ok:true,json:async()=>[
      {key:'health_fitbit',data:{[DAY]:health},updated_at:'2026-09-03T11:15:15.789Z'},
      {key:'rpg',data:remoteRpg(),updated_at:'2026-09-03T11:12:10.174Z'}
    ]}),
    recomputeHabitFromLog(){},
    addXP(key,amount,reason){
      xpCalls.push({key,amount,reason});
      xpRows.unshift({skill:key,amount,reason,date:'2026-09-03'});
    },
    toggleMission(){},
    addEventListener(){},dispatchEvent(){}
  };
  const document={hidden:false,addEventListener(){}};
  const context={
    window,document,localStorage,CustomEvent,Date,Number,Object,String,JSON,RegExp,Array,Promise,console,
    setTimeout(fn,ms){scheduled.push({fn,ms});return scheduled.length;},clearTimeout(){}
  };
  vm.createContext(context);
  vm.runInContext(code,context);
  return {
    store,xpRows,xpCalls,window,
    async run(){const result=await window.autoCheckHealthHabits();await settle();return result;},
    autoState(){return JSON.parse(store.rpg_autohabit_v1||'{}');},
    habitlog(){return JSON.parse(store.rpg_habitlog_v1||'{}');}
  };
}

(async()=>{
  // 1. A genuinely new Fitbit completion after ledger migration gets +15 once.
  {
    const h=makeHarness({state:{__retrospective_v2_migrated:true,__xp_ledger_v1_migrated:true}});
    const added=await h.run();
    assert.equal(added,1,'new qualified Fitbit day is added to canonical history');
    assert.equal(h.xpCalls.length,1,'new qualified Fitbit day gets one XP award');
    assert.equal(h.xpCalls[0].amount,15);
    assert.equal(h.habitlog().walking[DAY],true);
    assert.equal(h.autoState()['__xp_awarded_v1:walking:'+DAY],true,'XP ledger is persisted after award');
    await h.run();
    assert.equal(h.xpCalls.length,1,'normal retry cannot pay the same Fitbit day twice');
  }

  // 2. First ledger migration treats pre-existing canonical history as paid.
  {
    const h=makeHarness({
      state:{__retrospective_v2_migrated:true},
      habitlog:{walking:{[DAY]:true}},
      xpLog:[]
    });
    await h.run();
    assert.equal(h.xpCalls.length,0,'legacy canonical completion is never re-paid just because its old XP event aged out');
    assert.equal(h.autoState().__xp_ledger_v1_migrated,true);
    assert.equal(h.autoState()['__xp_awarded_v1:walking:'+DAY],true,'legacy canonical day receives a paid ledger marker');
  }

  // 3. Crash-before-XP shape: canonical day + auto state survived, ledger did not.
  {
    const h=makeHarness({
      state:{__retrospective_v2_migrated:true,__xp_ledger_v1_migrated:true,['walking:'+DAY]:true},
      habitlog:{walking:{[DAY]:true}},
      xpLog:[]
    });
    await h.run();
    assert.equal(h.xpCalls.length,1,'missing XP after a confirmed post-migration Fitbit day is repaired');
    assert.equal(h.autoState()['__xp_awarded_v1:walking:'+DAY],true);
    await h.run();
    assert.equal(h.xpCalls.length,1,'repaired crash-before-XP day remains exactly-once');
  }

  // 4. Crash-after-XP-before-ledger: XP audit exists, so only ledger is healed.
  {
    const h=makeHarness({
      state:{__retrospective_v2_migrated:true,__xp_ledger_v1_migrated:true,['walking:'+DAY]:true},
      habitlog:{walking:{[DAY]:true}},
      xpLog:[{skill:'walking',amount:15,reason:'Auto: 10k stappen gehaald ('+DAY+')',date:'2026-09-03'}]
    });
    await h.run();
    assert.equal(h.xpCalls.length,0,'existing auto XP audit prevents duplicate reward after crash');
    assert.equal(h.autoState()['__xp_awarded_v1:walking:'+DAY],true,'missing ledger heals from existing XP audit');
  }

  // 5. Manual completion that Fitbit also qualifies must never receive auto +15 again.
  {
    const h=makeHarness({
      state:{__retrospective_v2_migrated:true,__xp_ledger_v1_migrated:true},
      habitlog:{walking:{[DAY]:true}},
      xpLog:[{skill:'walking',amount:15,reason:'Habit: 10k Steps ('+DAY+')',date:'2026-09-03'}]
    });
    await h.run();
    assert.equal(h.xpCalls.length,0,'manual +15 is recognized as the completion reward');
    assert.equal(h.autoState()['walking:'+DAY],true,'Fitbit still records the day as confirmed auto-backed');
    assert.equal(h.autoState()['__xp_awarded_v1:walking:'+DAY],true,'manual completion receives ledger marker without a second award');
  }

  assert.match(code,/__xp_ledger_v1_migrated/,'XP ledger migration is durable');
  assert.match(code,/completionXpEvidence/,'XP audit is checked before any repair award');
  assert.match(code,/saveJson\(AUTO_KEY, state\)/,'ledger state is persisted durably');
  console.log('autohabit XP ledger smoke: legacy, new, crash-before, crash-after and manual overlap are exactly-once.');
})().catch(err=>{console.error(err);process.exitCode=1;});