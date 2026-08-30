// =============================================================
// Shared cloud-sync helper — Gamenfy v11.1 race fix
// Performed-by: ChatGPT (OpenAI)
//
// v11.1 hardens navigation/realtime races:
// - local writes are journaled immediately, even before Auth/cloud pull is ready
// - a stale remote/realtime payload may NOT overwrite a newer local dirty value
// - the dirty journal survives page navigation until a cloud write is confirmed
// - remote updated_at decides whether a local pending write is genuinely newer
// - periodic push remains a safety net, not the source of truth
//
// =============================================================
(function () {
  'use strict';

  const SUPABASE_URL = 'https://ttxjsoahmtennnufgeqx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_5lYXJme36ggS2dWTJbMSCA_Ir9Uogab';
  const WORKSPACE_STORAGE_KEY = 'gamenfy_workspace_id';
  const DIRTY_PREFIX = '__gamenfy_sync_dirty_v1:';

  function getWorkspaceId() {
    try {
      const v = (window.localStorage.getItem(WORKSPACE_STORAGE_KEY) || '').trim();
      return v || null;
    } catch (e) { return null; }
  }
  window.getGamenfyWorkspaceId = getWorkspaceId;
  window.setGamenfyWorkspaceId = function (id) {
    try {
      const v = (id || '').trim();
      if (v) window.localStorage.setItem(WORKSPACE_STORAGE_KEY, v);
      else window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      return true;
    } catch (e) { return false; }
  };

  window.__cloudSyncRegistry = window.__cloudSyncRegistry || {};

  function startCloudSync(config) {
    const appKey = config && config.appKey;
    const syncedKeys = (config && config.syncedKeys) || [];
    const syncedPrefixes = (config && config.syncedPrefixes) || [];
    const onApplied = config && config.onApplied;
    if (!appKey) return;
    if (syncedKeys.length === 0 && syncedPrefixes.length === 0) return;
    if (window.__cloudSyncRegistry[appKey]) return;
    window.__cloudSyncRegistry[appKey] = true;

    const cloudKey = appKey;
    const dirtyKey = DIRTY_PREFIX + appKey;
    let supa = null;
    let pushTimer = null;
    let suppressSync = false;
    let lastSyncedJson = null;
    let ready = false;

    // Capture the browser-native methods before wrapping them. Dirty-journal
    // writes use these directly so the journal never recursively syncs itself.
    const origSet = localStorage.setItem.bind(localStorage);
    const origRemove = localStorage.removeItem.bind(localStorage);

    function matches(k) {
      if (!k) return false;
      if (syncedKeys.indexOf(k) !== -1) return true;
      for (let i = 0; i < syncedPrefixes.length; i++) {
        if (k.indexOf(syncedPrefixes[i]) === 0) return true;
      }
      return false;
    }

    function loadDirty() {
      try {
        const raw = localStorage.getItem(dirtyKey);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && parsed.items && typeof parsed.items === 'object'
          ? parsed
          : { items: {} };
      } catch (e) { return { items: {} }; }
    }
    function saveDirty(journal) {
      try {
        if (!journal || !Object.keys(journal.items || {}).length) origRemove(dirtyKey);
        else origSet(dirtyKey, JSON.stringify(journal));
      } catch (e) {}
    }
    function markDirty(k, rawValue, removed) {
      if (!matches(k)) return;
      const j = loadDirty();
      j.items[k] = { value: rawValue == null ? null : String(rawValue), removed: !!removed, ts: Date.now() };
      saveDirty(j);
    }
    function dirtyEntry(k) {
      return (loadDirty().items || {})[k] || null;
    }
    function clearDirtyThrough(cutoffMs) {
      const j = loadDirty();
      let changed = false;
      Object.keys(j.items || {}).forEach((k) => {
        if ((j.items[k].ts || 0) <= cutoffMs) { delete j.items[k]; changed = true; }
      });
      if (changed) saveDirty(j);
    }
    function discardDirtyNotNewerThan(remoteMs) {
      const j = loadDirty();
      let changed = false;
      Object.keys(j.items || {}).forEach((k) => {
        if ((j.items[k].ts || 0) <= remoteMs) { delete j.items[k]; changed = true; }
      });
      if (changed) saveDirty(j);
    }

    // IMPORTANT: patch immediately. initCloudSync can be called before Auth is
    // ready, and Joey can already tap a mission in that window.
    localStorage.setItem = function (k, v) {
      origSet(k, v);
      try {
        if (!suppressSync && matches(k)) {
          markDirty(k, v, false);
          schedulePush();
        }
      } catch (e) {}
    };
    localStorage.removeItem = function (k) {
      origRemove(k);
      try {
        if (!suppressSync && matches(k)) {
          markDirty(k, null, true);
          schedulePush();
        }
      } catch (e) {}
    };

    function listAllKeys() {
      const out = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (matches(k)) out.push(k);
      }
      return out;
    }
    function collect() {
      const out = {};
      for (const k of listAllKeys()) {
        const v = localStorage.getItem(k);
        if (v == null) continue;
        try { out[k] = JSON.parse(v); } catch (e) { out[k] = v; }
      }
      return out;
    }

    function remoteMayTouchKey(k, remoteMs) {
      const d = dirtyEntry(k);
      return !(d && (d.ts || 0) > remoteMs);
    }

    function applyRemote(remote, allowDelete, remoteMs) {
      if (!remote || typeof remote !== 'object') return false;
      suppressSync = true;
      let changed = false;
      try {
        for (const k of Object.keys(remote)) {
          if (!matches(k) || !remoteMayTouchKey(k, remoteMs)) continue;
          const incoming = JSON.stringify(remote[k]);
          const local = localStorage.getItem(k);
          if (local !== incoming) {
            try { origSet(k, incoming); changed = true; } catch (e) {}
          }
        }
        if (allowDelete) {
          const missing = listAllKeys().filter((k) => !(k in remote) && remoteMayTouchKey(k, remoteMs));
          if (missing.length > 3) {
            // A large omission is almost certainly a partial/stripped whole-row
            // write. Heal cloud from local rather than wiping the device.
            schedulePush();
          } else {
            for (const k of missing) {
              try { origRemove(k); changed = true; } catch (e) {}
            }
          }
        }
      } finally { suppressSync = false; }
      if (changed && typeof onApplied === 'function') {
        try { onApplied(); } catch (e) {}
      }
      return changed;
    }

    function replayNewerDirty(remoteMs) {
      const j = loadDirty();
      let replayed = false;
      suppressSync = true;
      try {
        Object.keys(j.items || {}).forEach((k) => {
          const d = j.items[k];
          if (!matches(k) || (d.ts || 0) <= remoteMs) return;
          if (d.removed) {
            if (localStorage.getItem(k) != null) { origRemove(k); replayed = true; }
          } else if (localStorage.getItem(k) !== d.value) {
            origSet(k, d.value);
            replayed = true;
          }
        });
      } finally { suppressSync = false; }
      discardDirtyNotNewerThan(remoteMs);
      if (replayed && typeof onApplied === 'function') {
        try { onApplied(); } catch (e) {}
      }
      return replayed;
    }

    async function pushNow() {
      if (!supa || !ready || !window.gamenfyUserId) return;
      const state = collect();
      const json = JSON.stringify(state);
      const dirty = loadDirty();
      const hasDirty = Object.keys(dirty.items || {}).length > 0;
      if (json === lastSyncedJson && !hasDirty) return;

      const cutoff = Date.now();
      try {
        const { error } = await supa.from('app_state').upsert(
          { key: cloudKey, user_id: window.gamenfyUserId, data: state, updated_at: new Date(cutoff).toISOString() },
          { onConflict: 'key' }
        );
        if (!error) {
          lastSyncedJson = json;
          clearDirtyThrough(cutoff);
        }
      } catch (e) {}
    }

    function schedulePush() {
      clearTimeout(pushTimer);
      // Short enough that a normal tab switch usually confirms before navigation.
      pushTimer = setTimeout(pushNow, 120);
    }

    function flushOnUnload() {
      if (!ready || !window.gamenfyUserId || !window.gamenfyAccessToken) return;
      const state = collect();
      const json = JSON.stringify(state);
      if (json === lastSyncedJson && !Object.keys(loadDirty().items || {}).length) return;
      try {
        fetch(SUPABASE_URL + '/rest/v1/app_state?on_conflict=key', {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + window.gamenfyAccessToken,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            key: cloudKey,
            user_id: window.gamenfyUserId,
            data: state,
            updated_at: new Date().toISOString()
          }),
          keepalive: true,
        }).catch(() => {});
        // Deliberately DO NOT clear dirty here: keepalive is fire-and-forget.
        // The next confirmed push/pull is responsible for clearing it.
      } catch (e) {}
    }

    (async function init() {
      try {
        if (window.gamenfyAuthReady) await window.gamenfyAuthReady;
      } catch (e) {
        console.error('Gamenfy auth failed; cloud sync stays locked.', e);
        return;
      }
      if (!window.supabase || !window.gamenfySupabase || !window.gamenfyUserId) return;
      supa = window.gamenfySupabase;

      try {
        const { data, error } = await supa
          .from('app_state')
          .select('data,updated_at')
          .eq('key', cloudKey)
          .maybeSingle();

        const remote = (!error && data && data.data && typeof data.data === 'object') ? data.data : null;
        const remoteMs = data && data.updated_at ? (Date.parse(data.updated_at) || 0) : 0;

        if (remote && Object.keys(remote).length > 0) {
          lastSyncedJson = JSON.stringify(remote);
          applyRemote(remote, false, remoteMs); // initial load never deletes local-only keys
          const replayed = replayNewerDirty(remoteMs);
          ready = true;

          let hasLocalOnly = false;
          for (const k of listAllKeys()) {
            if (!(k in remote)) { hasLocalOnly = true; break; }
          }
          if (hasLocalOnly || replayed || Object.keys(loadDirty().items || {}).length) schedulePush();
        } else {
          ready = true;
          if (Object.keys(collect()).length > 0 || Object.keys(loadDirty().items || {}).length) schedulePush();
        }
      } catch (e) {
        // Pull failed: never erase local. Dirty journal remains and will retry.
        ready = true;
        if (Object.keys(loadDirty().items || {}).length) schedulePush();
      }

      supa.channel('app_state_' + cloudKey + '_' + Math.random().toString(36).slice(2,8))
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'app_state', filter: 'key=eq.' + cloudKey,
        }, (payload) => {
          if (!payload.new || !payload.new.data) return;
          const remoteMs = payload.new.updated_at ? (Date.parse(payload.new.updated_at) || 0) : 0;
          const incoming = JSON.stringify(payload.new.data);
          if (incoming === lastSyncedJson && !Object.keys(loadDirty().items || {}).length) return;
          lastSyncedJson = incoming;
          applyRemote(payload.new.data, true, remoteMs);
          // If a local write is newer than this realtime echo, keep it and push it.
          if (replayNewerDirty(remoteMs) || Object.keys(loadDirty().items || {}).length) schedulePush();
        })
        .subscribe();
    })();

    window.addEventListener('beforeunload', flushOnUnload);
    window.addEventListener('pagehide', flushOnUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) flushOnUnload();
      else if (ready && Object.keys(loadDirty().items || {}).length) schedulePush();
    });
    window.addEventListener('pageshow', () => {
      if (ready && Object.keys(loadDirty().items || {}).length) schedulePush();
    });
    window.addEventListener('storage', (e) => {
      if (e.key && matches(e.key)) schedulePush();
    });

    // Confirm pending local state frequently while the app remains open.
    setInterval(function(){ if (ready) pushNow(); }, 5000);
  }

  window.initCloudSync = function (config) {
    if (!config) return;
    // Start immediately so localStorage writes are journaled even while Auth loads.
    startCloudSync(config);
  };
})();
