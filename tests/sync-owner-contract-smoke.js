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
assert.match(source, /\.from\('app_state'\)[\s\S]*?\.select\('data,updated_at'\)[\s\S]*?\.eq\('key', cloudKey\)/,
  'cloud pull stays behind Supabase client/RLS rather than bypassing account ownership');

console.log('Cloud sync owner smoke passed: normal and unload writes fail closed and attach gamenfyUserId; reads stay RLS-scoped.');
