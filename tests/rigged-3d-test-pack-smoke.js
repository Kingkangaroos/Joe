'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const hub=fs.readFileSync(path.join(root,'lab-3d-character-tests.html'),'utf8');
const core=fs.readFileSync(path.join(root,'lab-3d-character-core.js'),'utf8');
const css=fs.readFileSync(path.join(root,'lab-3d-character.css'),'utf8');
const lab=fs.readFileSync(path.join(root,'lab.html'),'utf8');

for(let i=1;i<=5;i++){
  const p=path.join(root,'lab-3d-test-'+i+'.html');
  assert.ok(fs.existsSync(p),'missing test '+i);
  const html=fs.readFileSync(p,'utf8');
  assert.match(html,/lab-3d-character-core\.js/);
  assert.match(html,/type="importmap"/);
  assert.doesNotMatch(html,/supabase|auth\.js|sync\.js|xp\.js/);
  assert.ok(hub.includes('lab-3d-test-'+i+'.html'),'hub link '+i);
}
for(const token of ['THREE.AnimationMixer','GLTFLoader','isBone','left.?foot','rootLocomotion','walkTo','MODE===\'interact\'']) assert.ok(core.includes(token),token);
assert.match(core,/hf_20260916_220039_950a8a2c-9c1d-4854-8949-682a553945de\.glb/);
assert.doesNotMatch(core,/localStorage|sessionStorage|indexedDB|supabase|fetch\(|XMLHttpRequest|sendBeacon/);
assert.match(hub,/AutoSprite-route is niet meer mijn leidende hypothese/);
assert.match(lab,/3D Character Test Pack/);
assert.match(lab,/VERGELIJKING · 2D \/ AUTOSPRITE/);
assert.match(css,/prefers-reduced-motion:reduce/);
console.log('Rigged 3D pack: five isolated tests + real skeleton locomotion contract PASS');
