/* Park 3.1 Lab Daily Mission controller smoke test
   Run with: node tests/park31-lab-missions-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const store={rpg_private_unlocked:'1'};
const xpCalls=[];
const habitCalls=[];
const events=[];
const localStorage={
  getItem:key=>Object.prototype.hasOwnProperty.call(store,key)?store[key]:null,
  setItem:(key,value)=>{store[key]=String(value);},
  removeItem:key=>{delete store[key];}
};
const sessionStorage={
  getItem:key=>key==='rpg_private_unlocked'?store.rpg_private_unlocked:null,
  setItem:(key,value)=>{store[key]=String(value);}
};
function CustomEvent(type,init){this.type=type;this.detail=init&&init.detail;}
const window={
  RPG_DEFAULT_SKILLS:{walking:{label:'Steps',icon:'👟'}},
  checkHabit:key=>habitCalls.push(['check',key]),
  uncheckHabit:key=>habitCalls.push(['uncheck',key]),
  recomputeHabitFromLog:key=>habitCalls.push(['recompute',key]),
  addXP:(key,amount,reason)=>xpCalls.push({key,amount,reason}),
  dispatchEvent:event=>events.push(event)
};
const document={getElementById:()=>null,createElement:()=>{throw new Error('PIN modal should not open in unlocked smoke test');},body:{appendChild:()=>{}}};
const sandbox={window,document,localStorage,sessionStorage,CustomEvent,Date,String,JSON,setTimeout:fn=>fn()};
const source=fs.readFileSync(path.join(__dirname,'..','park31-lab.js'),'utf8');
vm.runInNewContext(source,sandbox,{filename:'park31-lab.js'});

const today=window.viewedDateStr();
assert.equal(window.toggleMission('walking'),true,'first tap completes a public mission');
let log=JSON.parse(store.rpg_habitlog_v1);
assert.equal(log.walking[today],true,'public completion is stored for today');
assert.deepEqual(habitCalls.slice(0,2),[['check','walking'],['recompute','walking']]);
assert.equal(xpCalls[0].amount,15,'public completion awards the existing +15 XP');

assert.equal(window.toggleMission('walking'),false,'second tap unchecks a public mission');
log=JSON.parse(store.rpg_habitlog_v1);
assert.equal(log.walking[today],undefined,'public uncheck removes today from the authoritative log');
assert.deepEqual(habitCalls.slice(2),[['uncheck','walking'],['recompute','walking']]);
assert.equal(xpCalls[1].amount,-15,'public uncheck reverses the XP');

assert.equal(window.togglePrivateQuest('weed_control'),true,'first private tap completes Gardening when the PIN session is unlocked');
let daily=JSON.parse(store['rpg_daily_v1:'+today]);
assert.equal(daily.quests.weed_control.done,true,'private completion uses the existing daily quest store');
assert.equal(xpCalls[2].amount,40,'Gardening uses its existing XP value');
assert.equal(window.togglePrivateQuest('weed_control'),false,'second private tap unchecks Gardening');
daily=JSON.parse(store['rpg_daily_v1:'+today]);
assert.equal(daily.quests.weed_control.done,false);
assert.equal(xpCalls[3].amount,-40,'private uncheck reverses the XP');

assert.ok(events.length>=4,'every change emits the refresh event used by Park 3.1');
assert.ok(events.every(event=>event.type==='gamenfy:daily-mission-change'));
assert.match(source,/localStorage\.getItem\('rpg_pin_v1'\)\|\|'1111'/,'the Lab respects the configured PIN with the established fallback');

console.log('Park 3.1 Lab mission logic smoke test passed.');
