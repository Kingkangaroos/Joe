/* Finance → Venture Lab deeplink contract — ChatGPT (OpenAI), 2026-09-07 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','finance.html'),'utf8');
assert.ok(source.includes("const requestedTab = new URLSearchParams(location.search).get('tab');"),'existing deterministic Finance tab contract stays intact');
assert.ok(source.includes("const pageParams = new URLSearchParams(location.search);"),'Finance keeps the full query for Venture sub-navigation');
assert.ok(source.includes("const requestedSpace = pageParams.get('space');"),'Finance forwards Venture sub-space');
assert.ok(source.includes("const requestedVenture = pageParams.get('venture');"),'Finance forwards selected venture');
assert.ok(source.includes("['overview','lab','pipeline'].includes(requestedSpace)"),'only known Venture spaces are accepted');
assert.ok(source.includes("/^[a-z0-9_-]{1,64}$/i.test(requestedVenture || '')"),'venture id is constrained before iframe forwarding');
assert.ok(source.includes("venturesFrame.src = 'ventures-workspace.html?' + params.toString();"),'Finance rewrites embedded Venture URL deterministically');
assert.ok(source.includes('id="venturesWorkspaceFrame"'),'Ventures iframe remains present');
console.log('finance venture deeplink smoke passed: Website Lab can return to the exact Venture Lab context without changing Finance tab semantics.');
