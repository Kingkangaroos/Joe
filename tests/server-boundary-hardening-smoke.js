/* Gamenfy server boundary hardening smoke — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const jarvisSql = fs.readFileSync(path.join(__dirname, '..', 'server', 'database', 'jarvis-action-guard.sql'), 'utf8');
const pushSql = fs.readFileSync(path.join(__dirname, '..', 'server', 'database', 'push-cron-vault.sql'), 'utf8');

assert.match(jarvisSql, /security\s+invoker/i, 'Jarvis guard must remain invoker-security');
assert.doesNotMatch(jarvisSql, /security\s+definer/i, 'Jarvis guard must never bypass app_state RLS');
assert.match(jarvisSql, /when\s*\(new\.key\s*=\s*'jarvis_actions'\)/i, 'trigger scope is only jarvis_actions');
assert.match(jarvisSql, /jsonb_agg\(item\s+order\s+by\s+ord\)/i, 'queue filtering preserves order');

const canonicalPublic = [
  'budgeting','sleep','nutrition','walking','teeth','household',
  'meditation','gratitude','good_deed','screen_time','cold_shower'
];
for (const key of canonicalPublic) {
  assert.match(jarvisSql, new RegExp("'" + key + "'"), 'canonical public Daily remains allowed: ' + key);
}
for (const key of ['no_porn','weed_control','grounding']) {
  assert.match(jarvisSql, new RegExp("'" + key + "'"), 'private/disabled key is explicitly blocked: ' + key);
}
assert.match(jarvisSql, /\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$/, 'explicit Jarvis habit dates must use YYYY-MM-DD');

assert.match(pushSql, /gamenfy_push_cron_secret/, 'push cron uses the named Vault secret contract');
assert.match(pushSql, /vault\.decrypted_secrets/, 'push cron resolves the secret at execution time from Vault');
assert.match(pushSql, /cron\.alter_job/, 'existing cron jobs are rewritten rather than duplicated');
assert.match(pushSql, /gamenfy-morning-push-poll/, 'morning job is covered');
assert.match(pushSql, /gamenfy-evening-push-poll/, 'evening job is covered');
assert.doesNotMatch(pushSql, /x-push-secret[^\n]{0,160}[0-9a-f]{32,}/i, 'repo SQL must never contain a literal push authentication secret');
assert.doesNotMatch(pushSql, /vault\.create_secret\s*\([^)]*['\"][0-9a-f]{32,}/i, 'repo must never bootstrap Vault from a literal secret');

console.log('Server boundary hardening smoke passed: Jarvis queue guard is RLS-safe and push cron is Vault-only.');
