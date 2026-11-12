(function () {
  'use strict';
  const core = window.InvestmentLab, $ = id => document.getElementById(id);
  const money = value => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  const decimal = value => new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 3 }).format(value);
  const ns = 'http://www.w3.org/2000/svg';
  let comparison, lastConfig, lastScenario;
  function svgElement(tag, attrs, text) {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    if (text != null) el.textContent = text;
    return el;
  }
  function draw(results, settings) {
    const svg = $('strategyChart');
    svg.querySelectorAll('[data-plot]').forEach(el => el.remove());
    const plot = svgElement('g', { 'data-plot': '' });
    const maximum = Math.max(1, ...results.flatMap(r => r.values), settings.initial + 36 * settings.monthly) * 1.09;
    const x = t => 70 + t / 36 * 790, y = v => 255 - v / maximum * 235;
    for (let i = 0; i <= 4; i++) {
      const value = maximum * i / 4;
      plot.append(svgElement('line', { x1: 70, y1: y(value), x2: 860, y2: y(value), class: 'chart-grid' }));
      plot.append(svgElement('text', { x: 60, y: y(value) + 4, 'text-anchor': 'end', class: 'chart-label' }, money(value)));
    }
    [0, 12, 24, 36].forEach(t => plot.append(svgElement('text', { x: x(t), y: 286, 'text-anchor': 'middle', class: 'chart-label' }, t + ' mnd')));
    const points = values => values.map((v, t) => `${x(t)},${y(v)}`).join(' ');
    plot.append(svgElement('polyline', { points: points(Array.from({ length: 37 }, (_, t) => settings.initial + t * settings.monthly)), fill: 'none', stroke: 'var(--muted)', 'stroke-dasharray': '5 6', 'stroke-width': 1.5 }));
    results.forEach((r, i) => plot.append(svgElement('polyline', { points: points(r.values), fill: 'none', class: 'line-' + i, 'stroke-width': 3, 'stroke-linejoin': 'round' })));
    svg.append(plot);
  }
  function compare(event) {
    if (event) event.preventDefault();
    try {
      const settings = core.config({ initial: Number($('initial').value), monthly: Number($('monthly').value), fee: Number($('fee').value), spreadBps: Number($('spread').value) * 100 });
      const prices = core.pricesFor($('scenario').value);
      const results = core.strategies.map(s => core.simulate(s.id, prices, settings));
      $('results').replaceChildren();
      results.forEach((r, i) => {
        const tr = document.createElement('tr');
        const values = [core.strategies[i].name, money(r.finalValue), money(r.profit), (r.maxDrawdown * 100).toFixed(1).replace('.', ',') + '%', money(r.costs), money(r.cash)];
        values.forEach((text, index) => { const td = document.createElement('td'); td.textContent = text; if (index === 2) td.className = r.profit >= 0 ? 'positive' : 'negative'; tr.append(td); });
        $('results').append(tr);
      });
      draw(results, settings); comparison = results; lastConfig = settings; lastScenario = $('scenario').value;
      $('formStatus').textContent = 'Per strategie ingelegd: ' + money(results[0].contributed) + '. Zelfde aannames, andere regels.';
    } catch (error) { $('formStatus').textContent = error.message; }
  }
  core.strategies.forEach(s => { const card = document.createElement('div'), title = document.createElement('h3'), p = document.createElement('p'); title.textContent = s.name; p.textContent = s.detail; card.append(title, p); $('strategyRules').append(card); });
  $('scenarioForm').addEventListener('submit', compare);
  $('themeToggle').addEventListener('click', () => { if (window.GamenfyTheme) window.GamenfyTheme.setPreview(window.GamenfyTheme.current() === 'paper' ? 'night' : 'paper'); });
  const paperPrices = core.pricesFor('crash');
  let paper = { cash: 10000, units: 0 }, month = 0, orders = [];
  function renderPaper() {
    $('paperCash').textContent = money(paper.cash); $('paperUnits').textContent = decimal(paper.units); $('paperPrice').textContent = money(paperPrices[month]); $('paperMonth').textContent = month; $('paperTotal').textContent = money(paper.cash + paper.units * paperPrices[month]); $('paperNext').disabled = month >= 36;
    $('paperHistory').replaceChildren();
    orders.slice(-6).reverse().forEach(order => { const li = document.createElement('li'); li.textContent = `Maand ${order.month}: ${order.side === 'buy' ? 'koop' : 'verkoop'} ${decimal(order.quantity)} stuks à ${money(order.price)} + €1 kosten`; $('paperHistory').append(li); });
  }
  function trade(side) {
    try {
      if (!$('paperQuantity').reportValidity()) return;
      const quantity = Number($('paperQuantity').value), next = core.paperTrade(paper, side, quantity, paperPrices[month]);
      paper = next; orders.push({ month, side, quantity, price: paperPrices[month], fee: 1 }); renderPaper();
      $('paperStatus').textContent = 'Fictieve order uitgevoerd in deze proef. Geen brokerorder verstuurd.';
    } catch (error) { $('paperStatus').textContent = error.message; }
  }
  $('paperBuy').addEventListener('click', () => trade('buy')); $('paperSell').addEventListener('click', () => trade('sell'));
  $('paperNext').addEventListener('click', () => { if (month < 36) month++; renderPaper(); $('paperStatus').textContent = 'Oefenmaand ' + month + '. Je positie beweegt mee met de verzonnen koers.'; });
  $('paperReset').addEventListener('click', () => { paper = { cash: 10000, units: 0 }; month = 0; orders = []; renderPaper(); $('paperStatus').textContent = 'Nieuwe oefensessie met €10.000 fictief geld.'; });
  const storageKey = 'gamenfy_investment_lab_research_v1', fields = ['researchName', 'researchHorizon', 'researchThesis', 'researchRisk'];
  const research = () => Object.fromEntries(fields.map(id => [id, $(id).value]));
  try { const saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); if (saved && typeof saved === 'object') fields.forEach(id => { if (typeof saved[id] === 'string') $(id).value = saved[id].slice(0, $(id).maxLength); }); } catch (_) { $('researchStatus').textContent = 'Eerdere notities niet beschikbaar. Nieuwe notities kun je exporteren.'; }
  $('saveResearch').addEventListener('click', () => { try { localStorage.setItem(storageKey, JSON.stringify(research())); $('researchStatus').textContent = 'Notities bewaard op dit apparaat. Niet gesynchroniseerd met je account.'; } catch (_) { $('researchStatus').textContent = 'Bewaren lukt niet op dit apparaat. Gebruik Exporteer mijn proef.'; } });
  $('clearResearch').addEventListener('click', () => { try { localStorage.removeItem(storageKey); fields.forEach(id => { $(id).value = ''; }); $('researchStatus').textContent = 'Notities gewist op dit apparaat.'; } catch (_) { $('researchStatus').textContent = 'Wissen is niet gelukt. Gebruik de browserinstellingen om lokale gegevens te verwijderen.'; } });
  $('export').addEventListener('click', () => {
    const snapshot = { schemaVersion: 1, exportedAt: new Date().toISOString(), mode: 'synthetic-local-only', scenario: lastScenario, config: lastConfig, comparison, paper: { ...paper, month, orders }, research: research(), limitations: 'Synthetische koersen, geen historische backtest of prognose. Geen live brokerverbinding.' };
    const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'gamenfy-money-lab-proef.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
    $('researchStatus').textContent = 'Export aangevraagd. Het bestand bevat je huidige notities en proefresultaten.';
  });
  compare(); renderPaper();
})();
