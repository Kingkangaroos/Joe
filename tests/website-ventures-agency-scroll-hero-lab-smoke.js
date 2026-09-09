'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const hero=read('website-ventures-agency-scroll-hero-lab.html');
const sites=read('sites.html');
const state=JSON.parse(read('WEBSITE-VENTURES-CHATGPT-LAB-STATE.json'));

assert.ok(hero.includes('Agency Scroll Hero Lab v1'),'Prototype identity must stay explicit');
assert.ok(hero.includes('0 AI credits'),'Prototype must remain generation-credit free');
assert.ok(hero.includes('site-plumbing-flagship-v1.html'),'First live preview must use the coded Plumbing demo');
assert.ok(hero.includes('site-klus-scroll-1-2.html'),'Second live preview must use an existing coded lab demo');
assert.ok(hero.includes('same-stone lift/return')||hero.includes('dezelfde steen'),'Same-stone return intent must remain visible');
assert.ok(hero.includes('rotateX')&&hero.includes('rotateY')&&hero.includes('rotateZ'),'Tablet motion must remain spatial rather than a flat scale-only effect');
assert.ok(hero.includes('requestAnimationFrame'),'Scroll updates should be animation-frame driven');
assert.ok(hero.includes('@media(max-width:720px)'),'A deliberate mobile fallback must exist');
assert.ok(hero.includes('prefers-reduced-motion'),'Reduced-motion users need a deliberate fallback');
assert.ok(!hero.includes('generate_video')&&!hero.includes('generate_image'),'Public Lab prototype must not contain generation machinery');

assert.ok(sites.includes('website-ventures-agency-scroll-hero-lab.html'),'Website Lab must surface the active scroll hero prototype');
assert.equal(state.activePrototype.id,'AG-SCROLL-HERO-LAB-V1','Durable Lab state must point at the active prototype');
assert.equal(state.activePrototype.status,'lab-testing','Prototype must remain Lab-only until Joey approves it');
assert.ok(state.activePrototype.deliberatelyDeferred.includes('live agency publication'),'Live publication must remain deferred');
assert.ok(state.activePrototype.interactionContract.some(x=>x.includes('same tablet')||x.includes('same large pale stone')),'State must preserve the same-object/same-stone motion contract');
assert.ok(state.guardrails.some(x=>x.includes('No paid Higgsfield')),'Paid autonomous generation remains blocked');

console.log('website ventures agency scroll hero lab smoke passed');
