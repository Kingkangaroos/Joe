'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const page=fs.readFileSync('website-ventures-prospect-lab.html','utf8');
const data=JSON.parse(fs.readFileSync('WEBSITE-VENTURES-PROSPECT-WAVE-01.json','utf8'));

assert.ok(page.includes('Prospect Lab')&&page.includes('Wave 01'),'Prospect research board must keep its identity');
assert.ok(page.includes('Research-only guardrail'),'No-contact state must remain visible');
assert.ok(page.includes('0</b><span>outreach sent'),'Board must not imply outreach was sent');
assert.ok(page.includes('ventures-sales.html'),'Board must distinguish research from real sales progress');
assert.equal(data.status,'research-only','Wave must remain research-only until intentional promotion');
assert.equal(data.prospects.length,10,'Wave 01 should keep all ten researched candidates');
assert.equal(data.prospects.filter(p=>p.tier==='A').length,6,'Wave 01 keeps six A-tier research hypotheses');
assert.ok(data.prospects.every(p=>p.status==='research'),'No candidate may silently become contacted/interested');
assert.ok(data.guardrail.includes('No calls, emails, DMs or form submissions'),'Durable data must keep no-outreach guardrail');
assert.ok(data.promotionRule.includes('Joey intentionally selects'),'Promotion to Sales Machine must be deliberate');
console.log('website ventures prospect lab smoke passed');
