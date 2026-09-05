/* Fitbit reconciliation audit SQL contract smoke — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sql = fs.readFileSync(path.join(__dirname, '..', 'server', 'database', 'fitbit-reconcile-audit.sql'), 'utf8');
const normalized = sql.replace(/--.*$/gm, '').toLowerCase();

assert.match(sql, /habitlog\[habit_id\]\[YYYY-MM-DD\]/, 'audit documents canonical habitlog orientation');
assert.match(sql, /q\.rpg->'rpg_habitlog_v1'->q\.habit_id->>q\.activity_date/, 'audit reads canonical habit -> date shape from the paired RPG row');
assert.match(sql, /payload->>'steps'.*>= 10000/s, 'walking audit threshold stays 10k');
assert.match(sql, /payload->>'sleepMinutes'.*>= 420/s, 'sleep audit threshold stays 420 minutes');
assert.match(sql, /auto_state = 'manual-off'/, 'audit distinguishes deliberate manual suppression');
assert.match(sql, /__xp_awarded_v1:/, 'audit exposes retry-safe XP ledger state');
assert.match(sql, /__retrospective_v2_migrated/, 'audit exposes retrospective migration marker');
assert.match(sql, /__xp_ledger_v1_migrated/, 'audit exposes XP-ledger migration marker');

// Multi-user safety: Health and RPG must belong to the same app_state owner.
assert.match(normalized, /join\s+public\.app_state\s+h[\s\S]*on\s+h\.user_id\s*=\s*r\.user_id[\s\S]*h\.key\s*=\s*'health_fitbit'[\s\S]*where\s+r\.key\s*=\s*'rpg'/, 'audit must pair health_fitbit and rpg by the same user_id');
assert.doesNotMatch(normalized, /select\s+data\s+from\s+public\.app_state\s+where\s+key\s*=\s*'health_fitbit'[\s\S]*limit\s+1/, 'independent Fitbit LIMIT 1 lookup is unsafe for multiple owners');
assert.doesNotMatch(normalized, /select\s+data\s+from\s+public\.app_state\s+where\s+key\s*=\s*'rpg'[\s\S]*limit\s+1/, 'independent RPG LIMIT 1 lookup is unsafe for multiple owners');
const finalSelectStart = normalized.lastIndexOf('\nselect\n');
const finalFromDetail = normalized.indexOf('\nfrom detail', finalSelectStart);
assert.ok(finalSelectStart >= 0 && finalFromDetail > finalSelectStart, 'final audit projection must be discoverable');
const finalProjection = normalized.slice(finalSelectStart, finalFromDetail);
assert.doesNotMatch(finalProjection, /\buser_id\b/, 'owner id must not be exposed in the final audit output');

for (const forbidden of ['insert ', 'update ', 'delete ', 'merge ', 'alter ', 'drop ', 'truncate ', 'create ', 'grant ', 'revoke ']) {
  assert.equal(normalized.includes(forbidden), false, `audit SQL must remain read-only: no ${forbidden.trim().toUpperCase()}`);
}

console.log('Fitbit reconciliation audit smoke passed: executable read-only contract, thresholds, same-owner pairing, suppression and ledger markers locked.');
