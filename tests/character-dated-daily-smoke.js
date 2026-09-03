const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('sync.js', 'utf8');
const characterSrc = fs.readFileSync('character.html', 'utf8');
const marker = '// Character has a second public Daily Quest control';
const start = src.indexOf(marker);
if (start < 0) throw new Error('Character dated Daily guard missing from sync.js');
const guardSrc = src.slice(start);

function makeStorage(seed) {
  const data = Object.assign({}, seed || {});
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; },
    setItem(key, value) { data[key] = String(value); },
    removeItem(key) { delete data[key]; },
    dump() { return data; }
  };
}

function runGuard(options = {}) {
  const calls = { original: [], override: [], check: [], recompute: [], add: [], remove: [], events: [] };
  const localStorage = makeStorage(options.seed);
  const original = function(q, date) { calls.original.push([q, date]); return 'legacy'; };
  const window = {
    toggleDailyQuest: original,
    RPG_DEFAULT_SKILLS: {
      walking: { isHabit: true, label: '10k Steps', icon: '👟' },
      sleep: { isHabit: true, label: 'Sleep', icon: '😴' },
      budgeting: { isHabit: true, label: 'Budgeting', icon: '💰' }
    },
    checkHabitFor(skill, date) { calls.check.push([skill, date]); },
    recomputeHabitFromLog(skill) { calls.recompute.push(skill); },
    addXP(skill, amount, reason) { calls.add.push([skill, amount, reason]); },
    removeXP(skill, amount, reason) { calls.remove.push([skill, amount, reason]); },
    dispatchEvent(event) { calls.events.push(event); }
  };
  if (!options.noOverrideHelper) {
    window.setAutoHabitManualOverride = (skill, date, suppressed) => calls.override.push([skill, date, suppressed]);
  }

  const context = {
    window,
    localStorage,
    document: { readyState: 'complete', addEventListener() {} },
    setTimeout(fn) { fn(); return 1; },
    clearTimeout() {},
    CustomEvent: function(type, init) { this.type = type; this.detail = init && init.detail; },
    console
  };
  vm.createContext(context);
  vm.runInContext(guardSrc, context, { filename: 'sync-character-dated-guard.js' });
  return { window, localStorage, calls, original };
}

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const date = '2026-08-31';
const walking = { id: 'walking', skill: 'walking', label: '10k Steps', xp: 15, private: false };

// The obsolete Character migration is still physically present for rollback, but
// modern sync must retire it before its own 300 ms delayed callback can mutate data.
assert(characterSrc.includes('setTimeout(backfillDailyHabits,300)'), 'legacy Character backfill timing changed; review retirement ordering');
{
  const { localStorage } = runGuard();
  assert(localStorage.getItem('rpg_daily_habit_backfill_v1') === '1', 'modern sync must retire legacy Daily backfill');
}

// Complete a backdated Fitbit-backed mission.
{
  const { window, localStorage, calls } = runGuard();
  const result = window.toggleDailyQuest(walking, date);
  const log = JSON.parse(localStorage.getItem('rpg_habitlog_v1'));
  assert(result === true, 'backdated complete should return true');
  assert(log.walking[date] === true, 'backdated complete must write canonical habitlog');
  assert(calls.override.length === 1 && calls.override[0][2] === false, 'complete must clear manual-off for exact date');
  assert(calls.check.length === 1 && calls.check[0][1] === date, 'complete must credit the exact historical date');
  assert(calls.recompute.length === 1, 'complete must replay canonical habit state');
  assert(calls.add.length === 1 && calls.add[0][2].endsWith('(' + date + ')'), 'backdated +XP reason must carry activity date');
  assert(calls.original.length === 0, 'public dated mission must bypass legacy Character writer');
}

// Complete -> undo -> recheck stays symmetric and cannot be re-added while manually off.
{
  const { window, localStorage, calls } = runGuard();
  window.toggleDailyQuest(walking, date);
  const undone = window.toggleDailyQuest(walking, date);
  let log = JSON.parse(localStorage.getItem('rpg_habitlog_v1'));
  assert(undone === false, 'undo should return false');
  assert(!log.walking[date], 'undo must remove canonical completion');
  assert(calls.override[1][0] === 'walking' && calls.override[1][1] === date && calls.override[1][2] === true, 'undo must set manual-off for exact date');
  assert(calls.remove.length === 1 && calls.remove[0][2].endsWith('(' + date + ')'), 'backdated -XP reason must carry activity date');

  const redone = window.toggleDailyQuest(walking, date);
  log = JSON.parse(localStorage.getItem('rpg_habitlog_v1'));
  assert(redone === true && log.walking[date] === true, 'recheck must restore canonical completion');
  assert(calls.override[2][2] === false, 'recheck must clear manual-off again');
  assert(calls.add.length === 2, 'complete + recheck should each award exactly one +XP event');
}

// Standalone fallback must persist manual-off even if the reconciler helper is absent.
{
  const seed = { 'rpg_habitlog_v1': JSON.stringify({ walking: { [date]: true } }) };
  const { window, localStorage } = runGuard({ noOverrideHelper: true, seed });
  window.toggleDailyQuest(walking, date); // undo
  let auto = JSON.parse(localStorage.getItem('rpg_autohabit_v1'));
  assert(auto['walking:' + date] === 'manual-off', 'fallback undo must persist manual-off');
  window.toggleDailyQuest(walking, date); // recheck
  auto = JSON.parse(localStorage.getItem('rpg_autohabit_v1'));
  assert(!auto['walking:' + date], 'fallback recheck must clear manual-off');
}

// Private quests retain the existing PIN/private Character route.
{
  const { window, calls } = runGuard();
  const privateQuest = { id: 'no_porn', skill: 'no_porn', label: 'No Porn', xp: 45, private: true };
  const result = window.toggleDailyQuest(privateQuest, date);
  assert(result === 'legacy', 'private quest must delegate to legacy Character route');
  assert(calls.original.length === 1, 'private quest delegation missing');
  assert(calls.add.length === 0 && calls.remove.length === 0, 'guard must not mutate private XP itself');
}

console.log('character-dated-daily-smoke: ok');
