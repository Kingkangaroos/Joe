/* sync.js remote-apply event regression smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/sync-remote-event-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

class Storage{
  constructor(seed={}){this.map=new Map(Object.entries(seed).map(([k,v])=>[k,String(v)]));}
  get length(){return this.map.size;}
  key(i){return Array.from(this.map.keys())[i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}
function CustomEvent(type,init){this.type=type;this.detail=init&&init.detail;}
function Event(type){this.type=type;}
async function settle(turns=16){for(let i=0;i<turns;i++)await Promise.resolve();}

async function runCase({seed={},remote}){
  const localStorage=new Storage(seed);
  const events=[];
  const listeners={};
  let realtime=null;
  const supa={
    from(table){
      assert.equal(table,'app_state');
      return {
        select(){return this;},eq(){return this;},
        async maybeSingle(){return {data:{data:remote,updated_at:'2026-09-03T13:30:00.000Z'},error:null};},
        async upsert(){return {error:null};}
      };
    },
    channel(){return {on(event,filter,fn){realtime=fn;return this;},subscribe(){return this;}};}
  };
  const window={
    localStorage,__cloudSyncRegistry:{},gamenfyAuthReady:Promise.resolve(),
    supabase:{},gamenfySupabase:supa,gamenfyUserId:'user-test',gamenfyAccessToken:'token-test',
    addEventListener(type,fn){listeners[type]=fn;},
    dispatchEvent(event){
      events.push(event);
      if(listeners[event.type])listeners[event.type](event);
      return true;
    }
  };
  const document={hidden:false,addEventListener(){}};
  const timers=[];
  const sandbox={
    window,document,localStorage,CustomEvent,Event,console,Date,Math,JSON,Object,String,Array,Promise,
    setTimeout(fn,delay=0){timers.push({fn,delay});return timers.length;},clearTimeout(){},setInterval(){return 1;},
    fetch:async()=>({ok:true})
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8'),sandbox,{filename:'sync.js'});
  window.initCloudSync({appKey:'rpg',syncedKeys:['rpg_habits_v1']});
  await settle();
  return {window,localStorage,events,realtime,listeners};
}

(async()=>{
  const remote={rpg_habits_v1:{walking:{score:8}}};
  const changed=await runCase({remote});
  assert.deepEqual(JSON.parse(changed.localStorage.getItem('rpg_habits_v1')),remote.rpg_habits_v1,'clean initial remote state is applied');
  const applied=changed.events.filter(event=>event.type==='gamenfy:remote-state-applied');
  assert.equal(applied.length,1,'a genuine clean remote apply emits one dedicated refresh event');
  assert.equal(applied[0].detail.appKey,'rpg');
  assert.equal(applied[0].detail.source,'apply-remote');
  const storageBridge=changed.events.filter(event=>event.type==='storage');
  assert.equal(storageBridge.length,1,'a genuine remote apply bridges into one legacy storage refresh');
  assert.equal(storageBridge[0].key,undefined,'the bridge intentionally has no key so sync cannot mistake it for a new local edit');

  const same=await runCase({seed:{rpg_habits_v1:JSON.stringify(remote.rpg_habits_v1)},remote});
  assert.equal(same.events.filter(event=>event.type==='gamenfy:remote-state-applied').length,0,'identical remote state does not emit a fake dedicated refresh event');
  assert.equal(same.events.filter(event=>event.type==='storage').length,0,'identical remote state does not emit a fake legacy refresh either');

  const syncSource=fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8');
  const checkinSource=fs.readFileSync(path.join(__dirname,'..','checkin.js'),'utf8');
  const gardenSource=fs.readFileSync(path.join(__dirname,'..','daily-garden.js'),'utf8');
  const characterSource=fs.readFileSync(path.join(__dirname,'..','character.html'),'utf8');
  assert.match(syncSource,/new CustomEvent\('gamenfy:remote-state-applied'/,'sync owns the dedicated remote-state event contract');
  assert.match(syncSource,/new Event\('storage'\)/,'sync bridges genuine remote applies to older storage-driven views');
  assert.match(syncSource,/if \(e\.key && matches\(e\.key\)\) schedulePush\(\)/,'the sync storage listener ignores the key-less refresh bridge');
  assert.match(checkinSource,/addEventListener\('gamenfy:remote-state-applied', refreshVisibleStreak\)/,'Main streak/check-in surfaces subscribe to dedicated remote applies');
  assert.match(gardenSource,/window\.addEventListener\('storage',render\)/,'Daily Garden is covered by the legacy refresh bridge');
  assert.match(characterSource,/window\.addEventListener\('storage',[\s\S]*char-screen\.active/,'Character active tab is covered by the legacy refresh bridge');

  console.log('sync remote event smoke: dedicated + legacy view refresh contracts pass without echo writes or eventspam.');
})().catch(err=>{console.error(err);process.exitCode=1;});