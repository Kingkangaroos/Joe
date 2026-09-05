/* Backup v4 owner binding smoke — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const {TextEncoder}=require('node:util');
const root=path.join(__dirname,'..');
const bindingSrc=fs.readFileSync(path.join(root,'backup-owner-binding.js'),'utf8');
const character=fs.readFileSync(path.join(root,'character.html'),'utf8');

const window={crypto:webcrypto};
vm.runInNewContext(bindingSrc,{window,TextEncoder,Uint8Array,Array,String,Error});
const B=window.GamenfyOwnerBinding;
assert.ok(B&&typeof B.fingerprintUserId==='function');

(async()=>{
  const a=await B.fingerprintUserId('11111111-2222-3333-4444-555555555555');
  const a2=await B.fingerprintUserId('11111111-2222-3333-4444-555555555555');
  const b=await B.fingerprintUserId('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
  assert.match(a,/^[0-9a-f]{64}$/);
  assert.equal(a,a2,'same authenticated owner gets stable binding');
  assert.notEqual(a,b,'different owners get different bindings');
  const manifest=B.createManifest(a);
  assert.equal(manifest.bindingType,'supabase-user-sha256-v1');
  assert.equal(B.inspectManifest(manifest).valid,true);
  assert.deepEqual(B.compareFingerprint(manifest,a),{verified:true,match:true,reason:'same-account'});
  assert.equal(B.compareFingerprint(manifest,b).match,false);
  assert.equal(B.inspectManifest({userId:'raw-owner-id'}).rawIdPresent,true,'raw user IDs are rejected as owner manifests');

  assert.match(character,/backup-owner-binding\.js\?v=/,'Character must load shared backup owner binding helper');
  assert.match(character,/version:\s*4/,'new exports must be backup v4');
  assert.match(character,/fingerprintUserId\(window\.gamenfyUserId\)/,'export binds to the authenticated owner');
  assert.match(character,/owner:\s*window\.GamenfyOwnerBinding\.createManifest\(ownerFingerprint\)/,'export stores only the pseudonymous manifest');
  assert.doesNotMatch(character,/owner:\s*\{[^}]*userId\s*:/s,'backup JSON must not contain a raw owner user ID');
  console.log('Backup v4 owner binding smoke passed: stable pseudonymous same-account binding, no raw owner id.');
})().catch((e)=>{console.error(e);process.exit(1);});
