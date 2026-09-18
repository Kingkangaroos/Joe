'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const core=fs.readFileSync(path.join(root,'lab-3d-character-core.js'),'utf8');
const hub=fs.readFileSync(path.join(root,'lab-3d-feel-tests.html'),'utf8');
const lab=fs.readFileSync(path.join(root,'lab.html'),'utf8');

for(let i=6;i<=9;i++){
  const p=path.join(root,'lab-3d-test-'+i+'.html');
  assert.ok(fs.existsSync(p),'missing test '+i);
  const html=fs.readFileSync(p,'utf8');
  assert.match(html,/lab-3d-character-core\.js/);
  assert.match(html,/type="importmap"/);
  assert.doesNotMatch(html,/supabase|auth\.js|sync\.js|xp\.js/);
  assert.ok(hub.includes('lab-3d-test-'+i+'.html'),'hub link '+i);
}
for(const token of ['setupFootQa','updateFootQa','SkeletonUtils.clone','applyToonLook','reactiveHome','buildPerfActors','updatePerf',"MODE==='grounded'","MODE==='toon'","MODE==='reactive'","MODE==='perf'"]) assert.ok(core.includes(token),token);
assert.doesNotMatch(core,/localStorage|sessionStorage|indexedDB|supabase|XMLHttpRequest|sendBeacon/);
assert.match(hub,/vier redenen aan waarom live 3D alsnog kan mislukken/);
assert.match(lab,/3D Feel Lab/);
console.log('3D Feel Lab Wave 2: grounded QA + visual fit + reactive Home + performance PASS');
