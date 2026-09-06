/* Gamenfy retrospective Fitbit -> Daily Mission reconciler
   ChatGPT (OpenAI), 2026-09-03.
   Fixes late Fitbit finalization without fighting deliberate manual unchecks.
   v11.9 keeps the retry-safe ledger and reads health_fitbit + rpg through the
   authenticated Supabase client, explicitly scoped to the current owner. This
   avoids the PWA raw-REST read path that could leave Body and auto-completion
   waiting even while the owner row was healthy in the cloud. */
(function () {
  'use strict';

  var AUTO_KEY = 'rpg_autohabit_v1';
  var HABITLOG_KEY = 'rpg_habitlog_v1';
  var STREAK_KEY = 'rpg_streak_v1';
  var CHARACTER_KEY = 'rpg_character_v1';
  var HABITS_KEY = 'rpg_habits_v1';
  var DIRTY_KEY = '__gamenfy_sync_dirty_v1:rpg';
  var MIGRATION_KEY = '__retrospective_v2_migrated';
  var XP_MIGRATION_KEY = '__xp_ledger_v1_migrated';
  var XP_LEDGER_PREFIX = '__xp_awarded_v1:';
  var CLOUD_KEYS = ['health_fitbit', 'rpg'];
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
  function xpLedgerKey(habitId, dateStr) { return XP_LEDGER_PREFIX + habitId + ':' + dateStr; }
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
  function stableJson(value) {
    if(Array.isArray(value)) return value.map(stableJson);
    if(value && typeof value==='object'){
      var out={}; Object.keys(value).sort().forEach(function(k){out[k]=stableJson(value[k]);}); return out;
    }
    return value;
  }
  function localMatchesRemote(key, value) {
    try {
      var raw=localStorage.getItem(key);
      if(raw===null)return false;
      return JSON.stringify(stableJson(JSON.parse(raw))) === JSON.stringify(stableJson(value));
    } catch (e) { return false; }
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

  // Build one immutable view of the retained XP audit per reconciliation pass.
  // xpLog is newest-first, so the first same-day decision exactly matches the
  // old inferManualOff() behavior while completion XP remains netted over every
  // matching completion/reversal row for crash-idempotency.
  function buildXpAuditIndex() {
    if (typeof window.getCharacter !== 'function') return null;
    try {
      var rows = (window.getCharacter().xpLog || []);
      var index = {};
      for (var i = 0; i < rows.length; i++) {
        var e = rows[i] || {};
        if (!isAutoHabit(e.skill)) continue;
        var date = logEntryDate(e);
        if (!validDay(date)) continue;
        var k = e.skill + ':' + date;
        var rec = index[k] || { completionSaw: false, completionNet: 0, manualDecision: null };
        var reason = String(e.reason || '');
        var amount = Number(e.amount || 0);
        var finiteAmount = Number.isFinite(amount);
        var looksLikeCompletion = reason.indexOf('Auto:') === 0 || reason.indexOf('Habit:') === 0 || /\bhabit\b/i.test(reason) || /\bunchecked\b/i.test(reason);

        if (looksLikeCompletion && finiteAmount && amount !== 0) {
          rec.completionSaw = true;
          rec.completionNet += amount;
        }

        if (rec.manualDecision === null) {
          if (reason.indexOf('Habit unchecked:') === 0 || /\bunchecked\b/i.test(reason) || (finiteAmount && amount < 0)) rec.manualDecision = true;
          else if (reason.indexOf('Habit:') === 0 || (finiteAmount && amount > 0)) rec.manualDecision = false;
        }
        index[k] = rec;
      }
      return index;
    } catch (e) { return null; }
  }

  function completionXpEvidence(auditIndex, habitId, dateStr) {
    if (auditIndex === null) return null;
    var rec = auditIndex[habitId + ':' + dateStr];
    return !!(rec && rec.completionSaw && rec.completionNet > 0);
  }

  // First XP-ledger migration is deliberately conservative: every Walking/Sleep
  // date that ALREADY exists in the canonical habitlog is treated as historically
  // paid, regardless of whether an old auto flag survived. This protects manual
  // completions whose XP event may already have aged out of the 200-row XP log.
  // New Fitbit additions are created only AFTER this migration, so they still
  // enter the retry-safe reward queue normally.
  function migrateXpLedger(state, habitlog) {
    if (state[XP_MIGRATION_KEY] === true) return false;
    Object.keys(AUTO_HABITS).forEach(function (habitId) {
      var days = habitlog[habitId] || {};
      Object.keys(days).forEach(function (date) {
        if (days[date] && validDay(date)) state[xpLedgerKey(habitId, date)] = true;
      });
    });
    state[XP_MIGRATION_KEY] = true;
    return true;
  }

  // Old versions used boolean true for both "goal met" and "past day settled as miss".
  // During the one-time migration, use the newest same-day manual XP event when
  // possible. Character's daily UI uses generic "... unchecked" reasons, while
  // Main uses "Habit unchecked:" — support both shapes.
  function inferManualOff(auditIndex, habitId, dateStr) {
    if (auditIndex === null) return false;
    var rec = auditIndex[habitId + ':' + dateStr];
    return !!(rec && rec.manualDecision === true);
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
      try { if(window.gamenfyAuthReady) await window.gamenfyAuthReady; } catch (e) { return 0; }
      if(!window.gamenfySupabase || !window.gamenfyUserId) return 0;

      var rows, healthRow, rpgRow, byDate, remoteRpg, remoteMs;
      try {
        var cloudClient = window.gamenfySupabase;
        var ownerId = window.gamenfyUserId;
        if (!cloudClient || !ownerId) return 0;
        var cloudResult = await cloudClient
          .from('app_state')
          .select('key,data,updated_at')
          .eq('user_id', ownerId)
          .in('key', CLOUD_KEYS);
        if (!cloudResult || cloudResult.error) return 0;
        rows = cloudResult.data || [];
        healthRow = rows.find(function (row) { return row && row.key === 'health_fitbit'; });
        rpgRow = rows.find(function (row) { return row && row.key === 'rpg'; });
        byDate = healthRow && healthRow.data;
        remoteRpg = rpgRow && rpgRow.data;
        remoteMs = rpgRow && rpgRow.updated_at ? (Date.parse(rpgRow.updated_at) || 0) : 0;
      } catch (e) { return 0; }
      if (!byDate || typeof byDate !== 'object') return 0;

      if (!(await waitForCloudBaseline(remoteRpg, remoteMs))) {
        if (baselineRetryCount < 8) {
          baselineRetryCount++;
          var retryDelay=Math.min(5000, 450 * baselineRetryCount);
          setTimeout(function () { window.autoCheckHealthHabits(refreshKnownMissionUI); }, retryDelay);
        }
        return 0;
      }
      baselineRetryCount = 0;

      var today = localDay();
      var dates = Object.keys(byDate).filter(function (d) { return validDay(d) && d <= today; }).sort();
      if (!dates.length) return 0;

      // From this point localStorage is known to be either the fetched cloud baseline
      // or a newer local dirty edit, so all mutations can safely use the normal engine.
      var xpAudit = buildXpAuditIndex();
      var state = loadJson(AUTO_KEY, {});
      var migrated = state[MIGRATION_KEY] === true;
      var habitlog = loadJson(HABITLOG_KEY, {});
      var streak = loadJson(STREAK_KEY, { days: {} });
      streak.days = streak.days || {};
      var additions = [];
      var rewardCandidates = {};
      var changedHabits = {};
      var stateChanged = migrateXpLedger(state, habitlog);

      function queueReward(habitId, date, cfg) {
        var ledgerKey = xpLedgerKey(habitId, date);
        if (state[ledgerKey] === true) return;
        rewardCandidates[habitId + ':' + date] = { key: habitId, date: date, cfg: cfg, ledgerKey: ledgerKey };
      }

      dates.forEach(function (date) {
        var day = byDate[date] || {};
        Object.keys(AUTO_HABITS).forEach(function (habitId) {
          var cfg = AUTO_HABITS[habitId];
          var stateKey = autoStateKey(habitId, date);
          var already = habitlogHas(habitlog, habitId, date);

          if (state[stateKey] !== 'manual-off' && !already && inferManualOff(xpAudit, habitId, date)) {
            state[stateKey] = 'manual-off';
            stateChanged = true;
          }
          if (state[stateKey] === 'manual-off') return;

          // After the first retrospective migration, boolean true has one
          // unambiguous meaning: this day was previously confirmed in the
          // authoritative log. If it later disappears, preserve the uncheck.
          if (migrated && state[stateKey] === true && !already) {
            state[stateKey] = 'manual-off';
            stateChanged = true;
            return;
          }

          var val = Number(day[cfg.field]);
          var met = Number.isFinite(val) && val >= cfg.min;

          if (already) {
            if (state[stateKey] !== true) { state[stateKey] = true; stateChanged = true; }
            queueReward(habitId, date, cfg);
            return;
          }

          // During the first retrospective migration an old boolean true can
          // still mean either "completed" or the legacy "settled miss".
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
          queueReward(habitId, date, cfg);
        });
      });

      if (!migrated) {
        state[MIGRATION_KEY] = true;
        stateChanged = true;
      }

      // Persist canonical completion/state before attempting XP. If execution
      // stops here, the next pass sees a confirmed day with a missing XP ledger
      // and repairs the +15 exactly once.
      if (additions.length) saveJson(HABITLOG_KEY, habitlog);
      if (stateChanged) saveJson(AUTO_KEY, state);
      if (additions.length) saveJson(STREAK_KEY, streak);

      Object.keys(changedHabits).forEach(function (habitId) {
        try {
          if (typeof window.recomputeHabitFromLog === 'function') window.recomputeHabitFromLog(habitId);
        } catch (e) {}
      });

      var xpAwards = 0;
      Object.keys(rewardCandidates).forEach(function (candidateKey) {
        var item = rewardCandidates[candidateKey];
        if (state[item.ledgerKey] === true) return;

        // Crash-after-addXP protection: if the completion XP already exists,
        // persist only the ledger marker. Net completion XP <= 0 is not enough.
        var evidence = completionXpEvidence(xpAudit, item.key, item.date);
        if (evidence === true) {
          state[item.ledgerKey] = true;
          saveJson(AUTO_KEY, state);
          return;
        }
        // If the XP log cannot be inspected yet, defer rather than risk double pay.
        if (evidence === null || typeof window.addXP !== 'function') return;

        try {
          window.addXP(item.key, 15, 'Auto: ' + item.cfg.label + ' gehaald (' + item.date + ')');
          xpAwards++;
          state[item.ledgerKey] = true;
          // Save immediately per award. If execution stops between addXP and this
          // save, completionXpEvidence() makes the next pass idempotent anyway.
          saveJson(AUTO_KEY, state);
        } catch (e) {}
      });

      if (additions.length || xpAwards > 0) refreshKnownMissionUI();
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
  window.addEventListener('gamenfy:cloud-sync-ready', function(event){
    if(event && event.detail && event.detail.appKey==='rpg') window.autoCheckHealthHabits(refreshKnownMissionUI);
  });
  window.addEventListener('gamenfy:remote-state-applied', function(event){
    if(!event || !event.detail || !event.detail.appKey || event.detail.appKey==='rpg') window.autoCheckHealthHabits(refreshKnownMissionUI);
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) rerunFromFocus();
  });
})();