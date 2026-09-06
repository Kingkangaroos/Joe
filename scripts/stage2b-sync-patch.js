/* One-shot Stage 2B patcher — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const fs = require('node:fs');

function replaceOnce(src, pattern, replacement, label) {
  const next = src.replace(pattern, replacement);
  if (next === src) throw new Error('Stage2B patch marker missing: ' + label);
  return next;
}

let sync = fs.readFileSync('sync.js', 'utf8');

sync = replaceOnce(sync,
  '// Shared cloud-sync helper — Gamenfy v11.8 dated Character Daily guard',
  '// Shared cloud-sync helper — Gamenfy v11.9 server CAS write gate',
  'header version');

sync = replaceOnce(sync,
  "// delayed Character callback can run; canonical habitlog is already cloud-synced.\n// =============================================================",
  "// delayed Character callback can run; canonical habitlog is already cloud-synced.\n// v11.9 moves the current browser writer to the authenticated server CAS RPC.\n// restore_generation protects restore epochs; state_version protects concurrent\n// writes inside an epoch. Legacy installed PWAs remain supported by the DB bridge.\n// Unload uses the same RPC with keepalive and never clears dirty state optimistically.\n// =============================================================",
  'v11.9 notes');

sync = replaceOnce(sync,
  '    let restoreGeneration = 0;\n',
  '    let restoreGeneration = 0;\n    let stateVersion = 0;\n    let reconcileInFlight = null;\n',
  'state version vars');

const pushBlock = `    function normalizeCounter(value) {
      const n = Number(value);
      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    }

    function isCasConflict(error) {
      if (!error) return false;
      const code = String(error.code || '');
      const message = String(error.message || '');
      return code === '40001' || code === '23505' || /conflict|duplicate/i.test(message);
    }

    function reconcileRemoteRow(row, allowDelete, source) {
      if (!row) return { found: false, ignored: false, replayed: false, remote: null };
      const remote = row.data && typeof row.data === 'object' ? row.data : {};
      const remoteMs = row.updated_at ? (Date.parse(row.updated_at) || 0) : 0;
      const remoteGeneration = normalizeCounter(row.restore_generation);
      const remoteVersion = normalizeCounter(row.state_version);

      if (remoteGeneration < restoreGeneration) {
        return { found: true, ignored: true, replayed: false, remote };
      }
      if (remoteGeneration === restoreGeneration && remoteVersion < stateVersion) {
        return { found: true, ignored: true, replayed: false, remote };
      }
      // During the compatibility phase an out-of-order duplicate can share the
      // same version. Keep the server timestamp as the tie-breaker until direct
      // browser writes are finally revoked.
      if (remoteGeneration === restoreGeneration && remoteVersion === stateVersion && remoteMs && remoteMs < highWaterMs) {
        return { found: true, ignored: true, replayed: false, remote };
      }

      if (remoteGeneration > restoreGeneration) {
        restoreGeneration = remoteGeneration;
        stateVersion = remoteVersion;
        highWaterMs = remoteMs;
      } else {
        stateVersion = Math.max(stateVersion, remoteVersion);
        highWaterMs = Math.max(highWaterMs, remoteMs);
      }

      const incoming = JSON.stringify(remote);
      const hasDirty = Object.keys(loadDirty().items || {}).length > 0;
      if (incoming === lastSyncedJson && !hasDirty) {
        return { found: true, ignored: false, replayed: false, remote, remoteMs, remoteGeneration, remoteVersion };
      }

      lastSyncedJson = incoming;
      applyRemote(remote, !!allowDelete, remoteMs, remoteGeneration);
      const replayed = replayNewerDirty(remoteMs, remoteGeneration);
      return { found: true, ignored: false, replayed, remote, remoteMs, remoteGeneration, remoteVersion, source: source || 'remote' };
    }

    async function pullAndReconcile(allowDelete, source) {
      if (!supa || !window.gamenfyUserId) return { found: false, ignored: false, replayed: false, remote: null };
      if (reconcileInFlight) return reconcileInFlight;
      reconcileInFlight = (async function () {
        const { data, error } = await supa
          .from('app_state')
          .select('data,updated_at,restore_generation,state_version')
          .eq('key', cloudKey)
          .eq('user_id', window.gamenfyUserId)
          .maybeSingle();
        if (error) throw error;
        return reconcileRemoteRow(data || null, !!allowDelete, source || 'pull');
      })();
      try {
        return await reconcileInFlight;
      } finally {
        reconcileInFlight = null;
      }
    }

    async function pushNow() {
      if (!supa || !ready || !window.gamenfyUserId) return;
      const state = collect();
      const json = JSON.stringify(state);
      const dirty = loadDirty();
      const hasDirty = Object.keys(dirty.items || {}).length > 0;
      if (json === lastSyncedJson && !hasDirty && !forcePush) return;

      const cutoff = Date.now();
      const expectedGeneration = restoreGeneration;
      const expectedVersion = stateVersion;
      try {
        const { data, error } = await supa.rpc('gamenfy_write_app_state', {
          p_key: cloudKey,
          p_data: state,
          p_expected_generation: expectedGeneration,
          p_expected_version: expectedVersion,
        });

        if (error) {
          if (isCasConflict(error)) {
            try {
              const result = await pullAndReconcile(true, 'cas-conflict');
              if (result && Object.keys(loadDirty().items || {}).length) schedulePush();
            } catch (e) {}
          }
          return;
        }

        const ack = Array.isArray(data) ? data[0] : data;
        const ackGeneration = normalizeCounter(ack && ack.restore_generation);
        const ackVersion = normalizeCounter(ack && ack.state_version);
        const ackMs = ack && ack.updated_at ? (Date.parse(ack.updated_at) || 0) : 0;

        if (!ack || ackGeneration !== expectedGeneration || ackVersion !== expectedVersion + 1) {
          try { await pullAndReconcile(true, 'unexpected-write-ack'); } catch (e) {}
          return;
        }

        const newerAlreadyKnown = restoreGeneration > ackGeneration ||
          (restoreGeneration === ackGeneration && stateVersion > ackVersion);
        if (!newerAlreadyKnown) lastSyncedJson = json;

        if (ackGeneration > restoreGeneration) {
          restoreGeneration = ackGeneration;
          stateVersion = ackVersion;
          highWaterMs = ackMs;
        } else if (ackGeneration === restoreGeneration) {
          stateVersion = Math.max(stateVersion, ackVersion);
          highWaterMs = Math.max(highWaterMs, ackMs);
        }

        clearDirtyThrough(cutoff);
        forcePush = false;
        if (Object.keys(loadDirty().items || {}).length) schedulePush();
      } catch (e) {}
    }

    function schedulePush`;

sync = replaceOnce(sync,
  /    async function pushNow\(\) \{[\s\S]*?\n    \}\n\n    function schedulePush/,
  pushBlock,
  'pushNow block');

const unloadBlock = `    function flushOnUnload() {
      if (!ready || !window.gamenfyUserId || !window.gamenfyAccessToken) return;
      const state = collect();
      const json = JSON.stringify(state);
      if (json === lastSyncedJson && !Object.keys(loadDirty().items || {}).length) return;
      try {
        fetch(SUPABASE_URL + '/rest/v1/rpc/gamenfy_write_app_state', {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + window.gamenfyAccessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_key: cloudKey,
            p_data: state,
            p_expected_generation: restoreGeneration,
            p_expected_version: stateVersion,
          }),
          keepalive: true,
        }).catch(() => {});
        // Fire-and-forget unload writes are never treated as acknowledged here.
        // The dirty journal remains until a later visible session observes cloud
        // state or a normal RPC response and can clear it safely.
      } catch (e) {}
    }

    (async function init()`;

sync = replaceOnce(sync,
  /    function flushOnUnload\(\) \{[\s\S]*?\n    \}\n\n    \(async function init\(\)/,
  unloadBlock,
  'unload block');

const initPullBlock = `      try {
        const result = await pullAndReconcile(false, 'initial');
        ready = true;
        const remote = result && result.found ? result.remote : null;

        if (remote) {
          let hasLocalOnly = false;
          for (const k of listAllKeys()) {
            if (!(k in remote)) { hasLocalOnly = true; break; }
          }
          if (hasLocalOnly || result.replayed || Object.keys(loadDirty().items || {}).length) schedulePush();
        } else if (Object.keys(collect()).length > 0 || Object.keys(loadDirty().items || {}).length) {
          schedulePush();
        }
      } catch (e) {
        ready = true;
        if (Object.keys(loadDirty().items || {}).length) schedulePush();
      }

      notifyReady();`;

sync = replaceOnce(sync,
  /      try \{\n        const \{ data, error \} = await supa[\s\S]*?      \} catch \(e\) \{\n        ready = true;\n        if \(Object\.keys\(loadDirty\(\)\.items \|\| \{\}\)\.length\) schedulePush\(\);\n      \}\n\n      notifyReady\(\);/,
  initPullBlock,
  'initial pull block');

const realtimeBlock = `      supa.channel('app_state_' + cloudKey + '_' + Math.random().toString(36).slice(2,8))
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'app_state', filter: 'key=eq.' + cloudKey,
        }, (payload) => {
          if (!payload.new || !payload.new.data) return;
          const result = reconcileRemoteRow(payload.new, true, 'realtime');
          if (!result || result.ignored) return;
          if (result.replayed || Object.keys(loadDirty().items || {}).length) schedulePush();
        })
        .subscribe();`;

sync = replaceOnce(sync,
  /      supa\.channel\('app_state_' \+ cloudKey[\s\S]*?        \.subscribe\(\);/,
  realtimeBlock,
  'realtime block');

fs.writeFileSync('sync.js', sync);

const ownerTest = `/* app_state owner + generation/version client contract — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const sync=fs.readFileSync(path.join(root,'sync.js'),'utf8');
const phase0=fs.readFileSync(path.join(root,'server','database','app-state-owner-scope-phase0.sql'),'utf8');
const plan=fs.readFileSync(path.join(root,'APP-STATE-OWNER-SCOPE-CUTOVER.md'),'utf8');

assert.match(phase0,/add column if not exists restore_generation bigint not null default 0/i);
assert.match(phase0,/unique \\(user_id, key\\)/i);
assert.doesNotMatch(phase0,/drop constraint app_state_pkey/i,'Phase 0 must not drop the legacy PK while old production exists');
assert.match(plan,/Phase 0 live/i);
assert.match(plan,/Do \\*\\*not\\*\\* drop \\`PRIMARY KEY\\(key\\)\\`/i);

assert.match(sync,/let restoreGeneration = 0;/);
assert.match(sync,/let stateVersion = 0;/);
assert.match(sync,/generation: restoreGeneration/,'new dirty entries must be stamped with their current restore generation');
assert.match(sync,/dirtyGeneration\\(d\\) !== remoteGeneration/,'dirty replay must reject another generation');
assert.match(sync,/remoteGeneration < restoreGeneration/,'lower-generation snapshots must be rejected');
assert.match(sync,/remoteVersion < stateVersion/,'lower-version snapshots inside an epoch must be rejected');
assert.match(sync,/remoteGeneration > restoreGeneration/,'higher-generation restore snapshots must advance the client generation');
assert.match(sync,/\\.select\\('data,updated_at,restore_generation,state_version'\\)/);
assert.match(sync,/\\.eq\\('user_id', window\\.gamenfyUserId\\)/,'reads remain explicitly owner-scoped in addition to RLS');
assert.match(sync,/supa\\.rpc\\('gamenfy_write_app_state'/,'normal browser writes must use the owner-bound server CAS RPC');
assert.match(sync,/p_expected_generation: expectedGeneration/);
assert.match(sync,/p_expected_version: expectedVersion/);
assert.match(sync,/rest\\/v1\\/rpc\\/gamenfy_write_app_state/,'unload keepalive must use the same server write gate');
assert.doesNotMatch(sync,/\\.from\\('app_state'\\)\\.upsert\\(/,'modern sync must not directly upsert app_state');
assert.doesNotMatch(sync,/rest\\/v1\\/app_state\\?on_conflict/,'modern unload must not bypass the RPC');
assert.doesNotMatch(sync,/onConflict: 'key'/);

console.log('app_state owner/generation/version smoke passed: browser reads are explicit-owner and writes use the generation+state_version CAS RPC, including unload.');
`;
fs.writeFileSync('tests/app-state-owner-generation-smoke.js', ownerTest);

const rpcTest = `/* Stage 2B RPC sync regression — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const sync = fs.readFileSync(require('node:path').join(__dirname, '..', 'sync.js'), 'utf8');

assert.match(sync, /v11\\.9 server CAS write gate/);
assert.match(sync, /let stateVersion = 0;/);
assert.match(sync, /let reconcileInFlight = null;/);
assert.match(sync, /function reconcileRemoteRow\\(/);
assert.match(sync, /remoteGeneration === restoreGeneration && remoteVersion < stateVersion/);
assert.match(sync, /remoteGeneration === restoreGeneration && remoteVersion === stateVersion && remoteMs && remoteMs < highWaterMs/,
  'same-version timestamp tie-break remains during legacy-client compatibility');
assert.match(sync, /stateVersion = Math\\.max\\(stateVersion, remoteVersion\\)/);

assert.match(sync, /supa\\.rpc\\('gamenfy_write_app_state'[\\s\\S]*?p_expected_generation: expectedGeneration[\\s\\S]*?p_expected_version: expectedVersion/);
assert.match(sync, /ackVersion !== expectedVersion \\+ 1/,'RPC acknowledgement must advance exactly one CAS version');
assert.match(sync, /newerAlreadyKnown/,'late RPC acknowledgement must not roll lastSyncedJson behind newer realtime state');
assert.match(sync, /clearDirtyThrough\\(cutoff\\)/,'only dirty entries present before the acknowledged call may clear');
assert.match(sync, /isCasConflict\\(error\\)[\\s\\S]*?pullAndReconcile\\(true, 'cas-conflict'\\)/,
  'CAS conflict must fresh-pull before replay/retry');

assert.match(sync, /fetch\\(SUPABASE_URL \\+ '\\/rest\\/v1\\/rpc\\/gamenfy_write_app_state'/);
const unload = (sync.match(/function flushOnUnload\\(\\)[\\s\\S]*?\\n    }\\n\\n    \\(async function init/) || [])[0] || '';
assert.ok(unload);
assert.match(unload, /p_expected_generation: restoreGeneration/);
assert.match(unload, /p_expected_version: stateVersion/);
assert.match(unload, /keepalive: true/);
assert.doesNotMatch(unload, /clearDirtyThrough/,'fire-and-forget unload may not clear dirty state');
assert.doesNotMatch(unload, /user_id:/,'RPC owner identity must come from auth context, not unload payload');

assert.doesNotMatch(sync, /\\.from\\('app_state'\\)\\.upsert\\(/);
assert.doesNotMatch(sync, /rest\\/v1\\/app_state\\?on_conflict/);
assert.doesNotMatch(sync, /gamenfy_restore_app_state/,'Stage 2B must not expose restore');
console.log('Stage 2B RPC sync smoke passed: CAS versioning, stale-event rejection, conflict fresh-pull, safe late ACK and keepalive RPC are locked.');
`;
fs.writeFileSync('tests/app-state-rpc-sync-smoke.js', rpcTest);

console.log('Stage 2B sync patch applied.');
