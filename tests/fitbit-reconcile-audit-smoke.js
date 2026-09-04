/* Fitbit reconciliation audit SQL contract smoke — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sql = fs.readFileSync(path.join(__dirname, '..', 'server', 'database', 'fitbit-reconcile-audit.sql'), 'utf8');
const normalized = sql.replace(/--.*$/gm, '').toLowerCase();

assert.match(sql, /habitlog\[habit_id\]\[YYYY-MM-DD\]/, 'audit documents canonical habitlog orientation');
assert.match(sql, /rpg_habitlog_v1'->q\.habit_id->>q\.activity_date/, 'audit reads canonical habit -> date shape');
assert.match(sql, /payload->>'steps'.*>= 10000/s, 'walking audit threshold stays 10k');
assert.match(sql, /payload->>'sleepMinutes'.*>= 420/s, 'sleep audit threshold stays 420 minutes');
assert.match(sql, /auto_state = 'manual-off'/, 'audit distinguishes deliberate manual suppression');
assert.match(sql, /__xp_awarded_v1:/, 'audit exposes retry-safe XP ledger state');
assert.match(sql, /__retrospective_v2_migrated/, 'audit exposes retrospective migration marker');
assert.match(sql, /__xp_ledger_v1_migrated/, 'audit exposes XP-ledger migration marker');

for (const forbidden of ['insert ', 'update ', 'delete ', 'merge ', 'alter ', 'drop ', 'truncate ', 'create ', 'grant ', 'revoke ']) {
  assert.equal(normalized.includes(forbidden), false, `audit SQL must remain read-only: no ${forbidden.trim().toUpperCase()}`);
}

console.log('Fitbit reconciliation audit smoke passed: executable read-only contract, thresholds, canonical orientation, suppression and ledger markers locked.');
