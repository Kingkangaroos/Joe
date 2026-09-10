'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const handoff=read('INCOME-HANDOFF-2026-09-07.md');
const line=JSON.parse(read('WEBSITE-VENTURES-PRODUCTION-LINE-V3.json'));
const hq=JSON.parse(read('WEBSITE-VENTURES-HQ-STATE.json'));
const agency0=read('site-agency-showroom-v0.html');
const active=read('website-ventures-agency-scroll-hero-lab.html');
const board=read('website-ventures-production-line-v3.html');
const sites=read('sites.html');
const oldBoard=read('website-ventures-production-line-v2.html');

assert.ok(handoff.includes("Joey's own Website Ventures / agency showroom = P0"),'Historical Income handoff retains the agency-first decision');
assert.equal(line.sourceOfTruth,'WEBSITE-VENTURES-HQ-STATE.json','Current Production Line must defer to the refreshed HQ state');
assert.ok(line.priorityOrder[0].includes('Agency Showroom v1.5'),'Agency/showroom remains first current production priority');
assert.equal(line.activeBuild.agencyVersion,'v1.5');
assert.ok(line.hardRules.some(x=>x.includes('Agency v1.5 must feel like multiple bespoke worlds')),'Agency must remain bespoke-feeling rather than an AI/template gallery');
assert.ok(line.hardRules.some(x=>x.includes('Generated demo visuals never masquerade')),'Proof integrity remains locked');
assert.ok(line.hardRules.some(x=>x.includes('Joey manually runs Higgsfield')),'Generation remains manual rather than autonomous paid spend');

assert.equal(hq.agencyExperience.activeVersion,'v1.5');
assert.ok(hq.northStar.customerReaction.includes('exceptionally expensive'),'HQ must preserve the high-perceived-value reaction');
assert.ok(hq.lockedDecisions.templateRule.includes('70% reusable'),'HQ must preserve the reusable-underneath / bespoke-front-end model');
assert.ok(hq.lockedDecisions.salesGate.includes('three strong examples'),'HQ must retain the real-market anti-delay gate');
assert.ok(hq.generationStrategy.historicalPlan.includes('Fire Challenger')&&hq.generationStrategy.historicalPlan.includes('no longer a mandatory gate'),'Old Fire ladder must remain history, not an active blocker');

assert.ok(agency0.includes('LAB / NOT PUBLIC COPY.'),'Agency v0 remains preserved as a prototype archive');
assert.ok(agency0.includes('site-plumbing-flagship-v1.html'),'Historical agency prototype retains Plumbing input');
assert.ok(active.includes('Agency Showroom · Lab v1.5'),'Canonical Agency page is now v1.5');
assert.ok(active.includes('Join the Club')&&active.includes('setupTotal')&&active.includes('outroRun'),'v1.5 must include showcases, configurator and ending');
assert.ok(board.includes("fetch('WEBSITE-VENTURES-PRODUCTION-LINE-V3.json'"),'Visual Production Line still reads durable state');
assert.ok(board.includes('Agency v1.5')&&board.includes('targeted Unlimited sprint'),'Production board must expose current sprint');

assert.ok(sites.indexOf('P0 · Nu testen') < sites.indexOf('P0 · Three showcase foundations'),'Website Lab must show current Agency v1.5 before showcase foundations');
assert.ok(sites.includes('site-agency-showroom-v0.html'),'Website Lab keeps the old agency prototype reachable');
assert.ok(sites.includes('website-ventures-production-line-v3.html'),'Website Lab links to active v3.3 factory');
['site-klus-scroll-1-2.html','site-klus-scroll-1-1.html','site-klus-scroll.html','site-klus.html','site-pt.html','site-rijschool.html'].forEach(path=>assert.ok(sites.includes(path),'Website Lab preserves prototype/base link '+path));
assert.ok(oldBoard.includes('Production Line v2 is no longer active.'),'Old v2 entry point clearly remains archive-only');
assert.ok(oldBoard.includes('website-ventures-production-line-v3.html'),'Old v2 entry point routes builders to v3');
console.log('Income handoff → current Agency v1.5 HQ contract smoke passed');
