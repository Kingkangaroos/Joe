/* Backdated XP -> real streak date regression
   Performed-by: ChatGPT (OpenAI), 2026-09-03
   Run with: node tests/streak-backdated-xp-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const store={
  rpg_streak_v1:JSON.stringify({days:{},best:0}),
  rpg_checkin_v1:JSON.stringify({days:{}})
};
const localStorage={
  getItem:key=>Object.prototype.hasOwnProperty.call(store,key)?store[key]:null,
  setItem:(key,value)=>{store[key]=String(value);}
};
const xpLog=[
  // Written on Sep 7, but this is explicitly an Aug 31 Fitbit backfill.
  {skill:'sleep',amount:15,reason:'Auto: 7 uur slaap gehaald (2026-08-31)',date:'2026-09-07'},
  // Same convention for a manual backdated Main check.
  {skill:'walking',amount:15,reason:'Habit: 10k Steps (2026-09-01)',date:'2026-09-07'},
  // Ordinary XP without an explicit audit date still belongs to write date.
  {skill:'reading',amount:40,reason:'Read 30 pages',date:'2026-09-02'}
];
const window={getCharacter:()=>({xpLog})};
// checkin.js is browser code. Keep timers inert so this smoke exercises only the
// synchronous streak reconciliation while still providing the browser API shape.
const sandbox={window,localStorage,Date,String,JSON,Number,Object,Math,console,setTimeout:()=>0,clearTimeout:()=>{}};
const source=fs.readFileSync(path.join(__dirname,'..','checkin.js'),'utf8');
const streakSource=source.split('// v11.5:')[0];
vm.runInNewContext(streakSource,sandbox,{filename:'checkin-streak.js'});

const result=window.Streak.refresh();
assert.equal(result.days['2026-08-31'],true,'Fitbit backfill counts on its explicit historical activity date');
assert.equal(result.days['2026-09-01'],true,'manual Main backfill counts on its explicit historical activity date');
assert.equal(result.days['2026-09-02'],true,'ordinary XP still counts on its normal event date');
assert.equal(result.days['2026-09-07'],undefined,'writing historical XP later must not create a ghost active write-day');
assert.match(source,/function xpEntryDate/,'streak engine owns a single audit-date resolver');
assert.match(source,/reason[\s\S]*\(\\d\{4\}-\\d\{2\}-\\d\{2\}\)/,'audit-date resolver recognizes explicit YYYY-MM-DD reasons');

console.log('streak backdated XP smoke: historical XP is attributed to the real activity day, not the later write day.');