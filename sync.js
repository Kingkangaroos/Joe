// =============================================================
// Shared cloud-sync helper. Each page calls initCloudSync({...}).
// Replace the two placeholders with your Supabase project URL +
// publishable key (same ones you used in topbar.js/gym.html).
//
// v10.55 — light multi-user workspace support (Joey's decision: max ~4
// people, no real auth, just data isolation by prefixing the Supabase
// ROW KEY — not every localStorage key, which would mean touching read/
// write code across the whole app). A device-local, NEVER-synced
// localStorage value (gamenfy_workspace_id) decides the prefix:
//   - unset/empty  -> cloudKey === appKey, EXACTLY as before. This is
//     Joey's own existing path and is completely unchanged — no
//     workspace id means no behavior change whatsoever.
//   - set (e.g. "alex") -> cloudKey becomes "alex:rpg", "alex:finance",
//     etc. — an entirely separate Supabase row per app key, so a
//     friend's data can never collide with or overwrite Joey's.
// localStorage key NAMES on each device stay exactly as they are; only
// which Supabase row they sync to changes. Set via settings.html.
// =============================================================
(function () {
  'use strict';
  const SUPABASE_URL = 'https://ttxjsoahmtennnufgeqx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_5lYXJme36ggS2dWTJbMSCA_Ir9Uogab';
  const WORKSPACE_STORAGE_KEY = 'gamenfy_workspace_id';

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

  // v9.23: one live sync instance per appKey. Duplicate inits (e.g. a page's own
  // config next to the xp.js fallback) previously raced each other; the instance
  // with the narrowest key list could overwrite the whole cloud row with a subset
  // and the realtime echo then deleted the missing keys locally (allowDelete).
  window.__cloudSyncRegistry = window.__cloudSyncRegistry || {};
  window.initCloudSync = function (config) {
    const appKey = config && config.appKey;
    const syncedKeys = (config && config.syncedKeys) || [];
    const syncedPrefixes = (config && config.syncedPrefixes) || [];
    const onApplied = config && config.onApplied;
    if (!appKey || !window.supabase) return;
    if (syncedKeys.length === 0 && syncedPrefixes.length === 0) return; // empty scope (e.g. shared config not loaded yet): no-op, don't claim the registry slot
    if (window.__cloudSyncRegistry[appKey]) return; // first init wins
    window.__cloudSyncRegistry[appKey] = true;
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    if (SUPABASE_URL.indexOf('PASTE-') === 0 || SUPABASE_KEY.indexOf('PASTE-') === 0) return;

    // v10.55: the ONLY thing that changes for multi-user — which Supabase row
    // this appKey's data lives in. Everything below still says "appKey" for
    // the local registry/matches() logic (those are about local storage keys,
    // untouched); only the Supabase reads/writes use cloudKey.
    const workspaceId = getWorkspaceId();
    const cloudKey = workspaceId ? (workspaceId + ':' + appKey) : appKey;

    let supa = null, pushTimer = null, suppressSync = false, lastSyncedJson = null, ready = false;
    // v10.65: local writes captured during the initial-pull window (see setItem).
    const pendingLocalWrites = new Map();

    function matches(k) {
      if (!k) return false;
      if (syncedKeys.indexOf(k) !== -1) return true;
      for (let i = 0; i < syncedPrefixes.length; i++) {
        if (k.indexOf(syncedPrefixes[i]) === 0) return true;
      }
      return false;
    }
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
    const origSet = localStorage.setItem.bind(localStorage);
    const origRemove = localStorage.removeItem.bind(localStorage);
    localStorage.setItem = function (k, v) {
      origSet(k, v);
      try {
        if (!suppressSync && matches(k)) {
          // v10.65 FIX: a write made BEFORE the initial cloud pull finished was
          // silently lost — schedulePush() fired but pushNow() early-returns
          // while !ready, and then applyRemote() overwrote it with the older
          // cloud value. On a slow connection Joey could open the app, tap a
          // few missions immediately, and watch them come back unchecked later.
          // Recording them here lets init replay them once the pull lands.
          if (!ready) pendingLocalWrites.set(k, v);
          schedulePush();
        }
      } catch (e) {}
    };
    localStorage.removeItem = function (k) {
      origRemove(k);
      try { if (!suppressSync && matches(k)) schedulePush(); } catch (e) {}
    };
    function applyRemote(remote, allowDelete) {
      if (!remote || typeof remote !== 'object') return false;
      suppressSync = true;
      let changed = false;
      try {
        for (const k of Object.keys(remote)) {
          if (!matches(k)) continue;
          const incoming = JSON.stringify(remote[k]);
          const local = localStorage.getItem(k);
          if (local !== incoming) { try { origSet(k, incoming); changed = true; } catch (e) {} }
        }
        if (allowDelete) {
          const missing = listAllKeys().filter((k) => !(k in remote));
          if (missing.length > 3) {
            // v9.23 safety net: a remote blob that lacks 4+ of our local keys is a
            // stripped/partial write, not a real cross-device delete (real deletes
            // in this app are single keys). Heal the cloud instead of wiping local.
            schedulePush();
          } else {
            for (const k of missing) { try { origRemove(k); changed = true; } catch (e) {} }
          }
        }
      } finally { suppressSync = false; }
      if (changed && typeof onApplied === 'function') { try { onApplied(); } catch (e) {} }
      return changed;
    }
    async function pushNow() {
      if (!supa || !ready) return;
      const state = collect();
      const json = JSON.stringify(state);
      if (json === lastSyncedJson) return;
      try {
        const { error } = await supa.from('app_state').upsert(
          { key: cloudKey, data: state, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
        if (!error) lastSyncedJson = json;
      } catch (e) {}
    }
    function schedulePush() { clearTimeout(pushTimer); pushTimer = setTimeout(pushNow, 250); }
    function flushOnUnload() {
      if (!ready) return;
      const state = collect();
      const json = JSON.stringify(state);
      if (json === lastSyncedJson) return;
      try {
        fetch(SUPABASE_URL + '/rest/v1/app_state?on_conflict=key', {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify({ key: cloudKey, data: state, updated_at: new Date().toISOString() }),
          keepalive: true,
        }).catch(() => {});
        lastSyncedJson = json;
      } catch (e) {}
    }
    (async function init() {
      supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      try {
        const { data, error } = await supa.from('app_state').select('data').eq('key', cloudKey).maybeSingle();
        if (!error && data && data.data && Object.keys(data.data).length > 0) {
          lastSyncedJson = JSON.stringify(data.data);
          applyRemote(data.data, false); // initial load: never delete local-only items
          // v10.65: anything the user changed while the pull was in flight was
          // just overwritten by the older cloud value — put it back, then push.
          // Local wins here because it is strictly newer than what we fetched.
          let replayed = false;
          if (pendingLocalWrites.size) {
            suppressSync = true;
            try {
              for (const [k, v] of pendingLocalWrites) {
                if (localStorage.getItem(k) !== v) { try { origSet(k, v); replayed = true; } catch (e) {} }
              }
            } finally { suppressSync = false; }
            pendingLocalWrites.clear();
            if (replayed && typeof onApplied === 'function') { try { onApplied(); } catch (e) {} }
          }
          ready = true; // v10.1: pull complete — pushes are now safe (this is the stale-load-clobber fix)
          // If we have local items the cloud doesn't know about, push the merged state.
          let hasLocalOnly = false;
          for (const k of listAllKeys()) { if (!(k in data.data)) { hasLocalOnly = true; break; } }
          if (hasLocalOnly || replayed) schedulePush();
        } else if (Object.keys(collect()).length > 0) {
          ready = true; // no cloud row yet but we have local data — safe to seed the cloud
          schedulePush();
        } else {
          ready = true; // nothing anywhere yet
        }
      } catch (e) { ready = true; /* pull failed: allow later user-driven pushes, but the stale on-load writes already fired their (suppressed) push and are dropped */ }
      supa.channel('app_state_' + cloudKey)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'app_state', filter: 'key=eq.' + cloudKey,
        }, (payload) => {
          if (!payload.new || !payload.new.data) return;
          const incoming = JSON.stringify(payload.new.data);
          if (incoming === lastSyncedJson) return;
          lastSyncedJson = incoming;
          applyRemote(payload.new.data, true);
        })
        .subscribe();
    })();
    window.addEventListener('beforeunload', flushOnUnload);
    window.addEventListener('pagehide', flushOnUnload);
    // v10.90: Joey checked a habit, then it was gone from the cloud — the
    // data confirmed it: nothing for the dates he'd just checked reached
    // Supabase at all. beforeunload/pagehide were already wired up, but on
    // an installed iOS PWA specifically (not a regular Safari tab), those
    // two events have documented cases where they don't fire reliably when
    // the app is backgrounded or swiped away — which is exactly how someone
    // closes an app right after checking something on a phone.
    // visibilitychange (document.hidden becoming true) is the more robust
    // signal recommended for standalone PWAs precisely for this scenario —
    // added as a third safety net alongside the existing two, not instead.
    document.addEventListener('visibilitychange', () => { if (document.hidden) flushOnUnload(); });
    window.addEventListener('storage', (e) => { if (e.key && matches(e.key)) schedulePush(); });
  };
})();
