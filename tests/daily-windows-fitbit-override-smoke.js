/* Daily Windows Fitbit override regression smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/daily-windows-fitbit-override-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'..','daily-windows.js'),'utf8');

assert.doesNotThrow(()=>new vm.Script(source,{filename:'daily-windows.js'}),'Daily Windows source must parse');

// Daily Windows does not load checkin/autohabit-reconcile. Its direct dated-log
// route therefore needs a self-contained fallback instead of merely hoping the
// central helper exists.
assert.match(source,/var AUTO_KEY=['\"]rpg_autohabit_v1['\"]/,'standalone route must know the durable Fitbit override store');
assert.match(source,/function markAutoOverride\(key,date,suppressed\)/,'standalone override helper must exist');
assert.match(source,/typeof window\.setAutoHabitManualOverride===['\"]function['\"][\s\S]*setAutoHabitManualOverride\(key,date,suppressed\)/,'use central helper when another surface provides it');
assert.match(source,/state\[stateKey\]=['\"]manual-off['\"]/,'fallback must persist manual-off on undo');
assert.match(source,/state\[stateKey\]===['\"]manual-off['\"][\s\S]*delete state\[stateKey\]/,'fallback must clear manual-off on deliberate recheck');

// `was` is deliberately the suppression value: undoing an already-complete
// mission => true/manual-off; completing/re-checking => false/clear manual-off.
assert.match(
  source,
  /var date=todayKey\(\),was=isDone\(m\.key,date\)[\s\S]*setDone\(m\.key,date,!was\)[\s\S]*markAutoOverride\(m\.key,date,was\)/,
  'override must be symmetric with the same pre-toggle `was` state'
);

assert.match(source,/recomputeHabitFromLog\(m\.key\)/,'dated log changes must still replay canonical 0–10 state');
assert.match(source,/addXP\(m\.key,15/,'completion must still award its normal +15 XP');
assert.match(source,/removeXP\(m\.key,15/,'undo must still reverse the normal +15 XP');
assert.match(source,/['\"]&quot;['\"]/, 'HTML quote escaping must retain the complete entity');

console.log('Daily Windows Fitbit override smoke: standalone fallback, symmetry, replay and XP reversal passed.');
