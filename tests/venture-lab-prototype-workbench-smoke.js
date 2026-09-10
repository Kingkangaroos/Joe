/* Venture Lab prototype ownership — ChatGPT (OpenAI), updated 2026-09-10 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const ventures=fs.readFileSync(path.join(root,'ventures-workspace.html'),'utf8');
const lab=fs.readFileSync(path.join(root,'lab.html'),'utf8');
const sites=fs.readFileSync(path.join(root,'sites.html'),'utf8');

assert.ok(ventures.includes('Prototype workbench'),'Venture Lab exposes a prototype workbench');
assert.ok(ventures.includes("v.id!=='sell_websites'"),'Prototype workbench is scoped to Websites Verkopen');
for(const file of ['website-ventures-agency-scroll-hero-lab.html?from=ventures','website-ventures-higgsfield-prompt-board.html','website-ventures-production-line-v3.html','sites.html?from=ventures','site-plumbing-flagship-v1.html?from=ventures','site-klus-scroll-1-2.html?from=ventures','site-pt.html?from=ventures']){
  assert.ok(ventures.includes(file),`Venture Lab links current prototype/work surface ${file}`);
}
assert.ok(ventures.includes('target="_top"'),'Prototype links break out of the Finance iframe cleanly');
assert.ok(!lab.includes('href="sites.html"'),'General Lab no longer owns Website Ventures prototypes');
assert.ok(sites.includes('finance.html?tab=ventures&amp;space=lab&amp;venture=sell_websites'),'Website Lab returns toward Finance → Ventures');
assert.ok(!sites.includes('Terug naar ChatGPT Lab'),'Website Lab no longer returns to General Lab');
for(const old of ['site-klus-scroll-1-1.html','site-klus-scroll.html','site-klus.html','site-rijschool.html']) assert.ok(sites.includes(old),'Accepted historical Website Lab experiment remains reachable: '+old);
assert.ok(sites.includes('website-ventures-agency-scroll-hero-lab-v1-4-archive.html'),'Previous integrated agency version remains archived');
console.log('venture lab workbench smoke passed: current Website Ventures work lives under Websites Verkopen and accepted history remains in Website Lab.');
