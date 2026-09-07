// Gamenfy Public Beta v0.1 — isolated multi-user core loop.
// Performed by ChatGPT/OpenAI for Joey's Gamenfy project.
(function () {
  'use strict';

  const SUPABASE_URL = 'https://ttxjsoahmtennnufgeqx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_5lYXJme36ggS2dWTJbMSCA_Ir9Uogab';
  const TABLE = 'gamenfy_public_state';
  const STATE_KEY = 'core';

  const MISSIONS = [
    { key: 'budgeting', label: 'Budgeting', detail: 'Spend bewust · check je geld', dir: 'budgeting' },
    { key: 'sleep', label: 'Sleep', detail: '7+ uur goede slaap', dir: 'sleep' },
    { key: 'nutrition', label: 'Nutrition', detail: 'Eet zoals je future self', dir: 'nutrition' },
    { key: 'walking', label: '10K Steps', detail: '10.000 stappen vandaag', dir: 'steps' },
    { key: 'teeth', label: 'Brush Teeth 2×', detail: 'Ochtend + avond', dir: 'teeth' },
    { key: 'household', label: 'Household', detail: 'Maak je omgeving beter', dir: 'household' },
    { key: 'meditation', label: 'Meditation', detail: 'Even stil. Even scherp.', dir: 'meditation' },
    { key: 'gratitude', label: 'Gratitude', detail: 'Noem iets dat goed is', dir: 'gratitude' },
    { key: 'good_deed', label: 'Good Deed', detail: 'Doe iets goeds voor iemand', dir: 'good-deed' },
    { key: 'screen_time', label: 'Screen Time', detail: 'Blijf binnen je limiet', dir: 'screen-time' },
    { key: 'cold_shower', label: 'Cold Shower', detail: 'Kies discomfort', dir: 'cold-shower' }
  ];

  let client = null;
  let session = null;
  let state = null;
  let authMode = 'signup';
  let saveSerial = 0;

  const $ = (id) => document.getElementById(id);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function localDate(date) {
    const d = date || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function addDays(iso, days) {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    date.setDate(date.getDate() + days);
    return localDate(date);
  }

  function defaultState(user) {
    const metadataName = user && user.user_metadata && user.user_metadata.display_name;
    const emailName = user && user.email ? user.email.split('@')[0] : 'Player';
    return {
      version: 1,
      createdDate: localDate(),
      profile: { name: String(metadataName || emailName || 'Player').slice(0, 40) },
      logs: {}
    };
  }

  function normalizeState(raw, user) {
    const base = defaultState(user);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
    return {
      version: 1,
      createdDate: /^\d{4}-\d{2}-\d{2}$/.test(raw.createdDate || '') ? raw.createdDate : base.createdDate,
      profile: { name: String(raw.profile && raw.profile.name || base.profile.name).slice(0, 40) },
      logs: raw.logs && typeof raw.logs === 'object' && !Array.isArray(raw.logs) ? raw.logs : {}
    };
  }

  function todayLog() {
    const today = localDate();
    if (!state.logs[today] || typeof state.logs[today] !== 'object') state.logs[today] = {};
    return state.logs[today];
  }

  function missionLevel(key) {
    if (!state) return 0;
    const today = localDate();
    let cursor = state.createdDate;
    let level = 0;
    let guard = 0;
    while (cursor <= today && guard < 5000) {
      const checked = !!(state.logs[cursor] && state.logs[cursor][key]);
      if (cursor < today) level = clamp(level + (checked ? 1 : -1), 0, 10);
      else if (checked) level = clamp(level + 1, 0, 10);
      cursor = addDays(cursor, 1);
      guard += 1;
    }
    return level;
  }

  function assetFor(mission, level) {
    const displayLevel = String(clamp(level || 1, 1, 10)).padStart(2, '0');
    return `../img/lab/park31/${mission.dir}/l${displayLevel}.webp`;
  }

  function checkedToday(key) {
    const log = state && state.logs && state.logs[localDate()];
    return !!(log && log[key]);
  }

  function completedTodayCount() {
    return MISSIONS.reduce((sum, mission) => sum + (checkedToday(mission.key) ? 1 : 0), 0);
  }

  function totalChecks() {
    if (!state || !state.logs) return 0;
    return Object.values(state.logs).reduce((sum, log) => {
      if (!log || typeof log !== 'object') return sum;
      return sum + MISSIONS.reduce((n, mission) => n + (log[mission.key] ? 1 : 0), 0);
    }, 0);
  }

  function scoreCopy(count) {
    if (count >= 11) return ['Perfect day', 'Alle missions binnen. Dat is een clean sweep.'];
    if (count >= 9) return ['Elite run', `Nog ${11 - count} te gaan.`];
    if (count >= 6) return ['Momentum', `Nog ${11 - count} missions over.`];
    if (count >= 3) return ['Building', `Nog ${11 - count} missions over.`];
    return ['Warming up', `Nog ${11 - count} missions over vandaag.`];
  }

  function missionCard(mission) {
    const done = checkedToday(mission.key);
    const level = missionLevel(mission.key);
    const card = document.createElement('article');
    card.className = 'mission' + (done ? ' done' : '');
    card.dataset.mission = mission.key;
    card.innerHTML = `
      <div class="art"><img src="${assetFor(mission, level)}" alt="" loading="lazy"></div>
      <div class="mission-copy"><h3>${escapeHtml(mission.label)}</h3><p>${escapeHtml(mission.detail)}</p><span class="level">Level ${level}</span></div>
      <button class="check" type="button" aria-label="${done ? 'Maak ongedaan' : 'Voltooi'}">${done ? '✓' : ''}</button>`;
    card.querySelector('.check').addEventListener('click', () => toggleMission(mission.key));
    return card;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function renderMissions(container) {
    container.textContent = '';
    MISSIONS.forEach((mission) => container.appendChild(missionCard(mission)));
  }

  function render() {
    if (!state || !session) return;
    const count = completedTodayCount();
    const levels = MISSIONS.map((m) => missionLevel(m.key));
    const avg = levels.reduce((a, b) => a + b, 0) / MISSIONS.length;
    const best = Math.max.apply(null, levels);
    const [title, sub] = scoreCopy(count);
    const name = state.profile.name || 'Player';

    $('hello').textContent = `${name}, make today count.`;
    $('scoreNumber').textContent = `${count}/11`;
    $('scoreRing').style.setProperty('--pct', `${(count / 11) * 360}deg`);
    $('scoreTitle').textContent = title;
    $('scoreSub').textContent = sub;
    $('statAvg').textContent = avg.toFixed(1);
    $('statChecks').textContent = String(totalChecks());
    $('statBest').textContent = String(best);
    $('dateLabel').textContent = new Intl.DateTimeFormat('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());
    $('avatar').textContent = (name.trim()[0] || 'P').toUpperCase();
    $('profileHeading').textContent = name;
    $('profileEmail').textContent = session.user.email || '';
    $('profileName').value = name;

    renderMissions($('homeMissions'));
    renderMissions($('allMissions'));
  }

  async function loadState() {
    setSync('laden…');
    const { data, error } = await client.from(TABLE)
      .select('data')
      .eq('user_id', session.user.id)
      .eq('key', STATE_KEY)
      .maybeSingle();
    if (error) throw error;
    state = normalizeState(data && data.data, session.user);
    if (!data) await persistState();
    setSync('opgeslagen', 'ok');
  }

  async function persistState() {
    const mySerial = ++saveSerial;
    setSync('opslaan…');
    const payload = {
      user_id: session.user.id,
      key: STATE_KEY,
      data: state,
      updated_at: new Date().toISOString()
    };
    const { error } = await client.from(TABLE).upsert(payload, { onConflict: 'user_id,key' });
    if (mySerial !== saveSerial) return;
    if (error) {
      setSync('sync fout', 'bad');
      throw error;
    }
    setSync('opgeslagen', 'ok');
  }

  async function toggleMission(key) {
    const log = todayLog();
    const previous = !!log[key];
    log[key] = !previous;
    render();
    try {
      await persistState();
      toast(log[key] ? '+1 voor vandaag ✓' : 'Check verwijderd');
    } catch (error) {
      log[key] = previous;
      render();
      toast('Opslaan mislukt. Probeer opnieuw.');
    }
  }

  function setSync(text, cls) {
    const el = $('sync');
    if (!el) return;
    el.textContent = text;
    el.className = 'sync' + (cls ? ` ${cls}` : '');
  }

  let toastTimer = null;
  function toast(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function showView(id) {
    document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === id));
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.view === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setAuthMode(mode) {
    authMode = mode;
    const signup = mode === 'signup';
    $('modeSignup').classList.toggle('active', signup);
    $('modeSignin').classList.toggle('active', !signup);
    $('nameField').hidden = !signup;
    $('authSubmit').textContent = signup ? 'Maak mijn account' : 'Inloggen';
    $('password').autocomplete = signup ? 'new-password' : 'current-password';
    authMessage('');
  }

  function authMessage(text, ok) {
    const el = $('authMessage');
    el.textContent = text || '';
    el.style.color = ok ? '#2f8b63' : '#ad4d32';
  }

  async function authenticate(event) {
    event.preventDefault();
    const email = ($('email').value || '').trim();
    const password = $('password').value || '';
    const name = ($('name').value || '').trim();
    if (!email || password.length < 8) {
      authMessage('Gebruik een geldig e-mailadres en een wachtwoord van minimaal 8 tekens.');
      return;
    }
    if (authMode === 'signup' && !name) {
      authMessage('Vul ook je naam in.');
      return;
    }
    $('authSubmit').disabled = true;
    authMessage(authMode === 'signup' ? 'Account wordt aangemaakt…' : 'Bezig met inloggen…', true);
    try {
      const result = authMode === 'signup'
        ? await client.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/public/', data: { display_name: name, app: 'gamenfy_public' } } })
        : await client.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (result.data && result.data.session) {
        await enterApp(result.data.session);
      } else {
        setAuthMode('signin');
        $('email').value = email;
        authMessage('Account gemaakt. Check één keer je e-mail om je account te bevestigen; daarna kom je terug in Gamenfy Public.', true);
      }
    } catch (error) {
      authMessage(error && error.message ? error.message : 'Dit lukte niet. Probeer opnieuw.');
    } finally {
      $('authSubmit').disabled = false;
    }
  }

  async function enterApp(nextSession) {
    session = nextSession;
    if (!session || !session.user) return showAuth();
    $('loading').hidden = false;
    $('auth').hidden = true;
    try {
      await loadState();
      render();
      $('app').hidden = false;
      $('tabs').hidden = false;
      $('loading').hidden = true;
    } catch (error) {
      $('loading').hidden = true;
      showAuth('Je account werkt, maar je Public Beta-data kon niet worden geladen. Probeer het nog eens.');
      console.error('[Gamenfy Public] load failed', error);
    }
  }

  function showAuth(message) {
    session = null;
    state = null;
    $('loading').hidden = true;
    $('app').hidden = true;
    $('tabs').hidden = true;
    $('auth').hidden = false;
    if (message) authMessage(message);
  }

  async function saveProfile() {
    const name = ($('profileName').value || '').trim().slice(0, 40);
    if (!name) return toast('Vul een naam in.');
    const previous = state.profile.name;
    state.profile.name = name;
    render();
    try {
      await persistState();
      toast('Profiel opgeslagen ✓');
    } catch (_error) {
      state.profile.name = previous;
      render();
      toast('Opslaan mislukt.');
    }
  }

  async function init() {
    if (!window.supabase || !window.supabase.createClient) {
      $('loading').hidden = true;
      showAuth('De beveiligde verbinding kon niet worden geladen. Open de pagina opnieuw.');
      return;
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    $('modeSignup').addEventListener('click', () => setAuthMode('signup'));
    $('modeSignin').addEventListener('click', () => setAuthMode('signin'));
    $('authForm').addEventListener('submit', authenticate);
    $('saveProfile').addEventListener('click', saveProfile);
    $('logout').addEventListener('click', async () => { await client.auth.signOut(); window.location.reload(); });
    $('avatar').addEventListener('click', () => showView('profileView'));
    document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => showView(tab.dataset.view)));

    client.auth.onAuthStateChange((_event, nextSession) => {
      if (!nextSession && session) showAuth();
    });

    const { data, error } = await client.auth.getSession();
    if (error || !data || !data.session) showAuth(error && error.message);
    else await enterApp(data.session);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
