// =============================================================
// Gamenfy — Streak + Evening Check-in engine (v7.1)
// A day counts when you did at least one real thing: XP gained,
// a mission checked, a venture step done, or the day closed via
// the evening check-in. Streak = consecutive active days.
// No punishment mechanics — today only breaks the streak once
// it is actually over.
// Storage: rpg_streak_v1, rpg_checkin_v1 (both synced).
// =============================================================
(function () {
  'use strict';

  const STREAK_KEY  = 'rpg_streak_v1';
  const CHECKIN_KEY = 'rpg_checkin_v1';

  function todayStr (d) {
    const x = d || new Date();
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  }
  function shiftDays (dateStr, n) {
    const p = dateStr.split('-').map(Number);
    const d = new Date(p[0], p[1] - 1, p[2] + n);
    return todayStr(d);
  }

  function loadJSON (key, fallback) {
    try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch (e) {}
    return fallback;
  }
  function saveJSON (key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function loadStreak ()  { return loadJSON(STREAK_KEY,  { days: {}, best: 0 }); }
  function loadCheckin () { return loadJSON(CHECKIN_KEY, { days: {} }); }

  // ── Activity detection ──────────────────────────────────────
  function xpLogActiveDays () {
    const days = {};
    if (typeof window.getCharacter === 'function') {
      const log = (window.getCharacter().xpLog) || [];
      for (const e of log) {
        if ((e.amount || 0) > 0 && e.date) days[String(e.date).slice(0, 10)] = true;
      }
    }
    return days;
  }
  function ventureActiveDays () {
    const days = {};
    if (window.Ventures) {
      const data = window.Ventures.load();
      (data.ventures || []).forEach(v => (v.phases || []).forEach(p => (p.steps || []).forEach(s => {
        if (s.done && s.doneAt) days[String(s.doneAt).slice(0, 10)] = true;
      })));
    }
    return days;
  }

  // Merge every known activity source into the persistent streak record.
  function refresh () {
    const st = loadStreak();
    const merge = Object.assign({}, xpLogActiveDays(), ventureActiveDays(), loadCheckin().days ? Object.keys(loadCheckin().days).reduce((a, d) => (a[d] = true, a), {}) : {});
    let changed = false;
    Object.keys(merge).forEach(d => { if (!st.days[d]) { st.days[d] = true; changed = true; } });
    const cur = computeFrom(st.days);
    if (cur.current > (st.best || 0)) { st.best = cur.current; changed = true; }
    if (changed) saveJSON(STREAK_KEY, st);
    return st;
  }

  function computeFrom (days) {
    const today = todayStr();
    const todayActive = !!days[today];
    let cursor = todayActive ? today : shiftDays(today, -1);
    let run = 0;
    while (days[cursor]) { run++; cursor = shiftDays(cursor, -1); }
    return { current: run, todayActive: todayActive, atRisk: !todayActive && run > 0 };
  }

  function status () {
    const st = refresh();
    const c = computeFrom(st.days);
    return { current: c.current, best: st.best || c.current, todayActive: c.todayActive, atRisk: c.atRisk };
  }

  // ── Check-in ────────────────────────────────────────────────
  function isClosedToday () {
    const c = loadCheckin();
    return !!(c.days && c.days[todayStr()]);
  }
  function closeDay () {
    const c = loadCheckin();
    c.days = c.days || {};
    c.days[todayStr()] = { closedAt: new Date().toISOString() };
    saveJSON(CHECKIN_KEY, c);
    const st = loadStreak();
    st.days[todayStr()] = true;
    saveJSON(STREAK_KEY, st);
    return status();
  }

  window.Streak = {
    STREAK_KEY: STREAK_KEY,
    CHECKIN_KEY: CHECKIN_KEY,
    status: status,
    refresh: refresh,
    isClosedToday: isClosedToday,
    closeDay: closeDay
  };
})();

// v11.5: keep the Fitbit -> Daily Mission reconciliation separate from xp.js,
// but replace xp.js' legacy today+yesterday checker SYNCHRONOUSLY before Main
// can call it. Calls made while the safer module is still loading are queued.
(function () {
  'use strict';
  if (window.__gamenfyAutohabitLoaderInstalled) return;
  window.__gamenfyAutohabitLoaderInstalled = true;

  const queued = window.__gamenfyAutoHabitQueuedCallbacks = window.__gamenfyAutoHabitQueuedCallbacks || [];
  window.__gamenfyLegacyAutoCheckHealthHabits = window.autoCheckHealthHabits;
  window.autoCheckHealthHabits = function (onChange) {
    if (typeof onChange === 'function') queued.push(onChange);
    return Promise.resolve(0);
  };

  if (document.querySelector('script[data-gamenfy-autohabit-reconcile]')) return;
  const script = document.createElement('script');
  script.src = 'autohabit-reconcile.js?v=11.5';
  script.dataset.gamenfyAutohabitReconcile = '1';
  document.head.appendChild(script);
})();

// v11.6: Main's existing Reset & start fresh marker only filtered the detail
// statistics; the authoritative rpg_habitlog_v1 still contained every old check.
// xp.js could therefore reconstruct the pre-reset level on the next getHabits().
// Install after Main's inline script has defined mdReset, then prune pre-reset
// completion history while preserving earned XP. Today's completion is retained
// and becomes Day 1 if it already happened before the reset.
(function () {
  'use strict';
  const RESET_KEY = 'rpg_habit_reset_v1';
  const HABITLOG_KEY = 'rpg_habitlog_v1';
  const AUTO_KEY = 'rpg_autohabit_v1';

  function load(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function install() {
    const original = window.mdReset;
    if (typeof original !== 'function' || original.__gamenfyAuthoritativeReset) return;

    const wrapped = function (key, isPrivate, privateId, e) {
      const btn = e && e.target;
      const confirming = !isPrivate && !!(btn && btn.dataset && btn.dataset.arm);
      const result = original.apply(this, arguments);
      if (!confirming) return result;

      const resets = load(RESET_KEY, {});
      const resetDate = resets[key];
      if (!resetDate) return result;

      const log = load(HABITLOG_KEY, {});
      const days = log[key] || {};
      const removed = [];
      Object.keys(days).forEach((date) => {
        if (date < resetDate) { delete days[date]; removed.push(date); }
      });
      log[key] = days;
      save(HABITLOG_KEY, log);

      // A reset explicitly says history before resetDate no longer counts.
      // For Fitbit-backed missions, mark those pruned dates manual-off so the
      // retrospective reconciler cannot reconstruct pre-reset history later.
      if ((key === 'walking' || key === 'sleep') && removed.length) {
        const auto = load(AUTO_KEY, {});
        removed.forEach((date) => { auto[key + ':' + date] = 'manual-off'; });
        save(AUTO_KEY, auto);
      }

      try { if (typeof window.recomputeHabitFromLog === 'function') window.recomputeHabitFromLog(key); } catch (err) {}
      try {
        window.dispatchEvent(new CustomEvent('gamenfy:daily-mission-change', {
          detail: { source: 'habit-reset', key: key, date: resetDate }
        }));
      } catch (err) {}

      // Original mdReset opened the sheet before the authoritative replay above.
      // Re-open once so the visible score/stats match the pruned log immediately.
      setTimeout(() => {
        try {
          document.getElementById('mdBg')?.remove();
          if (typeof window.openMissionDetail === 'function') window.openMissionDetail(key, false, privateId || undefined);
        } catch (err) {}
      }, 0);
      return result;
    };
    wrapped.__gamenfyAuthoritativeReset = true;
    wrapped.__gamenfyOriginalReset = original;
    window.mdReset = wrapped;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else setTimeout(install, 0);
})();