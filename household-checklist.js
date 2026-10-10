/* Household mini-checklist · ChatGPT (OpenAI) · 2026-10-10.
   Optional substeps only; canonical habit/XP writes remain in toggleMission.
   Stored inside the existing date-scoped, synced daily record. */
(function () {
  'use strict';
  var steps = [
    ['clothes', 'Kleding opruimen', 'Schone kleding in de kast, vuile kleding in de wasmand.'],
    ['trash', 'Afval weggooien', 'Verpakkingen, papier en andere troep weg.'],
    ['places', 'Alles op zijn plek', 'Losse spullen terug naar hun vaste plek.'],
    ['machines', 'Machines aan het werk', 'Was of vaat in- of uitruimen en zo nodig starten.'],
    ['prepare', 'Dag of week voorbereiden', 'Leg klaar wat je nodig hebt; doe klusjes die nog rommel maken nu.'],
    ['wipe', 'Schoonmaken met een doekje', 'Werk van boven naar beneden; gebruik aparte doekjes voor keuken en toilet.'],
    ['vacuum', 'Stofzuigen', 'Haal stof en kruimels van de vloer.'],
    ['mop', 'Dweilen', 'Alleen wanneer nodig en passend bij je vloer.'],
    ['finish', 'Final touch', 'Kussens recht, spullen klaar: is het fijn om hier te zijn?']
  ];
  var dialog, day, returnFocus;
  function currentDay() {
    if (typeof window.viewedDateStr === 'function') return window.viewedDateStr();
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function record(date) {
    var value = JSON.parse(localStorage.getItem('rpg_daily_v1:' + date) || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid daily record');
    return value;
  }
  function checked(date) {
    var value = record(date).householdChecklist;
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }
  function save(date, id, done) {
    if (!steps.some(function (step) { return step[0] === id; })) return;
    var value = record(date);
    var state = checked(date);
    state[id] = !!done;
    value.householdChecklist = state;
    localStorage.setItem('rpg_daily_v1:' + date, JSON.stringify(value));
  }
  function habitDone() {
    var log = JSON.parse(localStorage.getItem('rpg_habitlog_v1') || '{}');
    return !!(log.household && log.household[day]);
  }
  function refresh() {
    if (!dialog || !dialog.open) return;
    try {
      var state = checked(day), total = 0;
      dialog.querySelectorAll('[data-hh-step]').forEach(function (input) {
        input.checked = state[input.dataset.hhStep] === true;
        if (input.checked) total++;
      });
      dialog.querySelector('[data-hh-progress]').textContent = total + ' / ' + steps.length + ' stappen · ' + day;
      var done = habitDone();
      var button = dialog.querySelector('[data-hh-complete]');
      button.textContent = done ? 'Household is afgevinkt ✓' : 'Household afvinken';
      button.disabled = done || currentDay() !== day || typeof window.toggleMission !== 'function';
      dialog.querySelector('[data-hh-error]').textContent = currentDay() !== day ? 'De dag is veranderd. Sluit en open de checklist opnieuw.' : '';
    } catch (e) {
      dialog.querySelector('[data-hh-error]').textContent = 'Je voortgang kon niet worden gelezen. Er is niets overschreven.';
    }
  }
  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'hh-dialog';
    dialog.setAttribute('aria-labelledby', 'hh-title');
    dialog.innerHTML = '<header><div><small>DAILY HABIT</small><h2 id="hh-title">Household reset</h2></div><button type="button" data-hh-close aria-label="Checklist sluiten">×</button></header>' +
      '<p class="hh-intro">Eén vaste volgorde. Sla over wat vandaag niet nodig is. De machines draaien alvast terwijl jij verdergaat.</p>' +
      '<p class="hh-progress" data-hh-progress role="status"></p><ol>' + steps.map(function (step, i) {
        return '<li><label><input type="checkbox" data-hh-step="' + step[0] + '"><span><strong>' + (i+1) + '. ' + step[1] + '</strong><small>' + step[2] + '</small></span></label></li>';
      }).join('') + '</ol><p class="hh-error" data-hh-error role="alert"></p>' +
      '<footer><button type="button" data-hh-complete>Household afvinken</button><p>Stappen worden direct bewaard. Alleen deze knop of het ronde habit-vinkje voltooit je missie; geen extra XP per stap.</p></footer>';
    dialog.querySelector('[data-hh-close]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('close', function () {
      document.body.classList.remove('hh-open');
      if (returnFocus && returnFocus.isConnected) returnFocus.focus();
    });
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      var rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('change', function (event) {
      var input = event.target;
      if (!input.dataset.hhStep) return;
      try { save(day, input.dataset.hhStep, input.checked); refresh(); }
      catch (e) {
        input.checked = !input.checked;
        dialog.querySelector('[data-hh-error]').textContent = 'Opslaan is niet gelukt. Probeer de stap opnieuw; het vinkje is teruggezet.';
      }
    });
    dialog.querySelector('[data-hh-complete]').addEventListener('click', function () {
      if (currentDay() !== day) { refresh(); return; }
      try {
        if (!habitDone() && typeof window.toggleMission === 'function') window.toggleMission('household');
        refresh();
      } catch (e) { dialog.querySelector('[data-hh-error]').textContent = 'Afvinken is niet gelukt. Controleer je habit-status en probeer opnieuw.'; }
    });
    document.body.appendChild(dialog);
  }
  window.openHouseholdChecklist = function () {
    if (!dialog) build();
    if (dialog.open) return;
    day = currentDay();
    returnFocus = document.activeElement;
    if (returnFocus && returnFocus.tagName === 'IFRAME') {
      try { returnFocus = returnFocus.contentDocument.activeElement || returnFocus; } catch (e) {}
    }
    dialog.showModal();
    document.body.classList.add('hh-open');
    refresh();
  };
  ['storage', 'gamenfy:remote-state-applied', 'gamenfy:daily-mission-change', 'focus'].forEach(function (event) { window.addEventListener(event, refresh); });
})();
