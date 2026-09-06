// Gamenfy account gate — phase 1 of the single-owner security migration.
(function () {
  'use strict';

  const SUPABASE_URL = 'https://ttxjsoahmtennnufgeqx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_5lYXJme36ggS2dWTJbMSCA_Ir9Uogab';

  let resolveReady;
  let readyResolved = false;
  let autoHabitLoaderTimer = null;
  let autoHabitLoaderAttempts = 0;
  let autoHabitLoaderLoading = false;
  let autoHabitScriptFailures = 0;
  window.gamenfyAuthReady = new Promise((resolve) => { resolveReady = resolve; });
  window.gamenfyAccessToken = null;
  window.gamenfyUserId = null;

  // Fitbit-backed Daily Missions must not depend on Joey opening Main specifically.
  // Main still owns the synchronous legacy-checker blocker in checkin.js. On other
  // authenticated RPG surfaces (Character/Lab), load the same reconciler only once
  // the RPG cloud sync and XP engine are both present. Pages without the RPG engine
  // never qualify, so this cannot turn Finance/utility pages into mission writers.
  function maybeLoadAutoHabitReconciler() {
    if (!window.gamenfyUserId) return false;
    if (window.__gamenfyAutohabitLoaderInstalled || window.__gamenfyAutohabitSessionLoaderLoaded) return true;
    if (autoHabitLoaderLoading) return true;
    if (document.querySelector('script[data-gamenfy-autohabit-reconcile]')) return true;

    const rpgSyncStarted = !!(window.__cloudSyncRegistry && window.__cloudSyncRegistry.rpg);
    const rpgEngineReady = typeof window.recomputeHabitFromLog === 'function' &&
      typeof window.getCharacter === 'function' && typeof window.addXP === 'function';
    if (!rpgSyncStarted || !rpgEngineReady) {
      autoHabitLoaderAttempts += 1;
      if (autoHabitLoaderAttempts <= 300) {
        clearTimeout(autoHabitLoaderTimer);
        autoHabitLoaderTimer = setTimeout(maybeLoadAutoHabitReconciler, 50);
      }
      return false;
    }

    clearTimeout(autoHabitLoaderTimer);
    autoHabitLoaderTimer = null;
    autoHabitLoaderLoading = true;
    const script = document.createElement('script');
    script.src = 'autohabit-reconcile.js?v=11.9';
    script.dataset.gamenfyAutohabitReconcile = '1';
    script.onload = () => {
      autoHabitLoaderLoading = false;
      autoHabitScriptFailures = 0;
      window.__gamenfyAutohabitSessionLoaderLoaded = true;
      try { if(typeof window.autoCheckHealthHabits === 'function') window.autoCheckHealthHabits(); } catch (_error) {}
    };
    script.onerror = () => {
      autoHabitLoaderLoading = false;
      autoHabitScriptFailures += 1;
      try { script.remove(); } catch (_error) {}
      if (!window.gamenfyUserId || autoHabitScriptFailures > 5) return;
      clearTimeout(autoHabitLoaderTimer);
      const retryDelay = Math.min(4000, 250 * Math.pow(2, autoHabitScriptFailures - 1));
      autoHabitLoaderTimer = setTimeout(maybeLoadAutoHabitReconciler, retryDelay);
    };
    document.head.appendChild(script);
    return true;
  }

  window.addEventListener('gamenfy:cloud-sync-ready', (event) => {
    if (event && event.detail && event.detail.appKey === 'rpg') maybeLoadAutoHabitReconciler();
  });

  function failClosed(message) {
    window.gamenfyAuthError = message;
    showGate(message || 'Inloggen is tijdelijk niet beschikbaar.');
  }

  if (!window.supabase || !window.supabase.createClient) {
    document.addEventListener('DOMContentLoaded', () => failClosed('De beveiligde verbinding kon niet worden geladen.'), { once: true });
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  window.gamenfySupabase = client;

  window.gamenfyAuthHeaders = function (extra) {
    if (!window.gamenfyAccessToken) throw new Error('Geen geldige Gamenfy-sessie');
    return Object.assign({
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + window.gamenfyAccessToken,
    }, extra || {});
  };

  window.gamenfyAuthedFetch = async function (url, init) {
    const session = await window.gamenfyAuthReady;
    const options = Object.assign({}, init || {});
    options.headers = window.gamenfyAuthHeaders(options.headers || {});
    if (!session || !session.user) throw new Error('Geen geldige Gamenfy-sessie');
    return fetch(url, options);
  };

  window.gamenfySignOut = async function () {
    await client.auth.signOut();
    window.location.reload();
  };

  function styleGate() {
    if (document.getElementById('gamenfy-auth-style')) return;
    const style = document.createElement('style');
    style.id = 'gamenfy-auth-style';
    style.textContent = `
      #gamenfy-auth-gate{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;background:#f4f3ef;color:#15140f;font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif}
      #gamenfy-auth-gate[hidden]{display:none}
      .gamenfy-auth-card{width:min(100%,420px);background:#fff;border:1px solid #e8e6df;border-radius:22px;padding:26px;box-shadow:0 18px 60px rgba(21,20,15,.12)}
      .gamenfy-auth-mark{font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#d4633e;margin-bottom:10px}
      .gamenfy-auth-card h1{font-size:25px;line-height:1.15;margin:0 0 8px}.gamenfy-auth-card p{font-size:14px;line-height:1.5;color:#6f6c63;margin:0 0 18px}
      .gamenfy-auth-card label{display:block;font-size:12px;font-weight:700;margin:12px 0 6px}.gamenfy-auth-card input{width:100%;padding:13px 14px;border:1px solid #dbd8cf;border-radius:12px;background:#fff;color:#15140f;font-size:16px;outline:none}
      .gamenfy-auth-card input:focus{border-color:#15140f;box-shadow:0 0 0 3px rgba(21,20,15,.07)}
      .gamenfy-auth-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:18px}.gamenfy-auth-actions button{padding:13px 12px;border-radius:12px;border:1px solid #15140f;font-weight:800;font-size:14px;cursor:pointer}.gamenfy-auth-primary{background:#15140f;color:#fff}.gamenfy-auth-secondary{background:#fff;color:#15140f}
      #gamenfy-auth-message{min-height:20px;margin-top:13px;font-size:12px;line-height:1.45;color:#b14e2e}.gamenfy-auth-note{margin-top:14px!important;font-size:11px!important;color:#8b887f!important}
      #gamenfy-account-chip{position:fixed;right:12px;bottom:calc(82px + env(safe-area-inset-bottom));z-index:45;border:1px solid #e8e6df;border-radius:999px;background:#fff;color:#15140f;padding:7px 10px;font:700 11px/1 -apple-system,BlinkMacSystemFont,"Inter",sans-serif;box-shadow:0 4px 18px rgba(21,20,15,.08);cursor:pointer}
      @media(max-width:480px){.gamenfy-auth-card{padding:22px 18px;border-radius:18px}.gamenfy-auth-actions{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensureGate() {
    styleGate();
    let gate = document.getElementById('gamenfy-auth-gate');
    if (gate) return gate;
    gate = document.createElement('div');
    gate.id = 'gamenfy-auth-gate';
    gate.innerHTML = `
      <form class="gamenfy-auth-card" id="gamenfy-auth-form">
        <div class="gamenfy-auth-mark">Gamenfy · privé</div>
        <h1>Jouw account, jouw data.</h1>
        <p>Log in om Gamenfy en je cloudgegevens te openen. Maak hier één keer je persoonlijke account aan als je dat nog niet hebt.</p>
        <label for="gamenfy-auth-email">E-mailadres</label>
        <input id="gamenfy-auth-email" name="email" type="email" autocomplete="email" inputmode="email" required>
        <label for="gamenfy-auth-password">Wachtwoord</label>
        <input id="gamenfy-auth-password" name="password" type="password" autocomplete="current-password" minlength="8" required>
        <div class="gamenfy-auth-actions">
          <button class="gamenfy-auth-primary" type="submit">Inloggen</button>
          <button class="gamenfy-auth-secondary" id="gamenfy-auth-signup" type="button">Account maken</button>
        </div>
        <div id="gamenfy-auth-message" role="status" aria-live="polite"></div>
        <p class="gamenfy-auth-note">Deel je wachtwoord nooit in een chat. Het wordt rechtstreeks en versleuteld door Supabase Auth verwerkt.</p>
      </form>`;
    document.body.appendChild(gate);
    const form = document.getElementById('gamenfy-auth-form');
    form.addEventListener('submit', (event) => { event.preventDefault(); authenticate('signin'); });
    document.getElementById('gamenfy-auth-signup').addEventListener('click', () => authenticate('signup'));
    return gate;
  }

  function message(text, ok) {
    const el = document.getElementById('gamenfy-auth-message');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = ok ? '#2e8b5f' : '#b14e2e';
  }

  function showGate(text) {
    const run = () => {
      const gate = ensureGate();
      gate.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      if (text) message(text, false);
    };
    if (document.body) run();
    else document.addEventListener('DOMContentLoaded', run, { once: true });
  }

  function showAccountChip(session) {
    let chip = document.getElementById('gamenfy-account-chip');
    if (!chip) {
      chip = document.createElement('button');
      chip.id = 'gamenfy-account-chip';
      chip.type = 'button';
      chip.title = 'Uitloggen';
      chip.addEventListener('click', () => {
        if (confirm('Uitloggen bij Gamenfy?')) window.gamenfySignOut();
      });
      document.body.appendChild(chip);
    }
    chip.textContent = (session.user.email || 'Account') + ' · uitloggen';
  }

  function acceptSession(session) {
    if (!session || !session.user || !session.access_token) {
      window.gamenfyAccessToken = null;
      window.gamenfyUserId = null;
      showGate();
      return;
    }
    window.gamenfyAccessToken = session.access_token;
    window.gamenfyUserId = session.user.id;
    maybeLoadAutoHabitReconciler();
    const reveal = () => {
      const gate = document.getElementById('gamenfy-auth-gate');
      if (gate) gate.hidden = true;
      document.documentElement.style.overflow = '';
      showAccountChip(session);
    };
    if (document.body) reveal();
    else document.addEventListener('DOMContentLoaded', reveal, { once: true });
    if (!readyResolved) {
      readyResolved = true;
      resolveReady(session);
      window.dispatchEvent(new CustomEvent('gamenfy-auth-ready', { detail: { userId: session.user.id } }));
    }
  }

  async function authenticate(mode) {
    const email = (document.getElementById('gamenfy-auth-email').value || '').trim();
    const password = document.getElementById('gamenfy-auth-password').value || '';
    if (!email || password.length < 8) {
      message('Vul een geldig e-mailadres en minimaal 8 tekens voor je wachtwoord in.', false);
      return;
    }
    message(mode === 'signup' ? 'Account wordt aangemaakt…' : 'Bezig met inloggen…', true);
    const result = mode === 'signup'
      ? await client.auth.signUp({ email, password })
      : await client.auth.signInWithPassword({ email, password });
    if (result.error) {
      message(result.error.message || 'Inloggen is niet gelukt.', false);
      return;
    }
    if (result.data && result.data.session) {
      acceptSession(result.data.session);
      return;
    }
    message('Account aangemaakt. Bevestig de e-mail die Supabase je heeft gestuurd en log daarna hier in.', true);
  }

  client.auth.onAuthStateChange((_event, session) => acceptSession(session));
  client.auth.getSession()
    .then(({ data, error }) => {
      if (error) failClosed(error.message);
      else acceptSession(data && data.session);
    })
    .catch(() => failClosed('De beveiligde sessie kon niet worden gecontroleerd.'));
})();