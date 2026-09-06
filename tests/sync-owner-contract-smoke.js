/* Gamenfy cloud sync owner contract smoke — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'sync.js'), 'utf8');

assert.match(source, /if \(!supa \|\| !ready \|\| !window\.gamenfyUserId\) return;/,
  'normal cloud push must fail closed without an authenticated owner');
assert.match(source, /user_id:\s*window\.gamenfyUserId,\s*data:\s*state/,
  'normal app_state upsert must attach the current authenticated owner');
assert.match(source, /if \(!ready \|\| !window\.gamenfyUserId \|\| !window\.gamenfyAccessToken\) return;/,
  'unload flush must fail closed without owner + access token');
assert.match(source, /body:\s*JSON\.stringify\(\{[\s\S]*?key:\s*cloudKey,[\s\S]*?user_id:\s*window\.gamenfyUserId,[\s\S]*?data:\s*state/,
  'keepalive/unload write must attach the same authenticated owner');
assert.match(source, /\.from\('app_state'\)[\s\S]*?\.select\('data,updated_at,restore_generation'\)[\s\S]*?\.eq\('key', cloudKey\)[\s\S]*?\.eq\('user_id', window\.gamenfyUserId\)/,
  'cloud pull must explicitly bind logical key to the authenticated owner');
assert.match(source, /onConflict:\s*'user_id,key'/,
  'normal upsert must use the composite owner+logical-key conflict target');
assert.match(source, /on_conflict=user_id,key/,
  'keepalive REST upsert must use the same composite owner+logical-key target');
assert.doesNotMatch(source, /onConflict:\s*'key'/,
  'browser sync must not retain the legacy global-key conflict target');

console.log('Cloud sync owner smoke passed: writes/read use explicit authenticated owner + composite conflict target.');
