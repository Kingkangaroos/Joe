// Website Ventures Fulfilment Run controller
// Managed by ChatGPT (OpenAI), 2026-09-09.
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const KEY = 'wv_fulfilment_runs_v1';
  const INTAKE_PREFIX = 'wv_client_intake_v1_';
  const CONFIG_PREFIX = 'wv_client_config_draft_v1_';
  const CHECK_PREFIX = 'wv_delivery_checks_v1_';
  const SPEC = [
    { id: 'intake', title: 'Intake compleet', detail: 'Bedrijfsnaam, contact, diensten, servicegebied, CTA, domeinstatus. Geen secrets.' },
    { id: 'content', title: 'Content + real proof ontvangen', detail: 'Logo, echte projectfoto’s, reviews/certificering alleen met bron, ontbrekende items als blocker.' },
    { id: 'config', title: 'Client config', detail: 'Client Factory config invullen, local preview beoordelen, daarna approved JSON naar repo.' },
    { id: 'visuals', title: 'Visual slots', detail: 'Bestaande selected assets hergebruiken; alleen nieuwe generatie bij aantoonbaar klant/page-need.' },
    { id: 'desktop', title: 'Desktop QA', detail: 'Copy, links, services, selected assets, overflow, section rhythm en proof-integriteit.' },
    { id: 'mobile', title: '390px mobile QA', detail: 'Hero crop, CTA, touch, sticky/scroll gedrag, leesbaarheid en performance.' },
    { id: 'domain', title: 'Domain + hosting', detail: 'Domein blijft klant-owned. DNS/hosting koppelen volgens gekozen fulfilmentmodel.' },
    { id: 'launch', title: 'Launch check', detail: 'Live URL, contactlinks, metadata, 404/redirects, real-device sanity check.' },
    { id: 'handoff', title: 'Handoff + bewijs', detail: 'Klant akkoord, beheerafspraken, testimonial/referral pas vragen na echte levering.' }
  ];

  let run = null;

  function all () {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { runs: {} };
    } catch (error) {
      return { runs: {} };
    }
  }

  function persist (data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      return false;
    }
  }

  function slugify (value) {
    return String(value || '').toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'client-01';
  }

  function key () {
    return slugify($('slug').value) + '::' + $('runNo').value;
  }

  function fresh () {
    return {
      version: 2,
      slug: slugify($('slug').value),
      runNo: Number($('runNo').value),
      status: 'active',
      startedAt: null,
      updatedAt: null,
      launchedAt: null,
      launchEvidence: null,
      phases: Object.fromEntries(SPEC.map(item => [item.id, { done: false, seconds: 0, runningSince: null, note: '' }]))
    };
  }

  function load () {
    const data = all();
    const value = data.runs[key()] || fresh();
    SPEC.forEach(item => {
      if (!value.phases[item.id]) value.phases[item.id] = { done: false, seconds: 0, runningSince: null, note: '' };
    });
    return value;
  }

  function localEvidence () {
    const slug = slugify($('slug').value);
    let intake = null;
    let config = null;
    let checks = {};
    try {
      const intakeRaw = localStorage.getItem(INTAKE_PREFIX + slug);
      const configRaw = localStorage.getItem(CONFIG_PREFIX + slug);
      const checksRaw = localStorage.getItem(CHECK_PREFIX + slug);
      if (intakeRaw) intake = JSON.parse(intakeRaw);
      if (configRaw) config = JSON.parse(configRaw);
      if (checksRaw) checks = JSON.parse(checksRaw) || {};
    } catch (error) {}
    return { slug, intake, config, checks };
  }

  function foundationReport () {
    const current = localEvidence();
    return window.WVFulfilmentContract?.assessFoundation(current.intake, current.slug) || {
      ok: false,
      errors: ['Fulfilmentcontract is niet geladen.']
    };
  }

  function launchReport () {
    const current = localEvidence();
    return window.WVFulfilmentContract?.assessLaunch(run, current.intake, current.config, current.checks, current.slug) || {
      ok: false,
      errors: ['Fulfilmentcontract is niet geladen.'],
      currentEvidence: false,
      evidence: {},
      phases: { done: 0, total: SPEC.length, open: SPEC.map(item => item.id) },
      delivery: { done: 0, total: 12, open: [] }
    };
  }

  function seconds (phase) {
    let total = Number(phase.seconds) || 0;
    if (phase.runningSince) total += Math.max(0, (Date.now() - new Date(phase.runningSince).getTime()) / 1000);
    return total;
  }

  function formatDuration (value) {
    const rounded = Math.round(value);
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    return hours ? hours + 'h ' + minutes + 'm' : minutes + 'm';
  }

  function elapsed () {
    if (!run?.startedAt) return '—';
    const end = run.launchedAt ? new Date(run.launchedAt).getTime() : Date.now();
    const milliseconds = Math.max(0, end - new Date(run.startedAt).getTime());
    const hours = Math.floor(milliseconds / 3600000);
    const days = Math.floor(hours / 24);
    return days ? days + 'd ' + (hours % 24) + 'h' : hours + 'h';
  }

  function renderGate () {
    const foundation = foundationReport();
    const launch = launchReport();
    const gate = $('runGate');
    if (!foundation.ok) {
      gate.className = 'gate bad';
      gate.textContent = 'Run geblokkeerd · ' + (foundation.errors[0] || 'geldige Intake + scope ontbreken.');
    } else if (launch.ok) {
      gate.className = 'gate good';
      gate.textContent = 'Launch-status vrijgegeven · evidence 3/3 · fases ' + launch.phases.done + '/' + launch.phases.total + ' · Delivery Gate ' + launch.delivery.done + '/' + launch.delivery.total + '.';
    } else {
      const evidenceReady = Object.values(launch.evidence).filter(result => result.ok).length;
      gate.className = 'gate';
      gate.textContent = 'Run meetbaar · launch blijft geblokkeerd: evidence ' + evidenceReady + '/3 · fases ' + launch.phases.done + '/' + launch.phases.total + ' · Delivery Gate ' + launch.delivery.done + '/' + launch.delivery.total + '.';
    }
    document.querySelectorAll('[data-toggle],[data-done],[data-text]').forEach(control => { control.disabled = !foundation.ok; });
    $('save').disabled = !foundation.ok;
    $('copy').disabled = !foundation.ok;
  }

  function save (quiet) {
    const foundation = foundationReport();
    if (!foundation.ok) {
      $('summary').textContent = 'Niet opgeslagen: ' + (foundation.errors[0] || 'geldige Intake + scope ontbreken.');
      renderGate();
      return false;
    }
    const requestedStatus = $('runStatus').value;
    if (requestedStatus === 'launched') {
      const launch = launchReport();
      if (!launch.ok) {
        $('runStatus').value = run.status || 'active';
        $('summary').textContent = 'Status launched geblokkeerd: ' + launch.errors.join(' ');
        renderGate();
        return false;
      }
      if (!run.launchedAt) run.launchedAt = new Date().toISOString();
      run.launchEvidence = {
        recordedAt: new Date().toISOString(),
        currentEvidence: launch.currentEvidence,
        phasesDone: launch.phases.done,
        phasesTotal: launch.phases.total,
        deliveryDone: launch.delivery.done,
        deliveryTotal: launch.delivery.total
      };
    }
    const data = all();
    run.version = 2;
    run.slug = slugify($('slug').value);
    run.runNo = Number($('runNo').value);
    run.status = requestedStatus;
    if (!run.startedAt) run.startedAt = new Date().toISOString();
    run.updatedAt = new Date().toISOString();
    data.runs[key()] = run;
    if (!persist(data)) {
      $('summary').textContent = 'Run kon niet lokaal worden opgeslagen.';
      return false;
    }
    renderMetrics();
    renderGate();
    if (!quiet) {
      $('summary').textContent = 'Saved · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · active ' + formatDuration(Object.values(run.phases).reduce((total, phase) => total + seconds(phase), 0));
    }
    return true;
  }

  function stopOthers (except) {
    Object.entries(run.phases).forEach(([id, phase]) => {
      if (id !== except && phase.runningSince) {
        phase.seconds = seconds(phase);
        phase.runningSince = null;
      }
    });
  }

  function toggle (id) {
    if (!foundationReport().ok) return renderGate();
    const phase = run.phases[id];
    if (phase.done) return;
    if (phase.runningSince) {
      phase.seconds = seconds(phase);
      phase.runningSince = null;
    } else {
      stopOthers(id);
      phase.runningSince = new Date().toISOString();
    }
    save(true);
    render();
  }

  function done (id) {
    if (!foundationReport().ok) return renderGate();
    const phase = run.phases[id];
    if (phase.runningSince) {
      phase.seconds = seconds(phase);
      phase.runningSince = null;
    }
    phase.done = !phase.done;
    save(true);
    render();
  }

  function escapeTextarea (value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function render () {
    const box = $('phases');
    box.innerHTML = SPEC.map((item, index) => {
      const phase = run.phases[item.id];
      const running = !!phase.runningSince;
      return '<article class="phase' + (phase.done ? ' done' : '') + '">' +
        '<div class="phase-main"><div class="num">' + (phase.done ? '✓' : String(index + 1).padStart(2, '0')) + '</div>' +
        '<div class="title"><b>' + item.title + '</b><span>' + item.detail + '</span></div>' +
        '<div class="time" data-time="' + item.id + '">' + formatDuration(seconds(phase)) + '</div></div>' +
        '<div class="controls"><button class="btn ' + (running ? '' : 'primary') + '" data-toggle="' + item.id + '">' + (running ? 'Pause' : 'Start timer') + '</button>' +
        '<button class="btn done" data-done="' + item.id + '">' + (phase.done ? 'Undo done' : 'Done') + '</button>' +
        '<button class="btn" data-note="' + item.id + '">Blocker / note</button></div>' +
        '<div class="note' + (phase.note ? ' open' : '') + '" data-note-box="' + item.id + '"><textarea placeholder="Wat vertraagde dit? Geen credentials." data-text="' + item.id + '">' + escapeTextarea(phase.note) + '</textarea></div></article>';
    }).join('');
    box.querySelectorAll('[data-toggle]').forEach(button => { button.onclick = () => toggle(button.dataset.toggle); });
    box.querySelectorAll('[data-done]').forEach(button => { button.onclick = () => done(button.dataset.done); });
    box.querySelectorAll('[data-note]').forEach(button => {
      button.onclick = () => box.querySelector('[data-note-box="' + button.dataset.note + '"]').classList.toggle('open');
    });
    box.querySelectorAll('[data-text]').forEach(textarea => {
      textarea.oninput = () => {
        if (!foundationReport().ok) return renderGate();
        run.phases[textarea.dataset.text].note = textarea.value;
        save(true);
      };
    });
    renderMetrics();
    renderGate();
  }

  function renderMetrics () {
    const phases = Object.values(run.phases);
    const total = phases.reduce((sum, phase) => sum + seconds(phase), 0);
    const doneCount = phases.filter(phase => phase.done).length;
    $('activeTotal').textContent = formatDuration(total);
    $('doneTotal').textContent = doneCount + '/' + SPEC.length;
    $('started').textContent = run.startedAt ? new Date(run.startedAt).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }) : '—';
    $('elapsed').textContent = elapsed();
  }

  function loadKey () {
    run = load();
    $('runStatus').value = run.status || 'active';
    render();
  }

  for (let index = 1; index <= 10; index++) {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = 'Client ' + String(index).padStart(2, '0');
    $('runNo').appendChild(option);
  }
  $('runNo').value = '1';
  try {
    const lastClient = localStorage.getItem(INTAKE_PREFIX + 'last');
    if (lastClient) $('slug').value = slugify(lastClient);
  } catch (error) {}

  $('slug').onchange = () => {
    $('slug').value = slugify($('slug').value);
    loadKey();
  };
  $('runNo').onchange = loadKey;
  $('runStatus').onchange = () => save(false);
  $('save').onclick = () => save(false);
  $('copy').onclick = async () => {
    if (!save(true)) return;
    const output = JSON.stringify(run, null, 2);
    try {
      await navigator.clipboard.writeText(output);
      $('summary').textContent = 'Run JSON gekopieerd.';
    } catch (error) {
      $('summary').textContent = output;
    }
  };
  $('newRun').onclick = () => {
    const next = Math.min(10, Number($('runNo').value) + 1);
    $('runNo').value = String(next);
    $('slug').value = 'client-' + String(next).padStart(2, '0');
    loadKey();
  };
  $('reset').onclick = () => {
    const data = all();
    delete data.runs[key()];
    persist(data);
    run = fresh();
    $('runStatus').value = 'active';
    render();
    $('summary').textContent = 'Huidige lokale run is gereset; er is nog geen nieuwe meting gestart.';
  };
  setInterval(() => {
    document.querySelectorAll('[data-time]').forEach(element => {
      const phase = run?.phases?.[element.dataset.time];
      if (phase) element.textContent = formatDuration(seconds(phase));
    });
    renderMetrics();
  }, 1000);
  loadKey();
})();
