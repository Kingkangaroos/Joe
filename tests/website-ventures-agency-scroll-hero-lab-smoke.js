'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const hero=read('website-ventures-agency-scroll-hero-lab.html');
const heroLower=hero.toLowerCase();
const archive=read('website-ventures-agency-scroll-hero-lab-v1-4-archive.html');
const source=read('site-agency-showroom-v1-5.html');
const sites=read('sites.html');
const ventures=read('ventures-workspace.html');
const state=JSON.parse(read('WEBSITE-VENTURES-CHATGPT-LAB-STATE.json'));
const hq=JSON.parse(read('WEBSITE-VENTURES-HQ-STATE.json'));
const line=JSON.parse(read('WEBSITE-VENTURES-PRODUCTION-LINE-V3.json'));
const queue=JSON.parse(read('WEBSITE-VENTURES-HIGGSFIELD-QUEUE.json'));

assert.ok(hero.includes('Agency Showroom · Lab v1.5'),'Canonical Agency Lab must identify v1.5');
assert.ok(source.includes('Agency Showroom · Lab v1.5'),'Additive v1.5 source variant must exist');
assert.ok(archive.includes('Integrated Lab v1.4'),'Previous integrated v1.4 must remain archived');
assert.ok(hero.includes('site-plumbing-flagship-v1.html'),'Showcase 01 must use the real coded Plumbing demo');
assert.ok(hero.includes('site-klus-scroll-1-2.html'),'Showcase 02 must use the preserved Architectural Luxury demo');
assert.ok(hero.includes('site-pt.html'),'Showcase 03 must use a distinct coded Performance foundation');
assert.ok(heroLower.includes('join the club'),'Agency v1.5 must include the honest fourth Join the Club slot');
assert.ok(heroLower.includes('we also make')&&(heroLower.includes('productmotion')||heroLower.includes('product-motion')),'Agency v1.5 must include the product/ad motion capability world');
assert.ok(hero.includes('setupTotal')&&hero.includes('configSummary'),'Agency v1.5 must include a live configurator');
assert.ok(hero.includes('Online boeken')&&hero.includes('iDEAL')&&hero.includes('Motion ad'),'Configurator must expose the intended optional capability types');
assert.ok(hero.includes('outroRun')&&hero.includes('paintOutro')&&hero.includes('--close'),'Agency v1.5 must preserve a scroll-driven closing scene');
assert.ok(hero.includes('rotateX')&&hero.includes('rotateY')&&hero.includes('rotateZ'),'Tablet motion must remain spatial');
assert.ok(hero.includes('requestAnimationFrame'),'Hero scroll updates must stay animation-frame driven');
assert.ok(hero.includes('@media(max-width:720px)'),'Deliberate narrow-browser behavior must exist');
assert.ok(hero.includes('prefers-reduced-motion'),'Reduced-motion treatment must exist');
assert.ok(!hero.includes('generate_video')&&!hero.includes('generate_image'),'Public-facing Lab HTML must not contain generation machinery');
assert.ok(heroLower.includes('dezelfde steen')||heroLower.includes('same stone'),'Same-stone story must remain explicit');
assert.ok(heroLower.includes('geen bindend'),'Configurator must not pretend test pricing is a binding quote');
assert.ok(hero.includes('Je kunt gewoon verder scrollen'),'Contact CTA must explicitly remain non-blocking in Lab');

assert.ok(sites.includes('website-ventures-agency-scroll-hero-lab.html'),'Website Lab must surface the canonical Agency Lab');
assert.ok(ventures.includes('website-ventures-agency-scroll-hero-lab.html?from=ventures'),'Ventures must link directly to the canonical Agency Lab');
assert.ok(ventures.includes('Open mijn nieuwe website'),'Ventures must expose a clear user-facing entry point');
assert.ok(ventures.includes('Gamenfy General Lab'),'Website Venture Lab must remain distinct from General Lab');

assert.equal(state.activePrototype.id,'AGENCY-SHOWROOM-LAB-V1-5','Durable Lab state must point at Agency v1.5');
assert.equal(state.activePrototype.currentLabVersion,'v1.5','Durable Lab state must track current version');
assert.equal(state.activePrototype.status,'integrated-lab-testing','Agency v1.5 must remain Lab-only while being refined');
assert.ok(state.activePrototype.deliberatelyDeferred.includes('public agency launch'),'Public launch must remain deferred');
assert.ok(state.activePrototype.interactionContract.some(x=>x.toLowerCase().includes('same stone')),'State must preserve the same-stone contract');
assert.ok(state.guardrails.some(x=>x.includes('No paid Higgsfield')),'Autonomous paid generation must remain blocked');

assert.equal(hq.workflow.activeAgencyLab,'website-ventures-agency-scroll-hero-lab.html','HQ must point at canonical v1.5');
assert.equal(hq.agencyExperience.activeVersion,'v1.5','HQ must track v1.5');
assert.ok(hq.lockedDecisions.salesGate.includes('three strong examples'),'HQ must preserve the anti-delay sales gate');
assert.ok(hq.lockedDecisions.qualityOverQuantity.includes('smaller curated set'),'HQ must prioritize useful quality over raw generation count');
assert.equal(line.version,3.3,'Production Line must be realigned to v3.3');
assert.equal(line.activeBuild.agencyVersion,'v1.5','Production Line must track Agency v1.5');
assert.equal(line.activeGeneration.nextRequiredBatch,null,'No obsolete mandatory batch may block the targeted sprint');
assert.ok(line.activeGeneration.historicalNote.includes('Fire')&&line.activeGeneration.historicalNote.includes('no longer'),'Old Fire gate must be explicitly retired');
assert.equal(queue.version,4,'Higgsfield queue must use targeted v4');
assert.equal(queue.status.nextBatch,null,'Targeted queue must not invent an obsolete next batch');
assert.ok(queue.hardRules.some(x=>x.includes('Fire is optional')),'Fire must be optional, not required');
assert.ok(queue.batches.some(b=>b.name.includes('Premium Plumbing')),'Targeted queue must include Plumbing asset work');
assert.ok(queue.batches.some(b=>b.name.includes('Architectural Luxury')),'Targeted queue must include showcase 02');
assert.ok(queue.batches.some(b=>b.name.includes('Performance')),'Targeted queue must include showcase 03');
assert.ok(queue.batches.some(b=>b.name.includes('Product / ad motion')),'Targeted queue must include the product-motion proof');

console.log('website ventures agency v1.5 smoke passed');
