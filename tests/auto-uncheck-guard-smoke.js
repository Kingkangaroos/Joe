/* Central current-day Fitbit uncheck guard smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/auto-uncheck-guard-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

class Storage{
  constructor(){this.map=new Map();}
  get length(){return this.map.size;}
  key(i){return Array.from(this.map.keys())[i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}
const localStorage=new Storage();
const timers=[];
const listeners={};
const originalCalls=[];
const window={
  localStorage,
  addEventListener(type,fn){listeners[type]=fn;},
  dispatchEvent(){return true;}
};
const document={readyState:'complete',hidden:false,addEventListener(){}};
const sandbox={
  window,document,localStorage,console,Date,Math,JSON,Object,String,Array,Promise,
  CustomEvent:function(){},Event:function(){},
  setTimeout(fn,delay=0){const t={fn,delay,cancelled:false};timers.push(t);return t;},
  clearTimeout(t){if(t)t.cancelled=true;},setInterval(){return 1;},fetch:async()=>({ok:true})
};

vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8'),sandbox,{filename:'sync.js'});
assert.equal(typeof window.uncheckHabit,'undefined','sync loads before xp.js in the real pages');

// Simulate xp.js defining the shared engine after sync.js has already loaded.
window.uncheckHabit=function(key){originalCalls.push(key);return {key};};
for(const timer of timers){if(!timer.cancelled&&!timer.ran){timer.ran=true;timer.fn();}}
assert.equal(window.uncheckHabit.__gamenfyAutoUncheckGuard,true,'guard installs after the XP engine becomes available');

const result=window.uncheckHabit('walking');
assert.deepEqual(result,{key:'walking'},'wrapped engine preserves original return value');
assert.deepEqual(originalCalls,['walking'],'wrapped engine calls original exactly once');
let ledger=JSON.parse(localStorage.getItem('rpg_autohabit_v1'));
const today=new Date();
const todayKey=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
assert.equal(ledger['walking:'+todayKey],'manual-off','current-day Walking uncheck records Fitbit suppression');

window.uncheckHabit('sleep');
ledger=JSON.parse(localStorage.getItem('rpg_autohabit_v1'));
assert.equal(ledger['sleep:'+todayKey],'manual-off','current-day Sleep uncheck records Fitbit suppression');

const before=JSON.stringify(ledger);
window.uncheckHabit('nutrition');
assert.equal(localStorage.getItem('rpg_autohabit_v1'),before,'non-Fitbit habit uncheck does not alter auto ledger');
assert.deepEqual(originalCalls,['walking','sleep','nutrition'],'all ordinary uncheck behavior remains routed through original engine');

const source=fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8');
const character=fs.readFileSync(path.join(__dirname,'..','character.html'),'utf8');
const main=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
assert.match(character,/if\(checkedToday\)[\s\S]*window\.uncheckHabit\(h\.key\)/,'Character current-day habit tiles use the centrally guarded engine');
assert.match(main,/if \(isToday && window\.uncheckHabit\) window\.uncheckHabit\(key\)/,'Main calls uncheckHabit only on its today branch');
assert.match(source,/state\[key \+ ':' \+ date\] = 'manual-off'/,'guard stores the established manual-off token');

console.log('Auto uncheck guard smoke: late XP install, Walking/Sleep manual-off and normal habits passed.');