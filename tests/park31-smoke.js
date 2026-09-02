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
  constructor(id){this.id=id;this.dataset={};this.classList=new ClassList();this.style=new Style();this.attributes={};this.listeners={};this.hidden=false;this.disabled=false;this.textContent='';this._innerHTML='';}
  set innerHTML(value){this._innerHTML=String(value);}
  get innerHTML(){return this._innerHTML;}
  addEventListener(type,fn){this.listeners[type]=fn;}
  setAttribute(name,value){this.attributes[name]=String(value);if(name==='src')this.src=String(value);}
  getAttribute(name){return this.attributes[name]||null;}
  removeAttribute(name){delete this.attributes[name];}
  querySelectorAll(selector){return selector==='[data-level]'?levelNodes:[];}
  closest(selector){return selector==='[data-mission]'&&this.dataset.mission?this:null;}
  setPointerCapture(){}
  releasePointerCapture(){}
  focus(){this.focused=true;}
}

const ids={};
['p31Stage','p31Companion','p31Art','p31LiveLevel','p31State','p31Source','p31EvolutionCopy','p31Levels','p31Progress','p31LightState','p31Error','p31Roster','p31RosterCount','p31Modal','p31ModalArt','p31ModalTitle','p31ModalMeta','p31ModalLevel','p31ModalState','p31ModalProgress','p31ModalStatus','p31Prev','p31Next','p31MissionToggle','p31LiveReset','p31Celebration','p31CelebrationTitle','p31CelebrationMeta'].forEach(id=>{ids[id]=new Element(id);});
ids.p31Modal.hidden=true;
ids.p31Celebration.hidden=true;
const levelNodes=Array.from({length:10},(_,index)=>{const node=new Element('level-'+(index+1));node.dataset.level=String(index+1);return node;});
ids.p31Levels.querySelectorAll=selector=>selector==='[data-level]'?levelNodes:[];
const intervalTimers=[];
const timeoutTimers=[];
const windowListeners={};
const documentListeners={};
const storage={rpg_habits_v1:JSON.stringify({walking:{score:7}})};
const missionToggles=[];
class FakeImage {set src(value){this._src=value;}get src(){return this._src;}}
const parentListeners={};
const parentWindow={
  getHabits:()=>JSON.parse(storage.rpg_habits_v1),
  getCharacter:()=>({skills:{}}),
  getSkillLevel:()=>0,
  toggleMission:key=>{
    missionToggles.push(key);
    const habits=JSON.parse(storage.rpg_habits_v1||'{}');
    habits[key]=habits[key]||{};
    habits[key].score=Math.min(10,Number(habits[key].score||0)+1);
    storage.rpg_habits_v1=JSON.stringify(habits);
    const date=new Date();
    const dateKey=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
    const log=JSON.parse(storage.rpg_habitlog_v1||'{}');
    log[key]=log[key]||{};
    log[key][dateKey]=true;
    storage.rpg_habitlog_v1=JSON.stringify(log);
    return true;
  },
  addEventListener:(type,fn)=>{parentListeners[type]=fn;}
};
const sandboxWindow={
  parent:parentWindow,
  getHabits:()=>JSON.parse(storage.rpg_habits_v1),
  addEventListener:(type,fn)=>{windowListeners[type]=fn;},
  dispatchEvent:()=>{},
  supabase:null
};
const body=new Element('body');
const closeNodes=[new Element('close-shade'),new Element('close-button')];
const sandbox={
  window:sandboxWindow,
  document:{readyState:'complete',hidden:false,body,getElementById:id=>ids[id]||null,querySelectorAll:selector=>selector==='[data-p31-close]'?closeNodes:[],addEventListener:(type,fn)=>{documentListeners[type]=fn;}},
  localStorage:{getItem:key=>storage[key]||null},
  location:{search:'?embed=1&mode=missions'},
  URLSearchParams,
  Image:FakeImage,
  navigator:{vibrate:()=>{}},
  setTimeout:(fn,delay=0)=>{const timer={fn,delay,cancelled:false};timeoutTimers.push(timer);return timer;},
  clearTimeout:timer=>{if(timer)timer.cancelled=true;},
  setInterval:fn=>{intervalTimers.push(fn);return intervalTimers.length;},
  clearInterval:()=>{},
  console,Number,Math,JSON,Array,String
};

function runTimeoutsAtLeast(delay){
  for(const timer of timeoutTimers){if(!timer.cancelled&&!timer.ran&&timer.delay>=delay){timer.ran=true;timer.fn();}}
}
function runImmediateTimeouts(){
  for(const timer of timeoutTimers){if(!timer.cancelled&&!timer.ran&&timer.delay===0){timer.ran=true;timer.fn();}}
}

const source=fs.readFileSync(path.join(__dirname,'..','park31.js'),'utf8');
vm.runInNewContext(source,sandbox,{filename:'park31.js'});

assert.equal(ids.p31Stage.dataset.liveLevel,'7','live walking score is shown');
assert.equal(ids.p31Stage.dataset.artLevel,'7','walking level selects matching artwork');
assert.match(ids.p31Art.src,/\/l07\.webp\?v=1\.12$/,'level 7 loads l07.webp');
assert.equal(levelNodes[6].attributes['aria-current'],'step','live evolution dot is selected');
assert.ok(!ids.p31Stage.classList.contains('is-lit'),'park starts inactive');
ids.p31Companion.listeners.click();
assert.ok(ids.p31Stage.classList.contains('is-lit'),'tap activates light/glow');
assert.equal(ids.p31Companion.attributes['aria-pressed'],'true');
assert.equal(storage.rpg_habits_v1,JSON.stringify({walking:{score:7}}),'tap never changes habit data');

storage.rpg_habits_v1=JSON.stringify({walking:{score:0}});
intervalTimers[0]();
assert.equal(ids.p31Stage.dataset.liveLevel,'0');
assert.equal(ids.p31Stage.dataset.artLevel,'1','technical level 0 deliberately uses Level 1 art');
assert.match(ids.p31Art.src,/\/l01\.webp\?v=1\.12$/);
assert.ok(ids.p31Stage.classList.contains('is-zero'),'level 0 gets critical treatment');

for(const missionDir of ['steps','nutrition','teeth','household','gratitude','good-deed','screen-time','cold-shower','no-weed','discipline','sleep']){
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
for(const missionDir of ['cold-shower','teeth','good-deed','steps','sleep']){
  for(let level=1;level<=10;level++){
    const name='l'+String(level).padStart(2,'0')+'.webp';
    const bytes=fs.readFileSync(path.join(__dirname,'..','img','lab','park31',missionDir,name));
    assert.ok(bytes.includes(Buffer.from('ALPH')),missionDir+'/'+name+' contains a real WebP alpha channel');
  }
}
{
  const householdL1=fs.readFileSync(path.join(__dirname,'..','img','lab','park31','household','l01.webp'));
  assert.ok(householdL1.includes(Buffer.from('ALPH')),'the stronger Household Level 1 is a true transparent cutout');
}
assert.ok(source.includes("var KEY='walking'"),'Park 3.1 stays connected to Steps/Walking');
assert.ok(!source.includes('recomputeHabitFromLog'),'Park 3.1 cannot mutate the mission level');
assert.ok(!source.includes('rpg_habitlog_v1\',JSON.stringify'),'Park 3.1 never writes the completion log');
assert.equal((ids.p31Roster.innerHTML.match(/<button class="p31-slot/g)||[]).length,11,'the Park 3.1 roster reserves all eleven habit slots');
for(const label of ['Steps','Good Deed','Screen Time','Cold Shower','Gardening','Discipline','Sleep','Nutrition','Brush Teeth','Household','Gratitude']){
  assert.match(ids.p31Roster.innerHTML,new RegExp(label+'[\\s\\S]*Tik om te openen'),'the '+label+' artwork slot exposes the new tap/hold interaction');
}
assert.equal(ids.p31RosterCount.textContent,'11/11 artwork ready','all eleven complete companion sets are reported');
assert.match(ids.p31Roster.innerHTML,/class="p31-help"[^>]*>HELP<\/span>/,'a mission inactive for at least three days writes HELP on its artwork window');

const lab=fs.readFileSync(path.join(__dirname,'..','lab.html'),'utf8');
assert.match(lab,/park31-lab\.js\?v=1\.1/,'the normal Lab loads its dedicated Daily Mission controller');
assert.match(lab,/<iframe src="park31\.html\?embed=1&amp;mode=missions&amp;v=1\.12"/,'Park 3.1 renders interactively inside the normal Lab');
assert.doesNotMatch(lab,/class="chatgpt-lab-card" href="park31\.html"/,'Park 3.1 is not hidden behind a separate Lab card');
const home=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
assert.doesNotMatch(home,/park31\.html\?embed=1&amp;mode=missions/,'Park 3.1 remains Lab-only during this release');
assert.match(source,/var HOLD_MS=560/,'completion requires a deliberate hold');
assert.match(source,/rosterEl\.addEventListener\('pointerdown',startPointerPress\)/,'the roster distinguishes press duration');
assert.match(source,/mission\.private&&typeof w\.togglePrivateQuest/,'private companions keep the existing PIN-backed completion route');

const walkingSlot=new Element('walking-slot');walkingSlot.dataset.mission='walking';
const pointerEvent={target:walkingSlot,pointerType:'touch',button:0,pointerId:7,clientX:20,clientY:30,preventDefault(){this.prevented=true;}};
ids.p31Roster.listeners.pointerdown(pointerEvent);
ids.p31Roster.listeners.pointerup(pointerEvent);
assert.equal(ids.p31Modal.hidden,false,'a short tap opens the companion detail');
assert.equal(ids.p31ModalTitle.textContent,'Steps');
assert.equal(missionToggles.length,0,'a short tap never completes the mission');
assert.equal(ids.p31MissionToggle.textContent,'Voltooi vandaag','the expanded companion offers an explicit completion action');
assert.equal(ids.p31MissionToggle.disabled,false,'the live mission action is available outside preview');

const liveStorage=storage.rpg_habits_v1;
ids.p31Next.listeners.click();
assert.equal(ids.p31ModalMeta.textContent,'PREVIEW 2 · LIVE 0','plus enters read-only level preview');
assert.match(ids.p31ModalArt.src,/steps\/l02\.webp\?v=1\.12$/);
assert.equal(ids.p31MissionToggle.disabled,true,'preview disables the completion action');
assert.equal(ids.p31MissionToggle.textContent,'Ga terug naar live om te wijzigen');
assert.equal(storage.rpg_habits_v1,liveStorage,'preview does not touch real habit data');
closeNodes[0].listeners.click();

const holdEvent={target:walkingSlot,pointerType:'touch',button:0,pointerId:8,clientX:20,clientY:30,preventDefault(){this.prevented=true;}};
ids.p31Roster.listeners.pointerdown(holdEvent);
runTimeoutsAtLeast(560);
ids.p31Roster.listeners.pointerup(holdEvent);
runImmediateTimeouts();
assert.deepEqual(missionToggles,['walking'],'holding completes exactly one mission through the host controller');
assert.equal(ids.p31Modal.hidden,true,'a hold completes without also opening the preview');
assert.equal(ids.p31Celebration.hidden,false,'a real level increase opens the level-up celebration');
assert.equal(ids.p31CelebrationTitle.textContent,'Steps');
assert.equal(ids.p31CelebrationMeta.textContent,'LEVEL 1');
const restoredWalkingCard=ids.p31Roster.innerHTML.match(/<button[^>]*data-mission="walking"[\s\S]*?<\/button>/)[0];
assert.doesNotMatch(restoredWalkingCard,/class="p31-help"/,'completion removes HELP from the restored mission window');

const scrollEvent={target:walkingSlot,pointerType:'touch',button:0,pointerId:9,clientX:20,clientY:30,preventDefault(){}};
ids.p31Roster.listeners.pointerdown(scrollEvent);
ids.p31Roster.listeners.pointermove({...scrollEvent,clientY:48});
runTimeoutsAtLeast(560);
assert.deepEqual(missionToggles,['walking'],'moving to scroll cancels the hold action');

const nutritionSlot=new Element('nutrition-slot');nutritionSlot.dataset.mission='nutrition';
const nutritionTap={target:nutritionSlot,pointerType:'touch',button:0,pointerId:10,clientX:20,clientY:30,preventDefault(){this.prevented=true;}};
ids.p31Roster.listeners.pointerdown(nutritionTap);
ids.p31Roster.listeners.pointerup(nutritionTap);
assert.equal(ids.p31ModalTitle.textContent,'Nutrition');
assert.equal(ids.p31MissionToggle.textContent,'Voltooi vandaag');
ids.p31MissionToggle.listeners.click();
runImmediateTimeouts();
assert.deepEqual(missionToggles,['walking','nutrition'],'the explicit modal action completes through the host controller');
assert.equal(ids.p31MissionToggle.textContent,'Ongedaan maken','the action changes to undo after completion');

console.log('Park 3.1 smoke test passed.');
