/* Restore generation model smoke — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'restore-generation-model.js'),'utf8');
const window={};
vm.runInNewContext(src,{window,Number,Date,Array,Object,String});
const G=window.GamenfyRestoreGeneration;
assert.ok(G&&typeof G.mayReplayDirty==='function');

// Pre-generation behavior: legacy dirty can still replay only in generation 0 and only when newer.
assert.equal(G.mayReplayDirty({ts:2000},0,1000),true);
assert.equal(G.mayReplayDirty({ts:500},0,1000),false);

// Critical restore rule: a dirty edit from an older generation can never resurrect after restore.
assert.equal(G.mayReplayDirty({ts:999999,generation:7},8,1000),false,'old-generation offline dirty must lose even with a later device timestamp');
assert.equal(G.mayReplayDirty({ts:999999},8,1000),false,'legacy generation-0 dirty must lose once restore generation advanced');
assert.equal(G.mayReplayDirty({ts:2000,generation:8},8,1000),true,'new edits created after restore generation may replay normally');
assert.equal(G.mayReplayDirty({ts:500,generation:8},8,1000),false,'same-generation stale dirty still loses to newer cloud baseline');

const base={
  authenticated:true,ownerMatch:true,pendingDirtyCount:0,preRestoreBackupReady:true,
  atomicServerApplyAvailable:true,generationAwareSyncAvailable:true,currentGeneration:4,
  cloudBaselines:{rpg:{updatedAt:'2026-09-06T00:00:01Z'},finance:{updatedAt:'2026-09-06T00:00:02Z'},health:{updatedAt:'2026-09-06T00:00:03Z'}}
};
const ready=G.assessPreconditions(base);
assert.equal(ready.ready,true);
assert.equal(ready.currentGeneration,4);
assert.equal(ready.nextGeneration,5);

for(const [field,value,reason] of [
  ['authenticated',false,'auth-required'],
  ['ownerMatch',false,'owner-binding-mismatch-or-unverified'],
  ['pendingDirtyCount',1,'pending-local-dirty'],
  ['preRestoreBackupReady',false,'pre-restore-backup-required'],
  ['atomicServerApplyAvailable',false,'atomic-server-apply-required'],
  ['generationAwareSyncAvailable',false,'generation-aware-sync-required']
]){
  const input={...base,[field]:value};
  const result=G.assessPreconditions(input);
  assert.equal(result.ready,false,field+' must block restore readiness');
  assert.ok(result.blockers.includes(reason));
}
const missing={...base,cloudBaselines:{...base.cloudBaselines,health:null}};
assert.ok(G.assessPreconditions(missing).blockers.includes('cloud-baseline-missing:health'));

const envelope=G.buildCommitEnvelope(base);
assert.equal(envelope.ready,true);
assert.equal(envelope.expectedGeneration,4);
assert.equal(envelope.nextGeneration,5);
assert.equal(envelope.applyAvailable,false,'model can never perform a restore');
assert.equal(typeof window.GamenfyRestoreGeneration.applyRestore,'undefined','no mutation API exists');
assert.doesNotMatch(src,/localStorage\.(setItem|removeItem|clear)|\.from\(['"]app_state['"]\)|fetch\s*\(/,'generation model must stay analysis-only');
console.log('Restore generation model smoke passed: old/offline dirty cannot cross generation; all Phase 2 gates fail closed.');
