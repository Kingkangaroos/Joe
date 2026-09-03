/* RPG cloud sync scope regression test — ChatGPT (OpenAI)
   Run with: node tests/sync-scope-smoke.js */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const store=new Map();
const localStorage={getItem:key=>store.has(key)?store.get(key):null,setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key)};
const window={addEventListener(){},dispatchEvent(){}};
const document={readyState:'loading',addEventListener(){},getElementById(){return null;},createElement(){return {style:{},id:'',innerHTML:''};},body:{appendChild(){}}};
const sandbox={window,document,localStorage,console,Date,Math,JSON,Object,Number,String,Array,setTimeout(){return 1;},clearTimeout(){},setInterval(){return 1;},fetch:async()=>({ok:false,json:async()=>[]})};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','xp.js'),'utf8'),sandbox,{filename:'xp.js'});

const keys=Array.from(window.RPG_SYNC_KEYS||[]);
const prefixes=Array.from(window.RPG_SYNC_PREFIXES||[]);
for(const key of [
  'rpg_character_v1','rpg_habits_v1','rpg_habitlog_v1','rpg_streak_v1','rpg_checkin_v1',
  'rpg_habit_reset_v1','rpg_autohabit_v1','rpg_pin_v1','rpg_seasons_v1','rpg_tier_claims_v1'
]) assert.ok(keys.includes(key),'critical RPG cloud key must remain synced: '+key);
for(const prefix of ['rpg_daily_v1:','rpg_agenda_v1:','rpg_todo_v1:'])assert.ok(prefixes.includes(prefix),'critical RPG prefix must remain synced: '+prefix);
assert.equal(new Set(keys).size,keys.length,'RPG sync key list has no duplicates');
assert.equal(new Set(prefixes).size,prefixes.length,'RPG sync prefix list has no duplicates');
assert.ok(keys.indexOf('rpg_habitlog_v1')>=0&&keys.indexOf('rpg_autohabit_v1')>=0,'canonical day log and Fitbit suppression ledger travel together');
assert.ok(keys.indexOf('rpg_habit_reset_v1')>=0,'authoritative reset marker travels with the log it governs');
assert.ok(prefixes.includes('rpg_daily_v1:'),'PIN-backed private dailies remain cloud-synced');
console.log('RPG sync scope smoke: habitlog, reset, Fitbit ledger and private daily prefixes are locked.');