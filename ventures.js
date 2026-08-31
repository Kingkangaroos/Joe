// =============================================================
// Gamenfy — Ventures (v11.1)
// Business ideas as quest ladders. Each venture = phases → steps.
// Storage: rpg_ventures_v1 (synced). Seeded only if absent.
// v11.1: refreshes only the Gamenfy Build work queue so Main/Next Move
// reflects Joey's current website-first focus. Existing earned XP is untouched.
// =============================================================
(function () {
  'use strict';

  const KEY = 'rpg_ventures_v1';
  const GAMENFY_FOCUS_VERSION = 2;

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
            { id: 's1', title: 'Define the product', detail: 'Write a one-liner: who is it for, what pain does it solve, why tattoo studios as the channel. One paragraph max.', minutes: 30, xp: { sales: 20 } },
            { id: 's2', title: 'Market scan', detail: 'Find 10 comparable squeeze/stress balls (Amazon, AliExpress, bol.com). Log price, reviews, and what is missing.', minutes: 60, xp: { marketing: 30 } },
            { id: 's3', title: 'Studio reality check', detail: 'Call or visit 2 tattoo studios. Ask: do clients squeeze anything during sessions? Would you offer a branded ball?', minutes: 60, xp: { sales: 40 } },
            { id: 's4', title: 'Go / No-Go', detail: 'Write down target retail price, max cost price, and the decision. If No-Go: archive with lessons.', minutes: 30, xp: { sales: 20 } }
          ]},
          { id: 'p2', name: 'Sourcing', steps: [
            { id: 's5', title: 'Supplier shortlist', detail: 'Find 5 suppliers (AliExpress / Alibaba). Compare price, minimum order, shipping time.', minutes: 60, xp: { sales: 30 } },
            { id: 's6', title: 'Order samples', detail: 'Order 2-3 samples. Budget: max €25.', minutes: 30, xp: { sales: 20 } },
            { id: 's7', title: 'Sample test', detail: 'Squeeze test all samples. Pick the winner and write down why.', minutes: 30, xp: { marketing: 20 } },
            { id: 's8', title: 'Brand it', detail: 'Name + logo concept in Canva or Higgsfield. Keep it simple.', minutes: 60, xp: { marketing: 40, ai_tools: 20 } }
          ]},
          { id: 'p3', name: 'Sales kit', steps: [
            { id: 's9', title: 'Product photos', detail: 'Shoot with your phone in daylight. Pick the best 3.', minutes: 45, xp: { marketing: 30 } },
            { id: 's10', title: 'One-page sell sheet', detail: 'PDF for studios: what it is, price, their margin, contact. One page.', minutes: 60, xp: { marketing: 40 } },
            { id: 's11', title: 'Lock pricing', detail: 'Cost price, wholesale price, retail price. Aim for 4x cost at retail.', minutes: 30, xp: { sales: 30 } }
          ]},
          { id: 'p4', name: 'First revenue', steps: [
            { id: 's12', title: 'Hit list', detail: '20 tattoo studios in the region in a sheet with contact info.', minutes: 45, xp: { sales: 30 } },
            { id: 's13', title: 'Walk-ins', detail: 'Visit 3 studios with samples. Goal: 1 consignment deal (leave 5 balls).', minutes: 90, xp: { sales: 60 } },
            { id: 's14', title: 'Follow-up wave', detail: 'DM or email 10 studios from the hit list.', minutes: 60, xp: { sales: 40 } },
            { id: 's15', title: 'First euro', detail: 'A studio buys or sells the first ball. Revenue exists.', minutes: 0, xp: { sales: 100, marketing: 50 }, boss: true }
          ]},
          { id: 'p5', name: 'Systemize or stop', steps: [
            { id: 's16', title: 'Order flow', detail: 'Payment link + reorder template message for studios.', minutes: 45, xp: { sales: 30 } },
            { id: 's17', title: 'Review', detail: 'Margins, time spent, repeat interest. Decide: scale, tweak, or archive with lessons.', minutes: 45, xp: { sales: 40 } }
          ]}
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
            { id: 's1', title: 'Pick your offer', detail: 'One clear package: e.g. a sharp 1-page site for local businesses (restaurants, salons, trades) at a fixed price. Write who it is for and the price.', minutes: 30, xp: { sales: 20 } },
            { id: 's2', title: 'Build a demo site', detail: 'Make one great-looking demo site for a fictional local business. This is your portfolio and your template in one.', minutes: 120, xp: { coding: 60, ai_tools: 20 } },
            { id: 's3', title: 'Template it', detail: 'Turn the demo into a reusable template you can rebrand for a new business in under an hour.', minutes: 90, xp: { coding: 40, ai_tools: 20 } }
          ]},
          { id: 'p2', name: 'First client', steps: [
            { id: 's4', title: 'Hit list', detail: '20 local businesses with a weak or missing website. Note name, what they do, and their current site (or lack of one).', minutes: 45, xp: { marketing: 30 } },
            { id: 's5', title: 'Personalized demos', detail: 'For 3 of them, rebrand your template with their name/photos so they see THEIR site live. ~1 hour each with the template.', minutes: 120, xp: { coding: 40, marketing: 30 } },
            { id: 's6', title: 'Reach out', detail: 'Email, DM or walk in to those 3 with the live demo link: "I already built you a preview — want it?" Low pressure, high impact.', minutes: 60, xp: { sales: 50 } },
            { id: 's7', title: 'First euro', detail: 'A business pays for their site. Revenue exists.', minutes: 0, xp: { sales: 120, marketing: 40 }, boss: true }
          ]},
          { id: 'p3', name: 'Deliver & systemize', steps: [
            { id: 's8', title: 'Launch it', detail: 'Get their domain live, hand it over, and collect a testimonial.', minutes: 90, xp: { coding: 40, sales: 20 } },
            { id: 's9', title: 'Recurring offer', detail: 'Offer hosting + maintenance for a small monthly fee. Recurring revenue beats one-offs.', minutes: 45, xp: { sales: 40 } },
            { id: 's10', title: 'Referral ask', detail: 'Ask your first client for 2 referrals. Happy clients are your best sales channel.', minutes: 30, xp: { sales: 30 } }
          ]},
          { id: 'p4', name: 'Scale or stop', steps: [
            { id: 's11', title: 'Review', detail: 'Time per site, price, repeat interest. Decide: raise prices, niche down, or archive with lessons.', minutes: 45, xp: { sales: 40 } }
          ]}
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
            { id: 's1', title: 'Write the pitch', detail: 'Gamenfy in 3 sentences: what, for whom, why now.', minutes: 30, xp: { marketing: 20 } },
            { id: 's2', title: 'Watch-test', detail: 'Let 1 friend use the app for 10 minutes. Do not help. Note every point of confusion.', minutes: 45, xp: { marketing: 40 } },
            { id: 's3', title: 'Three conversations', detail: 'Show 3 people. Ask: would you use this weekly? Log the honest answers.', minutes: 60, xp: { sales: 40 } }
          ]},
          { id: 'p2', name: 'Public face', steps: [
            { id: 's4', title: 'Landing page', detail: 'One page, one sentence, waitlist email field. Vanilla HTML on Vercel.', minutes: 90, xp: { coding: 50, marketing: 30 } },
            { id: 's5', title: 'Ship it', detail: 'Share in 1 community or story. Target: 10 waitlist signups.', minutes: 45, xp: { marketing: 50 } }
          ]},
          { id: 'p3', name: 'MVP decision', steps: [
            { id: 's6', title: 'Feature cut', detail: 'List what a stranger’s version needs vs. what is personal (PIN, personal data, Hevy key).', minutes: 60, xp: { coding: 30 } },
            { id: 's7', title: 'Scope locked', detail: 'Decide the MVP scope and write it down as one build doc.', minutes: 60, xp: { coding: 60 }, boss: true }
          ]}
        ]
      },
      {
        id: 'app_vormgeving',
        name: 'Gamenfy Build',
        tagline: 'Current product/design work — website-first, with a reusable visual production line',
        hero: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        status: 'active',
        focusVersion: GAMENFY_FOCUS_VERSION,
        phases: [
          { id: 'wf', name: 'NU — eerst websites', steps: [
            { id: 'wf1', title: 'Website Lab · Test 1 beoordelen', detail: 'Open Test 1 · Scroll Animations. Noteer alleen: KEEP, CHANGE, REUSE. Dit staat #1 omdat websites nu je actieve businessfocus zijn en direct richting een verkoopbare productielijn gaan.', minutes: 20, xp: { ai_tools: 10, marketing: 10 } },
            { id: 'wf2', title: 'Website Test 2 · volgende techniek kiezen', detail: 'Kies één duidelijk andere website-techniek om naast Test 1 te zetten. Niet Test 1 overschrijven: nieuwe richting = nieuw testnummer.', minutes: 20, xp: { ai_tools: 20 } },
            { id: 'wf3', title: 'Website-productielijn vastleggen', detail: 'Maak de vaste flow: basiswebsite → 4 visuele/scroll alternatieven → ChatGPT bouwt eerst → alleen bij duidelijke meerwaarde Higgsfield-test → winnaar locken → herbruikbare template.', minutes: 30, xp: { ai_tools: 30, coding: 20 } }
          ]},
          { id: 'vp', name: 'Visuele productielijn — vaste queue', steps: [
            { id: 'vp1', title: '1 · Website hero — 4 richtingen', detail: 'Vier duidelijk verschillende hero-concepten. Eerst kijken wat ChatGPT zelf goed kan maken; Higgsfield alleen inzetten waar motion/kwaliteit aantoonbaar extra waarde geeft.', minutes: 30, xp: { ai_tools: 30, marketing: 20 } },
            { id: 'vp2', title: '2 · Skill tree — 4 richtingen', detail: 'Vier manieren om skill-progressie visueel te maken. Eén winnaar kiezen voordat er assets in bulk worden geproduceerd.', minutes: 30, xp: { ai_tools: 30 } },
            { id: 'vp3', title: '3 · Home hero animation — 4 richtingen', detail: 'Vier home-hero/motionrichtingen. Focus op motiverende beweging die de app beter maakt, niet alleen decoratie.', minutes: 30, xp: { ai_tools: 30 } },
            { id: 'vp4', title: '4 · Season card — 4 richtingen', detail: 'Vier visuele Season-card concepten die de actieve Season prominenter en motiverender maken.', minutes: 25, xp: { ai_tools: 25 } },
            { id: 'vp5', title: '5 · Lab characters — later', detail: 'Characters blijven een geldige vijfde productielijn, maar staan bewust achter websites, skill tree, Home hero en Season card zodat ze je nu niet opnieuw afleiden.', minutes: 15, xp: { ai_tools: 10 } }
          ]},
          { id: 'pipe', name: 'Per onderdeel — productieprotocol', steps: [
            { id: 'pipe1', title: 'ChatGPT-first test', detail: 'Maak eerst goedkope/creditloze varianten met ChatGPT. Beoordeel compositie, stijl en bruikbaarheid voordat externe credits worden gebruikt.', minutes: 25, xp: { ai_tools: 20 } },
            { id: 'pipe2', title: 'Higgsfield delta-test', detail: 'Test Higgsfield alleen op de richting waar het iets moet toevoegen: betere motion, consistentie of renderkwaliteit. Eén zuinige test per richting/model; geen brede reruns.', minutes: 25, xp: { ai_tools: 30 } },
            { id: 'pipe3', title: 'Winnaar locken + hergebruiken', detail: 'Sla de gekozen referentie/stijl op en bouw pas daarna varianten/batches. Doel: niet 45 keer een nét andere stijl genereren.', minutes: 20, xp: { ai_tools: 30, coding: 10 }, boss: true }
          ]}
        ]
      }
    ]
  };

  function clone (x) { return JSON.parse(JSON.stringify(x)); }

  function save (data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function refreshGamenfyBuildQueue (data) {
    const fresh = SEED.ventures.find(v => v.id === 'app_vormgeving');
    let v = (data.ventures || []).find(x => x.id === 'app_vormgeving');
    if (!fresh) return false;
    if (!v) {
      data.ventures.push(clone(fresh));
      return true;
    }
    if (Number(v.focusVersion || 0) >= GAMENFY_FOCUS_VERSION) return false;

    // This queue is planning state, not earned progression. Old completion XP
    // stays in the character; only the stale task list is refreshed.
    v.name = fresh.name;
    v.tagline = fresh.tagline;
    v.hero = v.hero || fresh.hero;
    v.status = 'active';
    v.focusVersion = GAMENFY_FOCUS_VERSION;
    v.phases = clone(fresh.phases);
    return true;
  }

  function load () {
    let data = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) data = JSON.parse(raw);
    } catch (e) {}
    if (!data) { data = clone(SEED); save(data); }

    try {
      data.ventures = data.ventures || [];
      let changed = false;
      (SEED.ventures || []).forEach(function (sv) {
        if (!data.ventures.some(function (v) { return v.id === sv.id; })) {
          data.ventures.push(clone(sv));
          changed = true;
        }
      });
      data.ventures.forEach(function (v) {
        const sv = (SEED.ventures || []).find(function (s) { return s.id === v.id; });
        if (!sv) return;
        if (v.hero == null && sv.hero) { v.hero = sv.hero; changed = true; }
      });
      if (refreshGamenfyBuildQueue(data)) changed = true;
      if (changed) save(data);
    } catch (e) {}
    return data;
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
    KEY,
    load,
    save,
    nextStep,
    progress,
    completeStep,
    activeVentures: function () { return load().ventures.filter(v => v.status === 'active'); }
  };
})();