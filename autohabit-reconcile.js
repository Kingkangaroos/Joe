/* Gamenfy retrospective Fitbit -> Daily Mission reconciler
   ChatGPT (OpenAI), 2026-09-03.
   Fixes late Fitbit finalization without fighting deliberate manual unchecks.
   v11.4 also waits for the authoritative RPG cloud baseline before mutating. */
(function () {
  'use strict';

  var AUTO_KEY = 'rpg_autohabit_v1';
  var HABITLOG_KEY = 'rpg_habitlog_v1';
  var STREAK_KEY = 'rpg_streak_v1';
  var CHARACTER_KEY = 'rpg_character_v1';
  var HABITS_KEY = 'rpg_habits_v1';
  var DIRTY_KEY = '__gamenfy_sync_dirty_v1:rpg';
  var STATE_URL = 'https://ttxjsoahmtennnufgeqx.supabase.co/rest/v1/app_state?key=in.(health_fitbit,rpg)&select=key,data,updated_at';
  var AUTO_HABITS = {
    walking: { field: 'steps', min: 10000, label: '10k stappen' },
    sleep: { field: 'sleepMinutes', min: 420, label: '7 uur slaap' }
  };
  var BASELINE_KEYS = [HABITLOG_KEY, AUTO_KEY, STREAK_KEY, CHARACTER_KEY, HABITS_KEY];
  var inFlight = null;
  var callbacks = [];
  var lastFocusRun = 0;
  var baselineRetryCount = 0;

  function localDay() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function validDay(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }
  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  function sleep(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }
  function autoStateKey(habitId, dateStr) { return habitId + ':' + dateStr; }
  function isAutoHabit(key) { return Object.prototype.hasOwnProperty.call(AUTO_HABITS, key); }
  function habitlogHas(log, key, date) { return !!(log[key] && log[key][date]); }

  function dirtyJournal() {
    var journal = loadJson(DIRTY_KEY, { items: {} });
    return journal && journal.items && typeof journal.items === 'object' ? journal.items : {};
  }
  function localDirtyIsNewer(key, remoteMs) {
    var entry = dirtyJournal()[key];
    return !!(entry && Number(entry.ts || 0) > Number(remoteMs || 0));
  }
  function localMatchesRemote(key, value) {
    try { return localStorage.getItem(key) === JSON.stringify(value); }
    catch (e) { return false; }
  }

  // sync.js owns the cloud pull. The reconciler never force-applies a remote RPG
  // snapshot itself: that would mark it dirty and could push it back unnecessarily.
  // Instead, wait until sync.js has either applied each remote key OR recorded a
  // genuinely newer local dirty edit. If neither happens, abort safely and retry.
  async function waitForCloudBaseline(remoteRpg, remoteMs) {
    if (!remoteRpg || typeof remoteRpg !== 'object') return true;
    for (var attempt = 0; attempt < 30; attempt++) {
      var ready = BASELINE_KEYS.every(function (key) {
        if (!Object.prototype.hasOwnProperty.call(remoteRpg, key)) return true;
        if (localDirtyIsNewer(key, remoteMs)) return true;
        return localMatchesRemote(key, remoteRpg[key]);
      });
      if (ready) return true;
      await sleep(80);
    }
    return false;
  }

  function logEntryDate(entry) {
    var reason = String((entry && entry.reason) || '');
    var m = reason.match(/\((\d{4}-\d{2}-\d{2})\)\s*$/);
    return m ? m[1] : String((entry && entry.date) || '').slice(0, 10);
  }

  // Old versions used boolean true for both "goal met" and "past day settled as miss".
  // If a user explicitly unchecked a health habit, infer that from the newest manual
  // habit event so a one-time migration never re-checks something they deliberately undid.
  function inferManualOff(habitId, dateStr) {
    if (typeof window.getCharacter !== 'function') return false;
    try {
      var rows = (window.getCharacter().xpLog || []);
      for (var i = 0; i < rows.length; i++) {
        var e = rows[i] || {};
        if (e.skill !== habitId || logEntryDate(e) !== dateStr) continue;
        var reason = String(e.reason || '');
        if (reason.indexOf('Habit unchecked:') === 0) return true;
        if (reason.indexOf('Habit:') === 0) return false;
      }
    } catch (e) {}
    return false;
  }

  window.setAutoHabitManualOverride = function (habitId, dateStr, suppressed) {
    if (!isAutoHabit(habitId) || !validDay(dateStr)) return false;
    var state = loadJson(AUTO_KEY, {});
    var k = autoStateKey(habitId, dateStr);
    if (suppressed) state[k] = 'manual-off';
    else if (state[k] === 'manual-off') delete state[k];
    saveJson(AUTO_KEY, state);
    return true;
  };

  function currentViewedDate() {
    try {
      if (typeof window.viewedDateStr === 'function') {
        var d = window.viewedDateStr();
        if (validDay(d)) return d;
      }
    } catch (e) {}
    return localDay();
  }

  function installManualToggleGuard() {
    var original = window.toggleMission;
    if (typeof original !== 'function' || original.__gamenfyAutoHabitGuard) return;
    var wrapped = function (key) {
      if (!isAutoHabit(key)) return original.apply(this, arguments);
      var date = currentViewedDate();
      var beforeLog = loadJson(HABITLOG_KEY, {});
      var wasDone = habitlogHas(beforeLog, key, date);
      var result = original.apply(this, arguments);
      var afterLog = loadJson(HABITLOG_KEY, {});
      var isDone = habitlogHas(afterLog, key, date);
      if (wasDone !== isDone) window.setAutoHabitManualOverride(key, date, !isDone);
      return result;
    };
    wrapped.__gamenfyAutoHabitGuard = true;
    wrapped.__gamenfyAutoHabitOriginal = original;
    window.toggleMission = wrapped;
  }

  function refreshKnownMissionUI() {
    try { if (typeof window.renderMissions === 'function') window.renderMissions(); } catch (e) {}
    try { if (typeof window.renderCharStrip === 'function') window.renderCharStrip(); } catch (e) {}
    try { if (window.Streak && typeof window.renderStreakPill === 'function') window.renderStreakPill(); } catch (e) {}
    try { if (window.Streak && typeof window.renderCheckinCard === 'function') window.renderCheckinCard(); } catch (e) {}
    try { if (typeof window.renderArc === 'function') window.renderArc(0); } catch (e) {}
  }

  function flushCallbacks(done) {
    var queue = callbacks.splice(0, callbacks.length);
    if (done > 0) {
      queue.forEach(function (fn) { try { fn(done); } catch (e) {} });
      try {
        window.dispatchEvent(new CustomEvent('gamenfy:auto-habits-changed', {
          detail: { source: 'fitbit-retrospective', count: done }
        }));
      } catch (e) {}
    }
  }

  window.autoCheckHealthHabits = function (onChange) {
    if (typeof onChange === 'function') callbacks.push(onChange);
    if (inFlight) return inFlight;

    inFlight = (async function () {
      if (typeof window.gamenfyAuthedFetch !== 'function') return 0;
      try { if (window.gamenfyAuthReady) await window.gamenfyAuthReady; } catch (e) { return 0; }

      var response, rows, healthRow, rpgRow, byDate, remoteRpg, remoteMs;
      try {
        response = await window.gamenfyAuthedFetch(STATE_URL);
        if (!response || !response.ok) return 0;
        rows = await response.json();
        healthRow = (rows || []).find(function (row) { return row && row.key === 'health_fitbit'; });
        rpgRow = (rows || []).find(function (row) { return row && row.key === 'rpg'; });
        byDate = healthRow && healthRow.data;
        remoteRpg = rpgRow && rpgRow.data;
        remoteMs = rpgRow && rpgRow.updated_at ? (Date.parse(rpgRow.updated_at) || 0) : 0;
      } catch (e) { return 0; }
      if (!byDate || typeof byDate !== 'object') return 0;

      if (!(await waitForCloudBaseline(remoteRpg, remoteMs))) {
        if (baselineRetryCount < 2) {
          baselineRetryCount++;
          setTimeout(function () { window.autoCheckHealthHabits(refreshKnownMissionUI); }, 700 * baselineRetryCount);
        }
        return 0;
      }
      baselineRetryCount = 0;

      var today = localDay();
      var dates = Object.keys(byDate).filter(function (d) { return validDay(d) && d <= today; }).sort();
      if (!dates.length) return 0;

      // From this point localStorage is known to be either the fetched cloud baseline
      // or a newer local dirty edit, so all mutations can safely use the normal engine.
      var state = loadJson(AUTO_KEY, {});
      var habitlog = loadJson(HABITLOG_KEY, {});
      var streak = loadJson(STREAK_KEY, { days: {} });
      streak.days = streak.days || {};
      var additions = [];
      var changedHabits = {};
      var stateChanged = false;

      dates.forEach(function (date) {
        var day = byDate[date] || {};
        Object.keys(AUTO_HABITS).forEach(function (habitId) {
          var cfg = AUTO_HABITS[habitId];
          var stateKey = autoStateKey(habitId, date);
          var already = habitlogHas(habitlog, habitId, date);

          if (state[stateKey] !== 'manual-off' && !already && inferManualOff(habitId, date)) {
            state[stateKey] = 'manual-off';
            stateChanged = true;
          }
          if (state[stateKey] === 'manual-off') return;

          var val = Number(day[cfg.field]);
          var met = Number.isFinite(val) && val >= cfg.min;

          if (already) {
            if (state[stateKey] !== true) { state[stateKey] = true; stateChanged = true; }
            return;
          }

          // A miss is never final. Fitbit can finalize/correct a previous date later.
          // Delete the old ambiguous boolean so legacy "settled miss" flags self-heal.
          if (!met) {
            if (state[stateKey] === true) { delete state[stateKey]; stateChanged = true; }
            return;
          }

          habitlog[habitId] = habitlog[habitId] || {};
          habitlog[habitId][date] = true;
          state[stateKey] = true;
          stateChanged = true;
          streak.days[date] = true;
          changedHabits[habitId] = true;
          additions.push({ key: habitId, date: date, cfg: cfg });
        });
      });

      if (additions.length) saveJson(HABITLOG_KEY, habitlog);
      if (stateChanged) saveJson(AUTO_KEY, state);
      if (additions.length) saveJson(STREAK_KEY, streak);

      Object.keys(changedHabits).forEach(function (habitId) {
        try {
          if (typeof window.recomputeHabitFromLog === 'function') window.recomputeHabitFromLog(habitId);
        } catch (e) {}
      });
      additions.forEach(function (item) {
        try {
          if (typeof window.addXP === 'function') {
            window.addXP(item.key, 15, 'Auto: ' + item.cfg.label + ' gehaald (' + item.date + ')');
          }
        } catch (e) {}
      });

      if (additions.length) refreshKnownMissionUI();
      return additions.length;
    })();

    return inFlight.then(function (done) {
      flushCallbacks(done || 0);
      return done || 0;
    }).finally(function () { inFlight = null; });
  };

  installManualToggleGuard();
  setTimeout(installManualToggleGuard, 120);

  // Main may have called the synchronous loader placeholder before this file
  // finished downloading. Preserve those UI callbacks and run one authoritative pass.
  try {
    var startupQueue = window.__gamenfyAutoHabitQueuedCallbacks;
    if (Array.isArray(startupQueue) && startupQueue.length) {
      startupQueue.splice(0, startupQueue.length).forEach(function (fn) {
        if (typeof fn === 'function') callbacks.push(fn);
      });
    }
  } catch (e) {}
  setTimeout(function () { window.autoCheckHealthHabits(refreshKnownMissionUI); }, 220);

  function rerunFromFocus() {
    var now = Date.now();
    if (now - lastFocusRun < 15000) return;
    lastFocusRun = now;
    installManualToggleGuard();
    window.autoCheckHealthHabits(refreshKnownMissionUI);
  }
  window.addEventListener('focus', rerunFromFocus);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) rerunFromFocus();
  });
})();