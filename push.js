// =============================================================
// Gamenfy — Push client (v7.3)
// Registers the service worker and manages the push subscription.
// Subscriptions are stored in Supabase app_state under key
// 'push_subscriptions' so the daily edge function can reach
// every registered device. iOS requires the app to be launched
// from the home screen (standalone) and iOS 16.4+.
// =============================================================
(function () {
  'use strict';

  const SUPABASE_URL = 'https://ttxjsoahmtennnufgeqx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_5lYXJme36ggS2dWTJbMSCA_Ir9Uogab';
  const VAPID_PUBLIC = 'BBv3mA0zyswgeya6dJ7-WKbJz69YCMheihrHBNJqvM9cmjyxH8FsL6wN6BueMbn6OAMiIq2IeMdt-fKzf-ll_wg';
  const ROW_KEY = 'push_subscriptions';

  function b64ToUint8 (base64) {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }

  function isStandalone () {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  function supported () {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  async function registerSW () {
    try { return await navigator.serviceWorker.register('sw.js'); } catch (e) { return null; }
  }

  async function getSubscription () {
    if (!supported()) return null;
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return null;
    return reg.pushManager.getSubscription();
  }

  function cloudHeaders () {
    return {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    };
  }

  async function readCloudSubscriptions () {
    const headers = cloudHeaders();
    const r = await window.gamenfyAuthedFetch(
      SUPABASE_URL + '/rest/v1/app_state?key=eq.' + ROW_KEY + '&select=data',
      { headers }
    );
    if (!r.ok) throw new Error('push subscription read failed');
    const rows = await r.json();
    return (rows.length && rows[0].data && Array.isArray(rows[0].data.subs))
      ? rows[0].data.subs
      : [];
  }

  async function writeCloudSubscriptions (subs) {
    if (!window.gamenfyUserId) throw new Error('auth not ready');
    const r = await window.gamenfyAuthedFetch(SUPABASE_URL + '/rest/v1/app_state', {
      method: 'POST',
      headers: cloudHeaders(),
      body: JSON.stringify({
        key: ROW_KEY,
        user_id: window.gamenfyUserId,
        data: { subs },
        updated_at: new Date().toISOString()
      })
    });
    if (!r.ok) throw new Error('push subscription write failed');
  }

  async function saveToCloud (sub) {
    const subs = await readCloudSubscriptions();
    const json = sub.toJSON();
    if (!subs.some(s => s && s.endpoint === json.endpoint)) subs.push(json);
    await writeCloudSubscriptions(subs);
  }

  async function removeFromCloud (endpoint) {
    if (!endpoint) return;
    const subs = await readCloudSubscriptions();
    const next = subs.filter(s => !s || s.endpoint !== endpoint);
    if (next.length !== subs.length) await writeCloudSubscriptions(next);
  }

  // Must be called from a user gesture (button tap).
  async function enable () {
    if (!supported()) return { ok: false, reason: 'unsupported' };
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return { ok: false, reason: 'denied' };
    const reg = (await navigator.serviceWorker.getRegistration()) || (await registerSW());
    if (!reg) return { ok: false, reason: 'no-sw' };
    await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: b64ToUint8(VAPID_PUBLIC)
      });
    }
    try {
      await saveToCloud(sub);
    } catch (e) {
      // Do not present a device as enabled when the server cannot reach it.
      try { await sub.unsubscribe(); } catch (_) {}
      return { ok: false, reason: 'cloud-save-failed' };
    }
    return { ok: true };
  }

  async function disable () {
    if (!supported()) return { ok: false, reason: 'unsupported' };
    const sub = await getSubscription();
    if (!sub) return { ok: true, alreadyDisabled: true };
    const endpoint = sub.endpoint;
    try {
      // Remove server reachability first. If that fails, keep the local
      // subscription so Settings cannot falsely show a successful opt-out.
      await removeFromCloud(endpoint);
    } catch (e) {
      return { ok: false, reason: 'cloud-remove-failed' };
    }
    try {
      await sub.unsubscribe();
    } catch (e) {
      return { ok: false, reason: 'unsubscribe-failed' };
    }
    return { ok: true };
  }

  async function status () {
    if (!supported()) {
      // iOS Safari outside the home-screen app has no PushManager.
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      return (ios && !isStandalone()) ? 'needs-standalone' : 'unsupported';
    }
    if (Notification.permission === 'denied') return 'denied';
    const sub = await getSubscription();
    return sub ? 'enabled' : 'ready';
  }

  // Register the SW early so push can be enabled later.
  if (supported()) registerSW();

  window.GamenfyPush = { enable, disable, status, isStandalone };
})();

// v7.4 — Home Daily Score presentation + Joey evolution character.
// Park 3.1 owns the canonical completion summary and posts it to Main.
// Joey wants the Home score to be the number he actually checked today —
// not the average 0–10 habit level and not `done / all missions` as the headline.
// The character art follows that checked count: 0/1 -> L1, 2 -> L2 ... 10+ -> L10.
// The image files are intentionally externalized under img/lab/daily-score/joey/
// so the approved transparent character set from the project chat can be dropped
// in without changing score logic again. Until an asset is present, the existing
// star badge remains visible instead of showing a broken image.
(function installHomeDailyCheckedScore () {
  'use strict';
  if (window.__gamenfyHomeDailyCheckedScoreInstalled) return;
  window.__gamenfyHomeDailyCheckedScoreInstalled = true;

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function scoreArtLevel(done) { return clamp(Math.floor(Number(done) || 0) || 1, 1, 10); }
  function scoreArtUrl(done) {
    return 'img/lab/daily-score/joey/l' + String(scoreArtLevel(done)).padStart(2, '0') + '.webp?v=1';
  }

  function ensureCharacterHolder() {
    const card = document.getElementById('dailyLevelCard');
    if (!card) return null;
    const holder = card.firstElementChild;
    if (!holder) return null;
    let img = document.getElementById('dailyScoreCharacter');
    if (!img) {
      img = document.createElement('img');
      img.id = 'dailyScoreCharacter';
      img.alt = 'Joey Daily Score character';
      img.draggable = false;
      img.style.cssText = 'display:none;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 7px 10px rgba(0,0,0,.28));';
      holder.appendChild(img);
    }
    return { holder, img, fallback: holder.querySelector('span') };
  }

  function renderCharacter(done) {
    const parts = ensureCharacterHolder();
    if (!parts) return;
    const url = scoreArtUrl(done);
    if (parts.img.dataset.requested === url && parts.img.dataset.loaded === '1') return;
    parts.img.dataset.requested = url;
    parts.img.dataset.loaded = '0';
    const probe = new Image();
    probe.onload = function () {
      if (parts.img.dataset.requested !== url) return;
      parts.img.src = url;
      parts.img.dataset.loaded = '1';
      parts.img.style.display = 'block';
      if (parts.fallback) parts.fallback.style.display = 'none';
      parts.holder.style.background = 'transparent';
      parts.holder.style.borderColor = 'transparent';
      parts.holder.style.boxShadow = 'none';
    };
    probe.onerror = function () {
      if (parts.img.dataset.requested !== url) return;
      parts.img.dataset.loaded = '0';
      parts.img.style.display = 'none';
      if (parts.fallback) parts.fallback.style.display = '';
    };
    probe.src = url;
  }

  window.GamenfyDailyScoreCharacter = {
    artLevel: scoreArtLevel,
    artUrl: scoreArtUrl,
    render: renderCharacter
  };

  window.addEventListener('message', function (event) {
    const data = event && event.data;
    if (!data || data.type !== 'gamenfy:park31-summary') return;

    const done = Math.max(0, Math.floor(Number(data.completedToday) || 0));
    const count = Math.max(0, Math.floor(Number(data.missionCount) || 0));
    const value = document.getElementById('dailyLevelValue');
    const fill = document.getElementById('dailyLevelFill');
    const meta = document.getElementById('dailyLevelMeta');

    if (value) {
      value.textContent = String(done);
      const suffix = value.nextElementSibling;
      if (suffix && suffix.tagName === 'SPAN') suffix.style.display = 'none';
      const label = value.parentElement && value.parentElement.previousElementSibling;
      if (label) label.textContent = 'Daily Score';
    }
    if (fill) fill.style.width = (count ? Math.min(100, (done / count) * 100) : 0) + '%';
    if (meta) meta.textContent = done + (done === 1 ? ' daily mission gecheckt vandaag' : ' daily missions gecheckt vandaag');
    renderCharacter(done);
  });
})();
