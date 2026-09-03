/* Canonical Daily Mission baseline replay regression
   Performed-by: ChatGPT (OpenAI), 2026-09-03
   Run with: node tests/habit-authority-baseline-smoke.js */
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
function deferred(){let resolve,reject;const promise=new Promise((res,rej)=>{resolve=res;reject=rej;});return {promise,resolve,reject};}
function CustomEvent(type,init){this.type=type;this.detail=init&&init.detail;}
function Event(type){this.type=type;}
async function settle(turns=20){for(let i=0;i<turns;i++)await Promise.resolve();}

function dayKey(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
function shiftDay(key,n){const p=key.split('-').map(Number);return dayKey(new Date(p[0],p[1]-1,p[2]+n));}
function between(a,b){return Math.floor((new Date(b)-new Date(a))/86400000);}
function after(d){return shiftDay(d,1);}

(async()=>{
  const today=dayKey(new Date());
  const yesterday=shiftDay(today,-1);
  const habitlog={
    walking:{[yesterday]:true,[today]:true},
    sleep:{[yesterday]:true},
    gardening:{[today]:true}
  };
  // Important regression shape: local AND cloud contain the exact same stale
  // materialized habit cache. applyRemote therefore has nothing to change and
  // cannot emit gamenfy:remote-state-applied. cloud-sync-ready must still heal it.
  const staleHabits={
    walking:{label:'10k Steps',icon:'🚶',score:9,streak:1,lastChecked:today},
    sleep:{label:'Sleep',icon:'😴',score:7,streak:7,lastChecked:yesterday},
    gardening:{label:'Private',icon:'🌿',score:8,streak:8,lastChecked:today}
  };
  const remote={rpg_habitlog_v1:habitlog,rpg_habits_v1:staleHabits};
  const seed={
    rpg_habitlog_v1:JSON.stringify(habitlog),
    rpg_habits_v1:JSON.stringify(staleHabits)
  };
  const localStorage=new Storage(seed);
  const auth=deferred();
  const listeners={};
  const events=[];
  const timers=[];
  const writes=[];
  let realtime=null;
  function on(type,fn){(listeners[type]=listeners[type]||[]).push(fn);}
  function dispatch(event){events.push(event);(listeners[event.type]||[]).slice().forEach(fn=>fn(event));return true;}

  const supa={
    from(table){
      assert.equal(table,'app_state');
      return {
        select(){return this;},eq(){return this;},
        async maybeSingle(){return {data:{data:remote,updated_at:new Date(Date.now()-1000).toISOString()},error:null};},
        async upsert(row){writes.push(JSON.parse(JSON.stringify(row)));return {error:null};}
      };
    },
    channel(){return {on(event,filter,fn){realtime=fn;return this;},subscribe(){return this;}};}
  };
  const window={
    localStorage,__cloudSyncRegistry:{},gamenfyAuthReady:auth.promise,
    supabase:{},gamenfySupabase:supa,gamenfyUserId:'user-test',gamenfyAccessToken:'token-test',
    uncheckHabit(){},
    addEventListener:on,dispatchEvent:dispatch
  };
  const document={hidden:false,readyState:'complete',addEventListener(type,fn){on('document:'+type,fn);}};
  const sandbox={
    window,document,localStorage,CustomEvent,Event,console,Date,Math,JSON,Object,String,Array,Promise,
    setTimeout(fn,delay=0){const t={fn,delay,cancelled:false,ran:false};timers.push(t);return t;},
    clearTimeout(t){if(t)t.cancelled=true;},setInterval(){return 1;},fetch:async()=>({ok:true})
  };

  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8'),sandbox,{filename:'sync.js'});
  window.initCloudSync({appKey:'rpg',syncedKeys:['rpg_habitlog_v1','rpg_habits_v1']});
  await settle();

  const replayed=[];
  window.RPG_DEFAULT_SKILLS={
    walking:{isHabit:true,active:true,private:false},
    sleep:{isHabit:true,active:true,private:false},
    gardening:{isHabit:true,active:true,private:true},
    tennis:{isHabit:false,active:true,private:false}
  };
  window.recomputeHabitFromLog=function(key){
    replayed.push(key);
    const log=JSON.parse(localStorage.getItem('rpg_habitlog_v1')||'{}');
    const habits=JSON.parse(localStorage.getItem('rpg_habits_v1')||'{}');
    const dates=Object.keys(log[key]||{}).filter(d=>log[key][d]).sort();
    let score=0,streak=0,last=null;
    for(const d of dates){
      if(last!==null){
        score=Math.max(0,score-Math.max(0,between(last,d)-1));
        streak=d===after(last)?streak+1:1;
      }else streak=1;
      score=Math.min(10,score+1);last=d;
    }
    if(last!==null){
      const missed=Math.max(0,between(last,today)-1);
      score=Math.max(0,score-missed);if(missed>0)streak=0;
    }
    habits[key]=Object.assign({},habits[key]||{},{score,streak,lastChecked:last,decayedThrough:today});
    localStorage.setItem('rpg_habits_v1',JSON.stringify(habits));
    return habits[key];
  };

  assert.equal(replayed.length,0,'authoritative replay does not run before Auth/cloud baseline');
  auth.resolve();
  await settle();

  assert.deepEqual(replayed.sort(),['sleep','walking'],'baseline replay covers exactly the public active Daily Missions');
  assert.equal(events.filter(e=>e.type==='gamenfy:remote-state-applied').length,0,'identical local/cloud baseline does not fake a remote-change event');
  assert.equal(events.filter(e=>e.type==='gamenfy:cloud-sync-ready'&&e.detail&&e.detail.appKey==='rpg').length,1,'RPG cloud baseline emits one ready event');

  const healed=JSON.parse(localStorage.getItem('rpg_habits_v1'));
  assert.equal(healed.walking.score,2,'stale Walking score heals from the two canonical completed dates');
  assert.equal(healed.walking.streak,2,'Walking streak heals from canonical consecutive dates');
  assert.equal(healed.sleep.score,1,'Sleep stale score heals even though lastChecked was already correct');
  assert.equal(healed.sleep.lastChecked,yesterday);
  assert.equal(healed.gardening.score,8,'private Daily Mission state is not touched by the public replay guard');

  // Run the coalesced push created by the healed rpg_habits_v1 write.
  for(const timer of timers.filter(t=>!t.cancelled&&!t.ran)){timer.ran=true;await timer.fn();await settle(3);}
  assert.ok(writes.length>=1,'healed materialized habit state converges back to cloud');
  assert.equal(writes.at(-1).data.rpg_habits_v1.walking.score,2,'cloud healing snapshot contains canonical Walking score');
  assert.equal(typeof realtime,'function','realtime subscription remains installed after baseline replay');

  const source=fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8');
  assert.match(source,/gamenfy:cloud-sync-ready/,'sync exposes a baseline-ready contract');
  assert.match(source,/replayPublicHabits/,'sync owns the canonical public habit replay guard');
  console.log('habit authority baseline smoke: canonical day log heals stale materialized scores after safe cloud baseline.');
})().catch(err=>{console.error(err);process.exitCode=1;});