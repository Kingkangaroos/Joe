/* Cloud-aware backup regression — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname,'..','character.html'),'utf8');

assert.match(src,/window\.exportBackup\s*=\s*async\s+function/,
  'backup must be async so it can read owner-scoped cloud rows');
assert.ok(src.includes(".from('app_state')"), 'backup must read durable app_state cloud data');
assert.ok(src.includes(".select('key,data,updated_at,restore_generation')"), 'backup must read cloud timestamps for dirty ordering');
assert.ok(src.includes(".in('key', domains)"), 'backup must request RPG, Finance and Health rows together');
assert.ok(src.includes(".eq('user_id', window.gamenfyUserId)"), 'backup must explicitly scope cloud rows to the authenticated owner');
assert.ok(src.includes('cloudRestoreGeneration:'), 'backup v4 must preserve per-domain cloud generation as metadata');
assert.ok(src.includes("const domains = ['rpg','finance','health']"), 'backup must cover all three durable user domains');
assert.match(src,/<script src="backup-owner-binding\.js\?v=[^"]+" defer><\/script>/,
  'Character must load the shared pseudonymous owner-binding helper without pinning a cache version in the test');
assert.ok(src.includes('const ownerFingerprint = await window.GamenfyOwnerBinding.fingerprintUserId(window.gamenfyUserId)'),
  'backup must derive a same-account binding from the authenticated owner');
assert.ok(src.includes('version: 4'), 'new cloud backups must use backup format v4');
assert.ok(src.includes('owner: window.GamenfyOwnerBinding.createManifest(ownerFingerprint)'),
  'backup v4 must store only the pseudonymous owner manifest');
assert.ok(!/owner:\s*\{[^}]*userId\s*:/s.test(src),
  'backup JSON must never serialize the raw authenticated user id');
assert.ok(src.includes("const dirtyPrefix = '__gamenfy_sync_dirty_v1:'"),
  'backup must understand pending sync journals');
assert.ok(src.includes('(item.ts || 0) <= remoteMs'),
  'stale local journal entries must not override newer cloud data');
assert.ok(src.includes('pendingLocalApplied: pendingApplied'),
  'backup must record whether newer local pending edits were included');
assert.ok(src.includes('dump.keys[k] = JSON.stringify(v)'),
  'flat compatibility keys must preserve the exact raw localStorage JSON representation');
assert.ok(!src.includes("(typeof v === 'string') ? v : JSON.stringify(v)"),
  'string cloud values must not lose their JSON-string layer in the flat compatibility view');
assert.ok(src.includes('deviceOnly: {}'),
  'non-authoritative local remnants must be separated from cloud-authoritative data');
assert.ok(src.includes("const sensitive = new Set(['hevy_api_key','rpg_pin_v1'])"),
  'backup must centrally classify the local credential/PIN exclusions');
assert.ok(src.includes('sensitive.forEach(k => { delete state[k]; })'),
  'sensitive keys must be removed from each fetched cloud domain before serialization');
assert.ok(src.includes("credentialsExcluded: ['rpg_pin_v1','hevy_api_key']"),
  'backup must document excluded local secrets/convenience PIN');
assert.ok(src.includes("return fail('Cloud backup failed — no incomplete file downloaded')"),
  'cloud errors must fail closed instead of silently exporting an incomplete file');
assert.ok(!src.includes("if(inScope(k)) dump.keys[k]=localStorage.getItem(k)"),
  'legacy localStorage-only backup loop must stay retired');

console.log('Cloud backup smoke: owner cloud is authoritative, newer dirty edits are preserved, sensitive keys are stripped, and stale device cache cannot masquerade as a complete backup.');
