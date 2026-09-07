'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const slots=JSON.parse(read('AGENCY-SHOWROOM-SLOT-CONTRACT-V1.json'));
const qa=JSON.parse(read('AGENCY-SHOWROOM-BROWSER-QA-2026-09-07.json'));
const page=read('site-agency-showroom-v0.html');
const line=JSON.parse(read('WEBSITE-VENTURES-PRODUCTION-LINE-V3.json'));

assert.equal(slots.sourceOfTruth,'INCOME-HANDOFF-2026-09-07.md');
assert.equal(slots.status,'slot-locked-content-direction-not-yet-approved');
assert.equal(slots.page,'site-agency-showroom-v0.html');
assert.ok(slots.globalRules.some(x=>x.includes('mobile and desktop')),'Agency wow proof must remain mobile + desktop');
assert.ok(slots.globalRules.some(x=>x.includes('Do not generate public proof')),'Fake proof generation must stay forbidden');
assert.ok(slots.globalRules.some(x=>x.includes('internal prompts')),'Public agency build must not expose internal production IP');
assert.ok(slots.globalRules.some(x=>x.includes('No paid generation')),'Slot contract must remain pre-spend by default');

const ids=(slots.slots||[]).map(x=>x.id);
['AG-HERO-001','AG-FIRSTSCROLL-001','AG-SHOWCASE-PL-001','AG-TRANSFORM-001','AG-INTERACT-001','AG-OFFER-001','AG-PROOF-001','AG-CTA-001'].forEach(id=>assert.ok(ids.includes(id),'Missing agency slot '+id));
assert.equal(new Set(ids).size,ids.length,'Agency slot IDs must stay unique');
assert.ok(slots.slots.find(x=>x.id==='AG-HERO-001').contentDecision==='open','Hero art direction must not silently become approved');
assert.ok(slots.slots.find(x=>x.id==='AG-SHOWCASE-PL-001').paidSpendRule.includes('not a duplicate'),'Agency must reuse Plumbing output instead of duplicating generation spend');
assert.ok(slots.slots.find(x=>x.id==='AG-TRANSFORM-001').paidSpendRule.includes('Do not generate'),'Transformation remains code-first');
assert.ok(slots.slots.find(x=>x.id==='AG-INTERACT-001').paidSpendRule.includes('Code first'),'Premium interaction remains technology-first');
assert.equal(slots.slots.find(x=>x.id==='AG-PROOF-001').externalMediaNeed,'real-source-only','Proof remains real-source-only');
assert.equal(slots.estimatedAgencyPaidVisualCount.minimum,1,'Agency site should not become an AI-image catalogue by default');

assert.equal(qa.result,'technical-pass');
assert.equal(qa.viewports.length,2,'Browser QA must cover desktop and mobile');
qa.viewports.forEach(v=>{assert.equal(v.httpStatus,200);assert.equal(v.horizontalOverflow,false);assert.deepEqual(v.consoleErrors,[]);assert.deepEqual(v.pageErrors,[]);assert.ok(v.stickyStoryStatesVerified.length>=3,'All sticky story states must be technically verified');});
assert.ok(qa.caveats.some(x=>x.includes('not a claim that the art direction')),'Technical QA may not masquerade as visual approval');

assert.ok(page.includes('site-plumbing-flagship-v1.html'),'Agency showroom must retain Plumbing showcase access');
assert.ok(page.includes('LAB / NOT PUBLIC COPY.'),'Agency prototype choices must remain labelled as prototype');
assert.equal(line.priorityOrder[0],'P0 Joey agency/showroom website','Agency remains P0 in active production line');

console.log('agency showroom slot contract + browser QA smoke passed');
