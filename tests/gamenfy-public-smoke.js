/* Gamenfy Public rollback contract — ChatGPT (OpenAI), 2026-09-08 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const auth=read('auth.js');
const vercel=JSON.parse(read('vercel.json'));
const archive=read('GAMENFY-PUBLIC-BETA.md');

new vm.Script(auth,{filename:'auth.js'});
assert.equal(fs.existsSync(path.join(root,'gamenfy-public.html')),false,'retired Public entry page must remain absent');
assert.equal(fs.existsSync(path.join(root,'private-login.html')),false,'retired Public/private router must remain absent');
assert.equal(fs.existsSync(path.join(root,'private-rpg-pwa-bootstrap.html')),false,'retired bootstrap router must remain absent');
assert.doesNotMatch(auth,/PRIVATE_OWNER_ID|gamenfy_private_access|gamenfyPrivateAccessDenied/,'single-account auth must not revive the rolled-back Public routing gate');
assert.match(auth,/window\.gamenfyUserId = session\.user\.id/,'authenticated user remains bound to owner-scoped state');

const rewrites=Array.isArray(vercel.rewrites)?vercel.rewrites:[];
const redirects=Array.isArray(vercel.redirects)?vercel.redirects:[];
assert.equal(rewrites.some(r=>r.source==='/public'||r.source==='/public/'),false,'Vercel must not expose the retired Public route');
assert.equal(redirects.some(r=>String(r.destination||'').includes('private-rpg-pwa-bootstrap')),false,'root must not route through the retired Public/private bootstrap');
assert.equal(vercel.outputDirectory,'.','single-account production continues to serve the repository root');

assert.match(archive,/Current status — ROLLED BACK \/ NOT LIVE/,'Public handoff must identify the current rollback prominently');
assert.match(archive,/history only/,'old Public implementation notes must be labelled historical');

for(const optionalArchive of ['gamenfy-public.js','gamenfy-public-feedback.js']){
  if(fs.existsSync(path.join(root,optionalArchive)))new vm.Script(read(optionalArchive),{filename:optionalArchive});
}

console.log('Gamenfy Public rollback contract passed: private single-account root remains active and stale Public routes stay disabled.');
