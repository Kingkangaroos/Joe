/* Gamenfy cloud sync owner contract smoke — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'sync.js'), 'utf8');

assert.match(source, /if \(!supa \|\| !ready \|\| !window\.gamenfyUserId\) return;/,
  'normal cloud push must fail closed without an authenticated owner');
assert.match(source, /supa\.rpc\('gamenfy_write_app_state'/,
  'normal canonical writes must use the auth-bound server CAS RPC');
assert.match(source, /p_key:\s*cloudKey,[\s\S]*?p_data:\s*state,[\s\S]*?p_expected_generation:[\s\S]*?p_expected_version:/,
  'normal RPC write must carry logical key, state and CAS watermarks');
assert.doesNotMatch(source, /supa\.rpc\('gamenfy_write_app_state'[\s\S]*?user_id\s*:/,
  'normal RPC payload must not accept a browser-supplied owner id');

assert.match(source, /if \(!ready \|\| !window\.gamenfyUserId \|\| !window\.gamenfyAccessToken\) return;/,
  'unload flush must fail closed without owner + access token');
const unloadStart = source.indexOf('function flushOnUnload()');
const unloadEnd = source.indexOf('(async function init()', unloadStart);
assert.ok(unloadStart >= 0 && unloadEnd > unloadStart, 'unload block must be discoverable');
const unload = source.slice(unloadStart, unloadEnd);
assert.match(unload, /\/rest\/v1\/rpc\/gamenfy_write_app_state/,
  'keepalive/unload must use the same server CAS RPC');
assert.match(unload, /p_key:\s*cloudKey,[\s\S]*?p_data:\s*state,[\s\S]*?p_expected_generation:[\s\S]*?p_expected_version:/,
  'keepalive RPC must carry logical key, state and CAS watermarks');
assert.doesNotMatch(unload, /user_id\s*:/,
  'keepalive RPC owner identity must come from the access token, not request body');

assert.match(source, /\.from\('app_state'\)[\s\S]*?\.select\('data,updated_at,restore_generation,state_version'\)[\s\S]*?\.eq\('key', cloudKey\)[\s\S]*?\.eq\('user_id', window\.gamenfyUserId\)/,
  'cloud pull must explicitly bind logical key to the authenticated owner');
assert.doesNotMatch(source, /\.from\('app_state'\)\.upsert\(/,
  'modern canonical sync must not bypass the server writer with a direct upsert');
assert.doesNotMatch(source, /on_conflict=user_id,key/,
  'modern unload must not retain the legacy direct REST upsert route');
assert.doesNotMatch(source, /onConflict:\s*'key'/,
  'browser sync must not retain the legacy global-key conflict target');

console.log('Cloud sync owner smoke passed: reads are explicit-owner; writes derive ownership server-side through the authenticated CAS RPC.');