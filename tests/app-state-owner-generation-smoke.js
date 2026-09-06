/* app_state owner + generation client contract — ChatGPT (OpenAI), 2026-09-06 */
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
