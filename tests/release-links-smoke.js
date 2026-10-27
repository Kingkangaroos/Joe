'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),api=require('../gamenfy-updates.js');
const target='finance.html?tab=ventures&space=lab&venture=freelance_finance';
assert.equal(api.releaseUrl(target),target);
assert.equal(api.releaseUrl('accountancy.html'),'accountancy.html');
for(const url of ['https://evil.test/a.html','//evil.test/a.html','javascript:alert(1)','../a.html','a.html?x=" onclick="alert(1)','a.html?x=<script>'])assert.equal(api.releaseUrl(url),null);
const feed=JSON.parse(fs.readFileSync(path.join(root,'GAMENFY-RELEASES.json'),'utf8'));
for(const id of ['2026-10-27-accountancy-terugvinden','2026-10-26-teeth-alpha','2026-10-19-accountancy-leerpad']){const r=feed.releases.find(x=>x.id===id);assert.ok(r&&r.surfaces.includes('home'));assert.ok(api.releaseUrl(r.url));}
assert.equal(feed.releases[0].url,target);
const workspace=fs.readFileSync(path.join(root,'ventures-workspace.html'),'utf8');
assert.ok(workspace.indexOf('id="accountancyShortcut"')<workspace.indexOf('id="venturePortfolioBook"'));
assert.ok(workspace.includes('space=lab&amp;venture=freelance_finance'));
for(const match of workspace.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(match[1].trim())new vm.Script(match[1]);
console.log('Release links: safe local deeplinks, Home notifications and visible Accountancy shortcut pass.');
