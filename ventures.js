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
        hero: 'https://images.pexels.com/photos/5446169/pexels-photo-5446169.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
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
        id: 'sell_websites',
        name: 'Websites Verkopen',
        tagline: 'Build & sell simple websites to local businesses',
        hero: 'https://images.pexels.com/photos/890065/pexels-photo-890065.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        status: 'active',
        phases: [
          { id: 'p1', name: 'Set up shop', steps: [
            { id: 's1', title: 'Pick your offer',      detail: 'One clear package: e.g. a sharp 1-page site for local businesses (restaurants, salons, trades) at a fixed price. Write who it is for and the price.', minutes: 30, xp: { sales: 20 } },
            { id: 's2', title: 'Build a demo site',    detail: 'Make one great-looking demo site for a fictional local business. This is your portfolio and your template in one.', minutes: 120, xp: { coding: 60, ai_tools: 20 } },
            { id: 's3', title: 'Template it',          detail: 'Turn the demo into a reusable template you can rebrand for a new business in under an hour.', minutes: 90, xp: { coding: 40, ai_tools: 20 } },
          ]},
          { id: 'p2', name: 'First client', steps: [
            { id: 's4', title: 'Hit list',             detail: '20 local businesses with a weak or missing website. Note name, what they do, and their current site (or lack of one).', minutes: 45, xp: { marketing: 30 } },
            { id: 's5', title: 'Personalized demos',   detail: 'For 3 of them, rebrand your template with their name/photos so they see THEIR site live. ~1 hour each with the template.', minutes: 120, xp: { coding: 40, marketing: 30 } },
            { id: 's6', title: 'Reach out',            detail: 'Email, DM or walk in to those 3 with the live demo link: "I already built you a preview — want it?" Low pressure, high impact.', minutes: 60, xp: { sales: 50 } },
            { id: 's7', title: 'First euro',           detail: 'A business pays for their site. Revenue exists.', minutes: 0, xp: { sales: 120, marketing: 40 }, boss: true },
          ]},
          { id: 'p3', name: 'Deliver & systemize', steps: [
            { id: 's8', title: 'Launch it',            detail: 'Get their domain live, hand it over, and collect a testimonial.', minutes: 90, xp: { coding: 40, sales: 20 } },
            { id: 's9', title: 'Recurring offer',      detail: 'Offer hosting + maintenance for a small monthly fee. Recurring revenue beats one-offs.', minutes: 45, xp: { sales: 40 } },
            { id: 's10', title: 'Referral ask',        detail: 'Ask your first client for 2 referrals. Happy clients are your best sales channel.', minutes: 30, xp: { sales: 30 } },
          ]},
          { id: 'p4', name: 'Scale or stop', steps: [
            { id: 's11', title: 'Review',              detail: 'Time per site, price, repeat interest. Decide: raise prices, niche down, or archive with lessons.', minutes: 45, xp: { sales: 40 } },
          ]},
        ]
      },
      {
        id: 'gamenfy_public',
        name: 'Gamenfy Public',
        tagline: 'From personal dashboard to something others can use',
        hero: 'https://images.pexels.com/photos/32665242/pexels-photo-32665242.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
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
      },
      {
        id: 'app_vormgeving',
        name: 'Gamenfy Vormgeving',
        tagline: 'Higgsfield en visuele verbetering van de app zelf — los van de business-ventures',
        hero: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        status: 'active',
        phases: [
          { id: 'p0', name: 'Eerst dit — buiten deze venture', steps: [
            { id: 's0', title: 'Websites-hero (Websites Verkopen)', detail: 'Enige stuk met een directe lijn naar je 1-jaarsdoel van \u20ac25-50k zelf verdiend \u2014 raakt outreach \u2192 klanten \u2192 omzet. Doe dit vo\u00f3r onderstaande, puur-motivatie stappen.', minutes: 20, xp: { ai_tools: 20 } },
          ]},
          { id: 'p1', name: 'Richting kiezen — geordend op waarde voor jou', steps: [
            { id: 's3', title: 'Eigen avatar: wel of niet Soul trainen', detail: '#1 van de motivatie-stappen: rechtstreeks uit je originele visie, en jezelf zien groeien met je level is de sterkste intrinsieke motivator van de vier.', minutes: 15, xp: { ai_tools: 20 } },
            { id: 's1', title: 'Lab-poppetjes: kies alternatief',  detail: '#2: je bezoekt het Lab regelmatig \u2014 hoogste zichtbaarheid van de vier. Zie de werkruimte voor de 4 opties (A-D) en welk model erbij hoort.', minutes: 15, xp: { ai_tools: 20 } },
            { id: 's2', title: 'Het Park: kies alternatief',       detail: '#3: ambient achtergrond, wordt gezien maar niet actief bekeken \u2014 minder impact dan de personages zelf.', minutes: 15, xp: { ai_tools: 20 } },
            { id: 's4', title: 'Skill-foto\u2019s: batch of per stuk',  detail: '#4, laagste prioriteit van de vier: minst frequent gezien (alleen in de Skills-grid), en Pexels dekt het meeste al gratis.', minutes: 15, xp: { ai_tools: 20 } },
            { id: 's8', title: '4 vlakken-homepage: alsnog bouwen?', detail: 'Teruggevonden idee uit een eerder gesprek: Main als 4 kwadranten (Lichaam/Geld/Geest/Bouwen) met haarlijnen i.p.v. losse kaartjes — één samenhangend blok. Er bestaat al een mockup, nooit gebouwd.', minutes: 10, xp: { ai_tools: 10 } },
          ]},
          { id: 'p2', name: 'Eerste uitvoering', steps: [
            { id: 's5', title: 'Stijl vastleggen als Element',  detail: 'Eén referentiebeeld opslaan zodat latere generaties dezelfde look delen \u2014 voorkomt 45x een net-andere stijl.', minutes: 20, xp: { ai_tools: 30, coding: 10 } },
            { id: 's6', title: 'Eerste test-generatie',         detail: 'Begin klein: het onderdeel met de minste credits/moeite uit stap s1-s4.', minutes: 30, xp: { ai_tools: 40 } },
            { id: 's7', title: 'Doorzetten of bijsturen',       detail: 'Bekijk het resultaat naast de rest van de app. Past de stijl, of terug naar de tekentafel?', minutes: 15, xp: { ai_tools: 20 }, boss: true },
          ]},
        ]
      }
    ]
  };

  function load () {
    let data = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) data = JSON.parse(raw);
    } catch (e) { /* fall through to seed */ }
    if (!data) { save(SEED); data = JSON.parse(JSON.stringify(SEED)); }
    // v10.5 migration: additively add any newly-shipped SEED ventures the user doesn't have yet.
    try {
      data.ventures = data.ventures || [];
      let changed = false;
      (SEED.ventures || []).forEach(function (sv) {
        if (!data.ventures.some(function (v) { return v.id === sv.id; })) {
          data.ventures.push(JSON.parse(JSON.stringify(sv)));
          changed = true;
        }
      });
      // v10.37: additively backfill new top-level fields (e.g. hero photo)
      // onto ventures the user already has, without touching anything they
      // already earned/completed (phases/steps/status are never overwritten).
      data.ventures.forEach(function (v) {
        const sv = (SEED.ventures || []).find(function (s) { return s.id === v.id; });
        if (!sv) return;
        if (v.hero == null && sv.hero) { v.hero = sv.hero; changed = true; }
      });
      if (changed) save(data);
    } catch (e) {}
    return data;
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
