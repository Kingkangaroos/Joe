/* Cloud-aware backup regression — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname,'..','character.html'),'utf8');

assert.match(src,/window\.exportBackup\s*=\s*async\s+function/,
  'backup must be async so it can read owner-scoped cloud rows');
assert.ok(src.includes(".from('app_state')"), 'backup must read durable app_state cloud data');
assert.ok(src.includes(".select('key,data,updated_at')"), 'backup must read cloud timestamps for dirty ordering');
assert.ok(src.includes(".in('key', domains)"), 'backup must request RPG, Finance and Health rows together');
assert.ok(src.includes("const domains = ['rpg','finance','health']"), 'backup must cover all three durable user domains');
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
assert.ok(src.includes("credentialsExcluded: ['rpg_pin_v1','hevy_api_key']"),
  'backup must document excluded local secrets/convenience PIN');
assert.ok(src.includes("return fail('Cloud backup failed — no incomplete file downloaded')"),
  'cloud errors must fail closed instead of silently exporting an incomplete file');
assert.ok(!src.includes("if(inScope(k)) dump.keys[k]=localStorage.getItem(k)"),
  'legacy localStorage-only backup loop must stay retired');

console.log('Cloud backup smoke: owner cloud is authoritative, newer dirty edits are preserved, stale device cache cannot masquerade as a complete backup.');
