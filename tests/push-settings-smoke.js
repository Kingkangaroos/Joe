/* Settings ↔ real push subscription regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const settings=fs.readFileSync(path.join(ROOT,'settings.html'),'utf8');
const push=fs.readFileSync(path.join(ROOT,'push.js'),'utf8');

assert.ok(settings.includes('<script src="push.js?v=10.98" defer></script>'),'Settings must load the real push client');
assert.ok(settings.includes('window.GamenfyPush.enable()'),'Settings enable toggle must call real push subscribe');
assert.ok(settings.includes('window.GamenfyPush.disable()'),'Settings disable toggle must call real push unsubscribe');
assert.ok(!settings.includes('scheduleReminder()'),'legacy in-page clock notification must stay retired');
assert.ok(settings.includes('Push on this device'),'Settings copy must describe device subscription truthfully');

const disableMatch=push.match(/async function disable\s*\([^)]*\)\s*\{([\s\S]*?)\n  \}\n\n  async function status/);
assert.ok(disableMatch,'push client must expose a parseable disable path');
const disableBody=disableMatch[1];
assert.ok(disableBody.includes('await removeFromCloud(endpoint)'),'disable must remove server reachability');
assert.ok(disableBody.includes('await sub.unsubscribe()'),'disable must unsubscribe the browser endpoint');
assert.ok(push.includes('window.GamenfyPush = { enable, disable, status, isStandalone }'),'public push API must include disable');
assert.ok(disableBody.indexOf('await removeFromCloud(endpoint)') < disableBody.indexOf('await sub.unsubscribe()'),'cloud opt-out must happen before local unsubscribe so failures cannot be reported as success');

console.log('Push Settings smoke: Settings uses real device subscribe/unsubscribe and legacy local reminder scheduling stays retired.');
