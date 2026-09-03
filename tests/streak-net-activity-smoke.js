/* Global streak net-activity regression smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/streak-net-activity-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const store={
  rpg_streak_v1:JSON.stringify({days:{
    '2026-01-01':true,       // old history: no longer represented in capped XP log
    '2026-09-01':true,       // ghost mission day: +15 then -15
    '2026-09-02':true,       // one mission reversed, another real XP event remains
    '2026-09-03':true        // XP fully reversed, but explicit evening check-in remains
  },best:9}),
  rpg_checkin_v1:JSON.stringify({days:{'2026-09-03':{closedAt:'2026-09-03T20:00:00Z'}}})
};
const localStorage={
  getItem:key=>Object.prototype.hasOwnProperty.call(store,key)?store[key]:null,
  setItem:(key,value)=>{store[key]=String(value);}
};
const xpLog=[
  {skill:'walking',amount:15,reason:'Habit: Steps',date:'2026-09-01'},
  {skill:'walking',amount:-15,reason:'Habit unchecked: Steps',date:'2026-09-01'},

  {skill:'walking',amount:15,reason:'Habit: Steps',date:'2026-09-02'},
  {skill:'walking',amount:-15,reason:'Habit unchecked: Steps',date:'2026-09-02'},
  {skill:'reading',amount:40,reason:'Read',date:'2026-09-02'},

  {skill:'nutrition',amount:15,reason:'Habit: Nutrition',date:'2026-09-03'},
  {skill:'nutrition',amount:-15,reason:'Habit unchecked: Nutrition',date:'2026-09-03'},

  {skill:'chess',amount:30,reason:'Chess practice',date:'2026-09-05'}
];
const window={
  getCharacter:()=>({xpLog}),
  Ventures:{load:()=>({ventures:[{phases:[{steps:[
    {done:true,doneAt:'2026-09-04T12:00:00Z'},
    {done:false,doneAt:'2026-09-06T12:00:00Z'}
  ]}]}]})}
};
const sandbox={window,localStorage,Date,String,JSON,Number,Object,Math,console};
const source=fs.readFileSync(path.join(__dirname,'..','checkin.js'),'utf8');
const streakSource=source.split('// v11.5:')[0];
vm.runInNewContext(streakSource,sandbox,{filename:'checkin-streak.js'});

const result=window.Streak.refresh();
assert.equal(result.days['2026-09-01'],undefined,'a mission +15/-15 reversal no longer leaves a ghost active day');
assert.equal(result.days['2026-09-02'],true,'unrelated positive XP keeps the day active when one mission is reversed');
assert.equal(result.days['2026-09-03'],true,'an explicit evening check-in keeps a day active even when its XP nets to zero');
assert.equal(result.days['2026-09-04'],true,'a completed venture step independently marks its day active');
assert.equal(result.days['2026-09-05'],true,'ordinary positive XP independently marks its day active');
assert.equal(result.days['2026-09-06'],undefined,'an incomplete venture step never creates activity');
assert.equal(result.days['2026-01-01'],true,'history outside the retained XP evidence window is preserved');
assert.equal(result.best,9,'historical best streak never shrinks during reconciliation');

assert.match(source,/perDay\[day\]\[skill\].*\+ amount/,'XP is netted per skill rather than blindly treating every positive event as permanent');
assert.match(source,/const known = Object\.assign\(\{\}, xp\.observed, ventures, checkins\)/,'only dates covered by current evidence are reconciled');
assert.doesNotMatch(streakSource,/if \(\(e\.amount \|\| 0\) > 0/,'legacy ever-positive XP detector is gone');

console.log('Streak net activity smoke: reversals, mixed XP, venture/check-in and preserved history passed.');