/* Canonical Daily Mission membership regression test — ChatGPT (OpenAI)
   Run with: node tests/daily-membership-smoke.js */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

class Storage{
  constructor(){this.values=new Map();}
  getItem(k){return this.values.has(k)?this.values.get(k):null;}
  setItem(k,v){this.values.set(k,String(v));}
  removeItem(k){this.values.delete(k);}
}
const localStorage=new Storage();
const window={addEventListener(){},dispatchEvent(){}};
const document={readyState:'loading',body:{appendChild(){}},addEventListener(){},getElementById(){return null;},createElement(){return {style:{},innerHTML:'',id:''};}};
const sandbox={window,document,localStorage,console,Date,Math,JSON,Object,Number,String,Array,setTimeout(){return 1;},clearTimeout(){},setInterval(){return 1;},fetch:async()=>({ok:false,json:async()=>[]})};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','xp.js'),'utf8'),sandbox,{filename:'xp.js'});

const defs=window.RPG_DEFAULT_SKILLS||{};
const canonical=Object.keys(defs).filter(key=>{
  const def=defs[key];return def&&def.isHabit===true&&def.active!==false&&!def.private;
}).sort();
assert.equal(canonical.length,11,'RPG registry contains exactly eleven public Daily Missions');
assert.deepEqual(canonical,['budgeting','cold_shower','good_deed','gratitude','household','meditation','nutrition','screen_time','sleep','teeth','walking']);

const source=fs.readFileSync(path.join(__dirname,'..','park31.js'),'utf8');
function keysFrom(blockName){
  const match=source.match(new RegExp('var '+blockName+'=\\[([\\s\\S]*?)\\n  \\];'));
  assert.ok(match,blockName+' is declared as a static registry');
  return Array.from(match[1].matchAll(/key:'([^']+)'/g),m=>m[1]);
}
const parkPublic=keysFrom('PUBLIC_MISSIONS');
const parkPrivate=keysFrom('PRIVATE_MISSIONS');
assert.deepEqual(parkPublic.slice().sort(),canonical,'Park public companions exactly match RPG_DEFAULT_SKILLS public habits');
assert.equal(new Set(parkPublic).size,11,'Park public roster has no duplicates');
assert.deepEqual(parkPrivate.slice().sort(),['no_porn','weed_control'],'private dailies remain separate');
assert.ok(parkPrivate.every(key=>defs[key]&&defs[key].private),'Park private entries are actually private in RPG registry');
assert.ok(parkPublic.every(key=>!parkPrivate.includes(key)),'no private daily can replace a public slot');

for(const forbidden of ['tennis','reading'])assert.equal(parkPublic.includes(forbidden),false,forbidden+' remains a normal skill, never a Daily Mission');
assert.match(source,/budgeting'.*fallback:'budgeting'/s,'Budgeting uses explicit fallback art until native Park 3.1 evolution is approved');
assert.match(source,/meditation'.*fallback:'meditation'/s,'Meditation uses explicit fallback art until native Park 3.1 evolution is approved');
assert.match(source,/PRIVATE_MISSIONS[\s\S]*weed_control[\s\S]*no_porn/,'private companion art remains available without corrupting public membership');

console.log('Daily Mission membership smoke: RPG public 11 == Park public 11; private dailies stay separate.');