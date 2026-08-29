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
      xp:0, parentSkill:'money', icon:'📋', label:'Budgeting', active:true, isHabit:true,
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
      benefits:[{d:3,t:'reaction time and focus recover'},{d:7,t:'insulin sensitivity measurably improves'},{d:14,t:'steadier mood, less irritability'},{d:30,t:'stronger immune function and memory consolidation'}],
      xp:0, parentSkill:'body', icon:'😴', label:'Sleep', active:true, isHabit:true,
      why:'7-9 hours is linked to better memory, hormone balance and muscle recovery. Chronic short sleep measurably raises illness and injury risk.',
      habitDesc:'8 hours sleep = +1 point. Less = proportionally less. Drops -1 per missed day.',
    },
    nutrition: {
      benefits:[{d:1,t:'more satiety, less snacking'},{d:7,t:'faster recovery after training'},{d:30,t:'measurable body-composition effect'}],
      xp:0, parentSkill:'body', icon:'🥗', label:'Nutrition', active:true, isHabit:true,
      why:'Enough protein (~1.6-2.2 g/kg when training) is what actually builds and keeps muscle — training without it wastes half the work.',
      habitDesc:'Eat enough and healthy every day. +1 point. Drops -1 per missed day.',
    },
    walking: {
      benefits:[{d:1,t:'instant mood lift and lower post-meal blood sugar'},{d:7,t:'cardio fitness starts building'},{d:21,t:'resting heart rate begins to drop'},{d:90,t:'measurably lower cardiovascular risk'}],
      xp:0, parentSkill:'body', icon:'👟', label:'10k Steps', active:true, isHabit:true,
      why:'Daily steps are strongly linked to lower all-cause mortality in large studies — most of the benefit kicks in around 7-9k steps.',
      habitDesc:'10,000 steps per day = full point. Less = proportionally less.',
    },
    grounding: {
      benefits:[{d:1,t:'acute calm (small studies)'},{d:7,t:'better sleep quality reported'},{d:30,t:'steadier cortisol rhythm in early research'}],
      xp:0, parentSkill:'body', icon:'🌱', label:'Grounding', active:false, isHabit:true, // removed per Joey 2026-07-29
      why:'Early small studies link it to lower cortisol, less inflammation and better sleep. Evidence is young — but barefoot minutes outside also mean daylight, calm and zero cost.',
      habitDesc:'Bare feet on earth — grass, sand, soil. A few minutes counts. Daily reset.',
    },
    teeth: {
      benefits:[{d:1,t:'plaque cleared today'},{d:14,t:'early gingivitis starts reversing'},{d:90,t:'stable gum health — lower systemic inflammation'}],
      xp:0, parentSkill:'body', icon:'🦷', label:'Brush Teeth 2×', active:true, isHabit:true,
      why:'Twice-daily brushing keeps plaque and gum inflammation down — and chronic gum disease is linked to higher cardiovascular risk in large cohort studies. Two minutes, twice, compounds for decades.',
      habitDesc:'Brush morning AND evening — both together count as the daily check. +1 point. Drops -1 per missed day.',
    },
    household: {
      benefits:[{d:1,t:'less visual noise = easier focus'},{d:7,t:'lower baseline stress at home (cortisol research)'},{d:30,t:'tidying turns automatic — costs no willpower'}],
      xp:0, parentSkill:'lifestyle', icon:'🧹', label:'Household', active:true, isHabit:true,
      why:'Visual clutter competes for your attention and is linked to higher cortisol and more procrastination. A daily reset keeps your space — and your head — clear. You think where you live.',
      habitDesc:'One tidy/clean session — dishes, reset a room, laundry. Any real effort counts. +1 point. Drops -1 per missed day.',
    },

    // ══ MIND — skills ═════════════════════════════════════════════════
    reading: {
      xp:0, parentSkill:'mind', icon:'📚', label:'Reading', active:true,
      quickLog:[
        {label:'30 min reading',  xp:25},
        {label:'1 hour reading',  xp:45},
        {label:'Book finished',   xp:150},
      ],
      milestones:{
        5:  'Starter — read 10 min a day, no phone',
        15: 'Habit Reader — read on 20 separate days',
        25: 'Book Finisher — finish your first book',
        40: 'Consistent — 5 books done, short summaries each',
        50: 'Deep Reader — 10 books, applying the key lessons',
        60: 'Fast Reader — 30-40 pages/hour with comprehension',
        70: 'Analytical — compare books, spot arguments',
        80: 'Knowledge Builder — 25 books + a notes system',
        90: 'Scholar — understand genuinely difficult books',
        100:'Sage — 100 books and actively using the knowledge',
      },
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
    chess: {
      xp:0, parentSkill:'mind', icon:'♟️', label:'Chess', active:true,
      quickLog:[
        {label:'Tactics practice (15 min)',       xp:15},
        {label:'Rapid/classical game played',     xp:25},
        {label:'Own game reviewed',               xp:20},
        {label:'Lesson or study (30 min)',        xp:25},
        {label:'OTB club/tournament game',        xp:50},
      ],
      milestones:{
        1:  'Board Ready — set up the board and explain every piece',
        3:  'Rules Locked — legal moves, check, mate, castling and promotion',
        6:  'First Finishes — reliably solve mate-in-one positions',
        10: 'Tactical Eye — spot forks, pins, skewers and hanging pieces',
        18: 'Opening Discipline — develop, fight for the centre and castle',
        30: 'Endgame Foundation — mate with king + queen and play basic pawn endings',
        45: 'Rated Competitor — complete 30 rated rapid games and review your losses',
        60: 'Club Player — stable 1200+ rating in one rapid pool over 20 games',
        75: 'Strong Club Player — stable 1500+ in that same rapid pool',
        90: 'Expert — stable 1800+ in that same rapid pool and analyse without an engine first',
        100:'Mastery — 2000+ in that same rapid pool or an official 1800+ over-the-board rating',
      },
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
      benefits:[{d:1,t:'heart rate and tension drop right after a session'},{d:4,t:'attention and working memory already improve (Zeidan 2010)'},{d:14,t:'less rumination, steadier emotional regulation'},{d:56,t:'8 weeks: structural amygdala & gray-matter changes (Hölzel 2011)'}],
      xp:0, parentSkill:'mind', icon:'🧘', label:'Meditation', active:true, isHabit:true,
      why:'8 weeks of regular practice measurably lowers amygdala stress-reactivity in imaging studies. Even single 10-20 min sessions reduce anxiety and sharpen attention.',
      habitDesc:'Meditate daily. +1 point. Drops -1 per missed day.',
    },
    gratitude: {
      benefits:[{d:1,t:'direct positive-affect lift'},{d:21,t:'better sleep (Emmons & McCullough)'},{d:42,t:'6 weeks: lasting wellbeing gains in studies'}],
      xp:0, parentSkill:'mind', icon:'🙏', label:'Gratitude', active:true, isHabit:true,
      why:'Trials link written gratitude to higher wellbeing and better sleep quality — it trains your brain to scan for wins instead of threats.',
      habitDesc:'Write 3 things you\'re grateful for every day.',
    },
    good_deed: {
      benefits:[{d:1,t:'"helper\'s high" — a mood lift right after (oxytocin/endorphin response)'},{d:7,t:'a week of daily kind acts raises measured wellbeing (Lyubomirsky kindness trials)'},{d:30,t:'stronger social bonds and lower stress reactivity — you start seeing yourself as someone who helps'}],
      xp:0, parentSkill:'mind', icon:'🤲', label:'Good Deed', active:true, isHabit:true,
      why:'Kindness-intervention studies link doing deliberate good deeds to higher happiness and lower stress — giving reliably lifts the giver, not only the receiver. Small, real acts count.',
      habitDesc:'Do one deliberate good deed for someone — help, give, a genuine kind gesture. +1 point. Drops -1 per missed day.',
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
        5:  'Air Bender — correct finger position, lips in, air aimed',
        15: 'First Sound — produce a soft whistle tone',
        25: 'Controlled — get a sound 5 of 10 tries',
        35: 'Stable — hold a 10-second constant tone',
        45: 'Loud — audible across a room',
        55: 'Sharp — short hard whistle on command',
        65: 'Consistent — hit it 8 of 10 tries',
        75: 'Distance — heard 20-30m outside',
        85: 'Control — vary pitch and volume at will',
        100:'Siren Mode — instant, loud, reliable, crowd-call level',
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
    coloring: {
      xp:0, parentSkill:'creative', icon:'🖍️', label:'Coloring', active:true,
      why:'Structured coloring measurably lowers anxiety in studies (mandala coloring vs. free doodling) — focused attention with zero performance pressure. Active rest that still builds color sense.',
      quickLog:[
        {label:'Coloring session (20 min)', xp:20},
        {label:'Full page finished',        xp:40},
        {label:'Tried a new technique',     xp:35},
      ],
      milestones:{
        10: 'Clean & calm — full pages, tidy edges, it relaxes you',
        25: 'Color sense — deliberate palettes and smooth blends',
        50: 'Craft — mandalas, texture, depth',
        75: 'Style — your pages are recognizably yours',
        100:'Zen Master — a finished body of work',
      },
    },
    drawing: {
      xp:0, parentSkill:'creative', icon:'✏️', label:'Drawing', active:true,
      why:'Drawing trains observation itself — you learn to see proportion, light and form. Skill compounds with deliberate practice, and 15 focused minutes beat two distracted hours.',
      quickLog:[
        {label:'Sketch session (15 min)',   xp:20},
        {label:'Focused study (30+ min)',   xp:40},
        {label:'Finished piece',            xp:60},
      ],
      milestones:{
        10: 'Observer — draw what you see, not what you think you see',
        25: 'Constructor — perspective and form under control',
        50: 'Portraitist — a face people recognize',
        75: 'Own style — 10 works that are clearly yours',
        100:'Commission-ready — people would pay for this',
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
    puzzling: {
      xp:0, parentSkill:'lifestyle', icon:'🧩', label:'Puzzling', active:true,
      quickLog:[
        {label:'Easy puzzle done (≤500 pc)',       xp:30},
        {label:'Standard puzzle done (1000 pc)',   xp:60},
        {label:'Hard puzzle (lots of sky/water)',  xp:90},
        {label:'Extreme puzzle (no reference)',    xp:140},
      ],
      milestones:{
        5:  'Starter — finish a 100-piece puzzle',
        15: 'Beginner — finish a 300-piece puzzle',
        25: 'Casual — finish a 500-piece puzzle',
        40: 'Solid — finish a 1000-piece puzzle',
        55: 'Strategist — 1000 pieces under 8 hours',
        65: 'Advanced — finish a 1500-piece puzzle',
        75: 'Expert — finish a 2000-piece puzzle',
        85: 'Master — 3000+ pieces or tough colour fields',
        100:'Legend — 5000+ pieces / extreme puzzles',
      },
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
      xp:0, parentSkill:'discipline', icon:'🛡️', label:'No Porn', active:true, private:true,
      why:'Frequent use trains your reward system on supernormal stimuli: fMRI work shows stronger cue-reactivity and altered reward-circuit structure in heavy users (Voon 2014; Kühn & Gallinat 2014). Quitting reverses the pattern — real rewards (people, goals, touch) start registering again.',
      benefits:[{d:7,t:'cue-driven urges weaken, energy returns'},{d:14,t:'motivation and drive toward real goals rise'},{d:30,t:'reward sensitivity noticeably recovering'},{d:90,t:'the classic reboot window — stable new baseline'}],
      quickLog:null,
    },
    weed_control: {
      xp:0, parentSkill:'discipline', icon:'🚫', label:'Weed Control', active:true, private:true,
      why:'THC suppresses REM sleep and measurably impairs verbal memory (Auer 2016); chronic use blunts the dopamine system — less motivation and less pleasure from ordinary things (Volkow 2014; Bloomfield 2016). The good news: memory largely recovers within ~4 weeks of abstinence.',
      benefits:[{d:2,t:'REM rebound: vivid dreams return'},{d:7,t:'sleep architecture normalises'},{d:28,t:'verbal memory largely recovered (abstinence studies)'},{d:90,t:'motivation/dopamine at a new baseline'}],
      quickLog:null,
    },

    // ══ DISCIPLINE — habits (NOT private) ══════════════════════════════
    screen_time: {
      benefits:[{d:1,t:'faster sleep onset tonight'},{d:7,t:'attention span recovers'},{d:30,t:'lower anxiety scores in research'}],
      xp:0, parentSkill:'discipline', icon:'📵', label:'Screen Time', active:true, isHabit:true,
      why:'Less passive scrolling is linked to better mood and sleep — screens before bed delay melatonin and push your sleep back.',
      habitDesc:'Conscious screen time: < 2h entertainment per day = full point.',
    },
    cold_shower: {
      benefits:[{d:1,t:'noradrenaline spike: alert and awake'},{d:7,t:'mood stabilises'},{d:30,t:'29% fewer sick days (Buijze 2016, PLOS)'}],
      xp:0, parentSkill:'discipline', icon:'🚿', label:'Cold Shower', active:true, isHabit:true,
      why:'Cold triggers a noradrenaline and dopamine surge (alertness, mood). A Dutch trial found ~29% fewer sick days in the cold-shower group.',
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
  // v9.2: LOCAL calendar day (was UTC via toISOString — in NL/UTC+2 the engine
  // thought it was still yesterday between 00:00–02:00, stamping habits, xpLog
  // and decay on the wrong day). All *.html pages already use local dates.
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function applyHabitDecay(habits) {
    // v9.15 FIX: decay is −1 per gemiste dag, maar de oude versie trok elke
    // run het TOTALE aantal gemiste dagen af van de al-verlaagde score
    // (kwadratisch verval: 3 dagen missen = score 5 → 0 i.p.v. 3).
    // decayedThrough onthoudt tot welke dag al is afgeschreven.
    const today = todayStr();
    let changed = false;
    for (const h of Object.values(habits)) {
      if (!h.lastChecked) continue;
      const totalMissed = Math.max(0, Math.floor((new Date(today) - new Date(h.lastChecked)) / 86400000) - 1);
      if (totalMissed === 0) continue;
      const already = h.decayedThrough
        ? Math.max(0, Math.floor((new Date(h.decayedThrough) - new Date(h.lastChecked)) / 86400000) - 1)
        : 0;
      const newMissed = totalMissed - already;
      if (newMissed > 0) {
        h.score = Math.max(0, (h.score||0) - newMissed);
        // v10.65 FIX: decay lowered `score` but never touched `streak`, so a
        // habit could sit at score 0 with a frozen streak from weeks ago
        // (Joey saw "level 0 · 🔥2d" on gratitude while its last check was
        // 16 days earlier). A streak with missed days isn't a streak — the
        // two numbers must never contradict each other, since the level IS
        // the progress signal here.
        h.streak = 0;
        h.decayedThrough = today;
        changed = true;
      }
    }
    if (changed) saveHabits(habits);
    return habits;
  }

  // v10.1: heal habit state from the authoritative per-day log (rpg_habitlog_v1).
  // A sync clobber could leave habits[key].lastChecked/score stale while the day-log
  // still records the real checks — this reconciles FORWARD only (never downgrades),
  // so the divergence Joey saw ("checked it but shows Lv 0") self-heals.
  function reconcileHabitsFromLog(habits) {
    let log; try { log = JSON.parse(localStorage.getItem('rpg_habitlog_v1')) || {}; } catch (e) { return habits; }
    let changed = false;
    for (const key in log) {
      const h = habits[key];
      if (!h || !log[key]) continue;
      const dates = Object.keys(log[key]).filter(function (d) { return log[key][d]; }).sort();
      if (!dates.length) continue;
      const last = dates[dates.length - 1];
      if (!h.lastChecked || h.lastChecked < last) {
        var streak = 1;
        for (var i = dates.length - 1; i > 0; i--) {
          var p = dates[i].split('-').map(Number);
          var d = new Date(p[0], p[1] - 1, p[2] - 1);
          var prev = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          if (dates[i - 1] === prev) streak++; else break;
        }
        h.lastChecked = last;
        h.streak = Math.max(h.streak || 0, streak);
        h.score = Math.max(h.score || 0, Math.min(10, streak));
        changed = true;
      }
    }
    if (changed) saveHabits(habits);
    return habits;
  }

  // v10.28: dedicated gratitude-words store — fixes "today's words don't
  // persist" (Joey's #1 priority bug). Root cause found live in Supabase:
  // rpg_daily_v1:2026-07-28 had gratitudeXpGiven=true but gratitudeWords=null.
  // Two separate causes converged: (1) character.html's gratitude-add flow
  // (submitGratitudeTag/addGratitudeItem) only ever wrote to the rpg_gratitude_v1
  // aggregate — it never wrote into rpg_daily_v1:{date}.gratitudeWords at all,
  // so anything added via the Skills-tab widget was invisible to index.html's
  // Main-page render, which reads gratitudeWords first; (2) that per-day words
  // array lived inside the same shared rpg_daily_v1:{date} blob that agenda,
  // quests-done and workout_challenge ALSO read-modify-write independently —
  // a crowded shared blob with no per-field merge (the exact class of gap
  // already flagged in the roadmap as Track E1). Fix: gratitude words now get
  // their own dedicated top-level key, keyed by date internally (same shape
  // as rpg_habitlog_v1, which has never had this problem because nothing else
  // touches it). Both index.html and character.html now read/write through
  // this one source of truth; old fields are left in place and still read as
  // a fallback, so nothing already stored is lost.
  window.GRATITUDE_WORDS_KEY = 'rpg_gratitude_words_v1';
  window.addGratitudeWordFor = function (dateStr, word) {
    let store; try { store = JSON.parse(localStorage.getItem(window.GRATITUDE_WORDS_KEY)) || {}; } catch (e) { store = {}; }
    store[dateStr] = Array.isArray(store[dateStr]) ? store[dateStr] : [];
    const key = String(word).toLowerCase();
    if (!store[dateStr].some(function (w) { return String(w).toLowerCase() === key; })) store[dateStr].push(word);
    try { localStorage.setItem(window.GRATITUDE_WORDS_KEY, JSON.stringify(store)); } catch (e) {}
    return store[dateStr];
  };
  window.getGratitudeWordsFor = function (dateStr) {
    try {
      const store = JSON.parse(localStorage.getItem(window.GRATITUDE_WORDS_KEY)) || {};
      return Array.isArray(store[dateStr]) ? store[dateStr] : [];
    } catch (e) { return []; }
  };

  window.getHabits   = function () { return applyHabitDecay(reconcileHabitsFromLog(loadHabits())); };
  window.saveHabits  = saveHabits;

  // v10.27: authoritative recompute — call this after ANY check/uncheck,
  // today or backdated. It re-derives score/streak/lastChecked by REPLAYING
  // the day-log (rpg_habitlog_v1) chronologically through the exact same
  // leaky-bucket rules checkHabit()/applyHabitDecay() already use in real
  // time (+1 per check capped at 10, -1 per missed day with a one-day grace
  // — the miss only shows up the day AFTER, never the day of). Replaying
  // instead of incrementing in place means an uncheck (even for a past day)
  // always lands on exactly the state that would exist had that check never
  // happened — fixing two real bugs Joey hit testing the backfill flow:
  //   1. Unchecking a PAST day (index.html toggleMission) only ever reverted
  //      the day-log + XP — uncheckHabit() was gated behind `isToday`, so
  //      score/streak never moved for a backdated uncheck.
  //   2. Unchecking TODAY after a multi-day streak nulled lastChecked
  //      unconditionally, losing a real earlier streak instead of falling
  //      back to it correctly.
  // Verified against Joey's own test case: check Sat+Sun, miss Mon (score
  // stays put ON Monday, only drops -1 the day after on Tue), check Tue
  // again -> bounces back up +1. No cliff on longer gaps, always -1/day.
  window.recomputeHabitFromLog = function (habitId) {
    const habits = loadHabits();
    let log; try { log = JSON.parse(localStorage.getItem('rpg_habitlog_v1')) || {}; } catch (e) { log = {}; }
    const entries = log[habitId] || {};
    const checkedDates = Object.keys(entries).filter(function (d) { return entries[d]; }).sort();
    const prev = habits[habitId] || {};

    function daysBetween(a, b) { return Math.floor((new Date(b) - new Date(a)) / 86400000); }
    function dayAfter(d) {
      const p = d.split('-').map(Number); const dt = new Date(p[0], p[1] - 1, p[2] + 1);
      return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    }

    let score = 0, streak = 0, lastChecked = null;
    for (const d of checkedDates) {
      if (lastChecked !== null) {
        const gapMissed = Math.max(0, daysBetween(lastChecked, d) - 1);
        score = Math.max(0, score - gapMissed);
        streak = (d === dayAfter(lastChecked)) ? streak + 1 : 1;
      } else {
        streak = 1;
      }
      score = Math.min(10, score + 1);
      lastChecked = d;
    }
    const today = todayStr();
    if (lastChecked !== null) {
      const finalMissed = Math.max(0, daysBetween(lastChecked, today) - 1);
      score = Math.max(0, score - finalMissed);
    }

    const h = { label: prev.label, icon: prev.icon, score: score, streak: streak, lastChecked: lastChecked, decayedThrough: today };
    habits[habitId] = h;
    saveHabits(habits);
    return h;
  };

  // v10.39: Seasons. Joey's answers (2026-07-30): trigger is manual — tap a
  // skill, start a season on it (not auto on the 1st of the month); reward
  // is the goal itself, no separate reward system. Only 1 active season at
  // a time ("1 focus-skill, not 3"). The "master quest" is picked
  // algorithmically, not freshly authored per season: it's simply the
  // skill's own next unclaimed SKILL_LADDERS tier — reuses all the ladder
  // content already written, rather than inventing new copy per season.
  window.SEASONS_KEY = 'rpg_seasons_v1';
  function loadSeasons() {
    try { const s = JSON.parse(localStorage.getItem(window.SEASONS_KEY)); return s && typeof s === 'object' ? s : { active: null, history: [] }; }
    catch (e) { return { active: null, history: [] }; }
  }
  function saveSeasons(s) { try { localStorage.setItem(window.SEASONS_KEY, JSON.stringify(s)); } catch (e) {} }
  function tierClaimsRead() { try { return JSON.parse(localStorage.getItem('rpg_tier_claims_v1')) || {}; } catch (e) { return {}; } }

  // Returns the active season, or null — and quietly archives it (as
  // incomplete, no penalty) if its end date has passed unclaimed.
  window.getActiveSeason = function () {
    const s = loadSeasons();
    if (!s.active) return null;
    if (todayStr() > s.active.endDate) {
      s.history = s.history || [];
      s.history.push(Object.assign({}, s.active, { endedAt: todayStr(), completed: false }));
      s.active = null;
      saveSeasons(s);
      return null;
    }
    return s.active;
  };

  window.startSeason = function (skillKey, durationDays, dailyMinutes) {
    const ladder = (window.SKILL_LADDERS || {})[skillKey] || [];
    const claimed = tierClaimsRead()[skillKey] || 0;
    const target = ladder.find(function (t) { return t.level > claimed; });
    if (!target) return null; // already at the top of this skill's ladder
    const start = todayStr();
    const sp = start.split('-').map(Number);
    const endD = new Date(sp[0], sp[1] - 1, sp[2] + durationDays);
    const end = endD.getFullYear() + '-' + String(endD.getMonth() + 1).padStart(2, '0') + '-' + String(endD.getDate()).padStart(2, '0');
    const season = {
      skillKey: skillKey, startDate: start, endDate: end, durationDays: durationDays, dailyMinutes: dailyMinutes,
      targetLevel: target.level, targetTitle: target.title, targetClaim: target.claim,
    };
    const s = loadSeasons();
    s.active = season;
    saveSeasons(s);
    return season;
  };

  window.cancelSeason = function () {
    const s = loadSeasons();
    if (!s.active) return;
    s.history = s.history || [];
    s.history.push(Object.assign({}, s.active, { endedAt: todayStr(), completed: false, cancelled: true }));
    s.active = null;
    saveSeasons(s);
  };

  // Call after a tier claim. If it was this season's target (or higher),
  // the season completes right there — the claim itself is the reward.
  window.endSeasonIfComplete = function (skillKey, claimedLevel) {
    const s = loadSeasons();
    if (!s.active || s.active.skillKey !== skillKey) return false;
    if (claimedLevel < s.active.targetLevel) return false;
    s.history = s.history || [];
    s.history.push(Object.assign({}, s.active, { endedAt: todayStr(), completed: true }));
    s.active = null;
    saveSeasons(s);
    return true;
  };

  // v10.46: Priority Focus — "which skill actually helps hit my goals".
  // Joey's answer to how priority should work: not lowest-level, not
  // most-stale, but tied to his actual 100-year life plan (see the
  // dedicated section at the top of GAMENFY-MASTER.md). Conservative
  // mapping — only skills with a clear, explicit tie to a named goal are
  // included, so the signal stays meaningful rather than diluted across
  // all 45 skills. Ventures (sell_websites/gamenfy_public) already have
  // their own "Next Move" card on Main, so this stays skill-focused for v1.
  window.LIFE_GOAL_MAP = {
    saving: ['money'], investing: ['money'], budgeting: ['money'], net_worth: ['money'],
    sales: ['money','freedom'], marketing: ['money','freedom'], ai_tools: ['money','freedom'],
    coding: ['money','freedom'], content: ['money','freedom'],
    dating: ['love'], social: ['love','exploration'],
    gratitude: ['happiness'], meditation: ['happiness'], journaling: ['happiness'],
    recovery: ['happiness'], sleep: ['happiness'], nutrition: ['happiness'], focus: ['happiness'],
    superiority: ['happiness','exploration'],
    languages: ['exploration'], learning: ['exploration'], reading: ['exploration'],
  };
  window.LIFE_GOAL_LABELS = {
    money: { icon: '💰', label: 'Money' }, freedom: { icon: '🕊️', label: 'Freedom' },
    love: { icon: '❤️', label: 'Love' }, happiness: { icon: '😊', label: 'Happiness' },
    exploration: { icon: '🌎', label: 'Exploration' },
  };
  // Picks the mapped skill closest to its next unclaimed SKILL_LADDERS tier
  // (a real, close breakthrough) — not the lowest level, which would just
  // point at whatever's most neglected regardless of how far off it is.
  window.getLifeGoalPriority = function () {
    const char = window.getCharacter ? window.getCharacter() : null;
    if (!char) return null;
    const skills = char.skills || {};
    const defaults = window.RPG_DEFAULT_SKILLS || {};
    const ladders = window.SKILL_LADDERS || {};
    let claims = {}; try { claims = JSON.parse(localStorage.getItem('rpg_tier_claims_v1')) || {}; } catch (e) {}
    let habitlog = {}; try { habitlog = JSON.parse(localStorage.getItem('rpg_habitlog_v1')) || {}; } catch (e) {}
    const today = todayStr();
    // v10.53: a habit-type priority pick (e.g. gratitude) whose daily check
    // is ALREADY done today has nothing left to actually do right now — the
    // card was showing the same long-term tier goal regardless, giving no
    // sense of "what's next" once the one real action (today's check) was
    // already taken. Now: prefer a candidate that's still actionable today;
    // only fall back to a done-today habit if literally nothing else qualifies.
    let bestActionable = null;
    let bestAny = null;
    for (const key of Object.keys(window.LIFE_GOAL_MAP)) {
      const def = defaults[key]; if (!def || def.active === false) continue;
      const ladder = ladders[key]; if (!ladder || !ladder.length) continue;
      const claimed = claims[key] || 0;
      const nextTier = ladder.find(function (t) { return t.level > claimed; });
      if (!nextTier) continue; // already at the top of this skill's ladder
      const xp = (skills[key] || {}).xp || 0;
      const fromXp = window.xpForLevel ? window.xpForLevel(Math.max(1, claimed)) : 0;
      const toXp = window.xpForLevel ? window.xpForLevel(nextTier.level) : 1;
      const pct = toXp > fromXp ? Math.max(0, Math.min(100, Math.round(((xp - fromXp) / (toXp - fromXp)) * 100))) : 0;
      const doneToday = !!(def.isHabit && habitlog[key] && habitlog[key][today]);
      const candidate = { key: key, def: def, nextTier: nextTier, pct: pct, categories: window.LIFE_GOAL_MAP[key], doneToday: doneToday };
      if (!bestAny || pct > bestAny.pct) bestAny = candidate;
      if (!doneToday && (!bestActionable || pct > bestActionable.pct)) bestActionable = candidate;
    }
    let best = bestActionable || bestAny;
    return best;
  };

  // ── Auto-check habits from health data (v10.85) ────────────────
  // Joey: "ik wil dat de daily goals zoals stappen en slaap automatisch
  // worden afgevinkt wanneer die data binnengekomen is."
  //
  // Two design decisions worth knowing:
  //  1. It records that it has ALREADY auto-applied for a given habit+date in
  //     rpg_autohabit_v1. So if Joey unchecks something afterwards, the next
  //     page load will NOT tick it again — the app never fights him over it.
  //  2. Thresholds mirror what the habit itself claims to be, not a stretch
  //     goal: 10.000 steps (the app's own steps goal) and 7 hours of sleep
  //     (the sleep ladder's own wording is "7+ hours on most nights"; the 8h
  //     figure on the chart is an aspiration and would almost never fire).
  const AUTO_HABITS = {
    walking: { field: 'steps',        min: 10000, label: '10k stappen' },
    sleep:   { field: 'sleepMinutes', min: 420,   label: '7 uur slaap' },
  };
  const AUTO_KEY = 'rpg_autohabit_v1';
  // own constants: the ones further down live inside a separate IIFE and are
  // not reachable from here (checked, rather than assumed)
  const AH_SB_URL = 'https://ttxjsoahmtennnufgeqx.supabase.co';
  const AH_SB_KEY = 'sb_publishable_5lYXJme36ggS2dWTJbMSCA_Ir9Uogab';
  function autoLoad(){ try { return JSON.parse(localStorage.getItem(AUTO_KEY)) || {}; } catch (e) { return {}; } }
  function autoSave(o){ try { localStorage.setItem(AUTO_KEY, JSON.stringify(o)); } catch (e) {} }

  window.autoCheckHealthHabits = async function (onChange) {
    if (window.__autoHabitRan) return 0;      // once per page load
    window.__autoHabitRan = true;
    // v10.88 FIX: v10.87 fixed the "checks today, but today is still
    // accumulating" bug by switching to yesterday — but that introduced a
    // new problem Joey immediately hit: "ik heb net 10k stappen gezet, het
    // staat in de app maar mn daily mission is niet gecheckt." Checking only
    // yesterday means today's win is never caught until tomorrow — no
    // same-day satisfaction at all.
    // Now checks BOTH:
    //  - TODAY: re-evaluated on every load. Only marked "applied" (locked)
    //    once the goal is actually met, so an early check that misses the
    //    goal doesn't block a later same-day check from catching it once
    //    he's crossed the threshold.
    //  - YESTERDAY: evaluated once and marked applied regardless (its number
    //    is final) — a safety net for days he doesn't reopen the app again
    //    after crossing the threshold before midnight.
    const today = todayStr();
    const yd = new Date(Date.now()-86400000);
    const yesterday = yd.getFullYear()+'-'+String(yd.getMonth()+1).padStart(2,'0')+'-'+String(yd.getDate()).padStart(2,'0');
    const applied = autoLoad();
    const targets = [today, yesterday].filter(function(t){
      return Object.keys(AUTO_HABITS).some(function(k){ return !applied[k + ':' + t]; });
    });
    if (!targets.length) return 0;             // both days already fully settled
    let byDate = null;
    try {
      const r = await window.gamenfyAuthedFetch(AH_SB_URL + '/rest/v1/app_state?key=eq.health_fitbit&select=data');
      if (!r.ok) return 0;
      const rows = await r.json();
      byDate = rows.length ? rows[0].data : null;
    } catch (e) { return 0; }
    if (!byDate) return 0;
    const defaults = window.RPG_DEFAULT_SKILLS || {};
    let done = 0;
    for (const target of targets) {
      const day = byDate[target];
      const isToday = target === today;
      for (const key of Object.keys(AUTO_HABITS)) {
        if (applied[key + ':' + target]) continue;
        const cfg = AUTO_HABITS[key];
        const val = day ? Number(day[cfg.field]) : NaN;
        const met = val && val >= cfg.min;
        // today + not met yet: leave un-applied so a later load this same
        // day can still catch it. yesterday (or today once met): settle it.
        if (!met && isToday) continue;
        applied[key + ':' + target] = true;
        if (!met) continue; // yesterday, goal genuinely not met — settled, no XP
        const def = defaults[key] || {};
        let log = {}; try { log = JSON.parse(localStorage.getItem('rpg_habitlog_v1')) || {}; } catch (e) {}
        const already = !!(log[key] && log[key][target]);
        if (already) continue; // don't fight a manual check
        log[key] = log[key] || {}; log[key][target] = true;
        try { localStorage.setItem('rpg_habitlog_v1', JSON.stringify(log)); } catch (e) {}
        try { window.checkHabitFor(key, target, def.label, def.icon); } catch (e) {}
        try { if (window.recomputeHabitFromLog) window.recomputeHabitFromLog(key); } catch (e) {}
        try { if (window.addXP) window.addXP(key, 15, 'Auto: ' + cfg.label + ' gehaald'); } catch (e) {}
        try {
          const st = JSON.parse(localStorage.getItem('rpg_streak_v1')) || { days: {} };
          st.days = st.days || {}; st.days[target] = true;
          localStorage.setItem('rpg_streak_v1', JSON.stringify(st));
        } catch (e) {}
        done++;
      }
    }
    autoSave(applied);
    if (done && typeof onChange === 'function') { try { onChange(done); } catch (e) {} }
    return done;
  };

  window.checkHabit = function (habitId, label, icon) {
    const habits  = loadHabits();
    const today   = todayStr();
    const yd = new Date(Date.now()-86400000);
    const yesterday = yd.getFullYear() + '-' + String(yd.getMonth()+1).padStart(2,'0') + '-' + String(yd.getDate()).padStart(2,'0');
    if (!habits[habitId]) habits[habitId] = { label:label||habitId, icon:icon||'⭐', score:0, lastChecked:null, streak:0 };
    const h = habits[habitId];
    if (h.lastChecked === today) return h;
    h.score  = Math.min(10, (h.score||0)+1);
    h.streak = (h.lastChecked===yesterday) ? (h.streak||0)+1 : 1;
    h.lastChecked = today;
    saveHabits(habits);
    return h;
  };

  // v8.4: check a habit for a specific date (e.g. yesterday) — never downgrades
  // v8.9: backdating always applies score credit; dedup is the caller's job
  // (index.html keeps a per-day log). lastChecked only moves forward.
  window.checkHabitFor = function (habitId, dateStr, label, icon) {
    const habits = loadHabits();
    if (!habits[habitId]) habits[habitId] = { label:label||habitId, icon:icon||'\u2b50', score:0, lastChecked:null, streak:0 };
    const h = habits[habitId];
    h.score = Math.min(10, (h.score||0)+1);
    if (!h.lastChecked || h.lastChecked < dateStr) {
      const dayBefore = (function(){ const p=dateStr.split('-').map(Number); const d=new Date(p[0],p[1]-1,p[2]-1);
        return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })();
      h.streak = (h.lastChecked===dayBefore) ? (h.streak||0)+1 : 1;
      h.lastChecked = dateStr;
    } else {
      h.streak = (h.streak||0)+1; // chain grew backwards (yesterday filled while today was already checked)
    }
    saveHabits(habits);
    return { habit:h, applied:true };
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

  // ── v10.89: unified habit level ──────────────────────────────────────
  // Joey, confirmed twice: for a daily HABIT skill, "level" should mean the
  // 0-10 consistency score (up on check, down after 1 grace day of missing)
  // — not the ever-growing XP total. Before this, the habit-tile already
  // showed score as "Level X/10" while Your Skills, Core Tracker, the Lab
  // characters and the tier system all showed the SEPARATE, never-falling
  // XP-level for the exact same skill (e.g. Sleep: "Level 3" in one place,
  // "Level 1" in another). Confirmed across all 9 habits, not a one-off.
  // This is the single source of truth every display should call instead of
  // xpToLevel(xp) directly, so the two numbers can't diverge again.
  window.getSkillLevel = function (key, xp) {
    const def = (window.RPG_DEFAULT_SKILLS || {})[key];
    if (def && def.isHabit) {
      try { return (window.getHabits()[key] || {}).score || 0; } catch (e) { return 0; }
    }
    return xpToLevel(xp);
  };

  // ── Tier-lock (v7.4) ────────────────────────────────────────
  // XP always keeps accruing; only the effective level is capped.
  // To pass a gate (10/25/50/75) the gate quest — the highest quest
  // at or below that gate level — must be claimed. Skills without a
  // quest ladder are never capped.
  const TIER_GATES = [10, 25, 50, 75];
  function tierLockInfo (skillName, rawLevel) {
    const QUESTS = window.RPG_QUESTS;
    const ladder = QUESTS && QUESTS[skillName];
    if (!ladder || !ladder.length || typeof window.getQuestsDone !== 'function') {
      return { level: rawLevel, locked: false };
    }
    const done = window.getQuestsDone();
    for (const gate of TIER_GATES) {
      if (rawLevel <= gate) break;
      let gq = null;
      for (const q of ladder) { if (q.lvl <= gate && (!gq || q.lvl > gq.lvl)) gq = q; }
      if (gq && !done[skillName + ':' + gq.lvl]) {
        return { level: gate, locked: true, gate: gate, quest: gq };
      }
    }
    return { level: rawLevel, locked: false };
  }
  window.TIER_GATES   = TIER_GATES;
  window.tierLockInfo = tierLockInfo;

  // v9.31: quests are achievements — done = claimable — blocked ONLY by an unclaimed
  // tier-gate quest at a LOWER level. Never gated by the player's current XP level
  // (claiming a quest is how you earn the XP that levels you up). Canon: use everywhere.
  function questClaimable (skillName, qlvl) {
    const ladder = window.RPG_QUESTS && window.RPG_QUESTS[skillName];
    if (!ladder || !ladder.length || typeof window.getQuestsDone !== 'function') return true;
    const done = window.getQuestsDone();
    for (const g of TIER_GATES) {
      let gq = null;
      for (const q of ladder) { if (q.lvl <= g && (!gq || q.lvl > gq.lvl)) gq = q; }
      if (gq && gq.lvl < qlvl && !done[skillName + ':' + gq.lvl]) {
        return { ok: false, gate: gq.lvl, gateTitle: gq.title };
      }
    }
    return { ok: true };
  }
  window.questClaimable = questClaimable;

  window.RPG_PARENT_SKILLS  = PARENT_SKILLS;
  // v9.28: enrichment — a motivational, hedged 'why' for skills that lacked one.
  // Purely additive & display-only: only sets why where missing, never overwrites,
  // never touches behaviour (levels/quests/tier-locks). Renders in the skill detail sheet.
  const SKILL_WHY = {
    saving: 'Savings buy freedom, not stuff — a cash buffer turns emergencies into inconveniences and lets you say no to bad options.',
    investing: 'Compounding rewards time in the market over timing it; broad, boring, consistent investing is what quietly builds wealth.',
    budgeting: "A budget isn't restriction — it's telling your money where to go so it stops disappearing. Awareness alone shifts spending.",
    net_worth: 'Tracking net worth turns vague money-anxiety into one honest number you can move — what gets measured gets managed.',
    gym: 'Resistance training is one of the best-evidenced levers for long-term health: strength, bone density, metabolism and mood all respond to it.',
    tennis: 'Tennis blends cardio, coordination and split-second decisions — a sport you can play for life, and the footwork sharpens the mind too.',
    calisthenics: 'Bodyweight training builds real, controllable strength and mobility with almost no gear — mastery of your own body carries everywhere.',
    core: 'A strong core is the transfer station for nearly every movement — it protects your back and makes every lift and sport safer.',
    stretching: "Regular mobility work keeps joints usable and reduces stiffness; flexibility you don't train is flexibility you slowly lose.",
    strength: 'Getting stronger improves almost everything downstream — posture, injury resistance, confidence, and how capable you feel each day.',
    recovery: 'Progress happens during recovery, not the workout — sleep, rest and deloads are when the body actually adapts and grows.',
    endurance: 'Aerobic fitness is strongly linked to longevity and energy; a bigger engine means everyday life simply costs you less effort.',
    reading: "Reading is compounding for the mind — it borrows other people's decades of thinking and is tied to sharper focus and vocabulary.",
    focus: 'Deep, undistracted focus is where your best work lives; attention is trainable, and protecting it is a rare modern edge.',
    chess: 'Chess turns calculation, pattern recognition and decision-making into immediate feedback. Reviewing your own games matters more than chasing quick wins — every mistake can become a reusable pattern.',
    journaling: 'Writing things down offloads mental clutter — expressive writing is linked in studies to lower stress and clearer thinking.',
    sales: 'Selling is just understanding what someone needs and helping them get it — a skill that pays in every job, venture and relationship.',
    marketing: "Marketing is empathy at scale: knowing who you're talking to and why they'd care. Master it and good work stops going unseen.",
    ai_tools: 'Fluency with AI tools is fast becoming a baseline multiplier — the leverage goes to people who can direct these systems well.',
    coding: 'Code is leverage: build once, run forever. Even basic fluency lets you automate the boring and turn ideas into working things.',
    whistling: 'A clean finger-whistle is equal parts breath control and precise tongue placement — a fun, low-stakes skill that trains patience and feedback.',
    dancing: 'Dancing pairs music, memory and movement — it lifts mood, sharpens coordination, and is one of the most social ways to stay active.',
    cooking: 'Cooking is a compounding life skill — cheaper, healthier and better-tasting than the alternatives, and a reliable way to care for people.',
    puzzling: 'Puzzles give the brain focused, satisfying reps at pattern-finding and patience — a calm kind of problem-solving practice.',
    social: 'Relationships are among the strongest predictors of a happy life; social skill is trainable, and small consistent reps build real connection.',
    dating: "Dating well starts with being someone you'd want to date — curiosity, honesty and self-respect matter more than any tactic.",
    planning: 'A few minutes planning the day beats hours of drift — deciding in advance is how you stop reacting and start steering.',
    languages: 'A new language rewires how you think and opens whole cultures; consistent small exposure beats rare cramming every time.',
    learning: 'Knowing how to learn is the meta-skill behind every other one — spacing, self-testing and a bit of struggle are what make it stick.',
    superiority: 'Real self-respect is quiet: it comes from keeping promises to yourself, not from comparison. Standards you hold beat status you chase.',
    piano: 'Piano trains both hands, ears and patience at once; few hobbies give such rich feedback, and the progress is deeply satisfying to feel.',
    content: 'Making things in public compounds — every piece is a rep in taste, voice and consistency, and the archive keeps working for you.',
  };
  for (const k in SKILL_WHY) {
    if (DEFAULT_SKILLS[k] && !DEFAULT_SKILLS[k].why) DEFAULT_SKILLS[k].why = SKILL_WHY[k];
  }

  // v9.29: enrichment — descriptive level milestones for skills that lacked them.
  // Display-only (rendered in the skill detail sheet). Never overwrites, never gates
  // (milestones are labels, not quests/tier-locks). Additive & safe.
  const MILESTONE_FILL = {
    sleep:      { 10:'7+ hours most nights', 25:'Consistent sleep & wake times', 50:'Rarely need an alarm', 75:'Deep, restorative sleep is the norm', 100:'Sleep is dialed — a real recovery superpower' },
    nutrition:  { 10:'Mostly whole foods', 25:'Protein at every meal', 50:'Eating supports your goals automatically', 75:'Dialed intake without tracking', 100:'Nutrition runs on autopilot' },
    walking:    { 10:'Daily walks are a habit', 25:'8k+ steps most days', 50:'10k a natural baseline', 75:'Walking is your thinking time', 100:'Effortlessly active all day' },
    teeth:      { 10:'Twice-daily brushing locked in', 25:'Flossing is automatic', 50:'Spotless check-ups', 75:'Healthiest mouth of your life', 100:'Dental routine on full autopilot' },
    household:  { 10:'Basics stay on top of', 25:'Home rarely gets messy', 50:'A calm, ordered space', 75:'Systems that run themselves', 100:'Effortlessly tidy home' },
    journaling: { 10:'Writing a few times a week', 25:'A daily reflection habit', 50:'Clearer thinking on paper', 75:'Years of self-knowledge banked', 100:'Journaling is how you process life' },
    meditation: { 10:'A daily sit', 25:'10-minute sessions with ease', 50:'Calmer and less reactive', 75:'20-minute sessions feel natural', 100:'Deep equanimity — a trained mind' },
    gratitude:  { 10:'A daily gratitude habit', 25:'You notice the good more', 50:'A default positive lens', 75:'Resilient through hard days', 100:'Gratitude is your baseline' },
    good_deed:  { 10:'Kindness is a daily reflex', 25:'People feel your impact', 50:'Known for generosity', 75:'Kindness shapes who you are', 100:'A genuine force for good' },
    marketing:  { 10:'Understand your audience', 25:'Messages that land', 50:'Campaigns that convert', 75:'A brand people remember', 100:'Marketing mastery' },
    social:     { 10:'Comfortable in most rooms', 25:'Easy conversations', 50:'People gravitate to you', 75:'A wide, warm network', 100:'Effortless social presence' },
    dating:     { 10:'Confident putting yourself out there', 25:'Genuine connections', 50:'Attracting the right people', 75:'Clear on what you want', 100:'Relationship-ready and secure' },
    planning:   { 10:'A daily planning habit', 25:'Weeks map to your goals', 50:'You steer instead of drift', 75:'Long-term vision on track', 100:'Master of your own time' },
    no_porn:    { 10:'First real clean streak', 25:'Urges fading', 50:'Freedom returning', 75:'Barely a thought', 100:'Fully free' },
    weed_control:{ 10:'Cutting back consistently', 25:'Clearer head', 50:'In full control', 75:'Rarely tempted', 100:'Entirely on your terms' },
    screen_time:{ 10:'Aware of your usage', 25:'Fewer mindless pickups', 50:'Phone serves you, not the reverse', 75:'Deep attention restored', 100:'Screens fully under control' },
    cold_shower:{ 10:'Cold rinses becoming routine', 25:'The dread is gone', 50:'You seek the cold', 75:'Cold is your morning edge', 100:'Ice-cold resilience' },
    learning:   { 10:'Learning is a routine', 25:'You pick up skills fast', 50:'Spaced repetition that sticks', 75:'You can learn almost anything', 100:'A true autodidact' },
    content:    { 10:'Publishing regularly', 25:'Finding your voice', 50:'A growing audience', 75:'Content that compounds', 100:'A body of work that speaks for itself' },
  };
  for (const k in MILESTONE_FILL) {
    if (DEFAULT_SKILLS[k] && !DEFAULT_SKILLS[k].milestones) DEFAULT_SKILLS[k].milestones = MILESTONE_FILL[k];
  }

  // v9.30: benefits timelines for the daily-mission skills that lacked them
  // (workout→gym, reading, outreach→sales). These are practised daily, so a day-based
  // arc fits and fills the "What consistency earns you" section of the mission sheet.
  // Additive & display-only; only sets benefits where missing.
  const BENEFITS_FILL = {
    reading: [{d:1,t:'a calmer, more focused mind after a single session'},{d:7,t:'reading turns into a craving instead of a chore'},{d:30,t:'noticeably sharper vocabulary and attention span'},{d:90,t:'a genuinely better-informed way of thinking'}],
    gym:     [{d:1,t:'mood and energy lift from one session'},{d:14,t:'first real strength gains and better sleep'},{d:30,t:'visible tone and a body that feels capable'},{d:90,t:'a stronger, more resilient physique that carries everywhere'}],
    sales:   [{d:1,t:'the first ask is the scariest — and you did it'},{d:7,t:'rejection stops stinging as reps build calm'},{d:30,t:'a real pipeline and a repeatable approach'},{d:90,t:'selling feels natural — a skill that pays for life'}],
  };
  for (const k in BENEFITS_FILL) {
    if (DEFAULT_SKILLS[k] && !DEFAULT_SKILLS[k].benefits) DEFAULT_SKILLS[k].benefits = BENEFITS_FILL[k];
  }

  window.RPG_DEFAULT_SKILLS = DEFAULT_SKILLS;
  window.RPG_MAX_LEVEL      = MAX_LEVEL;
  window.RPG_CATEGORY_ORDER = ['money','body','mind','business','lifestyle','knowledge'];
  window.RPG_DOMAIN_MAP     = { discipline: 'mind', creative: 'knowledge' };

  // ─── Cloud sync ───────────────────────────────────────────────────────
  // v9.23: SINGLE SOURCE OF TRUTH for the rpg sync scope. The old fallback here
  // synced only [STORAGE_KEY, HABITS_KEY]; on pages without their own rpg config
  // (health, po-water) it overwrote the whole cloud row with those 2 keys and the
  // realtime echo deleted streak/daily/quests/ventures/gratitude everywhere.
  window.RPG_SYNC_KEYS = ['rpg_character_v1','rpg_habits_v1','rpg_milestones_v1','rpg_quotes_v1','rpg_pin_v1','rpg_last_reminder','rpg_active_quests_v1','rpg_focus_skills_v1','rpg_ventures_v1','rpg_streak_v1','rpg_checkin_v1','rpg_quests_done_v1','rpg_weekly_v1','rpg_custom_moves_v1','rpg_prefs_v1','rpg_habitlog_v1','rpg_gratitude_v1','rpg_gratitude_words_v1','rpg_seasons_v1','rpg_recipes_v1','rpg_jarvis_applied_v1','rpg_habit_reset_v1','rpg_tier_claims_v1','rpg_optional_quests_v1','rpg_goals_v1','rpg_autohabit_v1','rpg_venture_notes_v1',
    'rpg_routes_v1'];
  window.RPG_SYNC_PREFIXES = ['rpg_daily_v1:','rpg_agenda_v1:','rpg_todo_v1:','hevy_xp:','ah_xp_given:'];
  function initRPGSync() {
    if (!window.initCloudSync || !window.supabase) return;
    window.initCloudSync({ appKey:'rpg', syncedKeys: window.RPG_SYNC_KEYS, syncedPrefixes: window.RPG_SYNC_PREFIXES });
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', initRPGSync);
  else initRPGSync();

})();

// =============================================================
// Jarvis action queue consumer (v9.11 — Jarvis 2.0 fase 1)
// Jarvis (edge function) schrijft acties naar app_state.jarvis_actions;
// deze consumer voert ze uit via de BESTAANDE engine (addXP/checkHabitFor/
// setQuestDone) zodat streaks, decay en tier-gates automatisch kloppen.
// Jarvis schrijft NOOIT in de rpg-rij zelf (whole-blob last-write-wins).
// Dedupe: consumed-flag in de rij (eerst gemarkeerd, dan toegepast) +
// lokaal/gesynct ledger rpg_jarvis_applied_v1.
// =============================================================
(function(){
  var JV_SB_URL = 'https://ttxjsoahmtennnufgeqx.supabase.co';
  var JV_SB_KEY = 'sb_publishable_5lYXJme36ggS2dWTJbMSCA_Ir9Uogab';
  var LEDGER_KEY = 'rpg_jarvis_applied_v1';
  var busy = false;

  function ledger(){ try { return JSON.parse(localStorage.getItem(LEDGER_KEY)) || []; } catch(e){ return []; } }
  function ledgerAdd(ids){
    try {
      var l = ledger().concat(ids);
      localStorage.setItem(LEDGER_KEY, JSON.stringify(l.slice(-200)));
    } catch(e){}
  }
  function localDay(){
    var d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function applyAction(a){
    var defs = window.RPG_DEFAULT_SKILLS || {};
    var p = a.payload || {};
    try {
      if (a.type === 'addXP') {
        if (!defs[p.skill]) return 'skip';
        var amt = Math.max(-500, Math.min(500, Math.round(p.amount || 0)));
        if (!amt) return 'skip';
        window.addXP(p.skill, amt, p.reason || 'Via Jarvis');
        return (amt > 0 ? '+' : '') + amt + ' XP ' + (defs[p.skill].label || p.skill);
      }
      if (a.type === 'checkHabit') {
        var d = defs[p.key];
        if (!d || !d.isHabit) return 'skip';
        var date = (typeof p.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.date)) ? p.date : localDay();
        // habit-log bijwerken zodat Main/Daily de check zien (zelfde formaat als de pagina's)
        try {
          var hl = JSON.parse(localStorage.getItem('rpg_habitlog_v1')) || {};
          if (hl[p.key] && hl[p.key][date]) return 'skip'; // al gecheckt die dag
          hl[p.key] = hl[p.key] || {}; hl[p.key][date] = true;
          localStorage.setItem('rpg_habitlog_v1', JSON.stringify(hl));
        } catch(e){}
        if (window.checkHabitFor) window.checkHabitFor(p.key, date, d.label, d.icon);
        return (d.icon || '') + ' ' + (d.label || p.key) + ' \u2713';
      }
      if (a.type === 'claimQuest') {
        var lad = (window.RPG_QUESTS || {})[p.skill] || [];
        var q = lad.find(function(x){ return x.lvl === p.lvl; });
        if (!q) return 'skip';
        var done = window.getQuestsDone ? window.getQuestsDone() : {};
        if (done[p.skill + ':' + p.lvl]) return 'skip';
        window.setQuestDone(p.skill, p.lvl, true);
        window.addXP(p.skill, q.xp, 'Quest complete (Lvl ' + p.lvl + ') via Jarvis');
        return '\ud83c\udfc6 ' + q.title + ' +' + q.xp + ' XP';
      }
      if (a.type === 'planAgenda') {
        var sd = defs[p.skillKey];
        if (!sd) return 'skip';
        var hour = Math.max(6, Math.min(23, Math.round(p.hour || 0)));
        var dateK = (typeof p.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.date)) ? p.date : localDay();
        var ak = 'rpg_agenda_v1:' + dateK;
        var items; try { items = JSON.parse(localStorage.getItem(ak)) || []; } catch(e){ items = []; }
        items.push({ time: hour, key: p.skillKey, label: sd.label || p.skillKey, icon: sd.icon || '\u2b50',
                     type: sd.isHabit ? 'mission' : 'skill', done: false });
        try { localStorage.setItem(ak, JSON.stringify(items)); } catch(e){}
        return '\ud83d\uddd3\ufe0f ' + (sd.label || p.skillKey) + ' om ' + hour + ':00';
      }
    } catch(e){}
    return 'skip';
  }

  async function consume(){
    if (busy) return;
    busy = true;
    try {
      var r = await window.gamenfyAuthedFetch(JV_SB_URL + '/rest/v1/app_state?key=eq.jarvis_actions&select=data');
      if (!r.ok) return;
      var rows = await r.json();
      var data = (rows[0] && rows[0].data) || {};
      var queue = Array.isArray(data.queue) ? data.queue : [];
      var seen = ledger();
      // alleen consumeren wat DEZE pagina kan toepassen — anders blijft de
      // actie staan voor index/character (die laden quests.js wel)
      function canApply(a){
        if (a.type === 'claimQuest') return !!(window.setQuestDone && window.RPG_QUESTS);
        if (a.type === 'checkHabit') return !!window.checkHabitFor;
        if (a.type === 'addXP' || a.type === 'planAgenda') return !!window.addXP;
        return false;
      }
      var pending = queue.filter(function(a){ return a && a.id && !a.consumed && seen.indexOf(a.id) < 0 && canApply(a); });
      if (!pending.length) return;
      // EERST consumed markeren in de cloud (race-window minimaliseren), dan toepassen
      var ids = pending.map(function(a){ return a.id; });
      var newQueue = queue.map(function(a){ return ids.indexOf(a.id) >= 0 ? Object.assign({}, a, { consumed: true }) : a; });
      await window.gamenfyAuthedFetch(JV_SB_URL + '/rest/v1/app_state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ key: 'jarvis_actions', user_id: window.gamenfyUserId, data: { queue: newQueue.slice(-100) }, updated_at: new Date().toISOString() })
      });
      ledgerAdd(ids);
      var lines = [];
      pending.sort(function(a,b){ return (a.ts||0)-(b.ts||0); }).forEach(function(a){
        var res = applyAction(a);
        if (res && res !== 'skip') lines.push(res);
      });
      if (lines.length && typeof window.showToast === 'function') {
        window.showToast('Jarvis: ' + lines.slice(0,3).join(' \u00b7 ') + (lines.length>3 ? ' \u2026' : ''));
      }
    } catch(e){} finally { busy = false; }
  }

  window.jarvisConsumeActions = consume;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(consume, 1500); });
  } else { setTimeout(consume, 1500); }
  setInterval(consume, 60000);
})();
