/* Venture Lab prototype ownership — ChatGPT (OpenAI), 2026-09-07 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const ventures=fs.readFileSync(path.join(root,'ventures-workspace.html'),'utf8');
const lab=fs.readFileSync(path.join(root,'lab.html'),'utf8');
const sites=fs.readFileSync(path.join(root,'sites.html'),'utf8');

assert.ok(ventures.includes('Prototype workbench'),'Venture Lab exposes a prototype workbench');
assert.ok(ventures.includes("v.id!=='sell_websites'"),'prototype workbench is scoped to Websites Verkopen');
for(const file of ['sites.html?from=ventures','site-klus-scroll-1-2.html?from=ventures','site-klus-scroll-1-1.html?from=ventures','site-klus-scroll.html?from=ventures','site-klus.html?from=ventures','site-pt.html?from=ventures','site-rijschool.html?from=ventures']){
  assert.ok(ventures.includes(file),`Venture Lab links existing prototype ${file}`);
}
assert.ok(ventures.includes('target="_top"'),'prototype links break out of the Finance iframe cleanly');
assert.ok(!lab.includes('href="sites.html"'),'General Lab no longer owns Website Ventures prototypes');
assert.ok(sites.includes('finance.html?tab=ventures&amp;space=lab&amp;venture=sell_websites'),'Website Lab returns toward Finance → Ventures');
assert.ok(!sites.includes('Terug naar ChatGPT Lab'),'Website Lab no longer returns to General Lab');
console.log('venture lab prototype workbench smoke passed: Website prototypes live under Websites Verkopen and General Lab stays general.');
