/* Stage 2B RPC sync regression — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const sync=fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8');
function has(needle,label){ assert.ok(sync.includes(needle), label || ('missing: '+needle)); }
function lacks(needle,label){ assert.ok(!sync.includes(needle), label || ('must not contain: '+needle)); }

has('v11.9 server CAS write gate');
has('let stateVersion = 0;');
has('let reconcileInFlight = null;');
has('function reconcileRemoteRow(');
has('remoteGeneration === restoreGeneration && remoteVersion < stateVersion');
has('remoteGeneration === restoreGeneration && remoteVersion === stateVersion && remoteMs && remoteMs < highWaterMs');
has('stateVersion = Math.max(stateVersion, remoteVersion);');
has("supa.rpc('gamenfy_write_app_state'");
has('p_expected_generation: expectedGeneration');
has('p_expected_version: expectedVersion');
has('ackVersion !== expectedVersion + 1','RPC acknowledgement must advance exactly one CAS version');
has('newerAlreadyKnown','late ACK must not roll local watermark behind newer realtime state');
has('clearDirtyThrough(cutoff);','only pre-call dirty entries may clear after ACK');
has('isCasConflict(error)');
has("pullAndReconcile(true, 'cas-conflict')");
has("fetch(SUPABASE_URL + '/rest/v1/rpc/gamenfy_write_app_state'");

const start=sync.indexOf('function flushOnUnload()');
const end=sync.indexOf('(async function init()',start);
assert.ok(start>=0 && end>start,'flushOnUnload block must be discoverable');
const unload=sync.slice(start,end);
assert.ok(unload.includes('p_expected_generation: restoreGeneration'));
assert.ok(unload.includes('p_expected_version: stateVersion'));
assert.ok(unload.includes('keepalive: true'));
assert.ok(!unload.includes('clearDirtyThrough'),'fire-and-forget unload may not clear dirty state');
assert.ok(!unload.includes('user_id:'),'RPC owner must come from auth context');

lacks(".from('app_state').upsert(");
lacks('/rest/v1/app_state?on_conflict=');
lacks('gamenfy_restore_app_state','Stage 2B must not expose restore');
console.log('Stage 2B RPC sync smoke passed: CAS versioning, stale-event rejection, conflict fresh-pull, safe late ACK and keepalive RPC are locked.');
