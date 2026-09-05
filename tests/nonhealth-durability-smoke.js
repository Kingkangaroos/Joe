/* Non-health durability/truth regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const character=fs.readFileSync(path.join(ROOT,'character.html'),'utf8');
const settings=fs.readFileSync(path.join(ROOT,'settings.html'),'utf8');

// Backup must be owner-cloud aware: Character alone cannot assume Finance/Health
// have already hydrated localStorage on this device. The function is async by
// design and fails closed rather than labelling a local partial snapshot complete.
const backup=character.match(/window\.exportBackup\s*=\s*async\s+function\(\)\{([\s\S]*?)\n\};\n\n\/\/ ── Level-up moments/);
assert.ok(backup,'cloud-aware backup export function must stay parseable');
const b=backup[1];
assert.ok(b.includes("const domains = ['rpg','finance','health']"),'backup must cover all durable app_state domains');
assert.ok(b.includes(".from('app_state')") && b.includes(".select('key,data,updated_at')"),'backup must read owner cloud state + timestamps');
assert.ok(b.includes('window.RPG_SYNC_KEYS'),'RPG pending-local matching must still use the canonical registry');
for(const marker of ['vk_paid_v1','nw:history','po_water_v1','stack:items']) {
  assert.ok(b.includes(marker),'backup must understand independent durable state: '+marker);
}
assert.ok(b.includes("const sensitive = new Set(['hevy_api_key','rpg_pin_v1'])"),'sensitive local values must have explicit exclusions');
assert.ok(b.includes('sensitive.forEach(k => { delete state[k]; })'),'fetched cloud state must be scrubbed before serialization');
assert.ok(!b.includes("k.startsWith('hevy_')"),'backup must not use a broad hevy_ selector that can capture the API key');
assert.ok(b.includes('credentialsExcluded'),'backup metadata must make the security boundary explicit');
assert.ok(b.includes('(item.ts || 0) <= remoteMs'),'only local dirty entries newer than the cloud row may override it');
assert.ok(b.includes("Cloud backup failed — no incomplete file downloaded"),'backup must fail closed on cloud/auth failure');

// Settings copy must describe the live server contract rather than fixed
// times/workspace isolation that the backend does not guarantee.
assert.ok(settings.includes('server-selected morning window'),'morning push copy must match the server-selected window contract');
assert.ok(settings.includes('server-selected evening notification'),'evening push copy must match the server-selected window contract');
assert.ok(!settings.includes('Morning push (08:30)'),'obsolete exact morning time must stay retired');
assert.ok(!settings.includes('Evening push (19:30)'),'obsolete exact evening time must stay retired');
assert.ok(!settings.includes('It gets its own separate, empty data'),'inactive workspace handler must not retain a false isolation promise');
assert.match(settings,/window\.saveWorkspace\s*=\s*function\(\)\{\s*alert\('Separate cloud workspaces are not active yet\.'\);\s*return false;\s*\};/,'workspace handler must fail closed while multi-user isolation is unavailable');

console.log('Non-health durability smoke: backup is owner-cloud complete/credential-free and Settings stays aligned with live backend boundaries.');
