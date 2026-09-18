'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'lab-autosprite-bridge.html'),'utf8');

for(const token of [
  'AutoSprite Bridge','MODEL ID: autosprite',
  'img/lab/daily-score/joey/l06.webp',
  'daily-score-walk.png','daily-score-idle.png','daily-score-jump.png','daily-score-interact.png',
  'prefers-reduced-motion:reduce','L0–2 → tired','L9 → run','L10 + done → celebrate'
]) assert.ok(html.includes(token), token);

assert.doesNotMatch(html,/supabase|auth\.js|sync\.js|localStorage|sessionStorage|indexedDB|sendBeacon|XMLHttpRequest/);
assert.match(html,/FRAME COUNT: 25/);
assert.match(html,/FRAME SIZE: 256/);
assert.match(html,/VIDEO TIER: turbo/);
assert.match(html,/REMOVE BG: ultra/);
assert.match(html,/Deze pagina maakt geen externe API-calls en start geen generation jobs/);
console.log('AutoSprite Bridge: isolated state engine + verified Higgsfield contract PASS');
