/* Wishlist outbound links and optional finance venture regression, October 2026. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const finance = fs.readFileSync('finance.html', 'utf8');
const venturesHtml = fs.readFileSync('ventures-workspace.html', 'utf8');
const ventureJs = fs.readFileSync('ventures.js', 'utf8');

// Parse inline app scripts to catch syntax regressions before deploy.
for (const [page, html] of [['finance', finance], ['ventures', venturesHtml]]) {
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
  for (const [, code] of scripts) if (code.trim()) new vm.Script(code, {filename: page + '.inline.js'});
}
new vm.Script(ventureJs, {filename: 'ventures.js'});

// Existing wishlist entries (without a URL) still render in the same store.
assert.match(finance, /storeGet\('wishlist'\) \|\| \[\]/);
assert.match(finance, /storeSet\('wishlist', arr\)/);
assert.match(finance, /syncedKeys:\s*\[[^\]]*'wishlist'/);
assert.match(finance, /id="wishUrl"/);
assert.match(finance, /\.wish-row-link-edit/);
assert.match(finance, /target="_blank" rel="noopener noreferrer"/);
assert.match(finance, /arr\[origIdx\]\.url = value/);
assert.match(finance, /data-i="' \+ origIdx/);
const a = finance.indexOf('  function wishSafeUrl(raw) {');
const b = finance.indexOf('  function renderWishlist() {');
assert.ok(a > 0 && b > a, 'URL normalization must be present in the wishlist');
const normalize = vm.runInNewContext(finance.slice(a,b) + '\nwishSafeUrl', {URL});
assert.equal(normalize(''), '');
assert.equal(normalize('bol.com/nl/nl/'), 'https://bol.com/nl/nl/');
assert.equal(normalize('https://www.example.com/p?a=1&b=2'), 'https://www.example.com/p?a=1&b=2');
for (const invalid of ['javascript:alert(1)','data:text/html,test','ftp://example.com','https://user:secret@example.com','invalid website','https://']) {
  assert.equal(normalize(invalid), null, invalid);
}

// Additive Venture seed: do not overwrite or remove a saved venture.
const store = new Map([['rpg_ventures_v1',JSON.stringify({v:1,ventures:[{id:'saved_test',name:'Eigen project',status:'active',phases:[]} ]})]]);
const ls = {getItem:k=>store.get(k)||null, setItem:(k,v)=>store.set(k,v)};
const sandbox = {window:{}, localStorage:ls, console};
vm.runInNewContext(ventureJs, sandbox);
const saved = sandbox.window.Ventures.load().ventures;
assert.ok(saved.some(v=>v.id==='saved_test'));
const financeVenture = saved.find(v=>v.id==='freelance_finance');
assert.ok(financeVenture, 'existing users should receive finance idea');
assert.equal(financeVenture.status, 'exploring');
assert.equal(financeVenture.resources.length, 3);
assert.ok(financeVenture.phases.length >= 3);
assert.ok(!sandbox.window.Ventures.activeVentures().some(v=>v.id==='freelance_finance'), 'research should not automatically become an active venture');
assert.match(venturesHtml, /ventureResources\(v\)\+workbench\(v\)/);
assert.match(venturesHtml, /ventures\.js\?v=11\.7/);
console.log('Finance wishlist links and exploratory freelance finance venture passed.');
