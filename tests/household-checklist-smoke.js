'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'household-checklist.js'), 'utf8');
const values = new Map();
let writes = 0, fail = false;
const window = { addEventListener() {} };
const sandbox = {window, localStorage: {
  getItem: key => values.get(key) || null,
  setItem: (key,value) => { if (fail) throw new Error('quota'); writes++; values.set(key,value); }
}};
vm.runInNewContext(source.replace(/\}\)\(\);\s*$/, 'window.testHousehold = {save:save,checked:checked,steps:steps};})();'), sandbox);
assert.equal(writes, 0, 'loading never modifies data');
const api = window.testHousehold;
assert.equal(api.steps.length, 9);
assert.deepEqual(Array.from(api.steps, step=>step[0]), ['clothes','trash','places','machines','prepare','wipe','vacuum','mop','finish']);
values.set('rpg_daily_v1:2026-10-10', JSON.stringify({quests:{existing:{done:true}},notes:'preserve'}));
api.save('2026-10-10', 'clothes', true);
api.save('2026-10-10', 'trash', true);
assert.equal(api.checked('2026-10-10').clothes, true);
api.save('2026-10-10', 'clothes', false);
assert.equal(api.checked('2026-10-10').clothes, false);
assert.equal(api.checked('2026-10-10').trash, true);
const stored=JSON.parse(values.get('rpg_daily_v1:2026-10-10'));
assert.equal(stored.quests.existing.done, true);
assert.equal(stored.notes, 'preserve');
assert.equal(Object.keys(api.checked('2026-10-11')).length, 0);
api.save('2026-10-11', 'finish', true);
assert.equal(api.checked('2026-10-10').finish, undefined);
const before=writes; api.save('2026-10-10','unknown',true); assert.equal(writes,before);
fail=true; assert.throws(()=>api.save('2026-10-10','mop',true),/quota/); fail=false;
values.set('rpg_daily_v1:broken','not json');
assert.throws(()=>api.save('broken','mop',true));
assert.equal(values.get('rpg_daily_v1:broken'),'not json','corrupt data is not overwritten');
assert.equal(values.has('rpg_habitlog_v1'),false,'substeps never complete the habit');
assert.match(fs.readFileSync(path.join(root,'xp.js'),'utf8'),/RPG_SYNC_PREFIXES = \['rpg_daily_v1:'/);
assert.match(fs.readFileSync(path.join(root,'park31.js'),'utf8'),/key==='household'&&homeSurface&&typeof hostWindow\(\).openHouseholdChecklist/);
assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/household-checklist.js\?v=1.0/);
console.log('PASS Household: order, persistence, undo, day isolation, preservation, failures, sync scope and Home entry');

// Minimal DOM fixture exercises the actual UI handlers without browser packages.
class Node {
  constructor(){this.listeners={};this.dataset={};this.checked=false;this.disabled=false;this.open=false;this.nodes={};}
  setAttribute(){}
  addEventListener(name,fn){this.listeners[name]=fn;}
  set innerHTML(value){
    this.inputs=api.steps.map(step=>{const n=new Node();n.dataset.hhStep=step[0];return n;});
    ['close','progress','complete','error'].forEach(id=>this.nodes['[data-hh-'+id+']']=new Node());
  }
  querySelector(selector){return this.nodes[selector];}
  querySelectorAll(){return this.inputs;}
  showModal(){this.open=true;}
  close(){this.open=false;this.listeners.close();}
}
let ui, date='2026-10-12', completions=0;
sandbox.document={activeElement:null,createElement:()=>new Node(),body:{appendChild:node=>{ui=node;},classList:{add(){},remove(){}}}};
window.viewedDateStr=()=>date;
window.toggleMission=()=>{completions++;values.set('rpg_habitlog_v1',JSON.stringify({household:{[date]:true}}));};
window.openHouseholdChecklist();
assert.equal(ui.open,true);
ui.inputs[0].checked=true;ui.listeners.change({target:ui.inputs[0]});
assert.equal(api.checked(date).clothes,true);
assert.equal(completions,0);
ui.nodes['[data-hh-close]'].listeners.click();
window.openHouseholdChecklist();assert.equal(ui.inputs[0].checked,true);
ui.nodes['[data-hh-complete]'].listeners.click();
ui.nodes['[data-hh-complete]'].listeners.click();
assert.equal(completions,1,'repeat completion does not toggle off or grant twice');
assert.equal(ui.nodes['[data-hh-complete]'].disabled,true);
ui.close();date='2026-10-13';window.openHouseholdChecklist();
assert.equal(ui.inputs[0].checked,false,'next day starts empty');
assert.equal(ui.nodes['[data-hh-complete]'].disabled,false);
date='2026-10-14';ui.nodes['[data-hh-complete]'].listeners.click();
assert.equal(completions,1,'date rollover cannot complete the wrong day');
assert.equal(ui.nodes['[data-hh-complete]'].disabled,true);
ui.close();window.openHouseholdChecklist();fail=true;
ui.inputs[0].checked=true;ui.listeners.change({target:ui.inputs[0]});
assert.equal(ui.inputs[0].checked,false,'failed save reverts checkbox');
assert.match(ui.nodes['[data-hh-error]'].textContent,/Opslaan is niet gelukt/);
console.log('PASS Household UI: open/close/reopen, completion exactly once, next day, rollover guard and save-error feedback');
