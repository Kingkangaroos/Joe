/* Park 3.1 browserless smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/park31-smoke.js */
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class ClassList {
  constructor(){this.values=new Set();}
  add(...names){names.forEach(name=>this.values.add(name));}
  remove(...names){names.forEach(name=>this.values.delete(name));}
  contains(name){return this.values.has(name);}
  toggle(name,force){const on=force===undefined?!this.contains(name):!!force;if(on)this.add(name);else this.remove(name);return on;}
}
class Style {constructor(){this.values={};}setProperty(name,value){this.values[name]=String(value);}}
class Element {
  constructor(id){this.id=id;this.dataset={};this.classList=new ClassList();this.style=new Style();this.attributes={};this.listeners={};this.hidden=false;this.textContent='';this._innerHTML='';}
  set innerHTML(value){this._innerHTML=String(value);}
  get innerHTML(){return this._innerHTML;}
  addEventListener(type,fn){this.listeners[type]=fn;}
  setAttribute(name,value){this.attributes[name]=String(value);if(name==='src')this.src=String(value);}
  getAttribute(name){return this.attributes[name]||null;}
  removeAttribute(name){delete this.attributes[name];}
  querySelectorAll(selector){return selector==='[data-level]'?levelNodes:[];}
}

const ids={};
['p31Stage','p31Companion','p31Art','p31LiveLevel','p31State','p31Source','p31EvolutionCopy','p31Levels','p31Progress','p31LightState','p31Error','p31Roster','p31RosterCount'].forEach(id=>{ids[id]=new Element(id);});
const levelNodes=Array.from({length:10},(_,index)=>{const node=new Element('level-'+(index+1));node.dataset.level=String(index+1);return node;});
ids.p31Levels.querySelectorAll=selector=>selector==='[data-level]'?levelNodes:[];
const timers=[];
const windowListeners={};
const documentListeners={};
const storage={rpg_habits_v1:JSON.stringify({walking:{score:7}})};
class FakeImage {set src(value){this._src=value;}get src(){return this._src;}}
const sandboxWindow={
  parent:null,
  getHabits:()=>JSON.parse(storage.rpg_habits_v1),
  addEventListener:(type,fn)=>{windowListeners[type]=fn;},
  dispatchEvent:()=>{},
  supabase:null
};
sandboxWindow.parent=sandboxWindow;
const sandbox={
  window:sandboxWindow,
  document:{readyState:'complete',hidden:false,getElementById:id=>ids[id]||null,addEventListener:(type,fn)=>{documentListeners[type]=fn;}},
  localStorage:{getItem:key=>storage[key]||null},
  location:{search:''},
  URLSearchParams,
  Image:FakeImage,
  setTimeout:fn=>{fn();return 1;},
  setInterval:fn=>{timers.push(fn);return timers.length;},
  clearInterval:()=>{},
  console,Number,Math,JSON,Array,String
};

const source=fs.readFileSync(path.join(__dirname,'..','park31.js'),'utf8');
vm.runInNewContext(source,sandbox,{filename:'park31.js'});

assert.equal(ids.p31Stage.dataset.liveLevel,'7','live walking score is shown');
assert.equal(ids.p31Stage.dataset.artLevel,'7','walking level selects matching artwork');
assert.match(ids.p31Art.src,/\/l07\.webp\?v=1\.3$/,'level 7 loads l07.webp');
assert.equal(levelNodes[6].attributes['aria-current'],'step','live evolution dot is selected');
assert.ok(!ids.p31Stage.classList.contains('is-lit'),'park starts inactive');
ids.p31Companion.listeners.click();
assert.ok(ids.p31Stage.classList.contains('is-lit'),'tap activates light/glow');
assert.equal(ids.p31Companion.attributes['aria-pressed'],'true');
assert.equal(storage.rpg_habits_v1,JSON.stringify({walking:{score:7}}),'tap never changes habit data');

storage.rpg_habits_v1=JSON.stringify({walking:{score:0}});
timers[0]();
assert.equal(ids.p31Stage.dataset.liveLevel,'0');
assert.equal(ids.p31Stage.dataset.artLevel,'1','technical level 0 deliberately uses Level 1 art');
assert.match(ids.p31Art.src,/\/l01\.webp\?v=1\.3$/);
assert.ok(ids.p31Stage.classList.contains('is-zero'),'level 0 gets critical treatment');

for(const missionDir of ['steps','good-deed','cold-shower','sleep']){
  const assetDir=path.join(__dirname,'..','img','lab','park31',missionDir);
  const digests=[];
  for(let level=1;level<=10;level++){
    const name='l'+String(level).padStart(2,'0')+'.webp';
    const bytes=fs.readFileSync(path.join(assetDir,name));
    assert.equal(bytes.subarray(0,4).toString(),'RIFF',missionDir+'/'+name+' is a WebP RIFF file');
    assert.equal(bytes.subarray(8,12).toString(),'WEBP',missionDir+'/'+name+' has a WebP signature');
    digests.push(crypto.createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(new Set(digests).size,10,missionDir+' has ten distinct level images');
}
assert.ok(source.includes("var KEY='walking'"),'Park 3.1 stays connected to Steps/Walking');
assert.ok(!source.includes('recomputeHabitFromLog'),'Park 3.1 cannot mutate the mission level');
assert.ok(!source.includes('rpg_habitlog_v1\',JSON.stringify'),'Park 3.1 never writes the completion log');
assert.equal((ids.p31Roster.innerHTML.match(/<button class="p31-slot/g)||[]).length,11,'the Park 3.1 roster reserves all eleven habit slots');
assert.match(ids.p31Roster.innerHTML,/Steps[\s\S]*HQ artwork ready/,'Steps occupies the completed artwork slot');
assert.match(ids.p31Roster.innerHTML,/Good Deed[\s\S]*HQ artwork ready/,'Good Deed uses the Paarse Paard artwork');
assert.match(ids.p31Roster.innerHTML,/Cold Shower[\s\S]*HQ artwork ready/,'Cold Shower uses the Paarse Paard artwork');
assert.match(ids.p31Roster.innerHTML,/Sleep[\s\S]*HQ artwork ready/,'Sleep uses the Paarse Paard artwork');
assert.match(ids.p31Roster.innerHTML,/Nutrition[\s\S]*artwork onderweg/,'future companions keep an explicit artwork placeholder');
assert.equal(ids.p31RosterCount.textContent,'4/11 artwork ready','four complete companion sets are reported');

const lab=fs.readFileSync(path.join(__dirname,'..','lab.html'),'utf8');
assert.match(lab,/<iframe src="park31\.html\?embed=1&amp;v=1\.3"/,'Park 3.1 renders directly inside the normal Lab');
assert.doesNotMatch(lab,/class="chatgpt-lab-card" href="park31\.html"/,'Park 3.1 is not hidden behind a separate Lab card');

console.log('Park 3.1 smoke test passed.');
