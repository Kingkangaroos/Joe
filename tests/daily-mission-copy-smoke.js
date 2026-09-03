/* Fitbit-backed Daily Mission copy regression smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/daily-mission-copy-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const copy=fs.readFileSync(path.join(root,'daily-mission-copy.js'),'utf8');
const reconcile=fs.readFileSync(path.join(root,'autohabit-reconcile.js'),'utf8');
const html=fs.readFileSync(path.join(root,'daily-windows.html'),'utf8');

assert.match(reconcile,/sleep:\s*\{\s*field:\s*['\"]sleepMinutes['\"],\s*min:\s*420/,'active Sleep auto-threshold must remain 420 minutes');
assert.match(reconcile,/walking:\s*\{\s*field:\s*['\"]steps['\"],\s*min:\s*10000/,'active Walking auto-threshold must remain 10,000 steps');

assert.match(copy,/sleep:[\s\S]*Sleep 7\+ hours[\s\S]*420\+ sleep minutes[\s\S]*day you wake up/,'Sleep user copy must match the 7h threshold and wake-date ingest contract');
assert.match(copy,/walking:[\s\S]*10,000 steps[\s\S]*daily total reaches 10k/,'Walking user copy must match the 10k threshold');
assert.match(copy,/completed day moves the 0–10 level \+1[\s\S]*missed closed day moves it -1/,'copy must describe the persistent +1/-1 calendar-day level rule');

assert.match(html,/xp\.js\?v=11\.70[\s\S]*daily-mission-copy\.js\?v=11\.74[\s\S]*daily-windows\.js\?v=11\.73/,'copy patch must load after xp definitions and before Daily Windows renders them');

assert.doesNotMatch(copy,/8 hours sleep/i,'stale 8-hour Daily Mission copy must not return');
assert.doesNotMatch(copy,/proportionally less/i,'binary calendar-day mission copy must not claim proportional scoring');

console.log('Daily Mission copy smoke: 7h Sleep, 10k Walking, wake date and +1/-1 copy contract passed.');
