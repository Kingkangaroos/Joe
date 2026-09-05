/* Park 3.1 browserless smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/park31-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

class ClassList{
  constructor(){this.values=new Set();}
  add(...names){names.forEach(name=>this.values.add(name));}
  remove(...names){names.forEach(name=>this.values.delete(name));}
  contains(name){return this.values.has(name);}
  toggle(name,force){const on=force===undefined?!this.contains(name):!!force;if(on)this.add(name);else this.remove(name);return on;}
}
class Style{constructor(){this.values={};}setProperty(name,value){this.values[name]=String(value);}}
class Element{
  constructor(id){this.id=id;this.dataset={};this.classList=new ClassList();this.style=new Style();this.attributes={};this.listeners={};this.hidden=false;this.disabled=false;this.textContent='';this._innerHTML='';}
  set innerHTML(value){this._innerHTML=String(value);}
  get innerHTML(){return this._innerHTML;}
  addEventListener(type,fn){this.listeners[type]=fn;}
  setAttribute(name,value){this.attributes[name]=String(value);if(name==='src')this.src=String(value);}
  getAttribute(name){return this.attributes[name]||null;}
  removeAttribute(name){delete this.attributes[name];}
  querySelectorAll(selector){return selector==='[data-level]'?levelNodes:[];}
  querySelector(selector){
    const mission=String(selector||'').match(/^\[data-mission="(.+)"\]$/);
    if(mission){const node=new Element('slot-'+mission[1]);node.dataset.mission=mission[1];return node;}
    return null;
  }
  closest(selector){if(selector==='[data-mission]'&&this.dataset.mission)return this;if(selector==='[data-p31-toggle]'&&this.dataset.p31Toggle)return this;return null;}
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
class FakeImage{set src(value){this._src=value;}get src(){return this._src;}}
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
    const d=new Date();
    const dateKey=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const log=JSON.parse(storage.rpg_habitlog_v1||'{}');
    log[key]=log[key]||{};log[key][dateKey]=true;storage.rpg_habitlog_v1=JSON.stringify(log);
    return true;
  },
  togglePrivateQuest:key=>{missionToggles.push('private:'+key);return true;},
  addEventListener:(type,fn)=>{parentListeners[type]=fn;}
};
const sandboxWindow={parent:parentWindow,getHabits:()=>JSON.parse(storage.rpg_habits_v1),addEventListener:(type,fn)=>{windowListeners[type]=fn;},dispatchEvent:()=>{},supabase:null};
const body=new Element('body');
const closeNodes=[new Element('close-shade'),new Element('close-button')];
const sandbox={
  window:sandboxWindow,
  document:{readyState:'complete',hidden:false,body,getElementById:id=>ids[id]||null,querySelectorAll:selector=>selector==='[data-p31-close]'?closeNodes:[],addEventListener:(type,fn)=>{documentListeners[type]=fn;}},
  localStorage:{getItem:key=>storage[key]||null},
  location:{search:'?embed=1&mode=missions'},URLSearchParams,Image:FakeImage,navigator:{vibrate:()=>{}},
  setTimeout:(fn,delay=0)=>{const timer={fn,delay,cancelled:false};timeoutTimers.push(timer);return timer;},
  clearTimeout:timer=>{if(timer)timer.cancelled=true;},setInterval:fn=>{intervalTimers.push(fn);return intervalTimers.length;},clearInterval:()=>{},
  console,Number,Math,JSON,Array,String
};
function runTimeoutsAtLeast(delay){for(const timer of timeoutTimers){if(!timer.cancelled&&!timer.ran&&timer.delay>=delay){timer.ran=true;timer.fn();}}}
function runImmediateTimeouts(){for(const timer of timeoutTimers){if(!timer.cancelled&&!timer.ran&&timer.delay===0){timer.ran=true;timer.fn();}}}

const source=fs.readFileSync(path.join(__dirname,'..','park31.js'),'utf8');
vm.runInNewContext(source,sandbox,{filename:'park31.js'});

const canonicalPublic=['budgeting','sleep','nutrition','walking','teeth','household','meditation','gratitude','good_deed','screen_time','cold_shower'];
assert.deepEqual(Array.from(sandboxWindow.GamenfyPark31Registry.publicKeys),canonicalPublic,'Park exposes the exact canonical eleven public Daily Missions');
assert.deepEqual(Array.from(sandboxWindow.GamenfyPark31Registry.privateKeys),['weed_control','no_porn'],'private dailies are separate from the public eleven');

assert.equal(ids.p31Stage.dataset.liveLevel,'7','live walking score is shown');
assert.equal(ids.p31Stage.dataset.artLevel,'7','walking level selects matching artwork');
assert.match(ids.p31Art.src,/\/l07\.webp\?v=1\.15$/,'level 7 loads current l07 artwork');
assert.equal(ids.p31State.textContent,'EXPERT','level 7 uses canonical Expert band');
assert.equal(levelNodes[6].attributes['aria-current'],'step','live evolution dot is selected');
ids.p31Companion.listeners.click();
assert.ok(ids.p31Stage.classList.contains('is-lit'),'tap activates light/glow');
assert.equal(storage.rpg_habits_v1,JSON.stringify({walking:{score:7}}),'light tap never changes habit data');

const expectedBands=[[0,'STARTER'],[2,'STARTER'],[3,'APPRENTICE'],[4,'APPRENTICE'],[5,'ADVANCED'],[6,'ADVANCED'],[7,'EXPERT'],[9,'EXPERT'],[10,'MASTER']];
for(const [score,label] of expectedBands){
  storage.rpg_habits_v1=JSON.stringify({walking:{score}});intervalTimers[0]();
  assert.equal(ids.p31Stage.dataset.liveLevel,String(score));assert.equal(ids.p31State.textContent,label,'level '+score+' maps to '+label);
}
storage.rpg_habits_v1=JSON.stringify({walking:{score:0}});intervalTimers[0]();
assert.equal(ids.p31Stage.dataset.liveLevel,'0');assert.equal(ids.p31Stage.dataset.artLevel,'1');
assert.match(ids.p31Art.src,/\/l01\.webp\?v=1\.15$/);assert.equal(ids.p31Progress.style.width,'0%');

// Eleven native Park 3.1 sets remain intact: nine public missions plus two private companions.
const nativeDirs=['steps','nutrition','teeth','household','gratitude','good-deed','screen-time','cold-shower','no-weed','discipline','sleep'];
for(const missionDir of nativeDirs){
  const assetDir=path.join(__dirname,'..','img','lab','park31',missionDir);const digests=[];
  for(let level=1;level<=10;level++){
    const name='l'+String(level).padStart(2,'0')+'.webp';const bytes=fs.readFileSync(path.join(assetDir,name));
    assert.equal(bytes.subarray(0,4).toString(),'RIFF',missionDir+'/'+name+' is WebP');
    assert.equal(bytes.subarray(8,12).toString(),'WEBP',missionDir+'/'+name+' has WebP signature');
    digests.push(crypto.createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(new Set(digests).size,10,missionDir+' has ten distinct level images');
}
for(const missionDir of ['cold-shower','teeth','good-deed','steps','sleep']){
  for(let level=1;level<=10;level++){
    const bytes=fs.readFileSync(path.join(__dirname,'..','img','lab','park31',missionDir,'l'+String(level).padStart(2,'0')+'.webp'));
    assert.ok(bytes.includes(Buffer.from('ALPH')),missionDir+' l'+level+' has alpha');
  }
}
assert.ok(fs.existsSync(path.join(__dirname,'..','img','lab','park2','budgeting.png')),'Budgeting uses existing approved Park 2 fallback art');
for(const file of ['meditation.png','meditation/advanced.png','meditation/mastery.png'])assert.ok(fs.existsSync(path.join(__dirname,'..','img','lab','park2',file)),'Meditation fallback exists: '+file);

assert.equal((ids.p31Roster.innerHTML.match(/<button class="p31-slot/g)||[]).length,13,'roster contains eleven public plus two private companion cards');
for(const label of ['Budgeting','Sleep','Nutrition','Steps','Brush Teeth','Household','Meditation','Gratitude','Good Deed','Screen Time','Cold Shower']){
  assert.match(ids.p31Roster.innerHTML,new RegExp(label+'[\\s\\S]*Tik om te openen'),'public '+label+' is present and interactive');
}
for(const label of ['Gardening','Discipline'])assert.match(ids.p31Roster.innerHTML,new RegExp(label+'[\\s\\S]*Private daily'),'private '+label+' stays available but explicitly private');
assert.match(ids.p31Roster.innerHTML,/Private dailies[\s\S]*apart van de publieke 11/,'private cards are visually separated from public membership');
assert.match(ids.p31Roster.innerHTML,/Budgeting[\s\S]*Park 2 fallback/,'Budgeting fallback is explicit rather than pretending to be a 10-level native set');
assert.match(ids.p31Roster.innerHTML,/Meditation[\s\S]*3-stage fallback/,'Meditation fallback is explicit');
assert.equal(ids.p31RosterCount.textContent,'11 public · 2 private');
assert.match(ids.p31Roster.innerHTML,/class="p31-help"[^>]*>HELP<\/span>/,'inactive mission can show HELP');
assert.equal(typeof windowListeners['gamenfy:auto-habits-changed'],'function');
assert.equal(typeof parentListeners['gamenfy:auto-habits-changed'],'function');

assert.ok(source.includes("var KEY='walking'"));
assert.ok(!source.includes('recomputeHabitFromLog'),'display layer cannot independently mutate a level');
assert.ok(!source.includes("localStorage.setItem('rpg_habitlog_v1'"),'display layer never writes canonical completion log');
assert.doesNotMatch(source,/HOLD_MS/,'long-press completion is retired');
assert.match(source,/data-p31-toggle/,'each mission exposes a dedicated tap completion control');
assert.match(source,/mission\.private&&typeof w\.togglePrivateQuest/,'private companions retain PIN-backed host route');

const lab=fs.readFileSync(path.join(__dirname,'..','lab.html'),'utf8');
assert.match(lab,/park31-lab\.js\?v=1\.1/);assert.match(lab,/<iframe src="park31\.html\?embed=1&amp;mode=missions&amp;v=1\.12"/);
const home=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');assert.match(home,/park31\.html\?embed=1&amp;mode=missions&amp;privacy=public/,'Home uses the approved public-only Daily Missions 2.0 surface');
const page=fs.readFileSync(path.join(__dirname,'..','park31.html'),'utf8');
assert.match(page,/park31\.js\?v=1\.15/);assert.match(page,/11 public · 2 private/);assert.match(page,/Budgeting en Meditation.*Park 2 fallback/);

const walkingSlot=new Element('walking-slot');walkingSlot.dataset.mission='walking';
const openEvent={target:walkingSlot,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
ids.p31Roster.listeners.click(openEvent);
assert.equal(ids.p31Modal.hidden,false);assert.equal(ids.p31ModalTitle.textContent,'Steps');assert.equal(ids.p31ModalLevel.textContent,'Level 0');assert.equal(ids.p31ModalState.textContent,'STARTER');assert.equal(ids.p31ModalProgress.style.width,'0%');assert.equal(missionToggles.length,0);

const liveStorage=storage.rpg_habits_v1;ids.p31Next.listeners.click();
assert.equal(ids.p31ModalMeta.textContent,'PREVIEW 2 · LIVE 0');assert.match(ids.p31ModalArt.src,/steps\/l02\.webp\?v=1\.15$/);assert.equal(ids.p31MissionToggle.disabled,true);assert.equal(storage.rpg_habits_v1,liveStorage);closeNodes[0].listeners.click();

const walkingCheck=new Element('walking-check');walkingCheck.dataset.p31Toggle='walking';
const checkEvent={target:walkingCheck,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
ids.p31Roster.listeners.click(checkEvent);runImmediateTimeouts();
assert.deepEqual(missionToggles,['walking'],'circle tap completes exactly one public mission through host controller');assert.equal(ids.p31Celebration.hidden,false);assert.equal(ids.p31CelebrationMeta.textContent,'LEVEL 1');

const nutritionSlot=new Element('nutrition-slot');nutritionSlot.dataset.mission='nutrition';
const nutritionTap={target:nutritionSlot,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
ids.p31Roster.listeners.click(nutritionTap);assert.equal(ids.p31ModalTitle.textContent,'Nutrition');ids.p31MissionToggle.listeners.click();runImmediateTimeouts();assert.deepEqual(missionToggles,['walking','nutrition']);

console.log('Park 3.1 smoke test passed: canonical public 11, separate private 2, fallbacks, assets and interactions.');