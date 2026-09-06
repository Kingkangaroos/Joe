from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[2]

def replace_once(rel, old, new):
    p=ROOT/rel
    text=p.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'missing target in {rel}: {old[:140]!r}')
    p.write_text(text.replace(old,new,1),encoding='utf-8')

# sync.js — explicit owner scoping + generation-aware dirty journal.
replace_once('sync.js',
"    let highWaterMs = 0;\n    let forcePush = false;\n",
"    let highWaterMs = 0;\n    let forcePush = false;\n    let restoreGeneration = 0;\n")

replace_once('sync.js',
"      j.items[k] = { value: rawValue == null ? null : String(rawValue), removed: !!removed, ts: Date.now() };\n",
"      j.items[k] = { value: rawValue == null ? null : String(rawValue), removed: !!removed, ts: Date.now(), generation: restoreGeneration };\n")

replace_once('sync.js',
"    function discardDirtyNotNewerThan(remoteMs) {\n      const j = loadDirty();\n      let changed = false;\n      Object.keys(j.items || {}).forEach((k) => {\n        if ((j.items[k].ts || 0) <= remoteMs) { delete j.items[k]; changed = true; }\n      });\n      if (changed) saveDirty(j);\n    }\n",
"    function dirtyGeneration(entry) {\n      const n = Number(entry && entry.generation);\n      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;\n    }\n    function discardDirtyNotReplayable(remoteMs, remoteGeneration) {\n      const j = loadDirty();\n      let changed = false;\n      Object.keys(j.items || {}).forEach((k) => {\n        const item = j.items[k];\n        if (dirtyGeneration(item) !== remoteGeneration || (item.ts || 0) <= remoteMs) {\n          delete j.items[k]; changed = true;\n        }\n      });\n      if (changed) saveDirty(j);\n    }\n")

replace_once('sync.js',
"    function remoteMayTouchKey(k, remoteMs) {\n      const d = dirtyEntry(k);\n      return !(d && (d.ts || 0) > remoteMs);\n    }\n",
"    function remoteMayTouchKey(k, remoteMs, remoteGeneration) {\n      const d = dirtyEntry(k);\n      if (!d) return true;\n      if (dirtyGeneration(d) !== remoteGeneration) return true;\n      return !((d.ts || 0) > remoteMs);\n    }\n")

replace_once('sync.js',
"    function applyRemote(remote, allowDelete, remoteMs) {\n",
"    function applyRemote(remote, allowDelete, remoteMs, remoteGeneration) {\n")
replace_once('sync.js',
"          if (!matches(k) || !remoteMayTouchKey(k, remoteMs)) continue;\n",
"          if (!matches(k) || !remoteMayTouchKey(k, remoteMs, remoteGeneration)) continue;\n")
replace_once('sync.js',
"          const missing = listAllKeys().filter((k) => !(k in remote) && remoteMayTouchKey(k, remoteMs));\n",
"          const missing = listAllKeys().filter((k) => !(k in remote) && remoteMayTouchKey(k, remoteMs, remoteGeneration));\n")

replace_once('sync.js',
"    function replayNewerDirty(remoteMs) {\n",
"    function replayNewerDirty(remoteMs, remoteGeneration) {\n")
replace_once('sync.js',
"          if (!matches(k) || (d.ts || 0) <= remoteMs) return;\n",
"          if (!matches(k) || dirtyGeneration(d) !== remoteGeneration || (d.ts || 0) <= remoteMs) return;\n")
replace_once('sync.js',
"      discardDirtyNotNewerThan(remoteMs);\n",
"      discardDirtyNotReplayable(remoteMs, remoteGeneration);\n")

replace_once('sync.js',
"          { key: cloudKey, user_id: window.gamenfyUserId, data: state, updated_at: new Date(cutoff).toISOString() },\n          { onConflict: 'key' }\n",
"          { key: cloudKey, user_id: window.gamenfyUserId, data: state, updated_at: new Date(cutoff).toISOString(), restore_generation: restoreGeneration },\n          { onConflict: 'user_id,key' }\n")

replace_once('sync.js',
"        fetch(SUPABASE_URL + '/rest/v1/app_state?on_conflict=key', {\n",
"        fetch(SUPABASE_URL + '/rest/v1/app_state?on_conflict=user_id,key', {\n")
replace_once('sync.js',
"            updated_at: new Date(Math.max(Date.now(), highWaterMs + 1)).toISOString()\n",
"            updated_at: new Date(Math.max(Date.now(), highWaterMs + 1)).toISOString(),\n            restore_generation: restoreGeneration\n")

replace_once('sync.js',
"          .select('data,updated_at')\n          .eq('key', cloudKey)\n          .maybeSingle();\n\n        const remote = (!error && data && data.data && typeof data.data === 'object') ? data.data : null;\n        const remoteMs = data && data.updated_at ? (Date.parse(data.updated_at) || 0) : 0;\n",
"          .select('data,updated_at,restore_generation')\n          .eq('key', cloudKey)\n          .eq('user_id', window.gamenfyUserId)\n          .maybeSingle();\n\n        const remote = (!error && data && data.data && typeof data.data === 'object') ? data.data : null;\n        const remoteMs = data && data.updated_at ? (Date.parse(data.updated_at) || 0) : 0;\n        const remoteGeneration = Math.max(0, Math.floor(Number(data && data.restore_generation) || 0));\n        restoreGeneration = remoteGeneration;\n")

replace_once('sync.js',
"          applyRemote(remote, false, remoteMs);\n          const replayed = replayNewerDirty(remoteMs);\n",
"          applyRemote(remote, false, remoteMs, remoteGeneration);\n          const replayed = replayNewerDirty(remoteMs, remoteGeneration);\n")

# Replace realtime callback generation block and both downstream calls.
replace_once('sync.js',
"          const remoteMs = payload.new.updated_at ? (Date.parse(payload.new.updated_at) || 0) : 0;\n          if (remoteMs && remoteMs < highWaterMs) {\n            forcePush = true;\n            schedulePush();\n            return;\n          }\n          highWaterMs = Math.max(highWaterMs, remoteMs);\n",
"          const remoteMs = payload.new.updated_at ? (Date.parse(payload.new.updated_at) || 0) : 0;\n          const remoteGeneration = Math.max(0, Math.floor(Number(payload.new.restore_generation) || 0));\n          if (remoteGeneration < restoreGeneration) {\n            forcePush = true;\n            schedulePush();\n            return;\n          }\n          if (remoteGeneration === restoreGeneration && remoteMs && remoteMs < highWaterMs) {\n            forcePush = true;\n            schedulePush();\n            return;\n          }\n          if (remoteGeneration > restoreGeneration) {\n            restoreGeneration = remoteGeneration;\n            highWaterMs = remoteMs;\n          } else {\n            highWaterMs = Math.max(highWaterMs, remoteMs);\n          }\n")
replace_once('sync.js',
"          applyRemote(payload.new.data, true, remoteMs);\n          if (replayNewerDirty(remoteMs) || Object.keys(loadDirty().items || {}).length) schedulePush();\n",
"          applyRemote(payload.new.data, true, remoteMs, remoteGeneration);\n          if (replayNewerDirty(remoteMs, remoteGeneration) || Object.keys(loadDirty().items || {}).length) schedulePush();\n")

# Character backup: explicit owner filter + preserve generation metadata.
replace_once('character.html',
"      .select('key,data,updated_at')\n      .in('key', domains);\n",
"      .select('key,data,updated_at,restore_generation')\n      .in('key', domains)\n      .eq('user_id', window.gamenfyUserId);\n")
replace_once('character.html',
"      dump.domains[domain] = {\n        cloudUpdatedAt: row.updated_at || null,\n        pendingLocalApplied: pendingApplied,\n        data: state\n      };\n",
"      dump.domains[domain] = {\n        cloudUpdatedAt: row.updated_at || null,\n        cloudRestoreGeneration: Math.max(0, Math.floor(Number(row.restore_generation) || 0)),\n        pendingLocalApplied: pendingApplied,\n        data: state\n      };\n")

# Owner contract smoke: explicit composite target + explicit owner read.
p=ROOT/'tests/sync-owner-contract-smoke.js'
s=p.read_text(encoding='utf-8')
s=s.replace(
"assert.match(source, /\\.from\\('app_state'\\)[\\s\\S]*?\\.select\\('data,updated_at'\\)[\\s\\S]*?\\.eq\\('key', cloudKey\\)/,\n  'cloud pull stays behind Supabase client/RLS rather than bypassing account ownership');\n",
"assert.match(source, /\\.from\\('app_state'\\)[\\s\\S]*?\\.select\\('data,updated_at,restore_generation'\\)[\\s\\S]*?\\.eq\\('key', cloudKey\\)[\\s\\S]*?\\.eq\\('user_id', window\\.gamenfyUserId\\)/,\n  'cloud pull must explicitly bind logical key to the authenticated owner');\nassert.match(source, /onConflict:\\s*'user_id,key'/,\n  'normal upsert must use the composite owner+logical-key conflict target');\nassert.match(source, /on_conflict=user_id,key/,\n  'keepalive REST upsert must use the same composite owner+logical-key target');\nassert.doesNotMatch(source, /onConflict:\\s*'key'/,\n  'browser sync must not retain the legacy global-key conflict target');\n"
)
s=s.replace(
"console.log('Cloud sync owner smoke passed: normal and unload writes fail closed and attach gamenfyUserId; reads stay RLS-scoped.');",
"console.log('Cloud sync owner smoke passed: writes/read use explicit authenticated owner + composite conflict target.');"
)
p.write_text(s,encoding='utf-8')

# Cloud backup smoke follows new explicit owner/generation metadata contract.
p=ROOT/'tests/cloud-backup-smoke.js'
s=p.read_text(encoding='utf-8')
s=s.replace(".select('key,data,updated_at')", ".select('key,data,updated_at,restore_generation')")
needle="assert.ok(src.includes(\".in('key', domains)\"), 'backup must request RPG, Finance and Health rows together');\n"
insert=needle+"assert.ok(src.includes(\".eq('user_id', window.gamenfyUserId)\"), 'backup must explicitly scope cloud rows to the authenticated owner');\nassert.ok(src.includes('cloudRestoreGeneration:'), 'backup v4 must preserve per-domain cloud generation as metadata');\n"
if needle not in s: raise SystemExit('cloud backup smoke insertion target missing')
s=s.replace(needle,insert,1)
p.write_text(s,encoding='utf-8')

# New generation contract smoke.
(ROOT/'tests/app-state-owner-generation-smoke.js').write_text(r'''/* app_state owner + generation client contract — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const sync=fs.readFileSync(path.join(root,'sync.js'),'utf8');
const phase0=fs.readFileSync(path.join(root,'server','database','app-state-owner-scope-phase0.sql'),'utf8');
const plan=fs.readFileSync(path.join(root,'APP-STATE-OWNER-SCOPE-CUTOVER.md'),'utf8');

assert.match(phase0,/add column if not exists restore_generation bigint not null default 0/i);
assert.match(phase0,/unique \(user_id, key\)/i);
assert.doesNotMatch(phase0,/drop constraint app_state_pkey/i,'Phase 0 must not drop the legacy PK while old production exists');
assert.match(plan,/Phase 0 live/i);
assert.match(plan,/Do \*\*not\*\* drop `PRIMARY KEY\(key\)`/i);

assert.match(sync,/let restoreGeneration = 0;/);
assert.match(sync,/generation: restoreGeneration/,'new dirty entries must be stamped with their current restore generation');
assert.match(sync,/dirtyGeneration\(d\) !== remoteGeneration/,'dirty replay must reject another generation');
assert.match(sync,/remoteGeneration < restoreGeneration/,'lower-generation realtime snapshots must be rejected');
assert.match(sync,/remoteGeneration > restoreGeneration/,'higher-generation restore snapshots must advance the client generation');
assert.match(sync,/restore_generation: restoreGeneration/,'normal cloud writes must carry their generation');
assert.match(sync,/\.select\('data,updated_at,restore_generation'\)/);
assert.match(sync,/\.eq\('user_id', window\.gamenfyUserId\)/);
assert.match(sync,/onConflict: 'user_id,key'/);
assert.match(sync,/on_conflict=user_id,key/);
assert.doesNotMatch(sync,/onConflict: 'key'/);

console.log('app_state owner/generation smoke passed: additive Phase 0 stays backward compatible; browser sync is explicit-owner and generation-aware.');
''',encoding='utf-8')

# Restore spec: record live DB foundation and make clear server write gate is still required.
p=ROOT/'RESTORE-IMPORT-SPEC.md'
s=p.read_text(encoding='utf-8')
anchor='## Dirty-journal generation rule\n'
insert='''## Live app_state owner/generation foundation\n\nOn 2026-09-06 production Supabase received an additive Phase 0 schema change: `restore_generation BIGINT NOT NULL DEFAULT 0` plus `UNIQUE(user_id,key)`. The legacy `PRIMARY KEY(key)` is intentionally still present while older production/browser/Edge Function writers exist. See `APP-STATE-OWNER-SCOPE-CUTOVER.md`.\n\nThe next browser client stamps dirty journal entries with the current generation, explicitly reads `(user_id,key)`, and writes through the composite conflict target. This makes the client generation-aware, but **does not yet make restore safe**: before any restore apply path, server-side write gating must prevent stale/old clients from bypassing the generation rule.\n\n'''+anchor
if anchor not in s: raise SystemExit('restore spec anchor missing')
s=s.replace(anchor,insert,1)
p.write_text(s,encoding='utf-8')

print('owner/generation client patch applied')
