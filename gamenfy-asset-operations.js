/* Gamenfy Asset Operations — read-only renderer. ChatGPT (OpenAI), 2026-09-10. */
(function () {
  'use strict';

  var body = document.body;
  var manifestPath = body.dataset.manifest || 'GAMENFY-ASSET-OPERATIONS.json';
  var badgePath = body.dataset.badgeRegistry || 'GAMENFY-BADGE-REGISTRY.json';
  var views = ['overview', 'map', 'queue', 'gates', 'direction'];
  var state = { operations: null, badges: null, view: body.dataset.defaultView || 'overview' };

  function make(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = String(text);
    return element;
  }

  function statusClass(status) {
    if (status === 'live') return 'live';
    if (status === 'lab-preview-live') return 'lab';
    if (status === 'missing' || status === 'awaiting-intake') return 'wait';
    return '';
  }

  function statusLabel(status) {
    return String(status || 'unknown').replaceAll('-', ' ');
  }

  function toast(message) {
    var element = document.getElementById('toast');
    element.textContent = message;
    element.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(function () { element.classList.remove('show'); }, 1800);
  }

  function addRule(container, text, index) {
    var row = make('div', 'rule');
    var number = make('b', '', String(index + 1).padStart(2, '0'));
    row.append(number, make('span', '', text));
    container.appendChild(row);
  }

  function fillRules(id, items) {
    var list = document.getElementById(id);
    list.textContent = '';
    (items || []).forEach(function (item) { list.appendChild(make('li', '', item)); });
  }

  function renderMetrics(operations, badges) {
    var missionFamily = operations.inventory.find(function (item) { return item.id === 'GF-MISSION-EVOLUTIONS'; });
    var scoreFamily = operations.inventory.find(function (item) { return item.id === 'GF-DAILY-SCORE'; });
    document.getElementById('metricSets').textContent = missionFamily.setCount;
    document.getElementById('metricFrames').textContent = missionFamily.assetCount + scoreFamily.assetCount;
    document.getElementById('metricBadges').textContent = badges.items.length;
    document.getElementById('metricCredits').textContent = operations.strategy.creditsSpentThisRound;
    document.getElementById('updatedAt').textContent = operations.updatedAt;
  }

  function familyCard(item) {
    var card = make('article', 'family');
    var art = make('div', 'family-img');
    if (item.representative) {
      var image = make('img');
      image.src = item.representative;
      image.alt = item.name + ' representative';
      image.loading = 'lazy';
      art.appendChild(image);
    } else {
      art.appendChild(make('span', 'empty-art', item.assetCount === 0 ? 'NO FILES' : 'REFERENCE'));
    }
    var copy = make('div');
    copy.appendChild(make('span', 'status ' + statusClass(item.status), statusLabel(item.status)));
    copy.appendChild(make('h3', '', item.name));
    copy.appendChild(make('p', '', item.assetCount + ' assets · ' + item.decision));
    card.append(art, copy);
    return card;
  }

  function renderOverview(operations) {
    document.getElementById('strategyDecision').textContent = operations.strategy.decision;
    document.getElementById('strategyWhy').textContent = operations.strategy.firstMove + ' ' + operations.strategy.badgeRole;
    var roles = document.getElementById('roleCards');
    roles.textContent = '';
    [
      ['01', 'Mission companions', 'Show reversible daily consistency from Level 0–10. They are already complete and live.'],
      ['02', 'Achievement badges', 'Prove durable milestones. They need exact triggers and a collection home before wiring.'],
      ['03', 'App identity', 'Create recognition outside a mission. One app icon matters; another character pack does not.']
    ].forEach(function (role) {
      var card = make('article', 'mini');
      card.append(make('span', 'num', role[0]), make('h3', '', role[1]), make('p', '', role[2]));
      roles.appendChild(card);
    });
    var strip = document.getElementById('familyStrip');
    strip.textContent = '';
    operations.inventory.forEach(function (item) { strip.appendChild(familyCard(item)); });

    document.getElementById('agentDecision').textContent = operations.agentStrategy.decision;
    var use = document.getElementById('agentUse');
    var avoid = document.getElementById('agentAvoid');
    use.textContent = '';
    avoid.textContent = '';
    operations.agentStrategy.useHighReasoningFor.forEach(function (item, index) { addRule(use, item, index); });
    operations.agentStrategy.doNotUseItAs.forEach(function (item, index) { addRule(avoid, item, index); });
  }

  function renderMap(operations) {
    var grid = document.getElementById('missionGrid');
    grid.textContent = '';
    operations.missionSets.forEach(function (mission) {
      var card = make('article', 'mission' + (mission.privacy === 'private' ? ' private' : ''));
      var art = make('div', 'mission-art');
      var image = make('img');
      image.src = 'img/lab/park31/' + mission.directory + '/l' + String(mission.representativeLevel).padStart(2, '0') + '.webp';
      image.alt = mission.label + ' Level ' + mission.representativeLevel + ' companion';
      image.loading = 'lazy';
      art.appendChild(image);
      card.append(art, make('span', 'privacy', mission.privacy === 'private' ? 'PIN-safe' : 'public'), make('h3', '', mission.label), make('p', '', mission.identity + ' · l01–l10 · live'));
      grid.appendChild(card);
    });

    var list = document.getElementById('inventoryList');
    list.textContent = '';
    operations.inventory.forEach(function (item) {
      var row = make('article', 'inventory-row');
      var name = make('div');
      name.append(make('h3', '', item.name), make('p', '', item.source));
      var usage = make('div', 'use', item.usedIn.join(' · '));
      var count = make('div', 'count', item.assetCount);
      count.appendChild(make('small', '', item.status));
      row.append(name, usage, count);
      list.appendChild(row);
    });
  }

  function renderQueue(operations) {
    var list = document.getElementById('queueList');
    list.textContent = '';
    operations.queue.slice().sort(function (a, b) { return a.rank - b.rank; }).forEach(function (job) {
      var card = make('article', 'job');
      var rank = make('span', 'job-rank', String(job.rank).padStart(2, '0'));
      var copy = make('div');
      copy.append(make('h3', '', job.title), make('p', '', job.outcome));
      var meta = make('div', 'job-meta');
      meta.append(make('span', 'tag prio', job.priority), make('span', 'tag', job.id), make('span', 'tag', job.creditPolicy));
      copy.appendChild(meta);
      var stateCopy = make('div', 'job-state');
      stateCopy.append(make('strong', '', statusLabel(job.status)), make('span', '', 'Depends on: ' + job.dependency));
      card.append(rank, copy, stateCopy);
      list.appendChild(card);
    });
  }

  function renderGates(operations) {
    fillRules('globalPass', operations.gates.globalPass);
    fillRules('globalReject', operations.gates.globalReject);
    fillRules('badgePass', operations.gates.badgePass);
    fillRules('badgeReject', operations.gates.badgeReject);
  }

  function renderDirection(operations) {
    var palette = document.getElementById('palette');
    palette.textContent = '';
    Object.entries(operations.themeDirection.tokens).forEach(function (entry) {
      var swatch = make('div', 'swatch');
      var color = make('div', 'swatch-color');
      color.style.background = entry[1];
      var label = make('span', '', entry[0]);
      label.appendChild(make('small', '', entry[1]));
      swatch.append(color, label);
      palette.appendChild(swatch);
    });
    var rules = document.getElementById('themeRules');
    rules.textContent = '';
    operations.themeDirection.rules.forEach(function (item, index) { addRule(rules, item, index); });
  }

  function openView(view, focusTab) {
    if (!views.includes(view)) view = 'overview';
    state.view = view;
    document.querySelectorAll('[data-view]').forEach(function (tab) {
      var active = tab.dataset.view === view;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });
    views.forEach(function (name) {
      var panel = document.getElementById('panel' + name.charAt(0).toUpperCase() + name.slice(1));
      panel.hidden = name !== view;
    });
    var url = new URL(window.location.href);
    if (view === body.dataset.defaultView) url.searchParams.delete('view');
    else url.searchParams.set('view', view);
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }

  function bindTabs() {
    document.querySelectorAll('[data-view]').forEach(function (tab) {
      tab.addEventListener('click', function () { openView(tab.dataset.view, false); });
      tab.addEventListener('keydown', function (event) {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        var index = views.indexOf(tab.dataset.view);
        var delta = event.key === 'ArrowRight' ? 1 : -1;
        openView(views[(index + delta + views.length) % views.length], true);
      });
    });
    document.querySelectorAll('[data-open-view]').forEach(function (button) {
      button.addEventListener('click', function () {
        openView(button.dataset.openView, false);
        document.querySelector('.tabs-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function intakeText(operations) {
    return [
      'GAMENFY BADGE INTAKE',
      '',
      'Attach the original badge files or provide their exact current location.',
      'Do not rename or compress them before intake.',
      '',
      'Per badge, confirm only when known:',
      operations.badgeSystem.requiredContract.map(function (item) { return '- ' + item; }).join('\n'),
      '',
      'Unknown meaning stays unknown. ChatGPT may propose a mapping, but no trigger is invented from appearance alone.'
    ].join('\n');
  }

  function bindCopy(operations) {
    document.getElementById('copyBadgeIntake').addEventListener('click', function () {
      var text = intakeText(operations);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast('Badge intake checklist copied'); }).catch(function () { toast('Copy failed — open the registry instead'); });
        return;
      }
      toast('Clipboard is not available in this browser');
    });
  }

  async function loadJson(pathname) {
    var response = await fetch(pathname, { cache: 'no-store' });
    if (!response.ok) throw new Error(pathname + ' returned ' + response.status);
    return response.json();
  }

  async function start() {
    try {
      var data = await Promise.all([loadJson(manifestPath), loadJson(badgePath)]);
      state.operations = data[0];
      state.badges = data[1];
      renderMetrics(state.operations, state.badges);
      renderOverview(state.operations);
      renderMap(state.operations);
      renderQueue(state.operations);
      renderGates(state.operations);
      renderDirection(state.operations);
      bindTabs();
      bindCopy(state.operations);
      var requested = new URLSearchParams(window.location.search).get('view');
      openView(views.includes(requested) ? requested : state.operations.defaultView, false);
      window.GamenfyAssetOperations = Object.freeze({ operations: state.operations, badges: state.badges });
    } catch (error) {
      var box = document.getElementById('loadError');
      box.hidden = false;
      box.textContent = 'Asset Operations could not load its manifest. No asset state was guessed. ' + error.message;
    }
  }

  start();
})();
