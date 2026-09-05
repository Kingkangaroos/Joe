/* iPhone Device QA Lab regression guard — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'lab-iphone-device-qa.html'),'utf8');

assert.match(html,/viewport-fit=cover/i,'safe-area measurement needs viewport-fit=cover');
assert.match(html,/env\(safe-area-inset-top\)/,'top safe-area probe is present');
assert.match(html,/env\(safe-area-inset-bottom\)/,'bottom safe-area probe is present');
assert.match(html,/navigator\.standalone/,'iOS homescreen mode is measured');
assert.match(html,/display-mode:\s*standalone/,'standalone media mode is measured');
assert.match(html,/window\.visualViewport/,'Visual Viewport API is measured');
assert.match(html,/getBoundingClientRect\(\)/,'fixed bottom probe position is measured');
assert.match(html,/position:fixed[^}]*bottom:calc\(8px \+ env\(safe-area-inset-bottom\)\)/s,'probe mirrors fixed + safe-area bottom behavior');

// Zero-baseline contract: the intentional CSS offset (8px + safe-area) is not drift.
assert.match(html,/var\s+safeBottom\s*=\s*px\(cs\.paddingBottom\)/,'safe-area bottom is part of the expected probe position');
assert.match(html,/var\s+expectedBottom\s*=\s*visualBottom\s*-\s*\(8\s*\+\s*safeBottom\)/,'expected bottom subtracts the intentional probe offset');
assert.match(html,/var\s+drift\s*=\s*rect\.bottom\s*-\s*expectedBottom/,'drift is measured against the expected fixed position');
assert.doesNotMatch(html,/var\s+drift\s*=\s*rect\.bottom\s*-\s*visualBottom/,'raw visual-bottom delta would falsely count safe-area as drift');
assert.match(html,/maxFixedProbeDrift/,'diagnostics expose maximum fixed-probe drift');
assert.match(html,/orientationchange/,'orientation transitions are observed');
assert.match(html,/visibilitychange/,'background\/foreground transitions are observed');

for(const target of ['lab-swipe-nav.html','park31.html?mode=missions','index.html','character.html#goals']){
  assert.ok(html.includes(target),'device QA links to '+target);
}

// Canonical local-state proof: one shared read helper, counts/flags only, never Goal content.
assert.match(html,/function\s+readJsonKey\(key\)[\s\S]*localStorage\.getItem\(key\)/,'QA centralizes read-only localStorage access');
for(const key of ['rpg_goals_v1','rpg_autohabit_v1','rpg_habitlog_v1']){
  assert.match(html,new RegExp("readJsonKey\\(['\\\"]"+key+"['\\\"]\\)"),'QA reads canonical key through helper: '+key);
}
assert.match(html,/__retrospective_v2_migrated/,'QA reports retrospective migration marker');
assert.match(html,/__xp_ledger_v1_migrated/,'QA reports XP-ledger migration marker');
assert.match(html,/localGoalsCount/,'copyable diagnostics contain Goal count, not Goal text');
assert.match(html,/localWalkingDays/,'copyable diagnostics contain canonical Walking count');
assert.match(html,/localSleepDays/,'copyable diagnostics contain canonical Sleep count');

// Isolation contract: diagnostics may read local canonical state but must never mutate it or start app engines.
assert.doesNotMatch(html,/localStorage\.setItem|localStorage\.removeItem|localStorage\.clear\s*\(/,'QA Lab must not mutate local app state');
assert.doesNotMatch(html,/supabase-js|auth\.js|sync\.js|topbar\.js|swipe-nav\.js/i,'QA Lab stays isolated from Auth, sync, topbar and swipe engine');
assert.doesNotMatch(html,/gamenfySupabase|gamenfyAuthedFetch|fetch\s*\(/,'QA Lab must not call cloud APIs');
assert.doesNotMatch(html,/goal\.title|goal\.why|linkedSkills|JSON\.stringify\(.*goals/s,'QA diagnostics must not copy Goal content or links');

assert.match(html,/navigator\.clipboard\.writeText/,'diagnostics can be copied without writing app state');
assert.match(html,/Real-device checklist/,'page includes explicit device verification checklist');
console.log('iPhone Device QA smoke passed: device geometry plus read-only canonical Goal/Fitbit state diagnostics stay isolated and privacy-minimal.');
