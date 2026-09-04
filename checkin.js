// =============================================================
// Gamenfy — Streak + Evening Check-in engine (v7.8)
// A day counts when you did at least one real thing: a canonical Daily Mission,
// net XP gained, a venture step done, or the day closed via evening check-in.
// Streak = consecutive active days. Reversed XP (for example a mission
// check followed by an uncheck) is reconciled instead of leaving a ghost day.
// Backdated/retrospective XP uses the explicit YYYY-MM-DD audit date in its
// reason, so filling an old mission today cannot create a fake active today.
// Canonical rpg_habitlog_v1 is an independent activity source so a completion
// remains real even when its writer (for example Jarvis) did not emit habit XP.
// Venture doneAt stays an absolute ISO timestamp, but streak attribution converts
// that instant to the local civil day before counting it.
// Historical days outside retained evidence are never deleted implicitly.
// No punishment mechanics — today only breaks the streak once it is over.
// Storage: rpg_streak_v1, rpg_checkin_v1 (both synced).
// =============================================================

// v7.7: Main still contains a v8.9 legacy hlogHas() migration fallback that
// treats rpg_habits_v1.lastChecked as evidence and writes that date back into
// rpg_habitlog_v1. That was useful before the dated log became cloud-synced,
// but today it can resurrect a deliberately removed date from a stale materialized
// cache during boot. Keep the old fallback harmless by ensuring getHabits() never
// exposes a lastChecked date that the canonical day log does not actually contain.
// This guard is read-only: the existing sync/recompute pipeline remains the only
// writer that materializes canonical score/streak/lastChecked state.
(function installCanonicalHabitReadGuard () {
  'use strict';
  const HABITLOG_KEY = 'rpg_habitlog_v1';
  const original = window.getHabits;
  if (typeof original !== 'function' || original.__gamenfyCanonicalHabitReadGuard) return;

  const guarded = function () {
    const habits = original.apply(this, arguments) || {};
    let log = {};
    try { log = JSON.parse(localStorage.getItem(HABITLOG_KEY)) || {}; } catch (e) {}

    Object.keys(habits).forEach((key) => {
      const h = habits[key];
      if (!h || !h.lastChecked) return;
      const days = (log && log[key]) || {};
      if (days[h.lastChecked]) return;

      const canonicalDates = Object.keys(days).filter((date) => !!days[date]).sort();
      h.lastChecked = canonicalDates.length ? canonicalDates[canonicalDates.length - 1] : null;
      if (!h.lastChecked) h.streak = 0;
    });
    return habits;
  };

  guarded.__gamenfyCanonicalHabitReadGuard = true;
  guarded.__gamenfyOriginalGetHabits = original;
  window.getHabits = guarded;
})();

(function () {
  'use strict';

  const STREAK_KEY  = 'rpg_streak_v1';
  const CHECKIN_KEY = 'rpg_checkin_v1';
  const HABITLOG_KEY = 'rpg_habitlog_v1';

  function todayStr (d) {
    const x = d || new Date();
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  }
  function localDayFromTimestamp (value) {
    if (!value) return null;
    const instant = new Date(value);
    if (!Number.isNaN(instant.getTime())) return todayStr(instant);
    const fallback = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    return fallback ? fallback[1] : null;
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
  // XP is stored as an append-only event log. A mission check (+15) and its
  // later uncheck (-15) must cancel each other. Sum per skill first so a
  // reversal in one skill can never erase unrelated activity in another.
  // Backdated Main/Fitbit writes retain addXP's physical write timestamp in
  // e.date, but append the actual activity date as `(YYYY-MM-DD)` to reason.
  // Prefer that explicit audit date when present.
  function xpEntryDate (entry) {
    const raw = String((entry && entry.reason) || '');
    const match = raw.match(/\((\d{4}-\d{2}-\d{2})\)\s*$/);
    if (match) return match[1];
    return entry && entry.date ? String(entry.date).slice(0, 10) : null;
  }
  // `observed` lets refresh safely remove stale markers only for dates that
  // are actually represented by the retained XP log; older history survives.
  function xpLogActivity () {
    const perDay = {};
    if (typeof window.getCharacter === 'function') {
      const character = window.getCharacter() || {};
      const log = character.xpLog || [];
      for (const e of log) {
        if (!e) continue;
        const amount = Number(e.amount || 0);
        if (!Number.isFinite(amount) || amount === 0) continue;
        const day = xpEntryDate(e);
        if (!day) continue;
        const skill = e.skill || '__global__';
        perDay[day] = perDay[day] || {};
        perDay[day][skill] = (perDay[day][skill] || 0) + amount;
      }
    }
    const observed = {}, active = {};
    Object.keys(perDay).forEach(day => {
      observed[day] = true;
      active[day] = Object.keys(perDay[day]).some(skill => perDay[day][skill] > 0);
    });
    return { observed: observed, active: active };
  }
  // Daily Mission completion already has a canonical dated source of truth.
  // Treat it as activity directly instead of requiring every writer to also
  // manufacture an XP event just to keep the global streak alive.
  function habitLogActiveDays () {
    const days = {};
    const log = loadJSON(HABITLOG_KEY, {});
    Object.keys(log || {}).forEach(key => {
      const entries = log[key] || {};
      Object.keys(entries).forEach(day => { if (entries[day]) days[day] = true; });
    });
    return days;
  }
  function ventureActiveDays () {
    const days = {};
    if (window.Ventures) {
      const data = window.Ventures.load();
      (data.ventures || []).forEach(v => (v.phases || []).forEach(p => (p.steps || []).forEach(s => {
        if (!s.done || !s.doneAt) return;
        const day = localDayFromTimestamp(s.doneAt);
        if (day) days[day] = true;
      })));
    }
    return days;
  }
  function checkinActiveDays () {
    const days = {};
    const source = loadCheckin().days || {};
    Object.keys(source).forEach(day => { if (source[day]) days[day] = true; });
    return days;
  }

  // Reconcile dates covered by current evidence. We intentionally do NOT
  // rebuild the whole historical map because xpLog is capped; doing so would
  // make old legitimate streak history disappear once its XP events age out.
  function refresh () {
    const st = loadStreak();
    st.days = st.days || {};
    const xp = xpLogActivity();
    const habits = habitLogActiveDays();
    const ventures = ventureActiveDays();
    const checkins = checkinActiveDays();
    const known = Object.assign({}, xp.observed, habits, ventures, checkins);
    let changed = false;

    Object.keys(known).forEach(day => {
      const active = !!(xp.active[day] || habits[day] || ventures[day] || checkins[day]);
      if (active && !st.days[day]) { st.days[day] = true; changed = true; }
      else if (!active && st.days[day]) { delete st.days[day]; changed = true; }
    });

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
    st.days = st.days || {};
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

  // sync.js v11.4 emits this after a real remote apply. Reconcile the streak
  // and redraw Main's existing RPG surfaces in-place so a late initial pull or
  // realtime update is visible without navigation/reload. These calls are all
  // guarded because checkin.js is also safe to load on pages that omit them.
  function refreshVisibleRpg(event) {
    if (event && event.detail && event.detail.appKey && event.detail.appKey !== 'rpg') return;
    refresh();
    try { if (typeof window.renderStreakPill === 'function') window.renderStreakPill(); } catch (e) {}
    try { if (typeof window.renderCheckinCard === 'function') window.renderCheckinCard(); } catch (e) {}
    try { if (typeof window.renderMissions === 'function') window.renderMissions(); } catch (e) {}
    try { if (typeof window.renderCharStrip === 'function') window.renderCharStrip(); } catch (e) {}
    try { if (typeof window.renderFocusGrid === 'function') window.renderFocusGrid(); } catch (e) {}
    try { if (typeof window.renderAgenda === 'function') window.renderAgenda(); } catch (e) {}
    try { if (typeof window.renderNextMove === 'function') window.renderNextMove(); } catch (e) {}
    try { if (typeof window.renderArc === 'function') window.renderArc(0); } catch (e) {}
    try { if (typeof window.renderWorkoutChallenge === 'function') window.renderWorkoutChallenge(); } catch (e) {}
  }
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('gamenfy:remote-state-applied', refreshVisibleRpg);
    window.addEventListener('gamenfy:daily-mission-change', refreshVisibleRpg);
    window.addEventListener('storage', function (event) {
      if (!event || !event.key || event.key === STREAK_KEY || event.key === CHECKIN_KEY || event.key === HABITLOG_KEY || event.key === 'rpg_character_v1' || event.key === 'rpg_ventures_v1') refreshVisibleRpg();
    });
  }

  // Jarvis uses checkHabitFor() directly. Wrap that dated engine only to schedule
  // a post-write refresh; the original still owns the actual habit mutation.
  // setTimeout(0) lets the caller finish writing habitlog/replay before we read it.
  (function installDatedHabitRefresh(){
    let tries = 0;
    function install(){
      tries++;
      const original = window.checkHabitFor;
      if (typeof original !== 'function') { if (tries < 120) setTimeout(install, 50); return; }
      if (original.__gamenfyStreakRefresh) return;
      const wrapped = function(){
        const result = original.apply(this, arguments);
        setTimeout(function(){ refreshVisibleRpg(); }, 0);
        return result;
      };
      wrapped.__gamenfyStreakRefresh = true;
      wrapped.__gamenfyStreakRefreshOriginal = original;
      window.checkHabitFor = wrapped;
    }
    install();
  })();

  if (typeof setTimeout === 'function') setTimeout(function(){ refreshVisibleRpg(); }, 0);
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