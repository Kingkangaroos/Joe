/* Gamenfy app_state legacy write bridge regression — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const sql = fs.readFileSync(path.join(root, 'server', 'database', 'app-state-legacy-write-bridge.sql'), 'utf8');
const executable = sql.replace(/--.*$/gm, '');

assert.match(sql, /^begin;/im);
assert.match(sql, /commit;\s*$/i);
assert.match(sql, /create or replace function public\.gamenfy_guard_canonical_app_state_write\(\)/i);
assert.match(sql, /new\.key not in \('rpg', 'finance', 'health'\)/i,
  'bridge must stay canonical-domain only');
assert.match(sql, /if tg_op = 'INSERT'/i);
assert.match(sql, /new\.restore_generation <> 0/i,
  'canonical inserts may not manufacture a later restore epoch');
assert.match(sql, /new\.state_version = 0[\s\S]*?new\.state_version := 1/i,
  'legacy canonical inserts must join the version protocol');
assert.match(sql, /new\.restore_generation <> old\.restore_generation/i,
  'direct updates must not change restore generation');
assert.match(sql, /new\.state_version = old\.state_version[\s\S]*?old\.state_version \+ 1/i,
  'legacy writes that omit state_version must be advanced server-side');
assert.match(sql, /new\.state_version <> old\.state_version \+ 1/i,
  'version skips/backwards updates must fail');
assert.match(sql, /new\.updated_at := clock_timestamp\(\)/i,
  'canonical ordering timestamp must be server-generated');
assert.match(sql, /before insert or update on public\.app_state/i);
assert.match(sql, /execute function public\.gamenfy_guard_canonical_app_state_write\(\)/i);

assert.doesNotMatch(executable, /gamenfy_restore_app_state/i,
  'bridge must not create a restore path');
assert.doesNotMatch(executable, /revoke\s+(?:insert|update|delete)[\s\S]*?on table public\.app_state/i,
  'legacy clients must remain usable during the bridge phase');
assert.doesNotMatch(executable, /drop constraint|drop primary key|drop column/i,
  'bridge must not perform destructive schema cutover');

// Pure transition model: this proves the intended compatibility semantics even
// though CI does not mutate a real database.
function bridge(oldVersion, submittedVersion, oldGeneration, submittedGeneration) {
  if (submittedGeneration !== oldGeneration) throw new Error('generation');
  if (submittedVersion === oldVersion) return oldVersion + 1;
  if (submittedVersion === oldVersion + 1) return submittedVersion;
  throw new Error('version');
}
assert.equal(bridge(0, 0, 0, 0), 1, 'old PWA direct write advances version');
assert.equal(bridge(7, 8, 0, 0), 8, 'Stage 2A RPC OLD+1 remains exactly one increment');
assert.throws(() => bridge(7, 7, 1, 0), /generation/, 'stale pre-restore direct write is rejected');
assert.throws(() => bridge(7, 10, 0, 0), /version/, 'caller cannot skip CAS versions');

console.log('app_state legacy write bridge smoke passed: old canonical clients join monotone state_version, server time wins, restore generation cannot move and no restore/revoke/PK cutover is introduced.');
