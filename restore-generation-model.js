// Gamenfy restore-generation model — analysis only. No storage/cloud writes.
// Defines the safety semantics a future real restore must implement atomically.
(function(){
  'use strict';

  function generation(value){
    var n=Number(value);
    return Number.isInteger(n)&&n>=0?n:0;
  }
  function timestamp(value){
    if(typeof value==='number'&&Number.isFinite(value))return value;
    var n=Date.parse(String(value||''));
    return Number.isFinite(n)?n:0;
  }
  function dirtyGeneration(entry){
    if(!entry||typeof entry!=='object'||entry.generation===undefined||entry.generation===null)return 0;
    return generation(entry.generation);
  }

  // Legacy dirty entries are generation 0. Once a restore increments cloud
  // generation above 0, they can never replay into that newer generation.
  function mayReplayDirty(entry,cloudGeneration,remoteUpdatedAt){
    if(!entry||typeof entry!=='object')return false;
    var cg=generation(cloudGeneration);
    if(dirtyGeneration(entry)!==cg)return false;
    return Number(entry.ts||0)>timestamp(remoteUpdatedAt);
  }

  function nextGeneration(current){return generation(current)+1;}

  function assessPreconditions(input){
    input=input||{};
    var blockers=[];
    if(input.authenticated!==true)blockers.push('auth-required');
    if(input.ownerMatch!==true)blockers.push('owner-binding-mismatch-or-unverified');
    if(Number(input.pendingDirtyCount||0)>0)blockers.push('pending-local-dirty');
    if(input.preRestoreBackupReady!==true)blockers.push('pre-restore-backup-required');
    if(input.atomicServerApplyAvailable!==true)blockers.push('atomic-server-apply-required');
    if(input.generationAwareSyncAvailable!==true)blockers.push('generation-aware-sync-required');
    var domains=input.cloudBaselines||{};
    ['rpg','finance','health'].forEach(function(domain){
      var row=domains[domain];
      if(!row||!row.updatedAt)blockers.push('cloud-baseline-missing:'+domain);
    });
    return {ready:blockers.length===0,blockers:blockers,currentGeneration:generation(input.currentGeneration),nextGeneration:nextGeneration(input.currentGeneration)};
  }

  // Optimistic concurrency contract for a future atomic RPC. The server must
  // compare every expected timestamp + generation inside one DB transaction.
  function buildCommitEnvelope(input){
    var assessment=assessPreconditions(input);
    var domains=input&&input.cloudBaselines||{};
    return {
      ready:assessment.ready,
      blockers:assessment.blockers.slice(),
      expectedGeneration:assessment.currentGeneration,
      nextGeneration:assessment.nextGeneration,
      expectedUpdatedAt:{
        rpg:domains.rpg&&domains.rpg.updatedAt||null,
        finance:domains.finance&&domains.finance.updatedAt||null,
        health:domains.health&&domains.health.updatedAt||null
      },
      // Explicitly a design envelope. It contains no mutation method and does
      // not accept restored values here; Phase 2 remains impossible to execute.
      applyAvailable:false
    };
  }

  window.GamenfyRestoreGeneration={
    generation:generation,
    dirtyGeneration:dirtyGeneration,
    mayReplayDirty:mayReplayDirty,
    nextGeneration:nextGeneration,
    assessPreconditions:assessPreconditions,
    buildCommitEnvelope:buildCommitEnvelope
  };
})();
