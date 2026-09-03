/* Central current-day Fitbit manual override guard smoke test
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
const originalUnchecks=[];
const originalChecks=[];
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
assert.equal(typeof window.checkHabit,'undefined','sync loads before xp.js check engine too');

// Simulate xp.js defining both shared engines after sync.js has already loaded.
window.uncheckHabit=function(key){originalUnchecks.push(key);return {kind:'uncheck',key};};
window.checkHabit=function(key){originalChecks.push(key);return {kind:'check',key};};
for(const timer of timers){if(!timer.cancelled&&!timer.ran){timer.ran=true;timer.fn();}}
assert.equal(window.uncheckHabit.__gamenfyAutoUncheckGuard,true,'uncheck guard installs after XP engines become available');
assert.equal(window.checkHabit.__gamenfyAutoCheckGuard,true,'check guard installs after XP engines become available');

const uncheckResult=window.uncheckHabit('walking');
assert.deepEqual(uncheckResult,{kind:'uncheck',key:'walking'},'wrapped uncheck preserves original return value');
assert.deepEqual(originalUnchecks,['walking'],'wrapped uncheck calls original exactly once');
let ledger=JSON.parse(localStorage.getItem('rpg_autohabit_v1'));
const today=new Date();
const todayKey=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
assert.equal(ledger['walking:'+todayKey],'manual-off','current-day Walking uncheck records Fitbit suppression');

const checkResult=window.checkHabit('walking');
assert.deepEqual(checkResult,{kind:'check',key:'walking'},'wrapped check preserves original return value');
assert.deepEqual(originalChecks,['walking'],'wrapped check calls original exactly once');
ledger=JSON.parse(localStorage.getItem('rpg_autohabit_v1'));
assert.equal(Object.prototype.hasOwnProperty.call(ledger,'walking:'+todayKey),false,'current-day Walking re-check clears prior manual-off');

window.uncheckHabit('sleep');
ledger=JSON.parse(localStorage.getItem('rpg_autohabit_v1'));
assert.equal(ledger['sleep:'+todayKey],'manual-off','current-day Sleep uncheck records Fitbit suppression');
window.checkHabit('sleep');
ledger=JSON.parse(localStorage.getItem('rpg_autohabit_v1'));
assert.equal(Object.prototype.hasOwnProperty.call(ledger,'sleep:'+todayKey),false,'current-day Sleep re-check clears prior manual-off');

const before=JSON.stringify(ledger);
window.uncheckHabit('nutrition');
window.checkHabit('nutrition');
assert.equal(localStorage.getItem('rpg_autohabit_v1'),before,'non-Fitbit habit toggles do not alter auto ledger');
assert.deepEqual(originalUnchecks,['walking','sleep','nutrition'],'ordinary uncheck behavior remains routed through original engine');
assert.deepEqual(originalChecks,['walking','sleep','nutrition'],'ordinary check behavior remains routed through original engine');

const source=fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8');
const character=fs.readFileSync(path.join(__dirname,'..','character.html'),'utf8');
const main=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
assert.match(character,/if\(checkedToday\)[\s\S]*window\.uncheckHabit\(h\.key\)[\s\S]*else[\s\S]*window\.checkHabit\(h\.key/,'Character habit tiles use both centrally guarded current-day engines');
assert.match(main,/if \(isToday && window\.uncheckHabit\) window\.uncheckHabit\(key\)/,'Main calls uncheckHabit only on its today branch');
assert.match(source,/if \(suppressed\) state\[stateKey\] = 'manual-off'/,'guard stores the established manual-off token');
assert.match(source,/else if \(state\[stateKey\] === 'manual-off'\) delete state\[stateKey\]/,'guard clears manual-off on deliberate re-check');

console.log('Auto override guard smoke: late XP install, symmetric Walking/Sleep override and normal habits passed.');