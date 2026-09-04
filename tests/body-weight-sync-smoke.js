/* Manual Body weight durability regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const character=fs.readFileSync(path.join(ROOT,'character.html'),'utf8');
const xp=fs.readFileSync(path.join(ROOT,'xp.js'),'utf8');

assert.match(character,/const\s+WTB_KEY\s*=\s*['"]po_coach_weights['"]/,'Body tab must keep one canonical manual-weight key');
assert.ok(character.includes('<script src="sync.js?v=11.0" defer></script>'),'Character must load cloud sync');
assert.ok(xp.includes("'po_coach_weights'"),'manual Body weight history must remain in canonical RPG sync scope');

// This is a derived Hevy summary/cache and can be rebuilt; keeping it out of
// the cloud avoids turning recomputable data into another durability contract.
const scopeMatch=xp.match(/window\.RPG_SYNC_KEYS\s*=\s*\[([\s\S]*?)\];/);
assert.ok(scopeMatch,'canonical RPG sync scope must be discoverable');
assert.ok(!scopeMatch[1].includes('hevy_total_volume'),'derived Hevy volume cache must stay out of durable RPG sync scope');

console.log('Body weight sync smoke: manual po_coach_weights is durable; derived Hevy volume remains local cache.');
