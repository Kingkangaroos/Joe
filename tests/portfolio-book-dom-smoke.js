'use strict';
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.resolve(__dirname, '..');
class E {
  constructor(tag) { this.tagName = tag; this.children = []; this.events = {}; this.attrs = {}; this.dataset = {}; this.classes = new Set(); this.value = ''; this.style = { removeProperty(k) { delete this[k]; } }; this.classList = { add: (...v) => v.forEach(x => this.classes.add(x)), remove: (...v) => v.forEach(x => this.classes.delete(x)), contains: v => this.classes.has(v), toggle: (v, force) => { const yes = force === undefined ? !this.classes.has(v) : force; if (yes) this.classes.add(v); else this.classes.delete(v); return yes; } }; }
  set className(v) { this.classes = new Set(v.split(/\s+/)); } get className() { return [...this.classes].join(' '); }
  set textContent(v) { this.text = v; this.children = []; } get textContent() { return this.text || ''; }
  append(...nodes) { for (const n of nodes) { n.parent = this; this.children.push(n); } } replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  setAttribute(k, v) { this.attrs[k] = v; } removeAttribute(k) { delete this.attrs[k]; } addEventListener(k, fn) { this.events[k] = fn; }
  querySelectorAll(tags) { return descend(this).filter(e => tags.split(',').includes(e.tagName)); }
  closest(tags) { let e = this; while (e) { if (tags.split(',').includes(e.tagName)) return e; e = e.parent; } return null; }
  focus() { this.focused = true; } showModal() { this.open = true; } close() { this.open = false; this.events.close?.(); }
  setPointerCapture(id) { this.captured = id; } hasPointerCapture(id) { return this.captured === id; } releasePointerCapture() { this.captured = null; }
  getBoundingClientRect() { return { width: 760 }; }
}
const descend = e => e.children.flatMap(c => [c, ...descend(c)]);
const html = fs.readFileSync(path.join(root, 'website-ventures-portfolio-book-lab.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'website-ventures-portfolio-book-lab.js'), 'utf8');
function run(reduced = false, supports = true) {
  const ids = new Map(); for (const [, tag, id] of html.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"/g)) ids.set(id, new E(tag));
  const timers = new Map(), events = {}, body = new E('body'); let timer = 0;
  const document = { body, activeElement: ids.get('book'), hidden: false, getElementById: id => ids.get(id), createElement: t => new E(t), addEventListener: (k, f) => events[k] = f };
  vm.runInNewContext(source, { document, window: { matchMedia: () => ({ matches: reduced }) }, location: { search: '?embed=1' }, URLSearchParams, CSS: { supports: () => supports }, setTimeout: f => { timers.set(++timer, f); return timer; }, clearTimeout: id => timers.delete(id) });
  const $ = id => ids.get(id), flush = () => { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(f => f()); };
  return { $, flush, body, document, timers };
}
const { $, flush, body } = run();
const book = $('book'), leaves = book.children.filter(e => e.classes.has('leaf'));
assert.equal(leaves.length, 6); assert(body.classes.has('folio-embedded')); assert.equal($('readingProjects').children.length, 5);
assert.equal(leaves[0].children[0].inert, false); assert(leaves[0].children[1].inert); assert.equal($('previousPage').disabled, true);
$('openBook').events.click(); assert.equal($('pageCounter').textContent, '01 / 06'); assert($('nextPage').disabled); assert($('openBook').hidden); flush();
assert(leaves[0].classes.has('turned')); assert.equal(leaves[0].children[1].inert, false); assert.equal(leaves[1].children[0].inert, false); assert(leaves[1].children[1].inert);
let prevented = 0; book.events.keydown({ target: book, key: 'ArrowRight', preventDefault() { prevented++; } }); flush(); assert.equal($('pageCounter').textContent, '02 / 06');
book.events.keydown({ target: new E('input'), key: 'Home', preventDefault() { throw Error('Do not capture input keys'); } }); assert.equal($('pageCounter').textContent, '02 / 06');
$('chapterJump').events.change({ target: { value: '5' } }); assert.equal($('pageCounter').textContent, '05 / 06');
$('chapterJump').events.change({ target: { value: 'NaN' } }); assert.equal($('pageCounter').textContent, '05 / 06');
$('nextPage').events.click(); flush(); assert.equal($('pageCounter').textContent, '06 / 06'); assert.equal($('nextPage').disabled, true); assert.equal($('finalPage').inert, false);
$('restartBook').events.click(); assert.equal($('pageCounter').textContent, '00 / 06'); assert($('finalPage').inert);
const pointer = (x, y, extra = {}) => ({ pointerId: 1, button: 0, target: book, clientX: x, clientY: y, preventDefault() { prevented++; }, ...extra });
const before = prevented; book.events.pointerdown(pointer(200, 100)); book.events.pointermove(pointer(195, 180)); book.events.pointerup(pointer(195, 180)); assert.equal(prevented, before); assert.equal($('pageCounter').textContent, '00 / 06');
book.events.pointerdown(pointer(240, 100)); book.events.pointermove(pointer(100, 105)); assert.match(leaves[0].style.transform, /rotateY/); book.events.pointerup(pointer(100, 105)); flush(); assert.equal($('pageCounter').textContent, '01 / 06');
book.events.pointerdown(pointer(100, 100)); book.events.pointermove(pointer(240, 104)); book.events.pointercancel(pointer(240, 104)); assert.equal($('pageCounter').textContent, '01 / 06');
book.events.pointerdown(pointer(240, 100)); book.events.pointermove(pointer(190, 101)); book.events.pointermove(pointer(400, 101)); book.events.pointerup(pointer(400, 101)); assert.equal($('pageCounter').textContent, '01 / 06', 'Reversing past the starting point must not commit a forward turn');
const control = new E('button'); book.events.pointerdown(pointer(250, 100, { target: control })); book.events.pointermove(pointer(60, 101)); book.events.pointerup(pointer(60, 101)); assert.equal($('pageCounter').textContent, '01 / 06');
$('viewToggle').events.click(); assert(book.classes.has('is-top')); assert.equal($('viewToggle').attrs['aria-pressed'], 'true');
$('readingToggle').events.click(); assert.equal($('deskStage').hidden, true); assert.equal($('readingView').hidden, false); assert.equal($('viewToggle').disabled, true);
const card = $('readingProjects').children[1], caseButton = descend(card).find(e => e.tagName === 'button'); caseButton.events.click(); assert.equal($('caseDialog').open, true); assert.match($('caseTitle').textContent, /Aurel/); assert.equal($('casePoints').children.length, 3); assert.equal($('caseDemo').href, 'site-plumbing-flagship-v1.html?from=ventures'); $('closeCase').events.click(); assert.equal($('caseDialog').open, false);
$('readingToggle').events.click(); assert.equal($('deskStage').hidden, false); assert.equal($('pageCounter').textContent, '01 / 06');
for (const im of descend(book).filter(e => e.tagName === 'img')) { assert(fs.statSync(path.join(root, im.src)).size > 500); assert(im.srcset.includes('1280w')); }
const quiet = run(true); quiet.$('openBook').events.click(); assert.equal(quiet.timers.size, 0); assert.equal(quiet.$('nextPage').disabled, false);
assert.equal(run(false, false).$('readingView').hidden, false, 'Unsupported CSS-3D falls back to readable content');
for (const file of ['lab.html', 'ventures-workspace.html', 'sites.html']) assert(fs.readFileSync(path.join(root, file), 'utf8').includes('website-ventures-portfolio-book-lab.html'));
assert(!/localStorage|sessionStorage|supabase|fetch\(|innerHTML|requestAnimationFrame|autoplay/.test(source));
const css = fs.readFileSync(path.join(root, 'website-ventures-portfolio-book-lab.css'), 'utf8'); assert(css.includes('backface-visibility:hidden') && css.includes('preserve-3d') && css.includes('touch-action:pan-y') && css.includes('prefers-reduced-motion'));
console.log('Portfolio Book DOM: six two-sided leaves, page bounds, keyboard, vertical-first drag/cancel/reversal, controls, inert pages, modal, reading/reduced-motion/fallback, real local assets and app links pass. No browser rendering claim.');
