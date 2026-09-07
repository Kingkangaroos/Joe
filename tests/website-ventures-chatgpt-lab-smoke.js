'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const lab=read('website-ventures-chatgpt-lab.html');
const sites=read('sites.html');

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
console.log('website ventures chatgpt lab smoke passed');
