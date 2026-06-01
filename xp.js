// =============================================================
// xp.js — Life OS RPG engine
// Laad op elke pagina via <script src="xp.js" defer>
// Gebruik: addXP('fitness', 50, 'Workout gedaan')
// =============================================================
(function () {
  'use strict';

  const STORAGE_KEY = 'rpg_character_v1';
  const MAX_LOG = 100;

  // Level formule: level = floor(sqrt(xp / 50)) + 1
  function xpToLevel(xp) {
    return Math.floor(Math.sqrt((xp || 0) / 50)) + 1;
  }

  // XP nodig voor het volgende level (voor progress bar)
  function xpForLevel(level) {
    return Math.pow(level - 1, 2) * 50;
  }

  // Standaard skill definitie — dynamisch uitbreidbaar
  const DEFAULT_SKILLS = {
    // Body
    fitness:      { xp: 0, parentSkill: 'body',       icon: '💪', label: 'Fitness' },
    calisthenics: { xp: 0, parentSkill: 'body',       icon: '🤸', label: 'Calisthenics' },
    tennis:       { xp: 0, parentSkill: 'body',       icon: '🎾', label: 'Tennis' },
    nutrition:    { xp: 0, parentSkill: 'body',       icon: '🥗', label: 'Voeding' },
    sleep:        { xp: 0, parentSkill: 'body',       icon: '😴', label: 'Slaap' },
    steps:        { xp: 0, parentSkill: 'body',       icon: '👟', label: 'Stappen' },
    body_fat:     { xp: 0, parentSkill: 'body',       icon: '📊', label: 'Body Fat' },
    // Mind
    meditation:   { xp: 0, parentSkill: 'mind',       icon: '🧘', label: 'Meditatie' },
    reading:      { xp: 0, parentSkill: 'mind',       icon: '📚', label: 'Lezen' },
    gratitude:    { xp: 0, parentSkill: 'mind',       icon: '🙏', label: 'Gratitude' },
    reflection:   { xp: 0, parentSkill: 'mind',       icon: '🪞', label: 'Reflectie' },
    focus:        { xp: 0, parentSkill: 'mind',       icon: '🎯', label: 'Focus' },
    breathing:    { xp: 0, parentSkill: 'mind',       icon: '🌬️', label: 'Ademhaling' },
    // Money
    saving:       { xp: 0, parentSkill: 'money',      icon: '💰', label: 'Sparen' },
    investing:    { xp: 0, parentSkill: 'money',      icon: '📈', label: 'Investeren' },
    budgeting:    { xp: 0, parentSkill: 'money',      icon: '📋', label: 'Budgetteren' },
    income:       { xp: 0, parentSkill: 'money',      icon: '💵', label: 'Inkomen' },
    net_worth:    { xp: 0, parentSkill: 'money',      icon: '🏦', label: 'Net Worth' },
    // Business
    sales:        { xp: 0, parentSkill: 'business',   icon: '🤝', label: 'Sales' },
    marketing:    { xp: 0, parentSkill: 'business',   icon: '📣', label: 'Marketing' },
    ai_tools:     { xp: 0, parentSkill: 'business',   icon: '🤖', label: 'AI Tools' },
    portfolio:    { xp: 0, parentSkill: 'business',   icon: '🗂️', label: 'Portfolio' },
    outreach:     { xp: 0, parentSkill: 'business',   icon: '📧', label: 'Outreach' },
    revenue:      { xp: 0, parentSkill: 'business',   icon: '💹', label: 'Omzet' },
    // Lifestyle
    dating:       { xp: 0, parentSkill: 'lifestyle',  icon: '❤️', label: 'Dating' },
    social:       { xp: 0, parentSkill: 'lifestyle',  icon: '👥', label: 'Sociaal' },
    cooking:      { xp: 0, parentSkill: 'lifestyle',  icon: '🍳', label: 'Koken' },
    travel:       { xp: 0, parentSkill: 'lifestyle',  icon: '✈️', label: 'Reizen' },
    interior:     { xp: 0, parentSkill: 'lifestyle',  icon: '🏠', label: 'Interieur' },
    style:        { xp: 0, parentSkill: 'lifestyle',  icon: '👔', label: 'Stijl' },
    // Discipline
    no_porn:      { xp: 0, parentSkill: 'discipline', icon: '🛡️', label: 'No Porn' },
    weed_control: { xp: 0, parentSkill: 'discipline', icon: '🚫', label: 'Weed Control' },
    screen_time:  { xp: 0, parentSkill: 'discipline', icon: '📵', label: 'Schermtijd' },
    bedtime:      { xp: 0, parentSkill: 'discipline', icon: '🌙', label: 'Bedtijd' },
    discipline:   { xp: 0, parentSkill: 'discipline', icon: '⚡', label: 'Discipline' },
  };

  const PARENT_SKILLS = {
    body:       { label: 'Body',       icon: '💪', color: '#6BE3A4' },
    mind:       { label: 'Mind',       icon: '🧠', color: '#7DD3FC' },
    money:      { label: 'Money',      icon: '💰', color: '#F2C063' },
    business:   { label: 'Business',  icon: '📈', color: '#C4B5FD' },
    lifestyle:  { label: 'Lifestyle', icon: '✨', color: '#F9A8D4' },
    discipline: { label: 'Discipline',icon: '🛡️', color: '#FF6B6B' },
  };

  // --- localStorage helpers ---

  function loadCharacter() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // Merge: zorg dat nieuwe default skills ook aanwezig zijn
        for (const [k, v] of Object.entries(DEFAULT_SKILLS)) {
          if (!saved.skills[k]) saved.skills[k] = { ...v };
        }
        if (!saved.xpLog) saved.xpLog = [];
        return saved;
      }
    } catch (e) {}
    return { skills: { ...DEFAULT_SKILLS }, xpLog: [] };
  }

  function saveCharacter(char) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(char));
    } catch (e) {}
  }

  // --- XP toast ---

  function showToast(skillName, amount, parentSkill) {
    const parent = PARENT_SKILLS[parentSkill] || {};
    const color = parent.color || '#6BE3A4';
    const label = parent.label || parentSkill;

    let toast = document.getElementById('xp-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'xp-toast';
      toast.style.cssText = [
        'position:fixed',
        'bottom:calc(env(safe-area-inset-bottom, 0px) + 72px)',
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

    toast.innerHTML = '<span style="color:' + color + '">+' + amount + ' XP</span>'
      + ' <span style="color:rgba(255,255,255,0.5);font-weight:400">· ' + label + '</span>';

    clearTimeout(toast._hideTimer);
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    toast._hideTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
    }, 2200);
  }

  // --- Publieke API ---

  window.addXP = function (skillName, amount, reason) {
    const char = loadCharacter();

    // Maak skill aan als die nog niet bestaat (flexibel systeem)
    if (!char.skills[skillName]) {
      char.skills[skillName] = { xp: 0, parentSkill: 'discipline', icon: '⭐', label: skillName };
    }

    const skill = char.skills[skillName];
    const oldLevel = xpToLevel(skill.xp);
    skill.xp = (skill.xp || 0) + amount;
    const newLevel = xpToLevel(skill.xp);

    // Log bijhouden
    char.xpLog.unshift({
      skill: skillName,
      amount: amount,
      reason: reason || '',
      date: new Date().toISOString().slice(0, 10),
    });
    if (char.xpLog.length > MAX_LOG) char.xpLog.length = MAX_LOG;

    saveCharacter(char);
    showToast(skillName, amount, skill.parentSkill);

    // Level-up melding
    if (newLevel > oldLevel) {
      setTimeout(() => showLevelUp(skillName, newLevel, skill), 600);
    }

    return { skill: skillName, newXP: skill.xp, level: newLevel };
  };

  function showLevelUp(skillName, level, skill) {
    const parent = PARENT_SKILLS[skill.parentSkill] || {};
    const color = parent.color || '#6BE3A4';
    const toast = document.getElementById('xp-toast');
    if (!toast) return;
    toast.innerHTML = '<span style="color:' + color + '">' + (skill.icon || '⭐') + ' LEVEL UP!</span>'
      + ' <span style="color:rgba(255,255,255,0.7)">' + (skill.label || skillName) + ' → ' + level + '</span>';
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
    }, 3000);
  }

  // Hulpfuncties beschikbaar voor character.html en andere pagina's
  window.getCharacter = function () { return loadCharacter(); };
  window.xpToLevel = xpToLevel;
  window.xpForLevel = xpForLevel;
  window.RPG_PARENT_SKILLS = PARENT_SKILLS;

  // --- Cloud sync via sync.js ---
  // Wordt gestart zodra de pagina klaar is
  function initRPGSync() {
    if (!window.initCloudSync || !window.supabase) return;
    window.initCloudSync({
      appKey: 'rpg',
      syncedKeys: [STORAGE_KEY],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRPGSync);
  } else {
    initRPGSync();
  }
})();
