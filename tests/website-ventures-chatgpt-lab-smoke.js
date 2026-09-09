'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const lab=read('website-ventures-chatgpt-lab.html');
const sites=read('sites.html');
const vaultPage=read('website-ventures-visual-vault.html');
const vault=JSON.parse(read('WEBSITE-VENTURES-VISUAL-VAULT.json'));
const labState=JSON.parse(read('WEBSITE-VENTURES-CHATGPT-LAB-STATE.json'));

assert.ok(lab.includes('Website Ventures')&&lab.includes('Venture Lab'),'Lab identity must remain explicit');
assert.ok(lab.includes('experimental zone')&&lab.includes('Lab · niet definitief'),'Hypotheses must not masquerade as locked decisions');
assert.ok(lab.includes('€995')&&lab.includes('€49/mnd'),'Current founding hypothesis must remain visible');
assert.ok(lab.includes('Plumbing = leading wedge'),'Plumbing must remain a hypothesis, not a permanent niche lock');
assert.ok(lab.includes('Unit economics simulator'),'Lab must keep an economics stress test');
assert.ok(lab.includes('30×')&&lab.includes('10×')&&lab.includes('3×'),'Evidence gates must stay visible');
assert.ok(lab.includes('Geen automatische outreach'),'Lab may not silently contact prospects');
assert.ok(lab.includes('Geen fake proof'),'Proof integrity guardrail must remain explicit');
assert.ok(lab.includes('Geen betaalde AI-spend'),'Paid generation must remain gated');
assert.ok(lab.includes('ventures-sales.html'),'Lab must link the real Sales Machine');
assert.ok(lab.includes('site-plumbing-flagship-v1.html'),'Lab must link the active flagship');
assert.ok(lab.includes('site-klus-scroll-1-2.html'),'Accepted design reference must remain reachable');

assert.ok(sites.includes('website-ventures-chatgpt-lab.html'),'Website Lab must surface the ChatGPT Venture Lab');
assert.ok(sites.includes('ventures-sales.html'),'Website Lab must surface the Sales Machine');
assert.ok(sites.includes('website-ventures-visual-vault.html'),'Website Lab must surface the Visual Vault');

assert.equal(labState.currentWorkingModel.foundingPrice.setupExVat,995,'Lab state keeps the active setup hypothesis');
assert.equal(labState.currentWorkingModel.foundingPrice.monthlyExVat,49,'Lab state keeps the active monthly hypothesis');
assert.equal(labState.currentWorkingModel.leadingWedgeStatus,'hypothesis, not permanent lock','Niche cannot silently become permanent');
assert.ok(labState.guardrails.some(x=>x.includes('No prospect calls')),'Durable lab state must keep no-outreach guardrail');
assert.ok(labState.completedAutonomousWork.some(x=>x.includes('Built the Visual Vault')),'Completed Visual Vault must not remain a phantom P0 todo');
assert.ok(!labState.todo.some(x=>x.task.includes('Create the Visual Vault structure')),'Completed Visual Vault must be removed from active todo');

assert.ok(vaultPage.includes('Visual Vault')&&vaultPage.includes('10/12'),'Visual Vault workbench and motion gate must stay visible');
assert.equal(vault.ratingRubric.maxScore,12,'Vault rubric stays twelve-point');
assert.ok(vault.assets.some(a=>a.id==='PL-CHAR-001'&&a.status==='next'),'Master technician remains first production asset');
assert.ok(vault.assets.some(a=>a.id==='PL-PROOF-001'&&a.proofType==='real-source-only'),'Proof slot must remain real-source-only');
assert.ok(vault.assets.some(a=>a.id==='PL-MOTION-001'&&String(a.status).startsWith('blocked')),'Motion remains blocked until still approval');
assert.ok(vault.rules.some(x=>x.includes('Rejected assets remain archived')),'Rejected generation learning must be retained');

console.log('website ventures chatgpt lab smoke passed');
