// =============================================================
// xp.js — Life OS RPG engine v1.3
// Gebruik: addXP('tennis', 55, 'Tennisles')
//          removeXP('tennis', 55, 'Quest unchecked')
// isHabit: true → score 0-10 via checkHabit(), geen XP-level
// =============================================================
(function () {
  'use strict';

  const STORAGE_KEY = 'rpg_character_v1';
  const HABITS_KEY  = 'rpg_habits_v1';
  const MAX_LOG     = 200;
  const MAX_LEVEL   = 100;

  // Level 100 vereist 490.050 XP — bij ~150 XP/dag ≈ 9 jaar. Near-impossible.
  function xpToLevel(xp) {
    return Math.min(MAX_LEVEL, Math.floor(Math.sqrt((xp || 0) / 50)) + 1);
  }
  function xpForLevel(level) {
    if (level >= MAX_LEVEL) return Infinity;
    return Math.pow(level - 1, 2) * 50;
  }

  // ─── 8 Categorieën — Law of Attraction / Chakra ──────────────────────
  const PARENT_SKILLS = {
    money:      { label: 'Money',      icon: '💰', color: '#F5C842' }, // Gold   — Solar Plexus
    body:       { label: 'Body',       icon: '💪', color: '#6BE3A4' }, // Green  — Heart
    mind:       { label: 'Mind',       icon: '🧠', color: '#7DD3FC' }, // Blue   — Third Eye
    business:   { label: 'Business',   icon: '📈', color: '#C4B5FD' }, // Purple — Crown
    lifestyle:  { label: 'Lifestyle',  icon: '✨', color: '#FB923C' }, // Orange — Sacral
    discipline: { label: 'Discipline', icon: '🛡️', color: '#FF6B6B' }, // Red    — Root
    knowledge:  { label: 'Knowledge',  icon: '📚', color: '#818CF8' }, // Indigo — Brow
    creative:   { label: 'Creative',   icon: '🎨', color: '#2DD4BF' }, // Teal   — Throat
  };

  // ─── Skills & Habits ──────────────────────────────────────────────────
  //
  // isHabit: true  → dagelijkse gewoonte, score 0-10, geen XP-levels
  //                  wordt bijgehouden via rpg_habits_v1
  // isHabit: false → skill, cumulatief XP, level 1-100
  //
  // milestones: { level: 'wat je kunt op dat level' }
  //   → toont special toast bij level-up naar dat level
  //
  // private: true  → verborgen achter PIN (alleen no_porn + weed_control)

  const DEFAULT_SKILLS = {

    // ══ MONEY — skills ════════════════════════════════════════════════
    saving: {
      xp:0, parentSkill:'money', icon:'🐖', label:'Sparen', active:true,
      quickLog:[
        {label:'Bedrag gespaard',    xp:30},
        {label:'Maand target gehaald', xp:60},
        {label:'Automatisch sparen',  xp:20},
      ],
      milestones:{ 10:'Eerste €1.000 gespaard', 25:'€5.000 buffer', 50:'€10.000 — solid foundation', 75:'€25.000', 100:'€50.000+ — financiële vrijheid in zicht' },
    },
    investing: {
      xp:0, parentSkill:'money', icon:'📈', label:'Investeren', active:true,
      quickLog:[
        {label:'Investering gedaan',         xp:40},
        {label:'Strategie research (video/artikel)', xp:20},
        {label:'Portfolio review',           xp:25},
        {label:'Boek over investing gelezen',xp:35},
      ],
      milestones:{
        1:  'Eerste beleggingsrekening geopend',
        5:  '€500 belegd',
        10: 'Index fondsen begrijpen (S&P500, MSCI World)',
        15: '€2.500 belegd, consistent maandelijks',
        20: 'Portfolio diversificatie begrijpen',
        25: '€5.000 belegd',
        30: '€10.000 belegd',
        40: 'Dividend + FIRE concept doorgrond',
        50: '€25.000 — passief inkomen merkbaar',
        60: '€50.000 — compound werkt voor jou',
        70: '€75.000',
        80: '€100.000 — de ton. Het fundament.',
        90: '€150.000',
        100:'€250.000+ — financiële onafhankelijkheid',
      },
    },
    budgeting: {
      xp:0, parentSkill:'money', icon:'📋', label:'Budget', active:true,
      quickLog:[
        {label:'Maandbudget bijgewerkt', xp:25},
        {label:'Uitgaven gecategoriseerd', xp:15},
        {label:'Subscriptions gereviewed', xp:20},
      ],
    },
    net_worth: {
      xp:0, parentSkill:'money', icon:'🏦', label:'Net Worth', active:true,
      quickLog:[
        {label:'Net worth bijgewerkt', xp:30},
        {label:'Financieel overzicht gemaakt', xp:20},
      ],
      milestones:{ 10:'Eerste positieve net worth', 30:'€10.000 net worth', 50:'€25.000', 75:'€50.000', 100:'€100.000 — de ton gehaald 🏆' },
    },

    // ══ BODY — skills ═════════════════════════════════════════════════
    gym: {
      xp:0, parentSkill:'body', icon:'🏋️', label:'Gym', active:true,
      quickLog:[
        {label:'Gym sessie',        xp:60},
        {label:'Push sessie',       xp:50},
        {label:'Pull sessie',       xp:50},
        {label:'Legs sessie',       xp:55},
        {label:'PR gehaald',        xp:100},
      ],
      milestones:{ 10:'Consistente routine (3x/week)', 20:'Zichtbaar resultaat', 30:'100kg squat', 50:'Advanced lifter', 75:'Competition-ready physique', 100:'Elite — top 1% lichaam' },
    },
    tennis: {
      xp:0, parentSkill:'body', icon:'🎾', label:'Tennis', active:true,
      quickLog:[
        {label:'Tennisles',  xp:55},
        {label:'Freeplay',   xp:40},
        {label:'1v1 match',  xp:65},
        {label:'2v2 match',  xp:50},
      ],
      milestones:{
        1:  'Eerste les — je raakt de bal',
        5:  '20+ slag rally consistent houden',
        10: 'Serve 70%+ first serve percentage',
        15: 'Topspin forehand onder controle',
        20: 'Club-niveau — je wint van beginners',
        30: 'Backhand slice + lob beheersen',
        40: 'Competitie klaar — officiële wedstrijden',
        50: '4.0 NTRP niveau',
        60: 'Tactisch spel — punt opbouwen bewust',
        70: '4.5 NTRP — hogere competitie',
        80: 'Serve & volley, aanvallend spel volledig',
        90: '5.0 NTRP — near-professional',
        100:'Elite — toernooien winnen',
      },
    },
    calisthenics: {
      xp:0, parentSkill:'body', icon:'🤸', label:'Calisthenics', active:true,
      quickLog:[
        {label:'Training sessie',     xp:50},
        {label:'Nieuwe skill geoefend', xp:40},
        {label:'Progressie gehaald',  xp:70},
      ],
      milestones:{
        1:  'Correcte plank (30 sec) + 10 bodyweight squats',
        2:  '5 push-ups aaneengesloten',
        3:  '10 push-ups aaneengesloten',
        4:  '15 push-ups aaneengesloten',
        5:  '20 push-ups aaneengesloten',
        6:  '5 negatieve pull-ups (slow eccentric, 5 sec neer)',
        7:  '1 strikte pull-up — je eerste',
        8:  '3 strikte pull-ups aaneengesloten',
        9:  '5 strikte pull-ups aaneengesloten',
        10: '10 strikte pull-ups',
        12: 'Pike push-up — eerste stap richting handstand',
        14: 'Dips (parallel bars) — 10 herhalingen',
        15: 'Handstand oefening — tegen muur (eerste keer)',
        17: 'Handstand hold 5 sec tegen muur',
        20: 'Handstand hold 10 sec tegen muur',
        22: 'Pike handstand push-up',
        24: 'Vrije handstand 3 sec (zonder muur)',
        25: 'Vrije handstand 5 sec',
        27: 'Eerste handstand push-up (met muur)',
        30: 'Strict handstand push-up — geen kip',
        33: 'Ring dip — eerste gymring skill',
        35: 'Strict muscle-up op ringen',
        38: 'Ring muscle-up vloeiend, elke rep',
        40: 'Bar muscle-up',
        45: '5 muscle-ups aaneengesloten',
        50: 'L-sit (30 sec) — core van staal',
        55: 'Manna progressie — V-sit',
        60: 'Front lever (5 sec)',
        65: 'Front lever pulls',
        70: 'Back lever (5 sec)',
        75: 'Dragon flag — Rocky-niveau',
        80: 'Human flag (3 sec)',
        85: 'One-arm push-up (beide kanten)',
        90: 'Tuck planche',
        95: 'Advanced tuck planche',
        100:'Full planche — absolute wereldklasse',
      },
    },
    strength: {
      xp:0, parentSkill:'body', icon:'💪', label:'Kracht', active:false,
      quickLog:[{label:'Kracht sessie', xp:50},{label:'PR gehaald', xp:80}],
    },

    // ══ BODY — habits (isHabit: true) ═════════════════════════════════
    sleep: {
      xp:0, parentSkill:'body', icon:'😴', label:'Slaap', active:true, isHabit:true,
      habitDesc:'8 uur slapen = +1 punt. Minder = proportioneel minder. Daalt -1 per gemiste dag.',
    },
    nutrition: {
      xp:0, parentSkill:'body', icon:'🥗', label:'Voeding', active:true, isHabit:true,
      habitDesc:'Elke dag genoeg en gezond eten. +1 punt. Daalt -1 per gemiste dag.',
    },
    walking: {
      xp:0, parentSkill:'body', icon:'👟', label:'10k Stappen', active:true, isHabit:true,
      habitDesc:'10.000 stappen per dag = vol punt. Minder = proportioneel minder.',
    },

    // ══ MIND — skills ═════════════════════════════════════════════════
    reading: {
      xp:0, parentSkill:'mind', icon:'📚', label:'Lezen', active:true,
      quickLog:[
        {label:'30 min lezen',  xp:25},
        {label:'1 uur lezen',   xp:45},
        {label:'Boek afgerond', xp:150},
      ],
      milestones:{ 10:'10 boeken gelezen', 25:'25 boeken', 50:'50 boeken', 75:'75 boeken', 100:'100+ boeken — speed reader' },
    },
    focus: {
      xp:0, parentSkill:'mind', icon:'🎯', label:'Deep Work', active:true,
      quickLog:[
        {label:'Diepe werk sessie (90 min)', xp:60},
        {label:'Pomodoro x4',               xp:50},
        {label:'2 uur phone-free',          xp:45},
      ],
      milestones:{ 20:'2 uur/dag deep work', 50:'4 uur/dag deep work', 100:'6+ uur/dag — Cal Newport niveau' },
    },
    journaling: {
      xp:0, parentSkill:'mind', icon:'📓', label:'Journaling', active:true,
      quickLog:[
        {label:'Dagboek bijgewerkt',     xp:20},
        {label:'Uitgebreide reflectie',  xp:35},
        {label:'Week review',            xp:40},
      ],
    },

    // ══ MIND — habits ═════════════════════════════════════════════════
    meditation: {
      xp:0, parentSkill:'mind', icon:'🧘', label:'Meditatie', active:true, isHabit:true,
      habitDesc:'Dagelijks mediteren. +1 punt. Daalt -1 per gemiste dag.',
    },
    gratitude: {
      xp:0, parentSkill:'mind', icon:'🙏', label:'Gratitude', active:true, isHabit:true,
      habitDesc:'Dagelijks 3 dingen opschrijven waarvoor je dankbaar bent.',
    },

    // ══ BUSINESS — skills ═════════════════════════════════════════════
    sales: {
      xp:0, parentSkill:'business', icon:'🤝', label:'Sales', active:true,
      quickLog:[
        {label:'Sales gesprek gevoerd', xp:40},
        {label:'Offerte verstuurd',     xp:30},
        {label:'Deal gesloten',         xp:150},
        {label:'Follow-up gedaan',      xp:20},
      ],
      milestones:{ 10:'Eerste betaalde klant', 25:'5 klanten', 50:'Consistent pipeline', 75:'Sales systeem gebouwd', 100:'Top sales — €10k+/maand' },
    },
    marketing: {
      xp:0, parentSkill:'business', icon:'📣', label:'Marketing', active:true,
      quickLog:[
        {label:'Content gemaakt',       xp:40},
        {label:'Post gepubliceerd',     xp:20},
        {label:'Campagne opgezet',      xp:50},
        {label:'Analytics geanalyseerd',xp:25},
      ],
    },
    ai_tools: {
      xp:0, parentSkill:'business', icon:'🤖', label:'AI Tools', active:true,
      quickLog:[
        {label:'Workflow geautomatiseerd', xp:50},
        {label:'Nieuwe tool geleerd',      xp:30},
        {label:'Prompt geoptimeerd',       xp:20},
        {label:'AI-project gebouwd',       xp:70},
      ],
      milestones:{ 20:'10+ AI tools in gebruik', 50:'Volledig AI-first workflow', 100:'AI expert — bouwt eigen tools' },
    },
    coding: {
      xp:0, parentSkill:'business', icon:'💻', label:'Coding', active:true,
      quickLog:[
        {label:'Feature gebouwd',    xp:60},
        {label:'Bug gefixt',         xp:30},
        {label:'Project sessie',     xp:50},
        {label:'Deployed naar prod', xp:80},
      ],
      milestones:{
        1:  'HTML/CSS begrijpen, eerste pagina',
        5:  'JavaScript basics — functies, DOM',
        10: 'Eigen website live (dit dashboard — al gedaan!)',
        15: "API's aanroepen, data ophalen",
        20: 'Database koppelen (Supabase — al gedaan!)',
        25: 'Authentication systeem',
        30: 'Eerste product dat anderen gebruiken',
        40: 'AI agents bouwen en automatiseren',
        50: 'Full-stack app — frontend + backend',
        60: 'Eigen SaaS product live',
        70: 'Product genereert €1.000/maand',
        80: 'Team aansturen via automatisering',
        90: 'Tech founder — schaalbaar product',
        100:'10x engineer — bouwt wat anderen niet kunnen',
      },
    },

    // ══ LIFESTYLE — skills ════════════════════════════════════════════
    cooking: {
      xp:0, parentSkill:'lifestyle', icon:'🍳', label:'Koken', active:true,
      quickLog:[
        {label:'Gezond gekookt',    xp:20},
        {label:'Nieuw recept',      xp:45},
        {label:'Meal prep gedaan',  xp:40},
      ],
      milestones:{ 10:'10 recepten', 25:'25 recepten onder de knie', 50:'Gevarieerd en gezond koken', 100:'Chef-niveau thuis koken' },
    },
    social: {
      xp:0, parentSkill:'lifestyle', icon:'👥', label:'Sociaal', active:true,
      quickLog:[
        {label:'Vrienden gezien',     xp:35},
        {label:'Nieuwe connectie',    xp:40},
        {label:'Familie tijd',        xp:25},
        {label:'Sociaal event',       xp:30},
      ],
    },
    dating: {
      xp:0, parentSkill:'lifestyle', icon:'❤️', label:'Dating', active:true,
      quickLog:[
        {label:'Date gehad',          xp:50},
        {label:'Iemand aangesproken', xp:40},
        {label:'Match gemaakt',       xp:20},
      ],
    },
    planning: {
      xp:0, parentSkill:'lifestyle', icon:'📅', label:'Planning', active:true,
      quickLog:[
        {label:'Week gepland',       xp:30},
        {label:'Dag gepland',        xp:10},
        {label:'Doelen bijgewerkt',  xp:20},
      ],
    },

    // ══ DISCIPLINE — private skills (PIN 1111) ════════════════════════
    no_porn: {
      xp:0, parentSkill:'discipline', icon:'🛡️', label:'No Porn',
      active:true, private:true, quickLog:null,
    },
    weed_control: {
      xp:0, parentSkill:'discipline', icon:'🚫', label:'Weed Control',
      active:true, private:true, quickLog:null,
    },

    // ══ DISCIPLINE — habits (NIET privé) ══════════════════════════════
    screen_time: {
      xp:0, parentSkill:'discipline', icon:'📵', label:'Schermtijd', active:true, isHabit:true,
      habitDesc:'Bewuste schermtijd: < 2u entertainment per dag = vol punt.',
    },
    cold_shower: {
      xp:0, parentSkill:'discipline', icon:'🚿', label:'Koud Douchen', active:true, isHabit:true,
      habitDesc:'Elke dag koud douchen. +1 punt. Daalt -1 per gemiste dag.',
    },

    // ══ KNOWLEDGE — skills ════════════════════════════════════════════
    languages: {
      xp:0, parentSkill:'knowledge', icon:'🗣️', label:'Talen', active:true,
      quickLog:[
        {label:'Duolingo / app',             xp:15},
        {label:'30 min studeren',            xp:25},
        {label:'Gesprek in vreemde taal',    xp:45},
        {label:'Serie/film in taal gekeken', xp:20},
      ],
      milestones:{ 10:'Basis conversatie', 30:'A2 niveau', 50:'B1 niveau', 75:'B2 niveau', 100:'C1 — vloeiend' },
    },
    learning: {
      xp:0, parentSkill:'knowledge', icon:'🎓', label:'Leren', active:true,
      quickLog:[
        {label:'Online cursus (uur)',    xp:45},
        {label:'Tutorial gevolgd',       xp:25},
        {label:'Cursus afgerond',        xp:200},
        {label:'Skill geoefend',         xp:30},
      ],
    },

    // ══ CREATIVE — skills ═════════════════════════════════════════════
    piano: {
      xp:0, parentSkill:'creative', icon:'🎹', label:'Piano', active:true,
      quickLog:[
        {label:'30 min geoefend',       xp:30},
        {label:'1 uur geoefend',        xp:55},
        {label:'Nieuw nummer geleerd',  xp:80},
        {label:'Opgetreden / gedeeld',  xp:100},
      ],
      milestones:{
        1:  'Noten lezen, beide handen los',
        5:  'Eerste volledig stuk afgerond',
        10: 'Bladmuziek lezen — Grade 1',
        15: 'Grade 2 — polyfonie, pedaalgebruik',
        20: 'Grade 3 — eerste echte stukken',
        30: 'Grade 4 — Clementi sonatines',
        40: 'Grade 5 — Chopin nocturnes mogelijk',
        50: 'Grade 6 — Bach inventies',
        60: 'Grade 7 — Beethoven sonates',
        70: 'Grade 8 — gevorderd niveau',
        80: 'Diploma niveau — concertstukken',
        90: 'Pre-conservatoire niveau',
        100:'Concert-niveau — Chopin Ballade No.1',
      },
    },
    content: {
      xp:0, parentSkill:'creative', icon:'🎬', label:'Content', active:true,
      quickLog:[
        {label:'Video gemonteerd',   xp:60},
        {label:'Post gemaakt',       xp:25},
        {label:'Gepubliceerd',       xp:40},
        {label:'Serie afgerond',     xp:100},
      ],
    },
  };

  // ─── localStorage helpers ─────────────────────────────────────────────

  function loadCharacter() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (!saved.skills) saved.skills = {};
        for (const [k, v] of Object.entries(DEFAULT_SKILLS)) {
          if (!saved.skills[k]) {
            saved.skills[k] = { ...v };
          } else {
            // Altijd sync vanuit DEFAULT_SKILLS definitie (overschrijft stale data)
            saved.skills[k].parentSkill = v.parentSkill;
            saved.skills[k].icon    = saved.skills[k].icon  || v.icon;
            saved.skills[k].label   = saved.skills[k].label || v.label;
            saved.skills[k].isHabit = v.isHabit || false;
            // Private: ALTIJD sync vanuit default — verwijder als default het niet heeft
            if (v.private) saved.skills[k].private = true;
            else            delete saved.skills[k].private;
            if (saved.skills[k].active === undefined) saved.skills[k].active = v.active;
            saved.skills[k].quickLog  = v.quickLog;
            saved.skills[k].milestones = v.milestones;
          }
        }
        if (!saved.xpLog) saved.xpLog = [];
        return saved;
      }
    } catch (e) {}
    const base = JSON.parse(JSON.stringify(DEFAULT_SKILLS));
    return { skills: base, xpLog: [] };
  }

  function saveCharacter(char) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(char)); } catch (e) {}
  }

  // ─── Habits ──────────────────────────────────────────────────────────

  function loadHabits() {
    try { const r = localStorage.getItem(HABITS_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
  }
  function saveHabits(h) {
    try { localStorage.setItem(HABITS_KEY, JSON.stringify(h)); } catch {}
  }
  function todayStr() { return new Date().toISOString().slice(0, 10); }

  function applyHabitDecay(habits) {
    const today = todayStr();
    let changed = false;
    for (const h of Object.values(habits)) {
      if (!h.lastChecked) continue;
      const diffDays = Math.floor((new Date(today) - new Date(h.lastChecked)) / 86400000);
      if (diffDays > 1) { h.score = Math.max(0, (h.score||0) - (diffDays-1)); changed = true; }
    }
    if (changed) saveHabits(habits);
    return habits;
  }

  window.getHabits   = function () { return applyHabitDecay(loadHabits()); };
  window.saveHabits  = saveHabits;

  window.checkHabit = function (habitId, label, icon) {
    const habits  = loadHabits();
    const today   = todayStr();
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
    if (!habits[habitId]) habits[habitId] = { label:label||habitId, icon:icon||'⭐', score:0, lastChecked:null, streak:0 };
    const h = habits[habitId];
    if (h.lastChecked === today) return h;
    h.score  = Math.min(10, (h.score||0)+1);
    h.streak = (h.lastChecked===yesterday) ? (h.streak||0)+1 : 1;
    h.lastChecked = today;
    saveHabits(habits);
    return h;
  };

  window.uncheckHabit = function (habitId) {
    const habits = loadHabits();
    if (!habits[habitId]) return;
    const h = habits[habitId];
    h.score  = Math.max(0, (h.score||1)-1);
    h.streak = Math.max(0, (h.streak||1)-1);
    h.lastChecked = null;
    saveHabits(habits);
    return h;
  };

  // ─── XP toast ────────────────────────────────────────────────────────

  function getToastEl() {
    let t = document.getElementById('xp-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'xp-toast';
      t.style.cssText = [
        'position:fixed',
        'bottom:calc(env(safe-area-inset-bottom,0px)+72px)',
        'right:16px', 'padding:10px 16px', 'border-radius:12px',
        'background:rgba(20,20,24,0.95)', 'backdrop-filter:blur(16px)',
        '-webkit-backdrop-filter:blur(16px)',
        'border:1px solid rgba(255,255,255,0.08)',
        'font-family:-apple-system,BlinkMacSystemFont,"Inter",sans-serif',
        'font-size:14px', 'font-weight:600', 'color:#fff',
        'pointer-events:none', 'z-index:9999',
        'opacity:0', 'transform:translateY(8px)',
        'transition:opacity 0.25s,transform 0.25s',
        'max-width:280px',
      ].join(';');
      document.body.appendChild(t);
    }
    return t;
  }

  function showToast(html, duration) {
    const t = getToastEl();
    t.innerHTML = html;
    clearTimeout(t._hide);
    t.style.opacity='1'; t.style.transform='translateY(0)';
    t._hide = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateY(8px)'; }, duration||2400);
  }

  // ─── Publieke API ─────────────────────────────────────────────────────

  window.addXP = function (skillName, amount, reason) {
    const char  = loadCharacter();
    if (!char.skills[skillName]) {
      char.skills[skillName] = { xp:0, parentSkill:'knowledge', icon:'⭐', label:skillName, active:true };
    }
    const skill    = char.skills[skillName];
    const oldLevel = xpToLevel(skill.xp);
    skill.xp       = Math.max(0, (skill.xp||0) + amount);
    const newLevel = xpToLevel(skill.xp);

    const isPrivate = !!(skill.private || (DEFAULT_SKILLS[skillName]||{}).private);
    char.xpLog.unshift({ skill:skillName, amount, reason:reason||'', date:todayStr(), private:isPrivate });
    if (char.xpLog.length > MAX_LOG) char.xpLog.length = MAX_LOG;

    saveCharacter(char);

    // Toast
    if (!isPrivate) {
      const parent = PARENT_SKILLS[skill.parentSkill]||{};
      const color  = parent.color||'#6BE3A4';
      const sign   = amount>=0?'+':'';
      showToast(
        '<span style="color:'+color+'">'+sign+amount+' XP</span>'+
        ' <span style="color:rgba(255,255,255,0.5);font-weight:400">· '+(parent.label||skill.parentSkill)+'</span>'
      );
    }

    // Level-up
    if (newLevel > oldLevel) {
      const ms = (skill.milestones||(DEFAULT_SKILLS[skillName]||{}).milestones)||{};
      setTimeout(()=>{
        const parent = PARENT_SKILLS[skill.parentSkill]||{};
        const color  = parent.color||'#6BE3A4';
        const milestone = ms[newLevel];
        if (milestone) {
          showToast(
            '<div style="line-height:1.4">'+
            '<span style="color:'+color+'">⭐ LEVEL '+newLevel+'!</span>'+
            ' <span style="color:rgba(255,255,255,0.7);font-weight:400">'+(skill.label||skillName)+'</span>'+
            '<br><span style="font-size:11px;color:rgba(255,255,255,0.5);font-weight:400">🔓 '+milestone+'</span>'+
            '</div>', 4000
          );
        } else {
          showToast(
            '<span style="color:'+color+'">LEVEL UP!</span>'+
            ' <span style="color:rgba(255,255,255,0.7)">'+(skill.label||skillName)+' → Lvl '+newLevel+'</span>'
          );
        }
      }, 600);
    }

    return { skill:skillName, newXP:skill.xp, level:newLevel };
  };

  window.removeXP = function (skillName, amount, reason) {
    return window.addXP(skillName, -Math.abs(amount), reason||'Quest unchecked');
  };

  window.getCharacter       = function () { return loadCharacter(); };
  window.xpToLevel          = xpToLevel;
  window.xpForLevel         = xpForLevel;
  window.RPG_PARENT_SKILLS  = PARENT_SKILLS;
  window.RPG_DEFAULT_SKILLS = DEFAULT_SKILLS;
  window.RPG_MAX_LEVEL      = MAX_LEVEL;

  // ─── Cloud sync ───────────────────────────────────────────────────────
  function initRPGSync() {
    if (!window.initCloudSync || !window.supabase) return;
    window.initCloudSync({ appKey:'rpg', syncedKeys:[STORAGE_KEY, HABITS_KEY] });
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', initRPGSync);
  else initRPGSync();

})();
