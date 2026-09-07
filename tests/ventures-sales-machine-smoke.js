'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const sales=read('ventures-sales.html');
const lab=read('sites.html');
const playbook=read('WEBSITE-VENTURES-SALES-PLAYBOOK.md');
const production=read('PLUMBING-FLAGSHIP-PRODUCTION-PACK.md');

assert.ok(sales.includes('data-gamenfy-scope="personal"'),'Sales Machine must remain personal-only');
assert.ok(sales.includes("const KEY='rpg_venture_sales_v1'"),'Sales state needs a stable RPG key');
assert.ok(sales.includes("window.initCloudSync"),'Sales Machine must join normal RPG cloud sync');
assert.ok(sales.includes('€995')&&sales.includes('€49/mnd'),'Founding offer must stay explicit');
assert.ok(sales.includes('Klanten 1–10 pipeline'),'First-ten pipeline must remain visible');
assert.ok(sales.includes('ICP score'),'Prospect qualification must remain visible');
assert.ok(sales.includes('Sales funnel'),'Funnel evidence must remain visible');
assert.ok(sales.includes('Scopegrenzen'),'Scope guardrails must remain visible');

assert.ok(lab.includes('href="ventures-sales.html"'),'Website Lab must link to Sales Machine');
assert.ok(lab.includes('site-plumbing-flagship-v1.html'),'Existing production flagship must remain visible');
assert.ok(lab.includes('site-klus-scroll-1-2.html'),'Accepted Test 1.2 must remain visible');

assert.ok(playbook.includes('Customers 1–3')||playbook.includes('Customers 1–3:'),'Playbook keeps first pricing block');
assert.ok(playbook.includes('≤6 hours'),'Production-time guardrail must remain documented');
assert.ok(playbook.includes('Province expansion gate'),'Scale gate must stay evidence-based');

assert.ok(production.includes('PL-CHAR-001'),'Production pack must start from master technician');
assert.ok(production.includes('Animate only 10/12+ stills'),'Motion must remain gated behind still quality');
assert.ok(production.includes('Never generate fake project proof'),'Proof integrity must remain explicit');
assert.ok(production.includes('site-plumbing-flagship-v1.html'),'Production pack must map back to actual flagship');

console.log('ventures sales machine smoke passed');
