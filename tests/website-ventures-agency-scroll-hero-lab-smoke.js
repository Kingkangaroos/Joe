'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const hero=read('website-ventures-agency-scroll-hero-lab.html');
const sites=read('sites.html');
const ventures=read('ventures-workspace.html');
const state=JSON.parse(read('WEBSITE-VENTURES-CHATGPT-LAB-STATE.json'));

assert.ok(hero.includes('Agency Scroll Hero Lab v1'),'Prototype identity must stay explicit');
assert.ok(hero.includes('0 AI credits'),'Prototype must remain generation-credit free');
assert.ok(hero.includes('site-plumbing-flagship-v1.html'),'First live preview must use the coded Plumbing demo');
assert.ok(hero.includes('site-klus-scroll-1-2.html'),'Second live preview must use an existing coded lab demo');
assert.ok(hero.includes('same-stone lift/return')||hero.includes('dezelfde steen'),'Same-stone return intent must remain visible');
assert.ok(hero.includes('rotateX')&&hero.includes('rotateY')&&hero.includes('rotateZ'),'Tablet motion must remain spatial rather than a flat scale-only effect');
assert.ok(hero.includes('requestAnimationFrame'),'Scroll updates should be animation-frame driven');
assert.ok(hero.includes('@media(max-width:720px)'),'A deliberate narrow-layout treatment must exist');
assert.ok(!hero.includes('if(innerWidth<=720)return')&&!hero.includes('if (innerWidth <= 720) return'),'Narrow browsers must not disable scroll motion');
assert.ok(!hero.includes('.scroll-run{height:auto}'),'Narrow layout must retain enough scroll runway for animation');
assert.ok(hero.includes('window.innerWidth<=720'),'Motion renderer must deliberately adapt its geometry for narrow browsers');
assert.ok(hero.includes('prefers-reduced-motion'),'Reduced-motion users need a deliberate fallback');
assert.ok(!hero.includes('generate_video')&&!hero.includes('generate_image'),'Public Lab prototype must not contain generation machinery');
assert.ok(hero.includes('Show, don’t claim'),'Integrated Lab must continue from the hero into the agency narrative');
assert.ok(hero.includes('Founding offer'),'Integrated Lab must expose the current offer as a test rather than a hidden planning detail');
assert.ok(hero.includes('Geen nep-reviews')||hero.includes('Geen fake proof'),'Integrated Lab must not imply fabricated customer proof');

assert.ok(sites.includes('website-ventures-agency-scroll-hero-lab.html'),'Website Lab must surface the active scroll hero prototype');
assert.ok(ventures.includes('website-ventures-agency-scroll-hero-lab.html?from=ventures'),'Ventures must link directly to the active agency site');
assert.ok(ventures.includes('Open mijn nieuwe website'),'Ventures overview must expose an unambiguous user-facing entry point');
assert.ok(ventures.includes('Mijn nieuwe Agency-site'),'Venture Lab workbench must surface the active prototype');
assert.ok(ventures.includes('Gamenfy General Lab'),'The unrelated general Lab must be explicitly distinguished');

assert.equal(state.activePrototype.id,'AG-SCROLL-HERO-LAB-V1','Durable Lab state must point at the active prototype');
assert.ok(['lab-testing','integrated-lab-testing'].includes(state.activePrototype.status),'Prototype must remain Lab-only until Joey approves public launch');
assert.ok(state.activePrototype.deliberatelyDeferred.includes('public agency launch')||state.activePrototype.deliberatelyDeferred.includes('live agency publication'),'Public launch must remain deferred');
assert.ok(state.activePrototype.interactionContract.some(x=>x.includes('same tablet')||x.includes('same large pale stone')||x.includes('same tablet to the same stone')),'State must preserve the same-object/same-stone motion contract');
assert.ok(state.guardrails.some(x=>x.includes('No paid Higgsfield')),'Paid autonomous generation remains blocked');

console.log('website ventures agency scroll hero lab smoke passed');
