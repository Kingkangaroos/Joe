/* PIN privacy boundary regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const settings=fs.readFileSync(path.join(__dirname,'..','settings.html'),'utf8');

assert.ok(settings.includes('The PIN hides private skills in the app UI.'),'Settings must describe the PIN as a UI privacy control');
assert.ok(settings.includes('not encryption of synced data'),'Settings must explicitly distinguish the PIN from encryption');
assert.ok(!settings.includes('The PIN protects your private skills'),'old overclaiming PIN copy must stay retired');

// Preserve the existing convenience lock behavior while keeping its boundary honest.
assert.match(settings,/const\s+PIN_STORE\s*=\s*['"]rpg_pin_v1['"]/,'PIN storage contract must stay intact');
assert.ok(settings.includes('window.changePin = function'),'PIN change UI must remain available');
const changePin=settings.match(/window\.changePin\s*=\s*function\s*\([^)]*\)\s*\{([\s\S]*?)\n\};/);
assert.ok(changePin,'PIN change function must remain parseable');
assert.match(changePin[1],/localStorage\.setItem\(PIN_STORE\s*,\s*[A-Za-z_$][\w$]*\)/,'changing the PIN must still persist the local UI lock');

console.log('PIN privacy smoke: convenience lock remains functional and is no longer described as encryption/security of synced data.');
