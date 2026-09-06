/* Routes cloud-durability regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const routes=fs.readFileSync(path.join(__dirname,'..','routes.html'),'utf8');
const xp=fs.readFileSync(path.join(__dirname,'..','xp.js'),'utf8');

assert.match(routes,/const RT_KEY = 'rpg_routes_v1'/,'Routes must keep one durable RPG state key');
assert.match(routes,/localStorage\.setItem\(RT_KEY, JSON\.stringify\(s\)\)/,'route progress must write through localStorage so shared sync can observe it');
assert.match(xp,/['\"]rpg_routes_v1['\"]/,'central RPG sync scope must include route progress');
assert.match(routes,/<script src="sync\.js\?v=11\.9"><\/script>/,'Routes must load the shared cloud-sync engine');
const xpPos=routes.indexOf('<script src="xp.js');
const syncPos=routes.indexOf('<script src="sync.js');
assert.ok(xpPos>=0&&syncPos>xpPos,'Routes may register RPG sync before the engine loads, but sync.js must arrive before DOMContentLoaded');
assert.match(xp,/document\.readyState==='loading'\) document\.addEventListener\('DOMContentLoaded', initRPGSync\)/,'xp.js must defer RPG registration until the page has loaded its later sync.js script');
console.log('Routes sync smoke: rpg_routes_v1 writes are connected to the canonical RPG cloud scope.');
