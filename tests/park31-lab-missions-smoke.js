/* Park 3.1 Lab Daily Mission controller smoke test
   Run with: node tests/park31-lab-missions-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function makeHarness({unlocked=false,pin='2468'}={}){
  const store={rpg_pin_v1:pin};
  if(unlocked)store.rpg_private_unlocked='1';
  const xpCalls=[];const habitCalls=[];const events=[];const nodes={};
  const localStorage={
    getItem:key=>Object.prototype.hasOwnProperty.call(store,key)?store[key]:null,
    setItem:(key,value)=>{store[key]=String(value);},
    removeItem:key=>{delete store[key];}
  };
  const sessionStorage={
    getItem:key=>Object.prototype.hasOwnProperty.call(store,key)?store[key]:null,
    setItem:(key,value)=>{store[key]=String(value);}
  };
  function CustomEvent(type,init){this.type=type;this.detail=init&&init.detail;}
  function fakeNode(id){
    return nodes[id]={id,value:'',textContent:'',style:{cssText:''},dataset:{},listeners:{},focus(){this.focused=true;},addEventListener(type,fn){this.listeners[type]=fn;},remove(){delete nodes[id];if(id==='p31PinModal'){delete nodes.p31PinInput;delete nodes.p31PinError;delete nodes.p31PinCancel;}}};
  }
  const document={
    getElementById:id=>nodes[id]||null,
    createElement:tag=>{const node=fakeNode('created-'+tag+'-'+Object.keys(nodes).length);node.tagName=tag;return node;},
    body:{appendChild:node=>{
      if(node.id==='p31PinModal'){
        nodes.p31PinModal=node;fakeNode('p31PinInput');fakeNode('p31PinError');fakeNode('p31PinCancel');
      }
    }}
  };
  const originalCreate=document.createElement;
  document.createElement=tag=>{
    const node=originalCreate(tag);
    Object.defineProperty(node,'id',{get(){return this._id||'';},set(value){this._id=value;nodes[value]=this;}});
    return node;
  };
  const window={
    RPG_DEFAULT_SKILLS:{walking:{label:'Steps',icon:'👟'},sleep:{label:'Sleep',icon:'😴'}},
    checkHabit:key=>habitCalls.push(['check',key]),
    uncheckHabit:key=>habitCalls.push(['uncheck',key]),
    recomputeHabitFromLog:key=>habitCalls.push(['recompute',key]),
    addXP:(key,amount,reason)=>xpCalls.push({key,amount,reason}),
    dispatchEvent:event=>events.push(event)
  };
  const sandbox={window,document,localStorage,sessionStorage,CustomEvent,Date,String,JSON,setTimeout:fn=>{fn();return 1;}};
  const source=fs.readFileSync(path.join(__dirname,'..','park31-lab.js'),'utf8');
  vm.runInNewContext(source,sandbox,{filename:'park31-lab.js'});
  return {window,document,store,xpCalls,habitCalls,events,nodes,source};
}

// Public route + already-unlocked private route.
{
  const h=makeHarness({unlocked:true});
  const today=h.window.viewedDateStr();
  assert.equal(h.window.toggleMission('walking'),true,'first tap completes a public mission');
  let log=JSON.parse(h.store.rpg_habitlog_v1);
  assert.equal(log.walking[today],true,'public completion is stored in canonical day log');
  assert.deepEqual(h.habitCalls.slice(0,2),[['check','walking'],['recompute','walking']]);
  assert.equal(h.xpCalls[0].amount,15);

  assert.equal(h.window.toggleMission('walking'),false,'second tap unchecks public mission');
  log=JSON.parse(h.store.rpg_habitlog_v1);
  assert.equal(log.walking[today],undefined);
  assert.deepEqual(h.habitCalls.slice(2),[['uncheck','walking'],['recompute','walking']]);
  assert.equal(h.xpCalls[1].amount,-15);

  assert.equal(h.window.togglePrivateQuest('weed_control'),true,'unlocked Gardening can complete');
  let daily=JSON.parse(h.store['rpg_daily_v1:'+today]);
  assert.equal(daily.quests.weed_control.done,true);
  assert.equal(h.xpCalls[2].amount,40);
  assert.equal(h.window.togglePrivateQuest('weed_control'),false,'unlocked Gardening can undo');
  daily=JSON.parse(h.store['rpg_daily_v1:'+today]);
  assert.equal(daily.quests.weed_control.done,false);
  assert.equal(h.xpCalls[3].amount,-40);
  assert.ok(h.events.length>=4&&h.events.every(event=>event.type==='gamenfy:daily-mission-change'));
}

// Locked private route must never write before the configured PIN succeeds.
{
  const h=makeHarness({unlocked:false,pin:'2468'});
  const today=h.window.viewedDateStr();
  assert.equal(h.window.togglePrivateQuest('no_porn'),false,'locked private action pauses for PIN');
  assert.equal(h.store['rpg_daily_v1:'+today],undefined,'private state is untouched before PIN success');
  assert.equal(h.xpCalls.length,0,'no private XP before PIN success');
  assert.ok(h.nodes.p31PinModal,'PIN modal opens');
  assert.ok(h.nodes.p31PinInput,'PIN input exists');

  h.nodes.p31PinInput.value='1111';h.nodes.p31PinInput.listeners.input();
  assert.equal(h.nodes.p31PinError.textContent,'Wrong PIN, try again','wrong PIN is rejected');
  assert.equal(h.store['rpg_daily_v1:'+today],undefined,'wrong PIN cannot mutate private mission');

  h.nodes.p31PinInput.value='2468';h.nodes.p31PinInput.listeners.input();
  const daily=JSON.parse(h.store['rpg_daily_v1:'+today]);
  assert.equal(daily.quests.no_porn.done,true,'correct configured PIN unlocks and completes requested private mission');
  assert.equal(h.store.rpg_private_unlocked,'1','successful PIN unlocks only the current session store');
  assert.equal(h.xpCalls[0].amount,45,'Discipline retains its existing XP value');
  assert.equal(h.nodes.p31PinModal,undefined,'PIN modal closes after success');
}

const source=fs.readFileSync(path.join(__dirname,'..','park31-lab.js'),'utf8');
assert.match(source,/localStorage\.getItem\('rpg_pin_v1'\)\|\|'1111'/,'controller respects configured PIN with established fallback');
assert.match(source,/if\(!privateUnlocked\(\)\)[\s\S]*showPinModal/,'private write is structurally gated behind PIN state');
assert.match(source,/rpg_daily_v1:/,'private completions remain outside the public habit log');
console.log('Park 3.1 Lab mission smoke: public route, unlocked private route and PIN gate passed.');