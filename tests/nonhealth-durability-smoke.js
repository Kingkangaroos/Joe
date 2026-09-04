/* Non-health durability/truth regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const character=fs.readFileSync(path.join(ROOT,'character.html'),'utf8');
const settings=fs.readFileSync(path.join(ROOT,'settings.html'),'utf8');

// Backup must follow canonical RPG state and also cover the independent
// Finance/Health cloud scopes, while never exporting locally stored secrets.
const backup=character.match(/window\.exportBackup=function\(\)\{([\s\S]*?)\n\};\n\n\/\/ ── Level-up moments/);
assert.ok(backup,'backup export function must stay parseable');
const b=backup[1];
assert.ok(b.includes('window.RPG_SYNC_KEYS'),'backup must source RPG keys from the canonical registry');
for(const marker of ['vk_paid_v1','nw:history','po_water_v1','stack:items']) {
  assert.ok(b.includes(marker),'backup must include independent durable state: '+marker);
}
assert.ok(b.includes("'hevy_api_key'") && b.includes("'rpg_pin_v1'"),'sensitive local values must have explicit exclusions');
assert.ok(!b.includes("k.startsWith('hevy_')"),'backup must not use a broad hevy_ selector that can capture the API key');
assert.ok(b.includes('credentials excluded'),'backup completion message must make the security boundary visible');

// Settings copy must describe the live server contract rather than fixed
// times/workspace isolation that the backend does not guarantee.
assert.ok(settings.includes('server-selected morning window'),'morning push copy must match the server-selected window contract');
assert.ok(settings.includes('server-selected evening notification'),'evening push copy must match the server-selected window contract');
assert.ok(!settings.includes('Morning push (08:30)'),'obsolete exact morning time must stay retired');
assert.ok(!settings.includes('Evening push (19:30)'),'obsolete exact evening time must stay retired');
assert.ok(!settings.includes('It gets its own separate, empty data'),'inactive workspace handler must not retain a false isolation promise');
assert.match(settings,/window\.saveWorkspace\s*=\s*function\(\)\{\s*alert\('Separate cloud workspaces are not active yet\.'\);\s*return false;\s*\};/,'workspace handler must fail closed while multi-user isolation is unavailable');

console.log('Non-health durability smoke: backup is complete/credential-free and Settings stays aligned with live backend boundaries.');
