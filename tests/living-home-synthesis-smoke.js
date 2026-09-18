'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const test10=fs.readFileSync(path.join(root,'lab-3d-test-10.html'),'utf8');
const review=fs.readFileSync(path.join(root,'lab-3d-review.html'),'utf8');
const core=fs.readFileSync(path.join(root,'lab-3d-character-core.js'),'utf8');
const lab=fs.readFileSync(path.join(root,'lab.html'),'utf8');
const wave1=fs.readFileSync(path.join(root,'lab-3d-character-tests.html'),'utf8');

assert.match(test10,/data-mode="synthesis"/);
assert.match(test10,/synthesisComplete/);
assert.match(test10,/data-home-anchor="agenda"/);
assert.match(test10,/data-home-anchor="missions"/);
assert.match(test10,/data-home-anchor="skills"/);
assert.match(core,/MODE==='synthesis'/);
assert.match(core,/reactiveHome\('agenda'\)/);
assert.match(core,/synthesisComplete/);
assert.doesNotMatch(test10,/supabase|auth\.js|sync\.js|xp\.js/);

for(let i=1;i<=10;i++) assert.ok(review.includes('lab-3d-test-'+i+'.html'),'review link '+i);
assert.match(review,/gamenfy_3d_review_v1/);
assert.match(review,/Kopieer feedback/);
assert.doesNotMatch(review,/supabase|auth\.js|sync\.js|fetch\(|XMLHttpRequest|sendBeacon/);

assert.match(lab,/tests 6–10/);
assert.match(lab,/snelle review van alle 10/i);
assert.match(wave1,/Wave 2 \+ Test 10/);
assert.match(wave1,/Snelle review 1–10/);

console.log('Living Home synthesis + local evening review PASS');
