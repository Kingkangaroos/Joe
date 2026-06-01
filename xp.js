// =============================================================
// xp.js — Life OS RPG engine v1.2
// Gebruik: addXP('fitness', 50, 'Workout gedaan')
//          removeXP('fitness', 50, 'Quest unchecked')
// =============================================================
(function () {
  'use strict';

  const STORAGE_KEY = 'rpg_character_v1';
  const HABITS_KEY  = 'rpg_habits_v1';
  const MAX_LOG     = 200;

  // Level formule: level = floor(sqrt(xp / 50)) + 1
  function xpToLevel(xp) {
    return Math.floor(Math.sqrt((xp || 0) / 50)) + 1;
  }

  function xpForLevel(level) {
    return Math.pow(level - 1, 2) * 50;
  }

  // ─── 8 Categorieën — Law of Attraction + Chakra kleuren ─────────────
  const PARENT_SKILLS = {
    money:      { label: 'Money',      icon: '💰', color: '#F5C842' }, // Gold   — Solar Plexus
    body:       { label: 'Body',       icon: '💪', color: '#6BE3A4' }, // Green  — Heart
    mind:       { label: 'Mind',       icon: '🧠', color: '#7DD3FC' }, // Blue   — Third Eye
    business:   { label: 'Business',   icon: '📈', color: '#C4B5FD' }, // Purple — Crown
    lifestyle:  { label: 'Lifestyle',  icon: '✨', color: '#FB923C' }, // Orange — Sacral
    discipline: { label: 'Discipline', icon: '🛡️', color: '#FF6B6B' }, // Red    — Root (private)
    knowledge:  { label: 'Knowledge',  icon: '📚', color: '#818CF8' }, // Indigo — Brow
    creative:   { label: 'Creative',   icon: '🎨', color: '#2DD4BF' }, // Teal   — Throat
  };

  // ─── Skills — active: true = zichtbaar in grid, false = dormant ──────
  // Quick-log opties: array van { label, minutes, xp } — null = geen quick-log
  const DEFAULT_SKILLS = {

    // ── MONEY ─────────────────────────────────────────────────────────
    budgeting:     { xp:0, parentSkill:'money',      icon:'📋', label:'Budgetteren',    active:true,
                     quickLog:[{label:'Budget bijwerken',minutes:15,xp:20},{label:'Categorie review',minutes:30,xp:35}] },
    saving:        { xp:0, parentSkill:'money',      icon:'🐖', label:'Sparen',          active:true,
                     quickLog:[{label:'Gespaard bedrag',minutes:0,xp:30},{label:'Automatisch sparen',minutes:5,xp:20}] },
    investing:     { xp:0, parentSkill:'money',      icon:'📈', label:'Investeren',      active:true,
                     quickLog:[{label:'Investering gedaan',minutes:10,xp:40},{label:'Portfolio review',minutes:20,xp:25}] },
    net_worth:     { xp:0, parentSkill:'money',      icon:'🏦', label:'Net Worth',       active:true,
                     quickLog:[{label:'Net worth bijgewerkt',minutes:10,xp:30}] },
    income:        { xp:0, parentSkill:'money',      icon:'💵', label:'Inkomen',         active:false, quickLog:null },
    financial_ed:  { xp:0, parentSkill:'money',      icon:'📖', label:'Financial Ed.',   active:false, quickLog:null },

    // ── BODY ──────────────────────────────────────────────────────────
    fitness:       { xp:0, parentSkill:'body',       icon:'💪', label:'Fitness',         active:true,
                     quickLog:[{label:'Gym sessie',minutes:60,xp:60},{label:'Cardio',minutes:30,xp:35},{label:'HIIT',minutes:20,xp:40}] },
    tennis:        { xp:0, parentSkill:'body',       icon:'🎾', label:'Tennis',          active:true,
                     quickLog:[{label:'Tennisles',minutes:60,xp:55},{label:'Freeplay',minutes:60,xp:40},{label:'1v1 match',minutes:90,xp:65},{label:'2v2 match',minutes:90,xp:50}] },
    walking:       { xp:0, parentSkill:'body',       icon:'👟', label:'Wandelen',        active:true,
                     quickLog:[{label:'Korte wandeling',minutes:20,xp:15},{label:'Lange wandeling',minutes:60,xp:35},{label:'10k stappen',minutes:90,xp:40}] },
    nutrition:     { xp:0, parentSkill:'body',       icon:'🥗', label:'Voeding',         active:true,
                     quickLog:[{label:'Gezond gegeten',minutes:0,xp:20},{label:'Meal prep',minutes:60,xp:45},{label:'Geen suiker',minutes:0,xp:15}] },
    sleep:         { xp:0, parentSkill:'body',       icon:'😴', label:'Slaap',           active:true,
                     quickLog:[{label:'8+ uur geslapen',minutes:0,xp:30},{label:'7 uur geslapen',minutes:0,xp:20},{label:'Goed in slaap',minutes:0,xp:15}] },
    strength:      { xp:0, parentSkill:'body',       icon:'🏋️', label:'Kracht',          active:true,
                     quickLog:[{label:'Kracht training',minutes:45,xp:50},{label:'PR gehaald',minutes:60,xp:80}] },
    flexibility:   { xp:0, parentSkill:'body',       icon:'🤸', label:'Flexibiliteit',   active:false, quickLog:null },
    body_comp:     { xp:0, parentSkill:'body',       icon:'📊', label:'Body Comp',       active:false, quickLog:null },

    // ── MIND ──────────────────────────────────────────────────────────
    meditation:    { xp:0, parentSkill:'mind',       icon:'🧘', label:'Meditatie',       active:true,
                     quickLog:[{label:'5 min meditatie',minutes:5,xp:15},{label:'10 min meditatie',minutes:10,xp:25},{label:'20 min meditatie',minutes:20,xp:40}] },
    reading:       { xp:0, parentSkill:'mind',       icon:'📚', label:'Lezen',           active:true,
                     quickLog:[{label:'30 min lezen',minutes:30,xp:25},{label:'1 uur lezen',minutes:60,xp:45},{label:'Boek afgerond',minutes:0,xp:100}] },
    focus:         { xp:0, parentSkill:'mind',       icon:'🎯', label:'Focus',           active:true,
                     quickLog:[{label:'Diepe werk sessie',minutes:90,xp:60},{label:'Pomodoro x4',minutes:100,xp:50},{label:'No-distraction uur',minutes:60,xp:40}] },
    gratitude:     { xp:0, parentSkill:'mind',       icon:'🙏', label:'Gratitude',       active:true,
                     quickLog:[{label:'Gratitude journaling',minutes:10,xp:20},{label:'3 dingen opgeschreven',minutes:5,xp:15}] },
    journaling:    { xp:0, parentSkill:'mind',       icon:'📓', label:'Journaling',      active:true,
                     quickLog:[{label:'Dagboek bijgewerkt',minutes:15,xp:25},{label:'Uitgebreide reflectie',minutes:30,xp:40}] },
    visualization: { xp:0, parentSkill:'mind',       icon:'🌅', label:'Visualisatie',    active:false, quickLog:null },
    breathwork:    { xp:0, parentSkill:'mind',       icon:'🌬️', label:'Ademwerk',         active:false, quickLog:null },

    // ── BUSINESS ─────────────────────────────────────────────────────
    sales:         { xp:0, parentSkill:'business',   icon:'🤝', label:'Sales',           active:true,
                     quickLog:[{label:'Sales gesprek',minutes:30,xp:40},{label:'Deal gesloten',minutes:0,xp:100},{label:'Offerte verstuurd',minutes:20,xp:30}] },
    marketing:     { xp:0, parentSkill:'business',   icon:'📣', label:'Marketing',       active:true,
                     quickLog:[{label:'Content gemaakt',minutes:60,xp:45},{label:'Post gepubliceerd',minutes:15,xp:20},{label:'Strategie gewerkt',minutes:45,xp:35}] },
    ai_tools:      { xp:0, parentSkill:'business',   icon:'🤖', label:'AI Tools',        active:true,
                     quickLog:[{label:'AI workflow gebouwd',minutes:60,xp:50},{label:'Prompt geoptimeerd',minutes:20,xp:20},{label:'Nieuwe tool geleerd',minutes:30,xp:30}] },
    coding:        { xp:0, parentSkill:'business',   icon:'💻', label:'Coding',          active:true,
                     quickLog:[{label:'Feature gebouwd',minutes:60,xp:60},{label:'Bug gefixt',minutes:30,xp:30},{label:'Project sessie',minutes:90,xp:70}] },
    networking:    { xp:0, parentSkill:'business',   icon:'🌐', label:'Netwerken',       active:false, quickLog:null },
    portfolio:     { xp:0, parentSkill:'business',   icon:'🗂️', label:'Portfolio',       active:false, quickLog:null },
    leadership:    { xp:0, parentSkill:'business',   icon:'👑', label:'Leadership',      active:false, quickLog:null },

    // ── LIFESTYLE ────────────────────────────────────────────────────
    cooking:       { xp:0, parentSkill:'lifestyle',  icon:'🍳', label:'Koken',           active:true,
                     quickLog:[{label:'Gezond gekookt',minutes:30,xp:25},{label:'Nieuw recept',minutes:60,xp:40},{label:'Meal prep dag',minutes:90,xp:55}] },
    social:        { xp:0, parentSkill:'lifestyle',  icon:'👥', label:'Sociaal',         active:true,
                     quickLog:[{label:'Vrienden gezien',minutes:120,xp:35},{label:'Familie beld',minutes:30,xp:20},{label:'Sociale activiteit',minutes:90,xp:30}] },
    planning:      { xp:0, parentSkill:'lifestyle',  icon:'📅', label:'Planning',        active:true,
                     quickLog:[{label:'Week gepland',minutes:30,xp:30},{label:'Dag gepland',minutes:10,xp:10},{label:'Doelen bijgewerkt',minutes:20,xp:20}] },
    dating:        { xp:0, parentSkill:'lifestyle',  icon:'❤️', label:'Dating',          active:false, quickLog:null },
    style:         { xp:0, parentSkill:'lifestyle',  icon:'👔', label:'Stijl',           active:false, quickLog:null },
    travel:        { xp:0, parentSkill:'lifestyle',  icon:'✈️', label:'Reizen',          active:false, quickLog:null },
    hobbies:       { xp:0, parentSkill:'lifestyle',  icon:'🎮', label:'Hobby\'s',        active:false, quickLog:null },

    // ── DISCIPLINE (PRIVÉ — PIN 1111) ─────────────────────────────────
    no_porn:       { xp:0, parentSkill:'discipline', icon:'🛡️', label:'No Porn',         active:true,  private:true, quickLog:null },
    weed_control:  { xp:0, parentSkill:'discipline', icon:'🚫', label:'Weed Control',    active:true,  private:true, quickLog:null },
    screen_time:   { xp:0, parentSkill:'discipline', icon:'📵', label:'Schermtijd',      active:true,  private:true, quickLog:null },
    cold_shower:   { xp:0, parentSkill:'discipline', icon:'🚿', label:'Koud Douchen',    active:false, quickLog:null },
    bedtime:       { xp:0, parentSkill:'discipline', icon:'🌙', label:'Bedtijd',         active:false, quickLog:null },

    // ── KNOWLEDGE ────────────────────────────────────────────────────
    learning:      { xp:0, parentSkill:'knowledge',  icon:'🎓', label:'Leren',           active:true,
                     quickLog:[{label:'Online cursus',minutes:60,xp:50},{label:'Tutorial gevolgd',minutes:30,xp:25},{label:'Skill geoefend',minutes:45,xp:35}] },
    languages:     { xp:0, parentSkill:'knowledge',  icon:'🗣️', label:'Talen',           active:true,
                     quickLog:[{label:'Duolingo streak',minutes:15,xp:15},{label:'30 min oefenen',minutes:30,xp:25},{label:'Native speaker gesprek',minutes:30,xp:40}] },
    philosophy:    { xp:0, parentSkill:'knowledge',  icon:'🏛️', label:'Filosofie',       active:false, quickLog:null },
    history:       { xp:0, parentSkill:'knowledge',  icon:'📜', label:'Geschiedenis',    active:false, quickLog:null },
    science:       { xp:0, parentSkill:'knowledge',  icon:'🔬', label:'Wetenschap',      active:false, quickLog:null },

    // ── CREATIVE ─────────────────────────────────────────────────────
    content:       { xp:0, parentSkill:'creative',   icon:'🎬', label:'Content',         active:true,
                     quickLog:[{label:'Video gemaakt',minutes:120,xp:70},{label:'Foto\'s gemaakt',minutes:60,xp:40},{label:'Content gepland',minutes:30,xp:20}] },
    music:         { xp:0, parentSkill:'creative',   icon:'🎵', label:'Muziek',          active:true,
                     quickLog:[{label:'Muziek gemaakt',minutes:60,xp:50},{label:'Gespeeld',minutes:30,xp:25},{label:'Nieuw nummer',minutes:120,xp:80}] },
    design:        { xp:0, parentSkill:'creative',   icon:'🖌️', label:'Design',          active:false, quickLog:null },
    writing:       { xp:0, parentSkill:'creative',   icon:'✍️', label:'Schrijven',       active:false, quickLog:null },
    photography:   { xp:0, parentSkill:'creative',   icon:'📷', label:'Fotografie',      active:false, quickLog:null },
  };

  // ─── localStorage helpers ─────────────────────────────────────────────

  function loadCharacter() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (!saved.skills) saved.skills = {};
        // Merge: nieuwe skills toevoegen, bestaande XP bewaren
        for (const [k, v] of Object.entries(DEFAULT_SKILLS)) {
          if (!saved.skills[k]) {
            saved.skills[k] = { ...v };
          } else {
            // Sync metadata, bewaar xp
            saved.skills[k].parentSkill = v.parentSkill;
            saved.skills[k].icon        = saved.skills[k].icon || v.icon;
            saved.skills[k].label       = saved.skills[k].label || v.label;
            if (saved.skills[k].active === undefined) saved.skills[k].active = v.active;
            if (saved.skills[k].private === undefined && v.private) saved.skills[k].private = true;
            if (saved.skills[k].quickLog === undefined) saved.skills[k].quickLog = v.quickLog;
          }
        }
        if (!saved.xpLog) saved.xpLog = [];
        return saved;
      }
    } catch (e) {}
    return { skills: structuredClone ? structuredClone(DEFAULT_SKILLS) : JSON.parse(JSON.stringify(DEFAULT_SKILLS)), xpLog: [] };
  }

  function saveCharacter(char) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(char)); } catch (e) {}
  }

  // ─── Habits ──────────────────────────────────────────────────────────
  // Structuur: { habitId: { label, icon, score, lastChecked: 'YYYY-MM-DD', streak } }

  function loadHabits() {
    try {
      const raw = localStorage.getItem(HABITS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }

  function saveHabits(habits) {
    try { localStorage.setItem(HABITS_KEY, JSON.stringify(habits)); } catch (e) {}
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  // Decay: voor elke gemiste dag -1 XP (min 0), wordt bijgehouden op score 0-10
  function applyHabitDecay(habits) {
    const today = todayStr();
    let changed = false;
    for (const h of Object.values(habits)) {
      if (!h.lastChecked) continue;
      const last = new Date(h.lastChecked);
      const now  = new Date(today);
      const diffDays = Math.floor((now - last) / 86400000);
      if (diffDays > 1) {
        const missedDays = diffDays - 1;
        h.score = Math.max(0, (h.score || 0) - missedDays);
        changed = true;
      }
    }
    if (changed) saveHabits(habits);
    return habits;
  }

  window.getHabits    = function () { return applyHabitDecay(loadHabits()); };
  window.saveHabits   = saveHabits;

  window.checkHabit = function (habitId, label, icon) {
    const habits = loadHabits();
    const today  = todayStr();
    if (!habits[habitId]) {
      habits[habitId] = { label: label || habitId, icon: icon || '⭐', score: 0, lastChecked: null, streak: 0 };
    }
    const h = habits[habitId];
    if (h.lastChecked === today) return h; // al gecheckt vandaag
    h.score      = Math.min(10, (h.score || 0) + 1);
    h.streak     = (h.lastChecked === new Date(Date.now() - 86400000).toISOString().slice(0,10)) ? (h.streak||0)+1 : 1;
    h.lastChecked = today;
    saveHabits(habits);
    return h;
  };

  window.uncheckHabit = function (habitId) {
    const habits = loadHabits();
    if (!habits[habitId]) return;
    const h = habits[habitId];
    h.score  = Math.max(0, (h.score || 1) - 1);
    h.streak = Math.max(0, (h.streak || 1) - 1);
    h.lastChecked = null;
    saveHabits(habits);
    return h;
  };

  // ─── XP toast ────────────────────────────────────────────────────────

  function showToast(msg, color) {
    let toast = document.getElementById('xp-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'xp-toast';
      toast.style.cssText = [
        'position:fixed',
        'bottom:calc(env(safe-area-inset-bottom,0px) + 72px)',
        'right:16px',
        'padding:10px 16px',
        'border-radius:12px',
        'background:rgba(20,20,24,0.95)',
        'backdrop-filter:blur(16px)',
        '-webkit-backdrop-filter:blur(16px)',
        'border:1px solid rgba(255,255,255,0.08)',
        'font-family:-apple-system,BlinkMacSystemFont,"Inter",sans-serif',
        'font-size:14px',
        'font-weight:600',
        'color:#fff',
        'pointer-events:none',
        'z-index:9999',
        'opacity:0',
        'transform:translateY(8px)',
        'transition:opacity 0.25s,transform 0.25s',
      ].join(';');
      document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    clearTimeout(toast._hideTimer);
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    toast._hideTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
    }, 2200);
  }

  function xpToastMsg(amount, parentSkill) {
    const parent = PARENT_SKILLS[parentSkill] || {};
    const color  = parent.color || '#6BE3A4';
    const label  = parent.label || parentSkill;
    const sign   = amount >= 0 ? '+' : '';
    return '<span style="color:' + color + '">' + sign + amount + ' XP</span>'
         + ' <span style="color:rgba(255,255,255,0.5);font-weight:400">· ' + label + '</span>';
  }

  // ─── Publieke API ─────────────────────────────────────────────────────

  window.addXP = function (skillName, amount, reason) {
    const char  = loadCharacter();
    if (!char.skills[skillName]) {
      char.skills[skillName] = { xp:0, parentSkill:'knowledge', icon:'⭐', label:skillName, active:true, quickLog:null };
    }
    const skill    = char.skills[skillName];
    const oldLevel = xpToLevel(skill.xp);
    skill.xp       = Math.max(0, (skill.xp || 0) + amount);
    const newLevel = xpToLevel(skill.xp);

    char.xpLog.unshift({ skill:skillName, amount, reason:reason||'', date:todayStr() });
    if (char.xpLog.length > MAX_LOG) char.xpLog.length = MAX_LOG;

    saveCharacter(char);
    showToast(xpToastMsg(amount, skill.parentSkill));
    if (newLevel > oldLevel) setTimeout(() => showLevelUpToast(skillName, newLevel, skill), 600);
    return { skill:skillName, newXP:skill.xp, level:newLevel };
  };

  window.removeXP = function (skillName, amount, reason) {
    return window.addXP(skillName, -Math.abs(amount), reason || 'Quest unchecked');
  };

  function showLevelUpToast(skillName, level, skill) {
    const parent = PARENT_SKILLS[skill.parentSkill] || {};
    const color  = parent.color || '#6BE3A4';
    showToast(
      '<span style="color:' + color + '">' + (skill.icon||'⭐') + ' LEVEL UP!</span>'
      + ' <span style="color:rgba(255,255,255,0.7)">' + (skill.label||skillName) + ' → Lvl ' + level + '</span>'
    );
  }

  window.getCharacter       = function () { return loadCharacter(); };
  window.xpToLevel          = xpToLevel;
  window.xpForLevel         = xpForLevel;
  window.RPG_PARENT_SKILLS  = PARENT_SKILLS;
  window.RPG_DEFAULT_SKILLS = DEFAULT_SKILLS;

  // ─── Cloud sync ───────────────────────────────────────────────────────
  function initRPGSync() {
    if (!window.initCloudSync || !window.supabase) return;
    window.initCloudSync({
      appKey: 'rpg',
      syncedKeys: [STORAGE_KEY, HABITS_KEY],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRPGSync);
  } else {
    initRPGSync();
  }
})();
