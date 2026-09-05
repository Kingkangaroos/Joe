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
assert.match(html,/maxFixedProbeDrift/,'diagnostics expose maximum fixed-probe drift');
assert.match(html,/orientationchange/,'orientation transitions are observed');
assert.match(html,/visibilitychange/,'background\/foreground transitions are observed');

for(const target of ['lab-swipe-nav.html','park31.html?mode=missions','index.html','character.html#goals']){
  assert.ok(html.includes(target),'device QA links to '+target);
}

// Isolation contract: diagnostics must not mutate app data or start app engines.
assert.doesNotMatch(html,/localStorage\.setItem|localStorage\.removeItem|localStorage\.clear\s*\(/,'QA Lab must not mutate local app state');
assert.doesNotMatch(html,/supabase-js|auth\.js|sync\.js|topbar\.js|swipe-nav\.js/i,'QA Lab stays isolated from Auth, sync, topbar and swipe engine');
assert.doesNotMatch(html,/gamenfySupabase|gamenfyAuthedFetch|fetch\s*\(/,'QA Lab must not call cloud APIs');

assert.match(html,/navigator\.clipboard\.writeText/,'diagnostics can be copied without writing app state');
assert.match(html,/Real-device checklist/,'page includes explicit device verification checklist');
console.log('iPhone Device QA smoke passed: standalone, safe-area, Visual Viewport and fixed-bottom drift diagnostics stay isolated/read-only.');
