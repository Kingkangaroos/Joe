/* Cloud-sync v11.3 browserless smoke test
   Verifies that a dirty local key cannot erase unrelated newer remote keys. */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class LocalStorage {
  constructor(seed){this.map=new Map(Object.entries(seed||{}).map(([k,v])=>[k,String(v)]));}
  get length(){return this.map.size;}
  key(i){return Array.from(this.map.keys())[i]||null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}

(async function(){
  const localStorage=new LocalStorage({
    mission_log:JSON.stringify({walking:{'2026-08-31':false}}),
    'todo:2026-08-31':JSON.stringify([{id:'local',text:'Keep me'}])
  });
  let remote={
    data:{mission_log:{walking:{'2026-08-31':true}},remote_preference:{theme:'daylight'}},
    updated_at:'2026-09-01T10:00:00.000Z'
  };
  const statuses=[];
  const listeners={};
  const chain={
    select(){return this;},eq(){return this;},
    async maybeSingle(){return {data:{data:remote.data,updated_at:remote.updated_at},error:null};},
    async upsert(row){remote={data:row.data,updated_at:row.updated_at};return {error:null};}
  };
  const fakeSupa={
    from(){return chain;},
    channel(){return {on(){return this;},subscribe(){return this;}};}
  };
  class CustomEvent {constructor(type,opts){this.type=type;this.detail=(opts&&opts.detail)||null;}}
  const window={
    localStorage,supabase:true,gamenfySupabase:fakeSupa,gamenfyUserId:'user-1',gamenfyAccessToken:'token',
    gamenfyAuthReady:Promise.resolve(),__cloudSyncRegistry:{},
    addEventListener(type,fn){(listeners[type]=listeners[type]||[]).push(fn);},
    dispatchEvent(event){(listeners[event.type]||[]).forEach(fn=>fn(event));return true;}
  };
  window.addEventListener('gamenfy:sync-status',event=>statuses.push(event.detail.state));
  const document={hidden:false,addEventListener(){}};
  const sandbox={window,document,localStorage,CustomEvent,fetch:async()=>({}),console,JSON,Date,Object,
    setTimeout,clearTimeout,setInterval:()=>1,clearInterval:()=>{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8'),sandbox,{filename:'sync.js'});
  window.initCloudSync({appKey:'rpg',syncedKeys:['mission_log','remote_preference'],syncedPrefixes:['todo:']});

  await new Promise(resolve=>setTimeout(resolve,35));
  // Simulate another device adding a field after this page initially loaded.
  remote.data.remote_second={kept:true};
  remote.updated_at='2026-09-01T10:00:01.000Z';
  localStorage.setItem('mission_log',JSON.stringify({walking:{'2026-08-31':true,'2026-09-01':true}}));
  await new Promise(resolve=>setTimeout(resolve,220));

  assert.deepEqual(remote.data.mission_log.walking,{'2026-08-31':true,'2026-09-01':true},'dirty local mission log wins');
  assert.deepEqual(remote.data.remote_preference,{theme:'daylight'},'existing remote key survives');
  assert.deepEqual(remote.data.remote_second,{kept:true},'concurrent remote-only key survives');
  assert.equal(remote.data['todo:2026-08-31'][0].text,'Keep me','local-only dated todo is retained');
  assert.ok(statuses.includes('saving'),'saving state is emitted');
  assert.ok(statuses.includes('saved'),'cloud confirmation is emitted');
  console.log('Cloud sync smoke test passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});

