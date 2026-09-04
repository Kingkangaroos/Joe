/* Workspace isolation safety regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const settings=fs.readFileSync(path.join(__dirname,'..','settings.html'),'utf8');
const sync=fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8');

// Current architecture is owner-scoped single-workspace. Until cloudKey and every
// direct app_state integration share a workspace namespace, Settings must fail safe.
assert.match(sync,/const cloudKey = appKey;/,'test is anchored to current single-workspace cloud-key architecture');
assert.match(settings,/Workspace · not active yet/,'Settings must not present workspace isolation as active');
assert.match(settings,/Separate cloud workspaces are not enabled yet\./,'Settings must explain the actual limitation');
assert.match(settings,/id="wsNameInput"[^>]*disabled/,'workspace input must stay disabled while isolation is not implemented');
assert.doesNotMatch(settings,/setGamenfyWorkspaceId\(newVal\)/,'Settings must not mutate a fake workspace selection');
assert.match(settings,/Separate cloud workspaces are not active yet\./,'programmatic saveWorkspace path must also fail safe');
console.log('Workspace safety smoke: UI cannot promise or activate isolation before the cloud architecture supports it.');
