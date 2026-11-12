(function (root) {
  'use strict';
  const strategies = [
    { id: 'periodic', name: 'Elke maand inleggen', detail: 'Begin direct. Beleg iedere maand het beschikbare oefengeld.' },
    { id: 'dip', name: 'Wachten op een daling', detail: 'Begin direct. Bewaar nieuwe inleg tot de vorige maand minstens 10% onder de eerdere top sloot.' },
    { id: 'trend', name: 'De trend volgen', detail: 'Wacht zes maanden. Beleg als de vorige koers boven het gemiddelde van de zes vorige koersen ligt; verkoop anders.' }
  ];
  const paths = {
    steady: { name: 'Gestage stijging', detail: 'Een verzonnen markt die rustig stijgt.', anchors: [100, 105, 110, 115, 121, 127, 134] },
    crash: { name: 'Daling & herstel', detail: 'Een verzonnen markt met een forse daling en later herstel.', anchors: [100, 110, 118, 75, 86, 105, 123] },
    sideways: { name: 'Veel beweging, weinig richting', detail: 'Een verzonnen markt met meerdere omslagen.', anchors: [100, 118, 90, 113, 86, 111, 100] }
  };
  function finite(value, name, min, max) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error(name + ' valt buiten de toegestane waarden.');
    return value;
  }
  function pricesFor(id) {
    if (!paths[id]) throw new Error('Onbekend scenario.');
    const a = paths[id].anchors;
    return Array.from({ length: 37 }, (_, i) => {
      const block = Math.min(5, Math.floor(i / 6)), fraction = (i - block * 6) / 6;
      return a[block] + (a[block + 1] - a[block]) * fraction;
    });
  }
  function config(input = {}) {
    return {
      initial: finite(input.initial ?? 1000, 'Startbedrag', 0, 10000000),
      monthly: finite(input.monthly ?? 250, 'Maandinleg', 0, 100000),
      fee: finite(input.fee ?? 1, 'Transactiekosten', 0, 100),
      spreadBps: finite(input.spreadBps ?? 10, 'Prijsopslag', 0, 1000)
    };
  }
  function buyAll(cash, units, price, settings) {
    if (cash <= settings.fee) return { cash, units, cost: 0, traded: false };
    const bought = (cash - settings.fee) / (price * (1 + settings.spreadBps / 10000));
    return { cash: 0, units: units + bought, cost: settings.fee + bought * price * settings.spreadBps / 10000, traded: true };
  }
  function simulate(id, prices, input) {
    if (!strategies.some(s => s.id === id)) throw new Error('Onbekende strategie.');
    if (!Array.isArray(prices) || prices.length < 2 || prices.length > 1201 || prices.some(p => typeof p !== 'number' || !Number.isFinite(p) || p <= 0)) throw new Error('Koersen moeten positieve getallen zijn.');
    const s = config(input); let cash = s.initial, units = 0, costs = 0, trades = 0, contributed = s.initial;
    let index = 1, peakIndex = 1, maxDrawdown = 0, previousValue = 0;
    const values = [], ledger = [];
    for (let t = 0; t < prices.length; t++) {
      const beforeDeposit = cash + units * prices[t];
      const deposit = t ? s.monthly : 0;
      cash += deposit; contributed += deposit;
      const before = cash + units * prices[t];
      let action = 'Wachten';
      let shouldBuy = id === 'periodic' || (id === 'dip' && (t === 0 || prices[t - 1] <= Math.max(...prices.slice(0, t)) * 0.9));
      let shouldSell = false;
      if (id === 'trend' && t >= 6) {
        const mean = prices.slice(t - 6, t).reduce((a, b) => a + b, 0) / 6;
        shouldBuy = prices[t - 1] > mean;
        shouldSell = !shouldBuy && units > 0;
      }
      if (shouldSell) {
        const proceeds = units * prices[t] * (1 - s.spreadBps / 10000) - s.fee;
        if (proceeds >= 0) {
          costs += units * prices[t] * s.spreadBps / 10000 + s.fee;
          cash += proceeds; units = 0; trades++; action = 'Verkopen';
        }
      } else if (shouldBuy) {
        const trade = buyAll(cash, units, prices[t], s);
        if (trade.traded) { cash = trade.cash; units = trade.units; costs += trade.cost; trades++; action = 'Kopen'; }
      }
      const value = cash + units * prices[t];
      // Price movement occurs before this month's deposit and close-price trade.
      // Chain the return before the flow, then the trading-cost return after it.
      if (t && previousValue > 0) index *= beforeDeposit / previousValue;
      const denominator = beforeDeposit + deposit;
      if (denominator > 0) index *= value / denominator;
      peakIndex = Math.max(peakIndex, index);
      maxDrawdown = Math.max(maxDrawdown, 1 - index / peakIndex);
      previousValue = value;
      values.push(value); ledger.push({ month: t, price: prices[t], action, deposit, cash, units, value, tradeCost: before - value });
    }
    return { id, values, ledger, finalValue: values.at(-1), contributed, profit: values.at(-1) - contributed, cash, costs, trades, maxDrawdown };
  }
  function paperTrade(state, side, amount, price, fee = 1) {
    finite(amount, 'Aantal', Number.MIN_VALUE, 1000000); finite(price, 'Oefenkoers', 0.000001, 1000000); finite(fee, 'Kosten', 0, 100);
    finite(state.cash, 'Cash', 0, 1000000000); finite(state.units, 'Positie', 0, 1000000000);
    if (!['buy', 'sell'].includes(side)) throw new Error('Kies kopen of verkopen.');
    if (side === 'buy' && amount * price + fee > state.cash + 1e-8) throw new Error('Onvoldoende oefengeld, inclusief kosten.');
    if (side === 'sell' && amount > state.units) throw new Error('Je kunt niet meer verkopen dan je bezit.');
    if (side === 'sell' && amount * price < fee) throw new Error('Opbrengst is lager dan de kosten.');
    return { cash: Math.max(0, state.cash + (side === 'buy' ? -(amount * price + fee) : amount * price - fee)), units: Math.max(0, state.units + (side === 'buy' ? amount : -amount)) };
  }
  const api = { strategies, paths, pricesFor, config, simulate, paperTrade };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.InvestmentLab = api;
})(typeof window === 'undefined' ? globalThis : window);
