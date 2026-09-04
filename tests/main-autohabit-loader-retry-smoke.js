/* Main synchronous Fitbit reconciler loader retry smoke — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'checkin.js'), 'utf8');
const start = source.indexOf('// v11.7: keep the Fitbit -> Daily Mission reconciliation separate from xp.js,');
const end = source.indexOf('// v11.6: Main\'s existing Reset & start fresh marker');
assert.ok(start >= 0 && end > start, 'Main reconciler loader block must remain extractable');
const block = source.slice(start, end);

const appended = [];
const timers = [];
const legacy = function legacyAutoCheck() { return Promise.resolve(99); };
const window = { autoCheckHealthHabits: legacy };
const document = {
  querySelector(selector) {
    if (selector !== 'script[data-gamenfy-autohabit-reconcile]') return null;
    return appended.find((script) => !script.removed) || null;
  },
  createElement(tag) {
    assert.equal(tag, 'script');
    return {
      dataset: {},
      removed: false,
      remove() { this.removed = true; }
    };
  },
  head: {
    appendChild(script) { appended.push(script); return script; }
  }
};
function setTimeoutStub(fn, delay) { timers.push({ fn, delay }); return timers.length; }

vm.runInNewContext(block, {
  window,
  document,
  Promise,
  Math,
  setTimeout: setTimeoutStub
}, { filename: 'checkin-main-autohabit-loader.js' });

assert.equal(window.__gamenfyAutohabitLoaderInstalled, true, 'Main claims synchronous loader ownership immediately');
assert.equal(window.__gamenfyLegacyAutoCheckHealthHabits, legacy, 'legacy checker is retained only as diagnostic reference');
assert.notEqual(window.autoCheckHealthHabits, legacy, 'legacy writer is synchronously replaced before the network request');
assert.equal(appended.length, 1, 'Main injects one reconciler request');
assert.equal(appended[0].src, 'autohabit-reconcile.js?v=11.7', 'Main requests the current reconciler version');
assert.equal(window.__gamenfyAutohabitSessionLoaderLoaded, undefined, 'Main does not claim successful loading before onload');

let callbackCalls = 0;
window.autoCheckHealthHabits(() => { callbackCalls += 1; });
assert.equal(callbackCalls, 0, 'placeholder queues UI callbacks instead of invoking the old writer');
assert.equal(window.__gamenfyAutoHabitQueuedCallbacks.length, 1, 'callback remains queued for authoritative reconciler startup');

appended[0].onerror();
assert.equal(appended[0].removed, true, 'failed Main script node is removed');
assert.equal(window.__gamenfyAutohabitSessionLoaderLoaded, undefined, 'failed Main request never records success');
assert.equal(timers.length, 1, 'Main schedules a bounded retry after script failure');
assert.equal(timers[0].delay, 250, 'first Main retry uses short backoff');

timers.shift().fn();
assert.equal(appended.length, 2, 'Main retry injects a fresh reconciler script');
assert.equal(appended[1].src, 'autohabit-reconcile.js?v=11.7');
appended[1].onload();
assert.equal(window.__gamenfyAutohabitSessionLoaderLoaded, true, 'successful retry records session loader success');

assert.match(block, /if \(failures > 5\) return;/, 'Main retry loop stays bounded');
assert.match(block, /Math\.min\(4000, 250 \* Math\.pow\(2, failures - 1\)\)/, 'Main uses capped exponential retry backoff');

console.log('Main Fitbit reconciler loader smoke passed: synchronous legacy block stays intact and failed script downloads retry safely.');
