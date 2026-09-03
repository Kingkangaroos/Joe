/* Daily Mission authoritative reset smoke test — ChatGPT (OpenAI)
   Run with: node tests/habit-reset-smoke.js */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const today='2026-09-03';
const store={
  rpg_habitlog_v1:JSON.stringify({
    walking:{'2026-08-30':true,'2026-08-31':true,'2026-09-03':true},
    gratitude:{'2026-08-30':true}
  }),
  rpg_autohabit_v1:JSON.stringify({
    'walking:2026-08-30':true,'walking:2026-08-31':true,'walking:2026-09-03':true,
    '__retrospective_v2_migrated':true
  }),
  rpg_habits_v1:JSON.stringify({walking:{score:3,streak:1,lastChecked:today}}),
  rpg_character_v1:JSON.stringify({xpLog:[{skill:'walking',amount:15,date:'2026-08-30'},{skill:'walking',amount:15,date:'2026-09-03'}]})
};
const localStorage={
  getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,
  setItem:(k,v)=>{store[k]=String(v);},
  removeItem:k=>{delete store[k];}
};
const documentListeners={};
const reopened=[];
const events=[];
const document={
  readyState:'loading',
  head:{appendChild(){}},
  querySelector:()=>null,
  createElement:()=>({dataset:{}}),
  addEventListener:(type,fn)=>{documentListeners[type]=fn;},
  getElementById:()=>({remove(){}})
};
function CustomEvent(type,init){this.type=type;this.detail=init&&init.detail;}
const window={
  localStorage,
  addEventListener(){},
  dispatchEvent:event=>events.push(event),
  mdReset(key,isPrivate,privateId,e){
    const btn=e&&e.target;
    if(btn&&!btn.dataset.arm){btn.dataset.arm='1';return;}
    const resets=JSON.parse(localStorage.getItem('rpg_habit_reset_v1')||'{}');
    resets[key]=today;
    localStorage.setItem('rpg_habit_reset_v1',JSON.stringify(resets));
    const habits=JSON.parse(localStorage.getItem('rpg_habits_v1')||'{}');
    if(habits[key]){habits[key].score=0;habits[key].streak=0;habits[key].lastChecked=null;}
    localStorage.setItem('rpg_habits_v1',JSON.stringify(habits));
  },
  recomputeHabitFromLog(key){
    const log=JSON.parse(localStorage.getItem('rpg_habitlog_v1')||'{}');
    const checked=Object.keys(log[key]||{}).filter(d=>log[key][d]).sort();
    const habits=JSON.parse(localStorage.getItem('rpg_habits_v1')||'{}');
    habits[key]=habits[key]||{};
    habits[key].score=Math.min(10,checked.length);
    habits[key].lastChecked=checked.at(-1)||null;
    localStorage.setItem('rpg_habits_v1',JSON.stringify(habits));
  },
  openMissionDetail:(key,isPrivate,privateId)=>reopened.push({key,isPrivate,privateId})
};
const sandbox={window,document,localStorage,CustomEvent,setTimeout:fn=>{fn();return 1;},clearTimeout(){},Promise,Date,JSON,Object,String,Math,console};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','checkin.js'),'utf8'),sandbox,{filename:'checkin.js'});
assert.equal(typeof documentListeners.DOMContentLoaded,'function','reset guard installs after Main inline handlers exist');
documentListeners.DOMContentLoaded();
assert.equal(window.mdReset.__gamenfyAuthoritativeReset,true,'Main mdReset is wrapped by authoritative reset guard');

const button={dataset:{arm:'1'}};
window.mdReset('walking',0,'',{target:button});
const log=JSON.parse(store.rpg_habitlog_v1);
const auto=JSON.parse(store.rpg_autohabit_v1);
const habits=JSON.parse(store.rpg_habits_v1);
const character=JSON.parse(store.rpg_character_v1);

assert.deepEqual(Object.keys(log.walking),[today],'reset removes all pre-reset completion dates from authoritative habitlog');
assert.equal(auto['walking:2026-08-30'],'manual-off','old Fitbit-backed date is suppressed after reset');
assert.equal(auto['walking:2026-08-31'],'manual-off','every pruned Fitbit-backed date is suppressed after reset');
assert.equal(auto['walking:2026-09-03'],true,'today remains eligible as fresh Day 1');
assert.equal(habits.walking.score,1,'today completion becomes Level 1 after reset replay');
assert.equal(character.xpLog.length,2,'earned XP history is preserved');
assert.equal(reopened.at(-1).key,'walking','detail sheet reopens after authoritative replay');
assert.equal(events.at(-1).detail.source,'habit-reset','dependent Lab views receive reset event');
console.log('habit reset smoke: ok');