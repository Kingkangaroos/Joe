// ChatGPT/OpenAI — private RPG bootstrap repair.
// Prevents fresh/default localStorage from outranking Joey's existing cloud RPG
// state while auth is still resolving. The RPG sync is delayed until this check
// finishes. If the local state is clearly empty while cloud is clearly populated,
// cloud is rehydrated locally first, the stale dirty journal is removed, and the
// page reloads once before normal sync starts.
(function installPrivateRpgBootstrapRepair(){
  'use strict';

  const OWNER = 'dff21e4f-51fa-468b-9e0d-2344164efd79';
  const DIRTY_KEY = '__gamenfy_sync_dirty_v1:rpg';
  const MARKER_KEY = 'gamenfy_private_rpg_bootstrap_repair_v1';

  if (typeof window.initCloudSync !== 'function') return;
  const originalInitCloudSync = window.initCloudSync;

  function parseStored(key){
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_e) { return null; }
  }

  function charStats(char){
    const skills = char && char.skills && typeof char.skills === 'object' ? char.skills : {};
    const xpLog = char && Array.isArray(char.xpLog) ? char.xpLog : [];
    let totalXp = 0;
    Object.keys(skills).forEach((key) => {
      const value = Number(skills[key] && skills[key].xp);
      if (Number.isFinite(value) && value > 0) totalXp += value;
    });
    return { skillCount:Object.keys(skills).length, xpLogCount:xpLog.length, totalXp };
  }

  function rawSet(key,value){
    try { Storage.prototype.setItem.call(localStorage,key,value); } catch (_e) {
      try { localStorage.setItem(key,value); } catch (_e2) {}
    }
  }
  function rawRemove(key){
    try { Storage.prototype.removeItem.call(localStorage,key); } catch (_e) {
      try { localStorage.removeItem(key); } catch (_e2) {}
    }
  }

  async function repairBeforeSync(){
    try {
      if (window.gamenfyAuthReady) await window.gamenfyAuthReady;
      if (window.gamenfyUserId !== OWNER || !window.gamenfySupabase) return false;

      const { data:row, error } = await window.gamenfySupabase
        .from('app_state')
        .select('data,updated_at,restore_generation,state_version')
        .eq('key','rpg')
        .eq('user_id',OWNER)
        .maybeSingle();
      if (error || !row || !row.data || typeof row.data !== 'object') return false;

      const remote = row.data;
      const remoteStats = charStats(remote.rpg_character_v1);
      const localStats = charStats(parseStored('rpg_character_v1'));

      // Conservative recovery gate: only a clearly mature cloud profile may
      // overwrite a clearly empty/fresh local profile. Normal offline edits are
      // never touched by this bootstrap repair.
      const remoteIsMature = remoteStats.skillCount >= 20 && remoteStats.xpLogCount >= 20 && remoteStats.totalXp >= 250;
      const localLooksFresh = localStats.xpLogCount <= 2 && (
        localStats.totalXp <= 50 ||
        (remoteStats.totalXp > 0 && localStats.totalXp < remoteStats.totalXp * 0.10)
      );
      if (!remoteIsMature || !localLooksFresh) return false;

      rawRemove(DIRTY_KEY);
      Object.keys(remote).forEach((key) => {
        try { rawSet(key, JSON.stringify(remote[key])); } catch (_e) {}
      });
      rawSet(MARKER_KEY, JSON.stringify({
        at:new Date().toISOString(),
        updatedAt:row.updated_at || null,
        stateVersion:Number(row.state_version) || 0,
        remoteStats,
        previousLocalStats:localStats
      }));

      // A reload guarantees every legacy view reads the restored local baseline
      // during its normal synchronous startup instead of keeping already-rendered
      // default values in memory.
      setTimeout(function(){
        try { window.location.reload(); } catch (_e) {}
      }, 60);
      return true;
    } catch (_e) {
      return false;
    }
  }

  const repairPromise = repairBeforeSync();

  window.initCloudSync = function(config){
    if (!config || config.appKey !== 'rpg') return originalInitCloudSync(config);
    repairPromise.then(function(didRepair){
      if (!didRepair) originalInitCloudSync(config);
      // If repaired, this load is intentionally abandoned by the reload above;
      // normal RPG sync starts cleanly on the next load.
    }).catch(function(){
      originalInitCloudSync(config);
    });
  };
})();
