// =============================================================
// Gamenfy — Ventures (v7.0)
// Business ideas as quest ladders. Each venture = phases → steps
// doable in a single evening. Completing a step awards XP to
// existing skills via window.addXP (xp.js stays untouched).
// Storage: rpg_ventures_v1 (synced). Seeded only if absent.
// =============================================================
(function () {
  'use strict';

  const KEY = 'rpg_ventures_v1';

  const SEED = {
    v: 1,
    ventures: [
      {
        id: 'grip',
        name: 'Grip',
        tagline: 'Pain-relief squeeze ball — B2B via tattoo studios',
        status: 'active',
        phases: [
          { id: 'p1', name: 'Validation', steps: [
            { id: 's1',  title: 'Define the product',   detail: 'Write a one-liner: who is it for, what pain does it solve, why tattoo studios as the channel. One paragraph max.', minutes: 30, xp: { sales: 20 } },
            { id: 's2',  title: 'Market scan',          detail: 'Find 10 comparable squeeze/stress balls (Amazon, AliExpress, bol.com). Log price, reviews, and what is missing.', minutes: 60, xp: { marketing: 30 } },
            { id: 's3',  title: 'Studio reality check', detail: 'Call or visit 2 tattoo studios. Ask: do clients squeeze anything during sessions? Would you offer a branded ball?', minutes: 60, xp: { sales: 40 } },
            { id: 's4',  title: 'Go / No-Go',           detail: 'Write down target retail price, max cost price, and the decision. If No-Go: archive with lessons.', minutes: 30, xp: { sales: 20 } },
          ]},
          { id: 'p2', name: 'Sourcing', steps: [
            { id: 's5',  title: 'Supplier shortlist',   detail: 'Find 5 suppliers (AliExpress / Alibaba). Compare price, minimum order, shipping time.', minutes: 60, xp: { sales: 30 } },
            { id: 's6',  title: 'Order samples',        detail: 'Order 2-3 samples. Budget: max \u20ac25.', minutes: 30, xp: { sales: 20 } },
            { id: 's7',  title: 'Sample test',          detail: 'Squeeze test all samples. Pick the winner and write down why.', minutes: 30, xp: { marketing: 20 } },
            { id: 's8',  title: 'Brand it',             detail: 'Name + logo concept in Canva or Higgsfield. Keep it simple.', minutes: 60, xp: { marketing: 40, ai_tools: 20 } },
          ]},
          { id: 'p3', name: 'Sales kit', steps: [
            { id: 's9',  title: 'Product photos',       detail: 'Shoot with your phone in daylight. Pick the best 3.', minutes: 45, xp: { marketing: 30 } },
            { id: 's10', title: 'One-page sell sheet',  detail: 'PDF for studios: what it is, price, their margin, contact. One page.', minutes: 60, xp: { marketing: 40 } },
            { id: 's11', title: 'Lock pricing',         detail: 'Cost price, wholesale price, retail price. Aim for 4x cost at retail.', minutes: 30, xp: { sales: 30 } },
          ]},
          { id: 'p4', name: 'First revenue', steps: [
            { id: 's12', title: 'Hit list',             detail: '20 tattoo studios in the region in a sheet with contact info.', minutes: 45, xp: { sales: 30 } },
            { id: 's13', title: 'Walk-ins',             detail: 'Visit 3 studios with samples. Goal: 1 consignment deal (leave 5 balls).', minutes: 90, xp: { sales: 60 } },
            { id: 's14', title: 'Follow-up wave',       detail: 'DM or email 10 studios from the hit list.', minutes: 60, xp: { sales: 40 } },
            { id: 's15', title: 'First euro',           detail: 'A studio buys or sells the first ball. Revenue exists.', minutes: 0, xp: { sales: 100, marketing: 50 }, boss: true },
          ]},
          { id: 'p5', name: 'Systemize or stop', steps: [
            { id: 's16', title: 'Order flow',           detail: 'Payment link + reorder template message for studios.', minutes: 45, xp: { sales: 30 } },
            { id: 's17', title: 'Review',               detail: 'Margins, time spent, repeat interest. Decide: scale, tweak, or archive with lessons.', minutes: 45, xp: { sales: 40 } },
          ]},
        ]
      },
      {
        id: 'gamenfy_public',
        name: 'Gamenfy Public',
        tagline: 'From personal dashboard to something others can use',
        status: 'active',
        phases: [
          { id: 'p1', name: 'Proof of interest', steps: [
            { id: 's1', title: 'Write the pitch',     detail: 'Gamenfy in 3 sentences: what, for whom, why now.', minutes: 30, xp: { marketing: 20 } },
            { id: 's2', title: 'Watch-test',          detail: 'Let 1 friend use the app for 10 minutes. Do not help. Note every point of confusion.', minutes: 45, xp: { marketing: 40 } },
            { id: 's3', title: 'Three conversations', detail: 'Show 3 people. Ask: would you use this weekly? Log the honest answers.', minutes: 60, xp: { sales: 40 } },
          ]},
          { id: 'p2', name: 'Public face', steps: [
            { id: 's4', title: 'Landing page',        detail: 'One page, one sentence, waitlist email field. Vanilla HTML on Vercel.', minutes: 90, xp: { coding: 50, marketing: 30 } },
            { id: 's5', title: 'Ship it',             detail: 'Share in 1 community or story. Target: 10 waitlist signups.', minutes: 45, xp: { marketing: 50 } },
          ]},
          { id: 'p3', name: 'MVP decision', steps: [
            { id: 's6', title: 'Feature cut',         detail: 'List what a stranger\u2019s version needs vs. what is personal (PIN, personal data, Hevy key).', minutes: 60, xp: { coding: 30 } },
            { id: 's7', title: 'Scope locked',        detail: 'Decide the MVP scope and write it down as one build doc.', minutes: 60, xp: { coding: 60 }, boss: true },
          ]},
        ]
      }
    ]
  };

  function load () {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through to seed */ }
    save(SEED);
    return JSON.parse(JSON.stringify(SEED));
  }

  function save (data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function allSteps (v) {
    const out = [];
    (v.phases || []).forEach(p => (p.steps || []).forEach(s => out.push({ phase: p, step: s })));
    return out;
  }

  function nextStep (v) {
    const open = allSteps(v).find(x => !x.step.done);
    return open || null;
  }

  function progress (v) {
    const steps = allSteps(v);
    const done = steps.filter(x => x.step.done).length;
    return { done, total: steps.length };
  }

  function completeStep (ventureId, stepId) {
    const data = load();
    const v = data.ventures.find(x => x.id === ventureId);
    if (!v) return null;
    let hit = null;
    (v.phases || []).forEach(p => (p.steps || []).forEach(s => { if (s.id === stepId) hit = s; }));
    if (!hit || hit.done) return null;
    hit.done = true;
    hit.doneAt = new Date().toISOString();
    if (!nextStep(v)) v.status = 'done';
    save(data);
    if (typeof window.addXP === 'function' && hit.xp) {
      Object.keys(hit.xp).forEach(skill => {
        window.addXP(skill, hit.xp[skill], 'Venture: ' + hit.title);
      });
    }
    return hit;
  }

  window.Ventures = {
    KEY: KEY,
    load: load,
    save: save,
    nextStep: nextStep,
    progress: progress,
    completeStep: completeStep,
    activeVentures: function () { return load().ventures.filter(v => v.status === 'active'); }
  };
})();
