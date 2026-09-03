/* Smoke test for autohabit-reconcile.js
   Run with: node tests/autohabit-retrospective-smoke.js */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = process.argv[2] || path.join(__dirname, '..', 'autohabit-reconcile.js');
const code = fs.readFileSync(sourcePath, 'utf8');
const store = {
  rpg_autohabit_v1: JSON.stringify({
    'walking:2026-08-31': true,
    'sleep:2026-09-01': true,
    'sleep:2026-09-02': 'manual-off'
  }),
  rpg_habitlog_v1: JSON.stringify({ walking: { '2026-09-01': true, '2026-09-03': true } }),
  rpg_streak_v1: JSON.stringify({ days: {} })
};
const xpCalls = [];
const recomputes = [];
const scheduled = [];
const fetchUrls = [];
const localStorage = {
  getItem: key => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: key => { delete store[key]; }
};
function CustomEvent(type, init) { this.type = type; this.detail = init && init.detail; }
function fakeSetTimeout(fn, ms) { scheduled.push({ fn, ms }); return scheduled.length; }
const document = { hidden: false, addEventListener() {} };
const healthData = {
  '2026-08-31': { steps: 11239, sleepMinutes: 417 },
  '2026-09-01': { steps: 10698, sleepMinutes: 386 },
  '2026-09-02': { steps: 11785, sleepMinutes: 500 },
  '2026-09-03': { steps: 12000, sleepMinutes: 456 }
};
function currentRemoteRpg(){
  return {
    rpg_autohabit_v1: JSON.parse(store.rpg_autohabit_v1 || '{}'),
    rpg_habitlog_v1: JSON.parse(store.rpg_habitlog_v1 || '{}'),
    rpg_streak_v1: JSON.parse(store.rpg_streak_v1 || '{"days":{}}')
  };
}
const window = {
  localStorage,
  gamenfyAuthReady: Promise.resolve(),
  getCharacter: () => ({ xpLog: [] }),
  viewedDateStr: () => '2026-09-03',
  gamenfyAuthedFetch: async url => {
    fetchUrls.push(url);
    return {
      ok: true,
      json: async () => [
        { key: 'health_fitbit', data: healthData, updated_at: '2026-09-03T11:15:15.789Z' },
        { key: 'rpg', data: currentRemoteRpg(), updated_at: '2026-09-03T11:12:10.174Z' }
      ]
    };
  },
  recomputeHabitFromLog: key => recomputes.push(key),
  addXP: (key, amount, reason) => xpCalls.push({ key, amount, reason }),
  addEventListener() {},
  dispatchEvent() {},
  toggleMission(key) {
    const log = JSON.parse(localStorage.getItem('rpg_habitlog_v1') || '{}');
    log[key] = log[key] || {};
    if (log[key]['2026-09-03']) delete log[key]['2026-09-03'];
    else log[key]['2026-09-03'] = true;
    localStorage.setItem('rpg_habitlog_v1', JSON.stringify(log));
  }
};
const context = {
  window, document, localStorage, CustomEvent,
  setTimeout: fakeSetTimeout, clearTimeout() {},
  Date, Number, Object, String, JSON, RegExp, Promise, console
};
vm.createContext(context);
vm.runInContext(code, context);

(async () => {
  const added = await window.autoCheckHealthHabits();
  let log = JSON.parse(store.rpg_habitlog_v1);
  let state = JSON.parse(store.rpg_autohabit_v1);

  assert.ok(fetchUrls[0].includes('key=in.(health_fitbit,rpg)'), 'health and current RPG cloud baseline are fetched together');
  assert.equal(log.walking['2026-08-31'], true, 'late finalized steps should backfill during legacy migration');
  assert.equal(log.sleep['2026-09-03'], true, 'today sleep should auto-complete');
  assert.equal(log.sleep && log.sleep['2026-09-02'], undefined, 'manual-off must be respected');
  assert.equal(state['sleep:2026-09-01'], undefined, 'legacy settled miss must reopen');
  assert.equal(state.__retrospective_v2_migrated, true, 'the ambiguous legacy auto-ledger is migrated exactly once');
  assert.ok(added >= 2, 'expected retrospective additions');
  assert.ok(xpCalls.some(x => x.reason.includes('2026-08-31')), 'backfill should be auditable in XP log');
  assert.deepEqual(new Set(recomputes), new Set(['walking', 'sleep']), 'habit scores should be recomputed from the day log');

  // Main route: explicit wrapper creates manual-off immediately.
  window.toggleMission('walking');
  log = JSON.parse(store.rpg_habitlog_v1);
  state = JSON.parse(store.rpg_autohabit_v1);
  assert.equal(log.walking['2026-09-03'], undefined, 'manual uncheck should remove the day');
  assert.equal(state['walking:2026-09-03'], 'manual-off', 'Main manual uncheck should create suppression marker');

  await window.autoCheckHealthHabits();
  log = JSON.parse(store.rpg_habitlog_v1);
  assert.equal(log.walking['2026-09-03'], undefined, 'Fitbit must not fight a Main manual uncheck');

  // Character/backdated route does not call Main's toggleMission. Simulate its
  // authoritative dhSet(false): the previously confirmed ledger entry remains true.
  // After migration, that mismatch itself is sufficient evidence of a deliberate
  // uncheck and the reconciler must convert it to manual-off instead of restoring it.
  log = JSON.parse(store.rpg_habitlog_v1);
  delete log.walking['2026-08-31'];
  store.rpg_habitlog_v1 = JSON.stringify(log);
  await window.autoCheckHealthHabits();
  log = JSON.parse(store.rpg_habitlog_v1);
  state = JSON.parse(store.rpg_autohabit_v1);
  assert.equal(log.walking['2026-08-31'], undefined, 'Fitbit must not fight a Character/backdated uncheck after migration');
  assert.equal(state['walking:2026-08-31'], 'manual-off', 'confirmed day disappearing after migration becomes manual-off');

  assert.ok(code.includes('__gamenfy_sync_dirty_v1:rpg'), 'reconciler understands sync.js dirty journal');
  assert.ok(code.includes('waitForCloudBaseline'), 'reconciler waits for cloud/local convergence before mutation');
  assert.ok(code.includes('__retrospective_v2_migrated'), 'reconciler has a one-time ambiguity migration marker');
  console.log('autohabit retrospective smoke: ok');
})().catch(err => { console.error(err); process.exitCode = 1; });