/* Jarvis browser-client reliability regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','jarvis.html'),'utf8');

assert.match(src,/document\.addEventListener\('DOMContentLoaded',async\(\)=>\{/,'Jarvis history should start after deferred auth scripts have executed');
assert.match(src,/if\(window\.gamenfyAuthReady\) await window\.gamenfyAuthReady/,'Jarvis history should wait for authenticated readiness');
assert.doesNotMatch(src,/\n\s*jvLoadHistory\(\);\s*\n<\/script>/,'Jarvis must not fire history directly during parser execution');
assert.match(src,/if\(jvBusy \|\| \(jvRec && jvRec\.state==='recording'\)\) return;/,'text send must not race an active voice recording');
assert.match(src,/window\.jvMicTap=async function\(\)\{[\s\S]{0,150}?if\(jvBusy\) return;/,'voice recording must not start while a request is in flight');
assert.ok((src.match(/document\.getElementById\('jvMic'\)\.disabled=true/g)||[]).length>=2,'text/audio requests should lock the mic while busy');
assert.match(src,/jvRec\.start\(\);\s*\n\s*document\.getElementById\('jvSend'\)\.disabled=true;/,'recording should lock text-send until the audio path settles');
console.log('Jarvis client smoke: auth-ready history and text/voice mutual exclusion are locked.');
