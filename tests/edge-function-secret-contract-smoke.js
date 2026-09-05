/* Edge Function secret cutover contract smoke — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');

const contract=fs.readFileSync(path.join(root,'server','EDGE-FUNCTION-SECURITY-CUTOVER.md'),'utf8');
const jarvis=fs.readFileSync(path.join(root,'server','jarvis','index.ts'),'utf8');
const jarvisReadme=fs.readFileSync(path.join(root,'server','jarvis','README.md'),'utf8');
const pushReadme=fs.readFileSync(path.join(root,'server','send-daily-push','README.md'),'utf8');
const fitbitMarker=fs.readFileSync(path.join(root,'server','fitbit-sync','index.ts'),'utf8');

for(const name of ['GAMENFY_AI_PROVIDER_KEY','GAMENFY_PUSH_REQUEST_SECRET','GAMENFY_VAPID_PRIVATE_KEY']){
  assert.match(contract,new RegExp(name),'cutover contract must name required env secret '+name);
}
assert.match(contract,/Create environment secrets first/i,'secrets must exist before env-based redeploy');
assert.match(contract,/Rotate the old AI-provider credential only after \*\*both\*\* Jarvis and push/i,'shared provider credential rotation is coordinated');
assert.match(contract,/Changing the VAPID key pair can invalidate existing subscriptions/i,'VAPID rotation must not silently strand subscriptions');
assert.match(contract,/leaked-password protection disabled/i,'platform advisor finding is durably recorded');
assert.match(contract,/fitbit-sync[\s\S]*hard-coded owner identifier fallback/i,'Fitbit owner fallback hardening remains explicit');

const canonical=['budgeting','sleep','nutrition','walking','teeth','household','meditation','gratitude','good_deed','screen_time','cold_shower'];
for(const key of canonical) assert.match(contract,new RegExp('`'+key+'`'),'canonical Jarvis Daily is documented: '+key);
for(const key of ['grounding','no_porn','weed_control']) assert.match(contract,new RegExp('`'+key+'`'),'blocked Jarvis Daily is documented: '+key);

assert.match(jarvis,/deployment marker only/i,'repo Jarvis file must remain a non-secret deployment marker until secure source is ready');
assert.match(jarvisReadme,/environment secret/i,'Jarvis README keeps env-secret blocker');
assert.match(pushReadme,/environment secrets/i,'push README keeps env-secret blocker');
assert.match(fitbitMarker,/real implementation and secrets live in Supabase/i,'Fitbit repo marker must not copy deployed secret-bearing source');

const serverRoot=path.join(root,'server');
function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(ent=>ent.isDirectory()?walk(path.join(dir,ent.name)):[path.join(dir,ent.name)]);
}
const textFiles=walk(serverRoot).filter(f=>/\.(?:ts|js|md|sql)$/i.test(f));
const assignmentLiteral=/(?:GEMINI_KEY|AI_PROVIDER_KEY|VAPID_PRIVATE|PUSH_REQUEST_SECRET|GOOGLE_CLIENT_SECRET|SUPABASE_SERVICE_ROLE_KEY|OWNER_USER_ID)\s*=\s*['"][A-Za-z0-9._~+\/-]{20,}['"]/i;
for(const file of textFiles){
  const src=fs.readFileSync(file,'utf8');
  assert.doesNotMatch(src,assignmentLiteral,'server repo must not contain a credential/owner literal: '+path.relative(root,file));
}

console.log('Edge Function secret contract smoke: env-first cutover, coordinated rotation, canonical Jarvis membership, VAPID caution and repo literal guard passed.');
