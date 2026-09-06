/* Gamenfy sync.js race regression smoke test
   ChatGPT (OpenAI), 2026-09-06
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

function buildHarness({seed={},remoteData={},remoteUpdatedAt='2020-01-01T00:00:00.000Z',conflictOnce=false,conflictRemoteData=null}={}){
  const localStorage=new Storage(seed);
  const auth=deferred();
  const timers=[];
  const intervals=[];
  const writes=[];
  const listeners={};
  let realtime=null;
  let applied=0;
  let serverData=JSON.parse(JSON.stringify(remoteData));
  let serverUpdatedAt=remoteUpdatedAt;
  let serverGeneration=0;
  let serverVersion=0;
  let shouldConflict=!!conflictOnce;
  let pullCount=0;

  const supa={
    from(table){
      assert.equal(table,'app_state');
      return {
        select(){return this;},
        eq(){return this;},
        async maybeSingle(){
          pullCount++;
          return {data:{
            data:JSON.parse(JSON.stringify(serverData)),
            updated_at:serverUpdatedAt,
            restore_generation:serverGeneration,
            state_version:serverVersion
          },error:null};
        }
      };
    },
    async rpc(name,args){
      assert.equal(name,'gamenfy_write_app_state');
      assert.equal(args.p_key,'rpg');
      assert.equal(args.p_expected_generation,serverGeneration);
      if(shouldConflict){
        shouldConflict=false;
        // Simulate another writer committing version +1 just before this write.
        serverVersion+=1;
        if(conflictRemoteData) serverData=JSON.parse(JSON.stringify(conflictRemoteData));
        // Deliberately keep this older than the local dirty timestamp so the
        // local edit remains replayable after the conflict fresh-pull.
        serverUpdatedAt='2020-01-02T00:00:00.000Z';
        return {data:null,error:{code:'40001',message:'app_state write conflict'}};
      }
      if(args.p_expected_version!==serverVersion){
        return {data:null,error:{code:'40001',message:'app_state write conflict'}};
      }
      serverVersion+=1;
      serverData=JSON.parse(JSON.stringify(args.p_data));
      serverUpdatedAt=new Date().toISOString();
      writes.push({
        data:JSON.parse(JSON.stringify(args.p_data)),
        restore_generation:serverGeneration,
        state_version:serverVersion
      });
      return {data:{
        restore_generation:serverGeneration,
        state_version:serverVersion,
        updated_at:serverUpdatedAt
      },error:null};
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

  async function runTimers(maxRounds=30){
    for(let round=0;round<maxRounds;round++){
      const pending=timers.filter(t=>!t.cancelled&&!t.ran);
      if(!pending.length)break;
      for(const t of pending){t.ran=true;await t.fn();await settle(4);}
    }
  }

  function init(){
    window.initCloudSync({appKey:'rpg',syncedKeys:['rpg_habitlog_v1'],onApplied(){applied++;}});
  }

  return {
    window,localStorage,auth,writes,listeners,intervals,init,runTimers,
    realtime:()=>realtime,
    applied:()=>applied,
    pullCount:()=>pullCount,
    serverVersion:()=>serverVersion
  };
}

(async()=>{
  // Regression 1: an edit made before Auth / initial cloud pull must survive an
  // older remote snapshot and then be pushed through the CAS writer.
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
    assert.deepEqual(h.writes.at(-1).data.rpg_habitlog_v1,localValue,'CAS cloud write contains the newer local value');
    assert.equal(h.writes.at(-1).state_version,1,'successful CAS write advances one version');
    assert.equal(h.localStorage.getItem('__gamenfy_sync_dirty_v1:rpg'),null,'dirty journal clears only after confirmed RPC acknowledgement');

    // Regression 2: an out-of-order realtime event with a lower state_version
    // cannot roll local state back. Unlike the legacy timestamp-only protocol,
    // it does not need a redundant healing write: version ordering proves it old.
    const realtime=h.realtime();
    assert.equal(typeof realtime,'function','realtime handler is installed');
    const writesBefore=h.writes.length;
    realtime({new:{
      data:oldRemote,
      updated_at:'2020-01-01T00:00:00.000Z',
      restore_generation:0,
      state_version:0
    }});
    assert.deepEqual(JSON.parse(h.localStorage.getItem('rpg_habitlog_v1')),localValue,'lower-version realtime echo is ignored locally');
    await h.runTimers();
    assert.equal(h.writes.length,writesBefore,'lower-version realtime echo needs no redundant cloud healing write');
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
    assert.ok(h.writes.length>=1,'deletion converges through a CAS cloud write');
    assert.equal(Object.prototype.hasOwnProperty.call(h.writes.at(-1).data,'rpg_habitlog_v1'),false,'CAS healing snapshot omits the deleted key');
  }

  // Regression 4: if another writer wins between our pull and push, a 40001
  // conflict must cause a fresh pull. A still-newer local dirty edit from the
  // same restore generation is replayed and then succeeds against the new
  // server version rather than being silently discarded.
  {
    const initialRemote={rpg_habitlog_v1:{walking:{'2026-09-01':true}}};
    const competingRemote={rpg_habitlog_v1:{sleep:{'2026-09-02':true}}};
    const h=buildHarness({remoteData:initialRemote,conflictOnce:true,conflictRemoteData:competingRemote});
    h.init();
    const localValue={walking:{'2026-09-04':true}};
    h.localStorage.setItem('rpg_habitlog_v1',JSON.stringify(localValue));
    h.auth.resolve();
    await settle();
    const pullsAfterInitial=h.pullCount();

    await h.runTimers();
    assert.ok(h.pullCount()>pullsAfterInitial,'CAS conflict triggers a fresh owner-scoped pull');
    assert.ok(h.writes.length>=1,'local dirty edit is retried after CAS conflict');
    assert.deepEqual(h.writes.at(-1).data.rpg_habitlog_v1,localValue,'retry preserves the newer local dirty value');
    assert.equal(h.serverVersion(),2,'competing writer and retry advance the server version monotonically');
    assert.equal(h.localStorage.getItem('__gamenfy_sync_dirty_v1:rpg'),null,'dirty journal clears only after retry acknowledgement');
  }

  const source=fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8');
  assert.match(source,/DIRTY_PREFIX = '__gamenfy_sync_dirty_v1:'/,'sync keeps the persistent dirty journal contract');
  assert.match(source,/remoteVersion < stateVersion/,'out-of-order same-generation realtime payloads are rejected by version');
  assert.match(source,/pullAndReconcile\(true, 'cas-conflict'\)/,'CAS conflicts fresh-pull before replay/retry');
  console.log('sync race smoke: pre-auth edits/deletes, lower-version realtime and CAS-conflict replay passed.');
})().catch(err=>{console.error(err);process.exitCode=1;});