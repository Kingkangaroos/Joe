/* app_state owner + generation/version client contract — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const sync=fs.readFileSync(path.join(root,'sync.js'),'utf8');
const phase0=fs.readFileSync(path.join(root,'server','database','app-state-owner-scope-phase0.sql'),'utf8');
const plan=fs.readFileSync(path.join(root,'APP-STATE-OWNER-SCOPE-CUTOVER.md'),'utf8');
function has(text, needle, label){ assert.ok(text.includes(needle), label || ('missing: '+needle)); }
function lacks(text, needle, label){ assert.ok(!text.includes(needle), label || ('must not contain: '+needle)); }

has(phase0,'add column if not exists restore_generation bigint not null default 0');
has(phase0,'unique (user_id, key)');
lacks(phase0,'drop constraint app_state_pkey','Phase 0 must retain the legacy PK');
has(plan,'Phase 0 live');
has(plan,'Do **not** drop');

has(sync,'let restoreGeneration = 0;');
has(sync,'let stateVersion = 0;');
has(sync,'generation: restoreGeneration');
has(sync,'dirtyGeneration(d) !== remoteGeneration');
has(sync,'remoteGeneration < restoreGeneration');
has(sync,'remoteVersion < stateVersion');
has(sync,'remoteGeneration > restoreGeneration');
has(sync,".select('data,updated_at,restore_generation,state_version')");
has(sync,".eq('user_id', window.gamenfyUserId)");
has(sync,"supa.rpc('gamenfy_write_app_state'");
has(sync,'p_expected_generation: expectedGeneration');
has(sync,'p_expected_version: expectedVersion');
has(sync,"/rest/v1/rpc/gamenfy_write_app_state");
lacks(sync,".from('app_state').upsert(",'modern sync must not directly upsert app_state');
lacks(sync,'/rest/v1/app_state?on_conflict=','modern unload must not bypass the RPC');
lacks(sync,"onConflict: 'key'");
console.log('app_state owner/generation/version smoke passed: browser reads are explicit-owner and writes use the generation+state_version CAS RPC, including unload.');
