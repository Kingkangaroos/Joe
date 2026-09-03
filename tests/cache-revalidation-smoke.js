/* Cache/revalidation regression smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/cache-revalidation-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const vercel=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
const windows=fs.readFileSync(path.join(root,'daily-windows.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');

const jsRule=(vercel.headers||[]).find(rule=>rule&&rule.source==='/(.*).js');
assert.ok(jsRule,'Vercel must define an explicit revalidation rule for shared JS');
const cacheHeader=(jsRule.headers||[]).find(h=>String(h.key).toLowerCase()==='cache-control');
assert.equal(cacheHeader&&cacheHeader.value,'no-cache, must-revalidate','shared JS must revalidate instead of silently serving stale app logic');

assert.match(windows,/daily-windows\.js\?v=11\.72/,'Daily Windows HTML must point at the current v11.72 controller');
assert.doesNotMatch(windows,/daily-windows\.js\?v=11\.71/,'obsolete Daily Windows controller cache key must be gone');

// The service worker is intentionally push-only. If a future build starts
// intercepting fetches, caching becomes a separate correctness concern and
// this test should fail until that strategy has its own versioning contract.
assert.doesNotMatch(sw,/addEventListener\(['\"]fetch['\"]/,'push service worker must not silently become an app-shell cache');
assert.doesNotMatch(sw,/caches\.(?:open|match)/,'push service worker must not own static asset caching');

console.log('Cache revalidation smoke: JS revalidation, Daily Windows cache key and push-only SW passed.');
