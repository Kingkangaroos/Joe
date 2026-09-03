/* Daily Windows Fitbit override regression smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/daily-windows-fitbit-override-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'..','daily-windows.js'),'utf8');

// Syntax must stay valid even though the Lab prototype is not browser-run in CI.
assert.doesNotThrow(()=>new vm.Script(source,{filename:'daily-windows.js'}),'Daily Windows source must parse');

// Daily Windows owns a direct dated-log route, so it cannot rely on sync.js'
// checkHabit/uncheckHabit wrappers for Walking/Sleep manual override state.
assert.match(
  source,
  /\(m\.key==='walking'\|\|m\.key==='sleep'\)[\s\S]*setAutoHabitManualOverride\(m\.key,date,was\)/,
  'Walking/Sleep direct-log toggles must update the Fitbit manual override'
);

// `was` is deliberately the suppression value: undoing an already-complete
// mission => true/manual-off; completing/re-checking => false/clear manual-off.
assert.match(
  source,
  /var date=todayKey\(\),was=isDone\(m\.key,date\)[\s\S]*setDone\(m\.key,date,!was\)[\s\S]*setAutoHabitManualOverride\(m\.key,date,was\)/,
  'override must be symmetric with the same pre-toggle `was` state'
);

assert.match(source,/recomputeHabitFromLog\(m\.key\)/,'dated log changes must still replay canonical 0–10 state');
assert.match(source,/addXP\(m\.key,15/,'completion must still award its normal +15 XP');
assert.match(source,/removeXP\(m\.key,15/,'undo must still reverse the normal +15 XP');
assert.match(source,/['\"]&quot;['\"]/, 'HTML quote escaping must retain the complete entity');

console.log('Daily Windows Fitbit override smoke: syntax, symmetric manual-off, replay and XP reversal passed.');
