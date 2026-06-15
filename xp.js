// =============================================================
// xp.js — Life OS RPG engine v2.0
// Usage: addXP('tennis', 55, 'Tennis lesson')
//        removeXP('tennis', 55, 'Quest unchecked')
// isHabit: true → score 0-10 via checkHabit(), no XP-level
// =============================================================
(function () {
  'use strict';

  const STORAGE_KEY = 'rpg_character_v1';
  const HABITS_KEY  = 'rpg_habits_v1';
  const MAX_LOG     = 200;
  const MAX_LEVEL   = 100;

  // Level 100 requires 490,050 XP — at ~150 XP/day ≈ 9 years. Near-impossible.
  function xpToLevel(xp) {
    return Math.min(MAX_LEVEL, Math.floor(Math.sqrt((xp || 0) / 50)) + 1);
  }
  function xpForLevel(level) {
    if (level >= MAX_LEVEL) return Infinity;
    return Math.pow(level - 1, 2) * 50;
  }

  // ─── 8 Categories — Law of Attraction / Chakra ──────────────────────
  const PARENT_SKILLS = {
    // 6 officiële domeinen (v3.0)
    money:      { label: 'Money',      icon: '💰', color: '#F5C842' },
    body:       { label: 'Physical',   icon: '💪', color: '#6BE3A4' },
    mind:       { label: 'Mental',     icon: '🧠', color: '#7DD3FC' },
    business:   { label: 'Business',   icon: '📈', color: '#C4B5FD' },
    lifestyle:  { label: 'Lifestyle',  icon: '✨', color: '#FB923C' },
    knowledge:  { label: 'Knowledge',  icon: '📚', color: '#818CF8' },
    // Geen eigen domeinen meer — erven van dichtsbijzijnde domein
    discipline: { label: 'Mental',     icon: '🧠', color: '#7DD3FC' },
    creative:   { label: 'Knowledge',  icon: '📚', color: '#818CF8' },
  };

  // ─── Skills & Habits ──────────────────────────────────────────────────
  //
  // isHabit: true  → daily habit, score 0-10, no XP-levels
  //                  tracked via rpg_habits_v1
  // isHabit: false → skill, cumulative XP, level 1-100
  //
  // milestones: { level: 'what you can do at that level' }
  //   → shows special toast on level-up to that level
  //
  // private: true  → hidden behind PIN (only no_porn + weed_control)

  const DEFAULT_SKILLS = {

    // ══ MONEY — skills ════════════════════════════════════════════════
    saving: {
      xp:0, parentSkill:'money', icon:'🐖', label:'Saving', active:true,
      quickLog:[
        {label:'Amount saved',         xp:30},
        {label:'Monthly target hit',   xp:60},
        {label:'Auto-save set up',     xp:20},
      ],
      milestones:{ 10:'1 month of expenses saved', 25:'3-month emergency fund', 50:'6 months of runway', 75:'1 full year of expenses banked', 100:'2+ years runway — total safety net' },
    },
    investing: {
      xp:0, parentSkill:'money', icon:'📈', label:'Investing', active:true,
      quickLog:[
        {label:'Investment made',                    xp:40},
        {label:'Strategy research (video/article)',  xp:20},
        {label:'Portfolio review',                   xp:25},
        {label:'Investing book read',                xp:35},
      ],
      milestones:{
        2:  'First brokerage account opened (DEGIRO, Trade Republic…)',
        5:  'First €500 invested in a broad ETF',
        10: 'Understand index funds (S&P500, MSCI World)',
        15: '€2,500 in — automatic monthly contribution set up',
        22: 'Understand diversification & risk spreading',
        30: '€10,000 invested',
        40: 'Dividend + FIRE concept fully understood',
        50: '€25,000 — passive income becoming noticeable',
        60: '€50,000 — compound interest working for you',
        75: '€100,000 — the foundation',
        90: '€175,000',
        100:'€250,000+ — financial independence in reach',
      },
    },
    budgeting: {
      xp:0, parentSkill:'money', icon:'📋', label:'Budgeting', active:true,
      quickLog:[
        {label:'Monthly budget updated',    xp:25},
        {label:'Expenses categorized',      xp:15},
        {label:'Subscriptions reviewed',    xp:20},
      ],
      milestones:{
        5:  'Track every expense for one week',
        15: 'Run a full month on a written budget',
        30: 'Cancel unused subscriptions; know your fixed costs',
        50: 'Zero-based budget — every euro has a job',
        70: 'Consistently spend less than you earn, 6 months running',
        100:'Money fully automated: bills, savings & investing on autopilot'
      },
    },
    net_worth: {
      xp:0, parentSkill:'money', icon:'🏦', label:'Net Worth', active:true,
      quickLog:[
        {label:'Net worth updated',       xp:30},
        {label:'Financial overview made', xp:20},
      ],
      milestones:{ 10:'First positive net worth', 30:'€10,000 net worth', 50:'€25,000', 75:'€50,000', 100:'€100,000 — the ton reached 🏆' },
    },

    // ══ BODY — skills ═════════════════════════════════════════════════
    gym: {
      xp:0, parentSkill:'body', icon:'🏋️', label:'Gym', active:true,
      quickLog:[
        {label:'Gym session',   xp:60},
        {label:'Push session',  xp:50},
        {label:'Pull session',  xp:50},
        {label:'Legs session',  xp:55},
        {label:'PR hit',        xp:100},
      ],
      milestones:{ 10:'Consistent routine (3x/week)', 20:'Visible results', 30:'100kg squat', 50:'Advanced lifter', 75:'Competition-ready physique', 100:'Elite — top 1% body' },
    },
    tennis: {
      xp:0, parentSkill:'body', icon:'🎾', label:'Tennis', active:true,
      quickLog:[
        {label:'Tennis lesson', xp:55},
        {label:'Free play',     xp:40},
        {label:'1v1 match',     xp:65},
        {label:'2v2 match',     xp:50},
      ],
      milestones:{
        1:  'First lesson — you hit the ball',
        5:  'Consistent 20+ shot rally',
        10: 'Serve 70%+ first serve percentage',
        15: 'Topspin forehand under control',
        20: 'Club level — beating beginners',
        30: 'Backhand slice + lob mastered',
        40: 'Competition ready — playing official matches',
        50: '4.0 NTRP level',
        60: 'Tactical play — building points consciously',
        70: '4.5 NTRP — higher competition level',
        80: 'Serve & volley, full attacking game',
        90: '5.0 NTRP — near-professional',
        100:'Elite — winning tournaments',
      },
    },
    calisthenics: {
      xp:0, parentSkill:'body', icon:'🤸', label:'Calisthenics', active:true,
      quickLog:[
        {label:'Training session',    xp:50},
        {label:'New skill practiced', xp:40},
        {label:'Progress milestone',  xp:70},
      ],
      milestones:{
        1:  'Correct plank (30 sec) + 10 bodyweight squats',
        2:  '5 push-ups consecutive',
        3:  '10 push-ups consecutive',
        4:  '15 push-ups consecutive',
        5:  '20 push-ups consecutive',
        6:  '5 negative pull-ups (slow eccentric, 5 sec down)',
        7:  '1 strict pull-up — your first',
        8:  '3 strict pull-ups consecutive',
        9:  '5 strict pull-ups consecutive',
        10: '10 strict pull-ups',
        12: 'Pike push-up — first step toward handstand',
        14: 'Dips (parallel bars) — 10 reps',
        15: 'Handstand practice — against wall (first time)',
        17: 'Handstand hold 5 sec against wall',
        20: 'Handstand hold 10 sec against wall',
        22: 'Pike handstand push-up',
        24: 'Free handstand 3 sec (no wall)',
        25: 'Free handstand 5 sec',
        27: 'First handstand push-up (with wall)',
        30: 'Strict handstand push-up — no kip',
        33: 'Ring dip — first ring skill',
        35: 'Strict muscle-up on rings',
        38: 'Ring muscle-up smooth, every rep',
        40: 'Bar muscle-up',
        45: '5 muscle-ups consecutive',
        50: 'L-sit (30 sec) — core of steel',
        55: 'Manna progression — V-sit',
        60: 'Front lever (5 sec)',
        65: 'Front lever pulls',
        70: 'Back lever (5 sec)',
        75: 'Dragon flag — Rocky level',
        80: 'Human flag (3 sec)',
        85: 'One-arm push-up (both sides)',
        90: 'Tuck planche',
        95: 'Advanced tuck planche',
        100:'Full planche — absolute world class',
      },
    },
    core: {
      xp:0, parentSkill:'body', icon:'🔥', label:'Core', active:true,
      quickLog:[
        {label:'Core training session',   xp:45},
        {label:'Plank challenge',         xp:30},
        {label:'Dragon flag progression', xp:50},
        {label:'L-sit practice',          xp:40},
      ],
      milestones:{
        1:  '10 sec plank',
        5:  '60 sec plank',
        10: 'Hollow body hold (30 sec)',
        15: 'Leg raises — 10 strict',
        20: 'Toes to bar',
        30: 'Dragon flag progression',
        40: 'Dragon flag (full)',
        50: 'L-sit (15 sec)',
        60: 'L-sit (30 sec)',
        70: 'V-sit',
        80: 'Front lever',
        100:'Absolute core — planche-level stability',
      },
    },
    stretching: {
      xp:0, parentSkill:'body', icon:'🧘', label:'Mobility', active:true,
      quickLog:[
        {label:'Mobility session',      xp:30},
        {label:'Deep stretch (30 min)', xp:45},
        {label:'New milestone hit',     xp:60},
      ],
      milestones:{
        1:  'Touch knees with straight legs',
        5:  'Hands on floor — full forward fold',
        10: 'Full squat (heels on floor, 60s)',
        15: 'Pancake stretch (thighs on floor)',
        20: 'Side split (90 degrees)',
        30: 'Forward split',
        40: 'Full side split',
        50: 'Bridge from lying position',
        60: 'Bridge from standing (wall walkover)',
        80: 'Scorpion pose',
        100:'Contortion-level — full backbend with splits',
      },
    },
    strength: {
      xp:0, parentSkill:'body', icon:'💪', label:'Strength', active:true,
      quickLog:[
        { label:'Gym session', xp:60 },
        { label:'PR achieved', xp:100 },
        { label:'Push day',    xp:50 },
        { label:'Pull day',    xp:50 },
        { label:'Leg day',     xp:55 },
      ],
      milestones:{
        25:  '3x/week consistent training',
        50:  '100kg squat, 80kg bench',
        75:  '140kg squat, weighted pull-ups',
        100: 'Elite — competition-ready, top 1%',
      },
    },
    recovery: {
      xp:0, parentSkill:'body', icon:'❤️', label:'Recovery', active:true,
      quickLog:[
        { label:'8+ hours sleep',     xp:30 },
        { label:'Rest day respected', xp:20 },
        { label:'Deload week done',   xp:40 },
      ],
      milestones:{
        25:  'Consistent 7+ hrs sleep, resting HR under 65',
        50:  '8hr sleep standard, HRV improving',
        75:  'Recovery in 24h after heavy training',
        100: 'Athlete-level recovery — optimal sleep + HRV',
      },
    },
    endurance: {
      xp:0, parentSkill:'body', icon:'🏃', label:'Endurance', active:true,
      quickLog:[
        { label:'Run / cardio session', xp:40 },
        { label:'10k steps reached',    xp:30 },
        { label:'Cycling session',      xp:35 },
      ],
      milestones:{
        25:  'Run 5km without stopping',
        50:  '10km under 55 min',
        75:  'Half marathon',
        100: 'Marathon — elite endurance',
      },
    },

    // ══ BODY — habits (isHabit: true) ═════════════════════════════════
    sleep: {
      xp:0, parentSkill:'body', icon:'😴', label:'Sleep', active:true, isHabit:true,
      habitDesc:'8 hours sleep = +1 point. Less = proportionally less. Drops -1 per missed day.',
    },
    nutrition: {
      xp:0, parentSkill:'body', icon:'🥗', label:'Nutrition', active:true, isHabit:true,
      habitDesc:'Eat enough and healthy every day. +1 point. Drops -1 per missed day.',
    },
    walking: {
      xp:0, parentSkill:'body', icon:'👟', label:'10k Steps', active:true, isHabit:true,
      habitDesc:'10,000 steps per day = full point. Less = proportionally less.',
    },

    // ══ MIND — skills ═════════════════════════════════════════════════
    reading: {
      xp:0, parentSkill:'mind', icon:'📚', label:'Reading', active:true,
      quickLog:[
        {label:'30 min reading',  xp:25},
        {label:'1 hour reading',  xp:45},
        {label:'Book finished',   xp:150},
      ],
      milestones:{ 10:'10 books read', 25:'25 books', 50:'50 books', 75:'75 books', 100:'100+ books — speed reader' },
    },
    focus: {
      xp:0, parentSkill:'mind', icon:'🎯', label:'Deep Work', active:true,
      quickLog:[
        {label:'Deep work session (90 min)', xp:60},
        {label:'Pomodoro x4',               xp:50},
        {label:'2 hours phone-free',         xp:45},
      ],
      milestones:{ 20:'2 hours/day deep work', 50:'4 hours/day deep work', 100:'6+ hours/day — Cal Newport level' },
    },
    journaling: {
      xp:0, parentSkill:'mind', icon:'📓', label:'Journaling', active:true,
      quickLog:[
        {label:'Journal entry',         xp:20},
        {label:'Extended reflection',   xp:35},
        {label:'Week review',           xp:40},
      ],
    },

    // ══ MIND — habits ═════════════════════════════════════════════════
    meditation: {
      xp:0, parentSkill:'mind', icon:'🧘', label:'Meditation', active:true, isHabit:true,
      habitDesc:'Meditate daily. +1 point. Drops -1 per missed day.',
    },
    gratitude: {
      xp:0, parentSkill:'mind', icon:'🙏', label:'Gratitude', active:true, isHabit:true,
      habitDesc:'Write 3 things you\'re grateful for every day.',
    },

    // ══ BUSINESS — skills ═════════════════════════════════════════════
    sales: {
      xp:0, parentSkill:'business', icon:'🤝', label:'Sales', active:true,
      quickLog:[
        {label:'Sales call done',  xp:40},
        {label:'Proposal sent',    xp:30},
        {label:'Deal closed',      xp:150},
        {label:'Follow-up done',   xp:20},
      ],
      milestones:{ 10:'First paying client', 25:'5 clients', 50:'Consistent pipeline', 75:'Sales system built', 100:'Top sales — €10k+/month' },
    },
    marketing: {
      xp:0, parentSkill:'business', icon:'📣', label:'Marketing', active:true,
      quickLog:[
        {label:'Content created',    xp:40},
        {label:'Post published',     xp:20},
        {label:'Campaign set up',    xp:50},
        {label:'Analytics reviewed', xp:25},
      ],
    },
    ai_tools: {
      xp:0, parentSkill:'business', icon:'🤖', label:'AI Tools', active:true,
      quickLog:[
        {label:'Workflow automated', xp:50},
        {label:'New tool learned',   xp:30},
        {label:'Prompt optimized',   xp:20},
        {label:'AI project built',   xp:70},
      ],
      milestones:{
        5:  'First AI-generated output used in real work',
        10: '5+ AI tools in daily workflow',
        20: 'First automated pipeline built',
        30: 'AI replaces 3+ hours of manual work per week',
        40: 'Custom agent or automation built',
        50: 'Fully AI-first workflow — thinking in systems',
        60: 'AI agents working autonomously',
        75: 'Teaching others — AI workflow coach',
        90: 'Building products with AI at the core',
        100:'AI expert — building tools others can\'t imagine',
      },
    },
    coding: {
      xp:0, parentSkill:'business', icon:'💻', label:'Coding', active:true,
      quickLog:[
        {label:'Feature built',     xp:60},
        {label:'Bug fixed',         xp:30},
        {label:'Project session',   xp:50},
        {label:'Deployed to prod',  xp:80},
      ],
      milestones:{
        1:  'HTML/CSS understood — first page live',
        5:  'JavaScript basics — functions, DOM manipulation',
        10: 'Own website live (this dashboard — already done!)',
        15: 'Calling APIs, fetching real data',
        20: 'Database connected (Supabase — already done!)',
        25: 'Authentication system built',
        30: 'First product used by others',
        40: 'Building and deploying AI agents',
        50: 'Full-stack app — frontend + backend',
        60: 'Own SaaS product live',
        70: 'Product generating €1,000/month',
        80: 'Managing team via automation',
        90: 'Tech founder — scalable product',
        100:'10x engineer — building what others can\'t',
      },
    },

    // ══ LIFESTYLE — skills ════════════════════════════════════════════
    whistling: {
      xp:0, parentSkill:'lifestyle', icon:'🎵', label:'Finger Whistling', active:true,
      quickLog:[
        {label:'Practice session (10 min)', xp:20},
        {label:'First sound produced',      xp:50},
        {label:'Consistent tone',           xp:40},
        {label:'Melodic control',           xp:60},
      ],
      milestones:{
        1:  'First sound produced',
        5:  'Consistent tone — reproducible every time',
        10: 'Volume control — soft to loud',
        15: 'Pitch control — hit different notes',
        20: 'Simple melody playable (Happy Birthday)',
        30: 'Two-octave range',
        40: 'Clean transitions between notes',
        50: 'Play any simple song by ear',
        60: 'Vibrato technique',
        75: 'Complex melodies — improvise',
        90: 'Performance-ready — confident in public',
        100:'Signature whistle — instantly recognizable',
      },
    },
    dancing: {
      xp:0, parentSkill:'lifestyle', icon:'🕺', label:'Dancing', active:true,
      quickLog:[
        {label:'30-min session',          xp:30},
        {label:'1-hour session',          xp:55},
        {label:'New move learned',        xp:40},
        {label:'Social dancing (event)', xp:70},
      ],
      milestones:{
        1:  'First 30-min session — you showed up',
        5:  'Basic rhythm — move to the beat consistently',
        10: 'Freestyle basics — comfortable in your body',
        15: 'Social dancing — ask someone to dance',
        20: '5 go-to moves for any party',
        30: 'Salsa/Hip-hop basics',
        40: 'Improvise confidently to any song',
        50: 'Partner dancing — lead or follow smoothly',
        60: 'Style and flavor — you have your own moves',
        75: 'Perform in front of a crowd without nerves',
        90: 'Teach someone the basics',
        100:'Elite mover — own the floor',
      },
    },
    cooking: {
      xp:0, parentSkill:'lifestyle', icon:'🍳', label:'Cooking', active:true,
      quickLog:[
        {label:'Cooked healthy',  xp:20},
        {label:'New recipe',      xp:45},
        {label:'Meal prep done',  xp:40},
      ],
      milestones:{ 10:'10 recipes mastered', 25:'25 recipes mastered', 50:'Varied and healthy cooking', 100:'Chef-level home cooking' },
    },
    social: {
      xp:0, parentSkill:'lifestyle', icon:'👥', label:'Social', active:true,
      quickLog:[
        {label:'Friends seen',     xp:35},
        {label:'New connection',   xp:40},
        {label:'Family time',      xp:25},
        {label:'Social event',     xp:30},
      ],
    },
    dating: {
      xp:0, parentSkill:'lifestyle', icon:'❤️', label:'Dating', active:true,
      quickLog:[
        {label:'Date happened',       xp:50},
        {label:'Approached someone',  xp:40},
        {label:'Match made',          xp:20},
      ],
    },
    planning: {
      xp:0, parentSkill:'lifestyle', icon:'📅', label:'Planning', active:true,
      quickLog:[
        {label:'Week planned',    xp:30},
        {label:'Day planned',     xp:10},
        {label:'Goals updated',   xp:20},
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

    // ══ DISCIPLINE — habits (NOT private) ══════════════════════════════
    screen_time: {
      xp:0, parentSkill:'discipline', icon:'📵', label:'Screen Time', active:true, isHabit:true,
      habitDesc:'Conscious screen time: < 2h entertainment per day = full point.',
    },
    cold_shower: {
      xp:0, parentSkill:'discipline', icon:'🚿', label:'Cold Shower', active:true, isHabit:true,
      habitDesc:'Cold shower every day. +1 point. Drops -1 per missed day.',
    },

    // ══ KNOWLEDGE — skills ════════════════════════════════════════════
    languages: {
      xp:0, parentSkill:'knowledge', icon:'🇫🇷', label:'French', active:true,
      quickLog:[
        {label:'Duolingo / app (15 min)',                xp:15},
        {label:'30 min study',                           xp:25},
        {label:'Conversation in French',                 xp:45},
        {label:'Film/series in French',                  xp:20},
      ],
      milestones:{
        5:'A1 — greetings, intro yourself, order food',
        15:'A1+ — present tense, 500 common words',
        30:'A2 — past tense (passé composé), everyday topics',
        45:'A2+ — hold a 5-min conversation comfortably',
        55:'B1 — express opinions, future tense, ~2000 words',
        70:'B1+ — follow native conversation, subjunctive intro',
        85:'B2 — debate, understand films without subs',
        100:'C1 — fluent, think and dream in French'
      },
    },
    learning: {
      xp:0, parentSkill:'knowledge', icon:'🎓', label:'Learning', active:true,
      quickLog:[
        {label:'Online course (1 hour)', xp:45},
        {label:'Tutorial followed',      xp:25},
        {label:'Course completed',       xp:200},
        {label:'Skill practiced',        xp:30},
      ],
    },
    superiority: {
      xp:0, parentSkill:'knowledge', icon:'🧠', label:'Path to Superiority', active:true,
      quickLog:[
        {label:'Study session (1 hour)',     xp:50},
        {label:'Finished a book/topic',      xp:150},
        {label:'Connected two domains',      xp:80},
        {label:'Wrote / created something',  xp:100},
      ],
      milestones:{
        14:'Phase 1 — Structure of reality (math, physics, chemistry, biology, systems)',
        28:'Phase 2 — The mind (neuroscience, cognition, consciousness)',
        42:'Phase 3 — Language & logic (rhetoric, critical thinking, code)',
        56:'Phase 4 — Humanity (history, sociology, economics, art)',
        70:'Phase 5 — The great thinkers (Plato → Feynman → Da Vinci)',
        84:'Phase 6 — Connect all domains into one whole',
        100:'Phase 7 — Create: from knowledge to wisdom',
      },
    },

    // ══ CREATIVE — skills ═════════════════════════════════════════════
    piano: {
      xp:0, parentSkill:'creative', icon:'🎹', label:'Piano', active:true,
      quickLog:[
        {label:'30 min practice',    xp:30},
        {label:'1 hour practice',    xp:55},
        {label:'New piece learned',  xp:80},
        {label:'Performed / shared', xp:100},
      ],
      milestones:{
        3:  'Beginner — know where C is, all white keys, right-hand 5 notes',
        10: 'First piece hands-together with a metronome (~20 hrs)',
        20: 'Beginner done — first full song, I-IV-V chords, pedal (~60 hrs)',
        30: 'Novice — all major+minor chords, 10 songs, first improv (~150 hrs)',
        40: 'Intermediate — all scales, 20 songs, plays by ear, first gig (~300 hrs)',
        50: 'Adv. intermediate — Bach level, Chopin beginner, 1 hr repertoire (~600 hrs)',
        60: 'Advanced — fast passages, ABRSM 6-7, improv 5 min (~1,000 hrs)',
        70: 'Expert — Liszt/Chopin passages, sight-read, semi-pro (~1,500 hrs)',
        80: 'Master — virtuoso passages, full sonatas, conservatory-worthy (~2,500 hrs)',
        90: 'Grandmaster — full recital, own arrangements, top 1% (~5,000 hrs)',
        100:'Legend — concert pianist, own style, total mastery (~10,000 hrs)',
      },
    },
    content: {
      xp:0, parentSkill:'creative', icon:'🎬', label:'Content', active:true,
      quickLog:[
        {label:'Video edited',  xp:60},
        {label:'Post created',  xp:25},
        {label:'Published',     xp:40},
        {label:'Series done',   xp:100},
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
            // Always sync from DEFAULT_SKILLS definition (overwrites stale data)
            saved.skills[k].parentSkill = v.parentSkill;
            saved.skills[k].icon    = saved.skills[k].icon  || v.icon;
            saved.skills[k].label   = saved.skills[k].label || v.label;
            saved.skills[k].isHabit = v.isHabit || false;
            // Private: ALWAYS sync from default — remove if default doesn't have it
            if (v.private) saved.skills[k].private = true;
            else            delete saved.skills[k].private;
            if (saved.skills[k].active === undefined) saved.skills[k].active = v.active;
            saved.skills[k].quickLog  = v.quickLog;
            saved.skills[k].milestones = v.milestones;
          }
        }
        if (!saved.xpLog) saved.xpLog = [];
        applyPhysicalDecay(saved);
        return saved;
      }
    } catch (e) {}
    const base = JSON.parse(JSON.stringify(DEFAULT_SKILLS));
    return { skills: base, xpLog: [] };
  }

  function saveCharacter(char) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(char)); } catch (e) {}
  }

  function applyPhysicalDecay(char) {
    const PHYSICAL_SKILLS = ['strength','calisthenics','stretching','mobility','endurance','recovery','gym','tennis'];
    const today = todayStr();
    const DECAY_KEY = 'rpg_last_decay_check';
    if (localStorage.getItem(DECAY_KEY) === today) return;
    let changed = false;
    const log = char.xpLog || [];
    PHYSICAL_SKILLS.forEach(key => {
      const skill = char.skills[key];
      if (!skill || !skill.xp) return;
      const lastEntry = log.find(e => e.skill === key);
      if (!lastEntry || !lastEntry.date) return;
      const daysSince = Math.floor((new Date(today) - new Date(lastEntry.date)) / 86400000);
      if (daysSince >= 14) {
        const weeksInactive = Math.floor(daysSince / 14);
        const levelsToRemove = Math.min(weeksInactive, 5);
        const currentLevel = xpToLevel(skill.xp);
        const targetLevel = Math.max(1, currentLevel - levelsToRemove);
        if (targetLevel < currentLevel) {
          skill.xp = xpForLevel(targetLevel);
          changed = true;
        }
      }
    });
    localStorage.setItem(DECAY_KEY, today);
    if (changed) saveCharacter(char);
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

  // ─── Public API ─────────────────────────────────────────────────────

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
  window.setSkillXP = function (skillName, xp, reason) {
    const char = loadCharacter();
    if (!char.skills[skillName]) {
      const def = DEFAULT_SKILLS[skillName] || {};
      char.skills[skillName] = { xp: 0, parentSkill: def.parentSkill || 'knowledge', icon: def.icon || '⭐', label: def.label || skillName, active: true };
    }
    char.skills[skillName].xp = Math.max(0, Math.round(xp || 0));
    char.xpLog.unshift({ skill: skillName, amount: 0, reason: reason || 'Assessment', date: todayStr(), private: !!(char.skills[skillName].private || (DEFAULT_SKILLS[skillName] || {}).private) });
    if (char.xpLog.length > MAX_LOG) char.xpLog.length = MAX_LOG;
    saveCharacter(char);
    return char.skills[skillName];
  };
  window.setSkillLevel = function (skillName, level, reason) {
    const lvl = Math.max(1, Math.min(MAX_LEVEL, Math.round(level || 1)));
    return window.setSkillXP(skillName, xpForLevel(lvl), reason || 'Assessment');
  };
  window.xpToLevel          = xpToLevel;
  window.xpForLevel         = xpForLevel;
  window.RPG_PARENT_SKILLS  = PARENT_SKILLS;
  window.RPG_DEFAULT_SKILLS = DEFAULT_SKILLS;
  window.RPG_MAX_LEVEL      = MAX_LEVEL;
  window.RPG_CATEGORY_ORDER = ['money','body','mind','business','lifestyle','knowledge'];
  window.RPG_DOMAIN_MAP     = { discipline: 'mind', creative: 'knowledge' };

  // ─── Cloud sync ───────────────────────────────────────────────────────
  function initRPGSync() {
    if (!window.initCloudSync || !window.supabase) return;
    window.initCloudSync({ appKey:'rpg', syncedKeys:[STORAGE_KEY, HABITS_KEY] });
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', initRPGSync);
  else initRPGSync();

})();
