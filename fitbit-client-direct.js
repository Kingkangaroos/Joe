/* Gamenfy Fitbit client direct-read bridge — 2026-09-07
   Temporary resilience layer while Supabase PostgREST returns PGRST002.
   Reads only the authenticated owner's health_fitbit row through
   gamenfy-state-read; all other Gamenfy state keeps its existing paths. */
(function () {
  'use strict';

  var attempts = 0;
  var installed = false;

  function dateObjectFromFitbit(fb) {
    var out = { byDate: {}, hevy: {}, lastHealthDate: null };
    Object.entries(fb || {}).forEach(function (entry) {
      var k = entry[0], v = entry[1];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v || typeof v !== 'object') return;
      out.byDate[k] = {
        steps: v.steps != null ? Math.round(Number(v.steps)) : 0,
        energy: 0,
        weight: v.weightKg != null ? Number(v.weightKg) : 0,
        sleep: v.sleepMinutes != null ? Math.round(Number(v.sleepMinutes)) : 0,
        rhr: v.restingHR != null ? Math.round(Number(v.restingHR)) : 0,
        hrv: v.hrvMs != null ? Number(v.hrvMs) : 0,
        breathing: v.breathingRate != null ? Number(v.breathingRate) : 0,
        spo2: v.spo2Pct != null ? Number(v.spo2Pct) : (v.spo2 != null ? Number(v.spo2) : 0),
        distance: v.distanceKm != null ? Number(v.distanceKm) : (v.distance != null ? Number(v.distance) : 0)
      };
      if (!out.lastHealthDate || k > out.lastHealthDate) out.lastHealthDate = k;
    });
    return out;
  }

  async function addHevy(out) {
    try {
      var apiKey = localStorage.getItem('hevy_api_key');
      if (!apiKey) return;
      var r = await fetch('https://api.hevyapp.com/v1/workouts?page=1&pageSize=10', { headers: { 'api-key': apiKey } });
      if (!r.ok) return;
      var data = await r.json();
      (data.workouts || []).forEach(function (w) {
        var date = String(w.start_time || '').slice(0, 10);
        if (!date) return;
        var vol = 0;
        (w.exercises || []).forEach(function (ex) {
          (ex.sets || []).forEach(function (s) {
            if (s.type !== 'warmup') vol += (s.weight_kg || 0) * (s.reps || 0);
          });
        });
        out.hevy[date] = (out.hevy[date] || 0) + Math.round(vol);
      });
    } catch (_error) {}
  }

  async function directHmFetchAll(force) {
    try {
      if (typeof hmData !== 'undefined' && hmData && !force) return hmData;
      if (window.gamenfyAuthReady) await window.gamenfyAuthReady;
      if (typeof window.gamenfyReadState !== 'function') throw new Error('direct state reader unavailable');
      var rows = await window.gamenfyReadState(['health_fitbit']);
      var healthRow = rows && rows.health_fitbit;
      var fb = healthRow && healthRow.data;
      if (!fb || typeof fb !== 'object') return { byDate: {}, hevy: {}, lastHealthDate: null };
      var out = dateObjectFromFitbit(fb);
      await addHevy(out);
      if (typeof hmData !== 'undefined') hmData = out;
      window.gamenfyLastFitbitData = fb;
      return out;
    } catch (_error) {
      return (typeof hmData !== 'undefined' && hmData) ? hmData : { byDate: {}, hevy: {}, lastHealthDate: null };
    }
  }

  function install() {
    if (installed) return true;
    if (typeof window.gamenfyReadState !== 'function') return false;

    // character.html exposes these classic-script globals. Replace only the
    // Fitbit aggregate read; rendering, Hevy UI and all skill logic remain intact.
    if (typeof hmFetchAll === 'function') {
      try {
        hmFetchAll = directHmFetchAll;
        if (typeof hmData !== 'undefined') hmData = null;
        installed = true;
        if (typeof loadHealthMetrics === 'function') Promise.resolve(loadHealthMetrics()).catch(function () {});
        if (typeof renderBodyComposition === 'function') Promise.resolve(renderBodyComposition()).catch(function () {});
      } catch (_error) {}
    }

    return installed;
  }

  function retryInstall() {
    if (install()) return;
    attempts += 1;
    if (attempts < 80) setTimeout(retryInstall, 100);
  }

  retryInstall();
  window.addEventListener('gamenfy-auth-ready', function () {
    try {
      if (typeof hmData !== 'undefined') hmData = null;
      retryInstall();
    } catch (_error) {}
  });
})();
