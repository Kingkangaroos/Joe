'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const handoff=read('INCOME-HANDOFF-2026-09-07.md');
const ops=read('WEBSITE-VENTURES-OPS-HANDOFF.md');
const line=JSON.parse(read('WEBSITE-VENTURES-PRODUCTION-LINE-V3.json'));
const agency=read('site-agency-showroom-v0.html');
const board=read('website-ventures-production-line-v3.html');
const sites=read('sites.html');
const oldBoard=read('website-ventures-production-line-v2.html');

assert.ok(handoff.includes("Joey's own Website Ventures / agency showroom = P0"),'Income handoff must retain agency-site-first decision');
assert.equal(line.sourceOfTruth,'INCOME-HANDOFF-2026-09-07.md + WEBSITE-VENTURES-HQ-STATE.json');
assert.equal(line.priorityOrder[0],'P0 Joey agency/showroom website','Agency/showroom must remain first production priority');
assert.ok(line.hardRules.some(x=>x.includes("agency website sets the visual/technical ceiling")),'Plumbing may not silently become P0 above agency site again');
assert.ok(line.hardRules.some(x=>x.includes('competitive IP')),'Internal production factory must remain non-public');

const agencyAssets=(line.agencyBatches||[]).flatMap(b=>b.assets||[]);
['AG-SHELL-001','AG-NARR-001','AG-MOBILE-001','AG-HERO-001','AG-SHOWCASE-PL-001','AG-TRANSFORM-001','AG-INTERACT-001','AG-OFFER-001','AG-PROOF-001'].forEach(id=>assert.ok(agencyAssets.some(x=>x.id===id),'Missing agency production slot '+id));
assert.ok(agency.includes('LAB / NOT PUBLIC COPY.'),'Agency v0 must explicitly label brand/copy/art direction as prototype');
assert.ok(agency.includes('Real proof slot intentionally empty.'),'Agency prototype must not fabricate proof');
assert.ok(agency.includes('site-plumbing-flagship-v1.html'),'Plumbing demo must remain accessible as agency showcase input');
assert.ok(agency.includes('pointermove')&&agency.includes('sticky-wrap'),'Agency v0 should actually test interaction/scroll behavior in code');

const plumbing=line.plumbingShowcase||{};
assert.ok((plumbing.fixed||[]).includes('one strong recurring technician'),'Recurring technician is a fixed Plumbing principle');
assert.ok((plumbing.proposedNotLocked||[]).includes('leaking bathroom opening'),'Leak story must be classified as proposed rather than mandatory');
assert.ok((plumbing.proposedNotLocked||[]).includes('white/deep-red/chrome/water as permanent art direction'),'White/red art direction must remain a proposal until reviewed');

const g=line.gamenfyAnimationPilot||{};
assert.equal((g.tests||[]).length,4,'Gamenfy P2 should stay a bounded 4-test animation pilot');
['GF-PILOT-WALK-001','GF-PILOT-IDLE-001','GF-PILOT-JUMP-001','GF-PILOT-INTERACT-001'].forEach(id=>assert.ok(g.tests.some(x=>x.id===id),'Missing Gamenfy pilot '+id));
assert.ok(g.sourceRule.includes('existing approved character'),'Pilot must reuse approved character art');
assert.ok(g.fallbackArchitectureGate.includes('rigged 2D'),'Rigged 2D fallback gate must remain explicit');
assert.ok((g.deferred||[]).includes('full park world'),'Full park world must remain deferred/P2');
assert.ok((g.deferred||[]).includes('11 Daily Mission prop pack'),'Full Daily Mission prop pack must remain deferred/P2');

assert.ok(ops.includes('agency/showroom website is P0'),'Operations handoff must reflect latest Income priority');
assert.ok(ops.includes('€349'),'Ops must use current founding-price hypothesis rather than stale €995 as active direction');
assert.ok(ops.includes('V2')&&ops.includes('concepts, not approved production requirements'),'Ops must classify old v2 expansion as non-mandatory');
assert.ok(board.includes("fetch('WEBSITE-VENTURES-PRODUCTION-LINE-V3.json'"),'Visual v3 board must read active durable state');
assert.ok(board.includes('Agency P0')&&board.includes('Gamenfy pilot'),'Visual v3 board must expose corrected priorities');

assert.ok(sites.indexOf('P0 · Agency showroom') < sites.indexOf('P0 · First commercial showcase'),'Website Lab must show agency P0 before Plumbing showcase');
assert.ok(sites.includes('site-agency-showroom-v0.html'),'Website Lab must link to agency prototype');
assert.ok(sites.includes('website-ventures-production-line-v3.html'),'Website Lab must link to active v3 factory');
['site-klus-scroll-1-2.html','site-klus-scroll-1-1.html','site-klus-scroll.html','site-klus.html','site-pt.html','site-rijschool.html'].forEach(path=>assert.ok(sites.includes(path),'Website Lab must preserve old prototype/base link '+path));
assert.ok(oldBoard.includes('Production Line v2 is no longer active.'),'Old v2 entry point must clearly show archive status');
assert.ok(oldBoard.includes('website-ventures-production-line-v3.html'),'Old v2 entry point must route builders to v3');

console.log('income handoff agency P0 smoke passed');
