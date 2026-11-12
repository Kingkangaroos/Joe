'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../investment-lab-core.js');
const root = path.join(__dirname, '..');
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('PASS ' + name); }
check('Flat market preserves all capital without costs', () => {
  for (const strategy of core.strategies) {
    const r = core.simulate(strategy.id, Array(37).fill(100), { initial: 1000, monthly: 250, fee: 0, spreadBps: 0 });
    near(r.finalValue, 10000); near(r.profit, 0); near(r.maxDrawdown, 0);
  }
});
check('Every monthly buy accounts for fixed fees and adverse price', () => {
  const r = core.simulate('periodic', [100, 100, 100], { initial: 1000, monthly: 100, fee: 1, spreadBps: 10 });
  near(r.contributed, 1200); near(r.finalValue + r.costs, 1200); assert.equal(r.trades, 3);
});
check('New contributions cannot hide a 50% market drawdown', () => {
  const r = core.simulate('periodic', [100, 50], { initial: 100, monthly: 100, fee: 0, spreadBps: 0 });
  near(r.finalValue, 150); near(r.maxDrawdown, 0.5);
});
check('All strategies use earlier data for their decisions', () => {
  for (const strategy of ['dip', 'trend']) {
    const a = core.simulate(strategy, [100, 110, 120, 130, 140, 150, 180, 200], { fee: 0, spreadBps: 0 });
    const b = core.simulate(strategy, [100, 110, 120, 130, 140, 150, 1, 2], { fee: 0, spreadBps: 0 });
    assert.equal(a.ledger[6].action, b.ledger[6].action);
    a.ledger.slice(0, 6).forEach((entry, i) => assert.deepEqual(entry, b.ledger[i]));
  }
});
check('Insufficient cash, invalid data and uncovered sells are rejected', () => {
  assert.throws(() => core.paperTrade({ cash: 100, units: 0 }, 'buy', 1, 100));
  assert.throws(() => core.paperTrade({ cash: 100, units: 1 }, 'sell', 2, 100));
  assert.throws(() => core.paperTrade({ cash: 100, units: 1 }, 'sell', -1, 100));
  assert.throws(() => core.paperTrade({ cash: 100, units: 1 }, 'sell', Infinity, 100));
  assert.throws(() => core.simulate('periodic', [100, NaN], {}));
  assert.throws(() => core.config({ monthly: -1 }));
  assert.throws(() => core.pricesFor('unknown'));
});
check('Round trip deducts both transaction fees', () => {
  const buy = core.paperTrade({ cash: 1000, units: 0 }, 'buy', 3, 100);
  const sell = core.paperTrade(buy, 'sell', 3, 100);
  near(sell.cash, 998); near(sell.units, 0);
});
check('Zero capital and below-fee cash stay valid without phantom orders', () => {
  for (const strategy of core.strategies) {
    const r = core.simulate(strategy.id, core.pricesFor('crash'), { initial: 0, monthly: 0 });
    near(r.finalValue, 0); assert.equal(r.trades, 0);
    const small = core.simulate(strategy.id, [100, 100], { initial: 0.5, monthly: 0, fee: 1 });
    near(small.finalValue, 0.5); assert.equal(small.trades, 0);
  }
});
check('Synthetic paths reconcile cash, holdings, and deposits', () => {
  for (const scenario of Object.keys(core.paths)) for (const strategy of core.strategies) {
    const prices = core.pricesFor(scenario), r = core.simulate(strategy.id, prices, {});
    assert.equal(prices.length, 37); near(r.contributed, 10000);
    r.ledger.forEach(row => { assert.ok(row.cash >= 0 && row.units >= 0); near(row.value, row.cash + row.units * row.price); });
    near(r.profit, r.finalValue - r.contributed);
  }
});
check('Lab discoverability and release use an additive scoped entry', () => {
  const lab = fs.readFileSync(path.join(root, 'lab.html'), 'utf8');
  assert.ok(lab.includes('investment-lab.html'));
  const release = JSON.parse(fs.readFileSync(path.join(root, 'GAMENFY-RELEASES.json'), 'utf8')).releases.find(x => x.id === '2026-11-12-investment-lab');
  assert.ok(release.surfaces.includes('home')); assert.equal(release.url, 'investment-lab.html?v=1');
});
check('Client has no network calls or broker-secret collection', () => {
  const ui = fs.readFileSync(path.join(root, 'investment-lab.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'investment-lab.html'), 'utf8');
  assert.ok(!/fetch\s*\(|XMLHttpRequest|WebSocket/.test(ui));
  assert.ok(!html.includes('investment-lab-connectors.mjs'));
  assert.ok(!/rpg_|finance_v|app_state|addXP|supabase/.test(ui));
});
(async () => {
  const { createDemoReader } = await import('../investment-lab-connectors.mjs');
  for (const provider of ['alpaca', 'trading212']) {
    const requests = [];
    const reader = createDemoReader({ provider, key: 'TEST-KEY', secret: 'TEST-SECRET', fetchImpl: async (url, options) => {
      requests.push({ url, options }); return { ok: true, json: async () => requests.length === 1 ? { currency: 'EUR' } : [] };
    } });
    assert.equal(requests.length, 0); const snapshot = await reader.snapshot();
    assert.equal(snapshot.mode, 'broker-demo-readonly'); assert.equal(requests.length, 2);
    for (const { url, options } of requests) {
      assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'error');
      assert.ok(url.startsWith(provider === 'alpaca' ? 'https://paper-api.alpaca.markets/' : 'https://demo.trading212.com/api/v0/'));
      assert.ok(!url.includes('order')); assert.ok(!JSON.stringify(snapshot).includes('TEST-SECRET'));
    }
    console.log('PASS ' + provider + ' reader only uses demo/paper GET endpoints'); checks++;
  }
  assert.throws(() => createDemoReader({ provider: 'live', key: 'x', secret: 'y' }));
  const failed = createDemoReader({ provider: 'alpaca', key: 'x', secret: 'y', fetchImpl: async () => ({ ok: false, status: 429 }) });
  await assert.rejects(() => failed.snapshot(), /HTTP 429/);
  const outage = createDemoReader({ provider: 'alpaca', key: 'x', secret: 'y', fetchImpl: async () => { throw new Error('secret x'); } });
  await assert.rejects(() => outage.snapshot(), error => error.message === 'Demo provider unavailable');
  console.log(`Investment Lab: ${checks} grouped checks passed. Broker calls mocked; no live connection tested.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
