/* Gamenfy Fitbit client direct-read bridge — 2026-09-07
   Temporary resilience layer while Supabase PostgREST returns PGRST002.
   Reads only the authenticated owner's health_fitbit row through
   gamenfy-state-read; all other Gamenfy state keeps its existing paths. */
(function () {
  'use strict';

  var FITBIT_SYNC_URL = 'https://ttxjsoahmtennnufgeqx.supabase.co/functions/v1/fitbit-sync';
  var attempts = 0;
  var installed = false;

  async function fitbitRequest(query, init) {
    if (window.gamenfyAuthReady) await window.gamenfyAuthReady;
    if (typeof window.gamenfyAuthHeaders !== 'function') throw new Error('Log opnieuw in bij Gamenfy');
    var options = Object.assign({ cache: 'no-store' }, init || {});
    options.headers = window.gamenfyAuthHeaders(Object.assign({ 'content-type': 'application/json' }, options.headers || {}));
    var response = await fetch(FITBIT_SYNC_URL + query, options);
    var body = null;
    try { body = await response.json(); } catch (_error) {}
    if (!response.ok || !body || body.ok !== true) throw new Error((body && body.error) || ('Fitbit-koppeling mislukt (' + response.status + ')'));
    return body;
  }

  window.gamenfyGetFitbitStatus = function () {
    return fitbitRequest('?client_status=1', { method: 'GET' });
  };

  window.gamenfyReconnectFitbit = async function (button) {
    var popup = null;
    try { popup = window.open('about:blank', 'gamenfy-fitbit-reauth'); } catch (_error) {}
    var oldText = button && button.textContent;
    if (button) { button.disabled = true; button.textContent = 'Koppeling openen…'; }
    try {
      var body = await fitbitRequest('?client_reauth=1', { method: 'POST', body: '{}' });
      if (!body.url) throw new Error('Geen veilige herstellink ontvangen');
      if (popup) popup.location.replace(body.url); else window.location.assign(body.url);
      return true;
    } catch (error) {
      try { if (popup) popup.close(); } catch (_error) {}
      if (button) { button.disabled = false; button.textContent = oldText || 'Fitbit opnieuw koppelen'; }
      if (typeof window.showToast === 'function') window.showToast(error.message || 'Fitbit-koppeling mislukt', 4000);
      else window.alert(error.message || 'Fitbit-koppeling mislukt');
      return false;
    }
  };

  function renderHomeStatus(status) {
    var anchor = document.getElementById('goalQuestCommand') || document.getElementById('dailyLevelCard');
    if (!anchor || !status) return;
    var old = document.getElementById('fitbitConnectionAlert');
    if (!status.needsReauth) { if (old) old.remove(); return; }
    var card = old || document.createElement('div');
    card.id = 'fitbitConnectionAlert';
    card.style.cssText = 'margin:0 0 12px;padding:13px 14px;border:1px solid #E8C889;border-radius:14px;background:#FDF3E2;color:#6B4E12;font:500 12px/1.45 Inter,sans-serif';
    card.innerHTML = '<b style="display:block;color:#4A3608;margin-bottom:3px">Fitbit heeft opnieuw toestemming nodig</b><span>Je laatste metingen blijven zichtbaar, maar worden niet bijgewerkt.</span><button type="button" style="display:block;width:100%;margin-top:9px;border:0;border-radius:10px;background:#4A3608;color:white;padding:10px;font-weight:800;cursor:pointer">Fitbit opnieuw koppelen</button>';
    card.querySelector('button').addEventListener('click', function () { window.gamenfyReconnectFitbit(this); });
    if (!old) anchor.parentNode.insertBefore(card, anchor);
  }

  async function checkConnectionStatus() {
    try { var status = await window.gamenfyGetFitbitStatus(); window.gamenfyFitbitStatus = status; renderHomeStatus(status); return status; }
    catch (_error) { return null; }
  }
  window.gamenfyCheckFitbitConnection = checkConnectionStatus;

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
      checkConnectionStatus();
    } catch (_error) {}
  });
  if (window.gamenfyAuthReady) window.gamenfyAuthReady.then(checkConnectionStatus).catch(function () {});
})();
