'use strict';
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.resolve(__dirname, '..');
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.dataset = {}; this.events = {}; this.paused = true; this.value = ''; }
  set textContent(v) { this.text = v; this.children = []; } get textContent() { return this.text || ''; }
  append(...nodes) { this.children.push(...nodes); } replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(k, v) { this[k] = v; } addEventListener(k, fn) { this.events[k] = fn; }
  pause() { this.paused = true; } async play() { this.paused = false; }
  focus() { this.focused = true; } select() { this.selected = true; }
}
const descend = e => e.children.flatMap(c => [c, ...descend(c)]);
(async () => {
  const elements = new Map(), all = [], requests = [], copied = [];
  const html = fs.readFileSync(path.join(root, 'website-ventures-credit-rescue-lab.html'), 'utf8');
  for (const [, id] of html.matchAll(/id="([^"]+)"/g)) elements.set(id, new Element('div'));
  const filters = ['all', 'image', 'video'].map(k => { const e = new Element('button'); e.dataset.kind = k; return e; });
  const document = {
    getElementById: id => elements.get(id), hidden: false, addEventListener() {},
    createElement: tag => { const e = new Element(tag); all.push(e); return e; },
    querySelectorAll: q => q === '[data-kind]' ? filters : q === '[data-world]' ? all.filter(e => e.dataset.world) : q === '#assetGrid video' ? descend(elements.get('assetGrid')).filter(e => e.tagName === 'video') : []
  };
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'WEBSITE-VENTURES-CREDIT-RESCUE-2026-10-07.json')));
  const navigator = { clipboard: { writeText: async text => copied.push(text) } };
  const blockedStorage = { setItem() { throw Error('No real-state writes'); }, getItem() { throw Error('No persisted review'); } };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'website-ventures-credit-rescue-lab.js'), 'utf8'), {
    document, navigator, localStorage: blockedStorage, sessionStorage: blockedStorage, location: { search: '' }, URLSearchParams,
    fetch: async (url, options) => { requests.push({ url, options }); return { ok: true, json: async () => manifest }; },
    requestAnimationFrame: () => 1, cancelAnimationFrame() {}
  });
  await new Promise(resolve => setImmediate(resolve));
  const $ = id => elements.get(id), grid = () => $('assetGrid');
  const asset = n => grid().children.find(e => e.dataset.asset === n);
  const vote = (n, v) => descend(asset(n)).find(e => e.dataset.vote === v);
  const note = n => descend(asset(n)).find(e => e.id === 'reviewNote' + n);
  const world = name => all.find(e => e.tagName === 'button' && e.dataset.world === name);
  assert.equal(grid().children.length, 6); assert.equal($('copyReview').disabled, true);
  vote(1, 'yes').events.click(); assert.equal(vote(1, 'yes')['aria-pressed'], 'true');
  assert.match($('reviewCount').textContent, /^1 \/ 22 beoordeeld/);
  note(1).value = '<img src=x onerror=alert(1)>'; note(1).events.input();
  assert($('reviewExport').value.includes('<img src=x onerror=alert(1)>'), 'Free text remains a plain textarea value');
  assert.equal($('reviewExport').children.length, 0);
  world('plumbing').events.click(); vote(8, 'maybe').events.click();
  assert.match($('reviewCount').textContent, /^2 \/ 22 beoordeeld/);
  world('agency').events.click(); assert.equal(vote(1, 'yes')['aria-pressed'], 'true'); assert.equal(note(1).value, '<img src=x onerror=alert(1)>');
  vote(1, 'yes').events.click(); assert.equal(vote(1, 'yes')['aria-pressed'], 'false'); assert.match($('reviewCount').textContent, /^1 \/ 22 beoordeeld/);
  assert.match($('reviewExport').value, /Oordeel: Nog niet gekozen/);
  note(1).value = ' '; note(1).events.input(); assert(!$('reviewExport').value.includes('Asset 1 ·'));
  world('gamenfy').events.click(); note(28).value = 'x'.repeat(700); note(28).events.input();
  assert($('reviewExport').value.includes('x'.repeat(500))); assert(!$('reviewExport').value.includes('x'.repeat(501)));
  await $('copyReview').events.click(); assert.equal(copied.length, 1); assert.match(copied[0], /Asset 8.*Vakbedrijf/); assert.match(copied[0], /Asset 28/);
  navigator.clipboard.writeText = async () => { throw Error('Clipboard blocked'); };
  await $('copyReview').events.click(); assert($('reviewExport').focused && $('reviewExport').selected); assert.match($('copyStatus').textContent, /handmatig/);
  filters[1].events.click(); assert.equal(grid().children.length, 1); filters[0].events.click(); assert.equal(grid().children.length, 2);
  assert.equal(requests.length, 1); assert.equal(requests[0].url, 'WEBSITE-VENTURES-CREDIT-RESCUE-2026-10-07.json');
  assert.equal(all.filter(e => e.tagName === 'img')[0].srcset.includes('480w'), true);
  assert.match(html, /vóór herladen of sluiten/);
  console.log('Credit Atelier review DOM: cross-world choices, undo, safe notes, 500-char limit, clipboard fallback, responsive sources and zero storage/cloud writes pass.');
})().catch(error => { console.error(error); process.exitCode = 1; });
