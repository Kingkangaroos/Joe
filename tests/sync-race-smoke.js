/* Gamenfy sync.js race regression smoke test
   ChatGPT (OpenAI), 2026-09-03
   Run with: node tests/sync-race-smoke.js */
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
async function settle(turns=12){for(let i=0;i<turns;i++)await Promise.resolve();}

function buildHarness({seed={},remoteData={},remoteUpdatedAt='2020-01-01T00:00:00.000Z'}={}){
  const localStorage=new Storage(seed);
  const auth=deferred();
  const timers=[];
  const intervals=[];
  const writes=[];
  const listeners={};
  let realtime=null;
  let applied=0;

  const supa={
    from(table){
      assert.equal(table,'app_state');
      return {
        select(){return this;},
        eq(){return this;},
        async maybeSingle(){return {data:{data:remoteData,updated_at:remoteUpdatedAt},error:null};},
        async upsert(row){writes.push(JSON.parse(JSON.stringify(row)));return {error:null};}
      };
    },
    channel(){
      return {
        on(event,filter,fn){assert.equal(event,'postgres_changes');realtime=fn;return this;},
        subscribe(){return this;}
      };
    }
  };

  const window={
    localStorage,
    __cloudSyncRegistry:{},
    gamenfyAuthReady:auth.promise,
    supabase:{},
    gamenfySupabase:supa,
    gamenfyUserId:'user-test',
    gamenfyAccessToken:'token-test',
    addEventListener(type,fn){listeners['window:'+type]=fn;}
  };
  const document={hidden:false,addEventListener(type,fn){listeners['document:'+type]=fn;}};
  const sandbox={
    window,document,localStorage,
    console,Date,Math,JSON,Object,String,Array,Promise,
    setTimeout(fn,delay=0){const t={fn,delay,cancelled:false,ran:false};timers.push(t);return t;},
    clearTimeout(t){if(t)t.cancelled=true;},
    setInterval(fn,delay){intervals.push({fn,delay});return intervals.length;},
    fetch:async()=>({ok:true})
  };

  const source=fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8');
  vm.runInNewContext(source,sandbox,{filename:'sync.js'});

  async function runTimers(maxRounds=20){
    for(let round=0;round<maxRounds;round++){
      const pending=timers.filter(t=>!t.cancelled&&!t.ran);
      if(!pending.length)break;
      for(const t of pending){t.ran=true;await t.fn();await settle(3);}
    }
  }

  function init(){
    window.initCloudSync({appKey:'rpg',syncedKeys:['rpg_habitlog_v1'],onApplied(){applied++;}});
  }

  return {
    window,localStorage,auth,writes,listeners,intervals,init,runTimers,
    realtime:()=>realtime,
    applied:()=>applied
  };
}

(async()=>{
  // Regression 1: an edit made before Auth / initial cloud pull must survive an
  // older remote snapshot and then be pushed to the cloud.
  {
    const oldRemote={rpg_habitlog_v1:{walking:{'2026-09-01':true}}};
    const h=buildHarness({remoteData:oldRemote});
    h.init();
    const localValue={walking:{'2026-09-03':true}};
    h.localStorage.setItem('rpg_habitlog_v1',JSON.stringify(localValue));

    const dirtyBefore=JSON.parse(h.localStorage.getItem('__gamenfy_sync_dirty_v1:rpg'));
    assert.equal(dirtyBefore.items.rpg_habitlog_v1.value,JSON.stringify(localValue),'pre-auth edit is journaled immediately');

    h.auth.resolve();
    await settle();
    assert.deepEqual(JSON.parse(h.localStorage.getItem('rpg_habitlog_v1')),localValue,'older initial cloud row cannot overwrite newer local dirty state');

    await h.runTimers();
    assert.ok(h.writes.length>=1,'surviving local edit is pushed after initial pull');
    assert.deepEqual(h.writes.at(-1).data.rpg_habitlog_v1,localValue,'cloud healing write contains the newer local value');
    assert.equal(h.localStorage.getItem('__gamenfy_sync_dirty_v1:rpg'),null,'dirty journal clears only after confirmed upsert');

    // Regression 2: a stale realtime echo arriving after a newer write may not
    // roll local state back; it schedules another healing push instead.
    const realtime=h.realtime();
    assert.equal(typeof realtime,'function','realtime handler is installed');
    const writesBefore=h.writes.length;
    realtime({new:{data:oldRemote,updated_at:'2020-01-01T00:00:00.000Z'}});
    assert.deepEqual(JSON.parse(h.localStorage.getItem('rpg_habitlog_v1')),localValue,'stale realtime echo is ignored locally');
    await h.runTimers();
    assert.ok(h.writes.length>writesBefore,'stale realtime echo triggers a healing write');
    assert.deepEqual(h.writes.at(-1).data.rpg_habitlog_v1,localValue,'healing write preserves newest local state');
  }

  // Regression 3: a delete made before the initial pull is also a real edit.
  // An older cloud value must not resurrect the removed key.
  {
    const oldRemote={rpg_habitlog_v1:{walking:{'2026-09-01':true}}};
    const seed={rpg_habitlog_v1:JSON.stringify({walking:{'2026-09-02':true}})};
    const h=buildHarness({seed,remoteData:oldRemote});
    h.init();
    h.localStorage.removeItem('rpg_habitlog_v1');
    const dirty=JSON.parse(h.localStorage.getItem('__gamenfy_sync_dirty_v1:rpg'));
    assert.equal(dirty.items.rpg_habitlog_v1.removed,true,'pre-auth deletion is journaled');

    h.auth.resolve();
    await settle();
    assert.equal(h.localStorage.getItem('rpg_habitlog_v1'),null,'older initial cloud row cannot resurrect a newer local deletion');
    await h.runTimers();
    assert.ok(h.writes.length>=1,'deletion converges through a cloud write');
    assert.equal(Object.prototype.hasOwnProperty.call(h.writes.at(-1).data,'rpg_habitlog_v1'),false,'cloud healing snapshot omits the deleted key');
  }

  const source=fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8');
  assert.match(source,/DIRTY_PREFIX = '__gamenfy_sync_dirty_v1:'/,'sync keeps the persistent dirty journal contract');
  assert.match(source,/remoteMs && remoteMs < highWaterMs/,'out-of-order whole-row realtime payloads are detected');
  assert.match(source,/forcePush = true/,'stale realtime detection heals the cloud instead of accepting rollback');
  console.log('sync race smoke: ok');
})().catch(err=>{console.error(err);process.exitCode=1;});
