/* Settings quote safety + legacy reminder retirement — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname,'..','settings.html'),'utf8');

assert.ok(src.includes("text.textContent = String(q || '')"),
  'user/synced quote content must be rendered via textContent');
assert.ok(!src.includes("'<div class=\"quote-text\">' + q"),
  'quote text must never be concatenated into innerHTML');
assert.ok(src.includes("del.addEventListener('click', () => window.deleteQuote(i))"),
  'quote deletion must use a DOM event handler rather than regenerated inline HTML');
assert.ok(!src.includes('notifTimeRow'), 'obsolete hidden 21:00 picker must stay retired');
assert.ok(!src.includes('saveNotifTime'), 'obsolete local reminder-time writer must stay retired');
assert.ok(!src.includes("const LAST_REMIND  = 'rpg_last_reminder'"),
  'Settings must not revive the obsolete in-page reminder marker');
assert.ok(src.includes('window.GamenfyPush.enable()'), 'real push enable route must remain active');
assert.ok(src.includes('window.GamenfyPush.disable()'), 'real push disable route must remain active');

console.log('Settings safety smoke: synced quote text is inert text; obsolete 21:00 reminder UI stays retired; real push remains authoritative.');
