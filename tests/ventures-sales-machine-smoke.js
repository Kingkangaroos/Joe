'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const legacySales=read('ventures-sales.html');
const sales=read('ventures-sales-v2.html');
const lab=read('sites.html');
const playbook=read('WEBSITE-VENTURES-SALES-PLAYBOOK.md');
const production=read('PLUMBING-FLAGSHIP-PRODUCTION-PACK.md');
const prospects=read('WEBSITE-VENTURES-PROSPECT-WAVE-01.md');

assert.ok(legacySales.includes("const KEY='rpg_venture_sales_v1'"),'Legacy Sales Machine must retain the original local key for migration history');
assert.ok(sales.includes('data-gamenfy-scope="personal"'),'Sales Machine v2 must remain personal-only');
assert.ok(sales.includes("const KEY='rpg_venture_sales_v1'"),'Sales v2 must reuse the existing local pipeline key');
assert.ok(sales.includes("const APP_KEY='venture_sales'"),'Sales v2 needs an isolated cloud app-state key');
assert.ok(sales.includes('syncedKeys:[KEY]'),'Sales v2 must sync only its own state key');
assert.ok(!sales.includes('xp.js'),'Sales v2 must not boot the broad RPG sync scope');
assert.ok(sales.includes('€995')&&sales.includes('€49/mnd'),'Founding offer must stay explicit');
assert.ok(sales.includes('Klanten 1–10 pipeline'),'First-ten pipeline must remain visible');
assert.ok(sales.includes('Funnel'),'Funnel evidence must remain visible');
assert.ok(sales.includes('Geen automatische outreach'),'Outbound guardrail must remain explicit');

assert.ok(lab.includes('href="ventures-sales-v2.html"'),'Website Lab must link to active Sales Machine v2');
assert.ok(lab.includes('website-ventures-delivery-os.html'),'Website Lab must link to Delivery OS');
assert.ok(lab.includes('website-ventures-prospect-lab.html'),'Website Lab must expose Prospect Lab');
assert.ok(lab.includes('site-plumbing-flagship-v1.html'),'Existing production flagship must remain visible');
assert.ok(lab.includes('site-klus-scroll-1-2.html'),'Accepted Test 1.2 must remain visible');

assert.ok(playbook.includes('Customers 1–3')||playbook.includes('Customers 1–3:'),'Playbook keeps first pricing block');
assert.ok(playbook.includes('≤6 hours'),'Production-time guardrail must remain documented');
assert.ok(playbook.includes('Province expansion gate'),'Scale gate must stay evidence-based');

assert.ok(production.includes('PL-CHAR-001'),'Production pack must start from master technician');
assert.ok(production.includes('Animate only 10/12+ stills'),'Motion must remain gated behind still quality');
assert.ok(production.includes('Never generate fake project proof'),'Proof integrity must remain explicit');
assert.ok(production.includes('site-plumbing-flagship-v1.html'),'Production pack must map back to actual flagship');

assert.ok(prospects.includes('research only — nobody contacted'),'Prospect wave must never imply outreach happened');
assert.ok(prospects.includes('### 10. Service & Klusbedrijf Zeewolde'),'Wave 01 should retain ten researched prospects');
assert.ok(prospects.includes('No-contact guardrail'),'Research and outreach must remain separate actions');
assert.ok(prospects.includes('Premium Plumbing flagship'),'Prospecting should stay tied to the actual sales demo');

console.log('ventures sales machine smoke passed');
