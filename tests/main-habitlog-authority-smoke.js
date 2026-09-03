/* Main stale materialized habit cache -> canonical day-log regression
   Performed-by: ChatGPT (OpenAI), 2026-09-04
   Run with: node tests/main-habitlog-authority-smoke.js */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'checkin.js'), 'utf8');
const start = source.indexOf('// v7.7: Main still contains a v8.9 legacy hlogHas() migration fallback');
const end = source.indexOf('\n(function () {', start);
assert.ok(start >= 0 && end > start, 'canonical habit read guard must exist before streak engine');
const guardSource = source.slice(start, end);

const store = {
  rpg_habitlog_v1: JSON.stringify({
    walking: { '2026-09-02': true },
    budgeting: { '2026-09-03': true }
  })
};
const writes = [];
const localStorage = {
  getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
  setItem(key, value) { writes.push([key, value]); store[key] = String(value); }
};

const materialized = {
  walking: { score: 10, streak: 2, lastChecked: '2026-09-03' }, // stale: missing in day-log
  sleep: { score: 4, streak: 3, lastChecked: '2026-09-03' },   // stale: no canonical dates at all
  budgeting: { score: 3, streak: 1, lastChecked: '2026-09-03' } // valid
};
const window = {
  getHabits() { return JSON.parse(JSON.stringify(materialized)); }
};
const context = { window, localStorage, JSON, Object, console };
vm.createContext(context);
vm.runInContext(guardSource, context, { filename: 'checkin-canonical-habit-read-guard.js' });

const guarded = window.getHabits();
assert.equal(guarded.walking.lastChecked, '2026-09-02', 'stale lastChecked must fall back to newest canonical date');
assert.equal(guarded.sleep.lastChecked, null, 'habit with no canonical dates must expose no lastChecked');
assert.equal(guarded.sleep.streak, 0, 'habit with no canonical dates must not expose a ghost streak');
assert.equal(guarded.budgeting.lastChecked, '2026-09-03', 'valid canonical lastChecked must remain unchanged');
assert.equal(writes.length, 0, 'read guard itself must never mutate storage');
assert.equal(window.getHabits.__gamenfyCanonicalHabitReadGuard, true, 'guard marker missing');

// Simulate Main's old v8.9 hlogHas fallback. With the guard installed, a stale
// materialized lastChecked can no longer write itself back into canonical history.
function hlogLoad() { return JSON.parse(localStorage.getItem('rpg_habitlog_v1') || '{}'); }
function hlogSave(value) { localStorage.setItem('rpg_habitlog_v1', JSON.stringify(value)); }
function hlogSet(key, date, value) {
  const log = hlogLoad();
  log[key] = log[key] || {};
  if (value) log[key][date] = true; else delete log[key][date];
  hlogSave(log);
}
function legacyMainHlogHas(key, date) {
  const log = hlogLoad();
  if (log[key] && log[key][date]) return true;
  const h = (window.getHabits ? window.getHabits() : {})[key] || {};
  if (h.lastChecked === date) { hlogSet(key, date, true); return true; }
  return false;
}

assert.equal(legacyMainHlogHas('walking', '2026-09-03'), false, 'stale Walking date must not resurrect');
assert.equal(legacyMainHlogHas('sleep', '2026-09-03'), false, 'stale Sleep date must not resurrect');
assert.equal(legacyMainHlogHas('walking', '2026-09-02'), true, 'real canonical Walking date must still read checked');
const finalLog = hlogLoad();
assert.equal(finalLog.walking['2026-09-03'], undefined, 'guarded Main fallback must not create stale Walking history');
assert.equal(finalLog.sleep && finalLog.sleep['2026-09-03'], undefined, 'guarded Main fallback must not create stale Sleep history');

const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(indexSource.indexOf('xp.js') < indexSource.indexOf('checkin.js'), 'checkin guard must load after xp.js so getHabits exists');
assert.match(indexSource, /if\(h\.lastChecked===date\)\{ hlogSet\(key,date,true\); return true; \}/, 'test must stay anchored to the legacy Main fallback it protects');

console.log('Main habitlog authority smoke: stale materialized lastChecked cannot resurrect canonical Daily dates.');
