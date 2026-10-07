'use strict';
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.resolve(__dirname, '..');
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.events = {}; this.attrs = {}; }
  append(...nodes) { this.children.push(...nodes); } replaceChildren(...nodes) { this.children = nodes; }
  querySelector(tag) { return this.children.find(e => e.tagName === tag); }
  addEventListener(k, f) { this.events[k] = f; } setAttribute(k, v) { this.attrs[k] = v; }
  focus() { this.focused = true; } scrollIntoView() { this.scrolled = true; }
}
const elements = new Map(['creditAppPanel', 'creditAppMount', 'creditAppClose'].map(id => [id, new Element('div')]));
elements.get('creditAppPanel').hidden = true;
const events = {}, messages = [], frames = [];
const document = { getElementById: id => elements.get(id), documentElement: { scrollHeight: 1700 }, addEventListener: (k, f) => events[k] = f, createElement: t => { const e = new Element(t); frames.push(e); return e; } };
const window = { parent: { postMessage: (data, target) => messages.push({ data, target }) } };
const location = { href: 'https://fixture.test/ventures-workspace.html?embed=1', origin: 'https://fixture.test' };
const source = fs.readFileSync(path.join(root, 'credit-atelier-in-app.js'), 'utf8');
vm.runInNewContext(source, { document, window, location, URL });
function click(href, options = {}) {
  const anchor = new Element('a'); anchor.href = href;
  const event = { target: { closest: () => anchor }, preventDefault() { this.prevented = true; }, ...options };
  events.click(event); return { anchor, event };
}
const panel = elements.get('creditAppPanel'), mount = elements.get('creditAppMount'), close = elements.get('creditAppClose');
assert.equal(frames.length, 0, 'No asset iframe before explicit click');
assert.equal(click('https://external.test/website-ventures-credit-rescue-lab.html').event.prevented, undefined);
assert.equal(click('https://fixture.test/lab-3d-test-6.html').event.prevented, undefined);
assert.equal(click('website-ventures-credit-rescue-lab.html', { ctrlKey: true }).event.prevented, undefined);
const first = click('website-ventures-credit-rescue-lab.html?world=gamenfy&owner=not-forwarded');
assert(first.event.prevented); assert.equal(panel.hidden, false); assert(close.focused && panel.scrolled);
assert.equal(mount.children.length, 1);
let frame = mount.children[0]; assert.equal(frame.src, 'https://fixture.test/website-ventures-credit-rescue-lab.html?embed=1&world=gamenfy');
assert(!frame.src.includes('owner=')); assert.match(frame.allow, /clipboard-write/);
frame.events.load(); assert.equal(messages[0].target, location.origin);
assert.deepEqual(Object.keys(messages[0].data).sort(), ['height', 'type']);
click('website-ventures-credit-rescue-lab.html?world=gamenfy'); assert.equal(mount.children[0], frame, 'Reopening same world does not reset the session');
const second = click('website-ventures-credit-rescue-lab.html?world=agency'); assert.equal(first.anchor.attrs['aria-expanded'], 'false');
assert.notEqual(mount.children[0], frame);
close.events.click(); assert.equal(panel.hidden, true); assert.equal(mount.children.length, 0, 'Closing releases frame and media');
assert(second.anchor.focused); assert.equal(second.anchor.attrs['aria-expanded'], 'false');
click('website-ventures-credit-rescue-lab.html?world=unknown'); assert.equal(mount.children[0].src, 'https://fixture.test/website-ventures-credit-rescue-lab.html?embed=1');
for (const file of ['lab.html', 'ventures-workspace.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert(html.includes('credit-atelier-in-app.js?v=1')); assert(html.includes('credit-atelier-in-app.css?v=1'));
  assert(html.includes('id="creditAppPanel"') && html.includes('id="creditAppMount"') && html.includes('id="creditAppClose"'));
  assert(!/<iframe[^>]*src="website-ventures-credit-rescue/.test(html), 'No eager asset loading');
}
assert(!/localStorage|sessionStorage|supabase|fetch\(|gamenfyUserId/.test(source), 'Portal does not use account/app data or make writes');
assert(fs.readFileSync(path.join(root, 'website-ventures-credit-rescue-lab.css'), 'utf8').includes('.atelier-embedded .top'));
console.log('Credit Atelier in-app: delegated Lab/Ventures links, lazy same-origin iframe, strict path/world, stripped context, close cleanup, focus return and no state writes pass.');
