/* Dormant cross-page swipe engine regression guard — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'swipe-nav.js'),'utf8');
const codeOnly=src.replace(/\/\/.*$/gm,'');
const arch=fs.readFileSync(path.join(root,'SWIPE-NAV-ARCHITECTURE.md'),'utf8');

assert.match(src,/\{key:'main',href:'index\.html'\}[\s\S]*\{key:'character',href:'character\.html'\}[\s\S]*\{key:'skills',href:'character\.html#skills'\}[\s\S]*\{key:'finance',href:'finance\.html'\}[\s\S]*\{key:'jarvis',href:'jarvis\.html'\}/,'route order must mirror topbar.js');
assert.match(src,/axisStart:10/);
assert.match(src,/horizontalRatio:1\.28/);
assert.match(src,/commitPx:72/);
assert.match(src,/commitRatio:0\.18/);
assert.match(src,/flickMinPx:38/);
assert.match(src,/flickVelocity:0\.55/);
assert.match(src,/if\(active\.axis==='y'\)return;/,'vertical lock must never call preventDefault');
assert.match(src,/if\(active\.axis!=='x'\)return;\s*event\.preventDefault\(\);/,'preventDefault occurs only after horizontal lock');
assert.match(src,/blockedTarget\(event\.target,root,options\.interactiveSelector\)/);
assert.match(src,/horizontallyScrollable\(target,root\)/,'nested horizontal surfaces are automatically protected');
assert.match(src,/isModalOpen\(doc\)/,'modal state blocks swipe starts');
assert.match(src,/location\.assign\(href\)/,'cross-document navigation happens only after a committed gesture');
assert.match(src,/window\.GamenfySwipeNav=\{[\s\S]*mount:mount/,'engine is exposed as an explicit API');
assert.doesNotMatch(codeOnly,/GamenfySwipeNav\.mount\s*\(/,'engine must never self-mount');
assert.doesNotMatch(src,/localStorage\.setItem|supabase|fetch\(/i,'engine must not own app data or remote state');
assert.match(arch,/engine built, dormant, not loaded by any production page/i);
assert.match(arch,/Do not load or mount it globally until Joey approves the installed-iPhone feel/i);
console.log('Swipe engine smoke: route parity, vertical-first ownership, exclusions, modal safety, cross-document commit and dormant activation are guarded.');
