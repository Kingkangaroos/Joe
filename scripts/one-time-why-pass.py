from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def read(path):
    return (ROOT/path).read_text(encoding='utf-8')

def write(path, text):
    (ROOT/path).write_text(text, encoding='utf-8')

def replace_once(text, old, new, label):
    count=text.count(old)
    if count!=1:
        raise SystemExit(f'{label}: expected 1 anchor, got {count}')
    return text.replace(old,new,1)

# ---- Shared goal-first WHY helpers (read-only) --------------------------------
p='xp.js'
s=read(p)
anchor="""  // Picks the mapped skill closest to its next unclaimed SKILL_LADDERS tier
"""
helper=r'''  // v10.100 — goal-first WHY graph foundation.
  // Joey's manually created Goals are the strongest source of truth because
  // they already carry his own `why`, deadline, progress and linkedSkills.
  // LIFE_GOAL_MAP remains a legacy/fallback direction map; these helpers do
  // not manufacture new life categories or silently infer links.
  function whyGoalDaysLeft(deadline) {
    if(!deadline) return null;
    var p=String(deadline).split('-').map(Number);
    if(p.length!==3||!p[0]||!p[1]||!p[2]) return null;
    var now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    var target=new Date(p[0],p[1]-1,p[2]);
    return Math.round((target-today)/86400000);
  }
  function activeWhyGoals() {
    var goals=[];
    try{ goals=JSON.parse(localStorage.getItem('rpg_goals_v1'))||[]; }catch(e){ goals=[]; }
    if(!Array.isArray(goals)) return [];
    return goals.filter(function(g){ return g && !g.archived && Number(g.pct||0)<100; });
  }
  function compareWhyGoals(a,b) {
    var ad=whyGoalDaysLeft(a.deadline), bd=whyGoalDaysLeft(b.deadline);
    if(ad===null&&bd!==null) return 1;
    if(ad!==null&&bd===null) return -1;
    if(ad!==null&&bd!==null&&ad!==bd) return ad-bd;
    return String(a.createdDate||'').localeCompare(String(b.createdDate||''));
  }
  window.getGoalLinksForSkill = function(skillKey) {
    return activeWhyGoals()
      .filter(function(g){ return Array.isArray(g.linkedSkills)&&g.linkedSkills.includes(skillKey); })
      .sort(compareWhyGoals)
      .map(function(g){
        return {
          title:String(g.title||''), why:String(g.why||''), deadline:g.deadline||null,
          daysLeft:whyGoalDaysLeft(g.deadline), pct:Math.max(0,Math.min(100,Number(g.pct)||0)),
          linkedSkills:Array.isArray(g.linkedSkills)?g.linkedSkills.slice():[]
        };
      });
  };
  window.getPriorityGoalReminder = function() {
    var goals=activeWhyGoals().slice().sort(compareWhyGoals);
    if(!goals.length) return null;
    var g=goals[0];
    return {
      title:String(g.title||''), why:String(g.why||''), deadline:g.deadline||null,
      daysLeft:whyGoalDaysLeft(g.deadline), pct:Math.max(0,Math.min(100,Number(g.pct)||0)),
      linkedSkills:Array.isArray(g.linkedSkills)?g.linkedSkills.slice():[]
    };
  };

'''
s=replace_once(s,anchor,helper+anchor,'xp WHY helper insertion')
write(p,s)

# ---- Home goal reminder + action-level WHY link --------------------------------
p='index.html'
s=read(p)

css_anchor='''/* ── Day Arc ─────────────────────────────────────── */
'''
why_css=r'''/* ── WHY today (v10.100) ─────────────────────────── */
.life-why-card{
  background:linear-gradient(135deg,#FBF9F3 0%,#F2EFE6 100%);
  border:1px solid rgba(201,162,39,.38);border-radius:18px;padding:15px 16px;
  margin-bottom:20px;cursor:pointer;-webkit-tap-highlight-color:transparent;
  box-shadow:0 8px 24px -20px rgba(21,20,15,.32);
}
.life-why-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.life-why-kicker{font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:4px}
.life-why-title{font-family:var(--font-display);font-weight:800;font-size:16px;line-height:1.25;color:var(--ink)}
.life-why-deadline{font-size:10px;font-weight:800;color:var(--muted);white-space:nowrap;padding-top:2px}
.life-why-deadline.overdue{color:var(--ember-deep)}
.life-why-copy{font-size:12px;line-height:1.5;color:#57544B;margin-top:7px}
.life-why-chain{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:9px;font-size:10px;color:var(--muted)}
.life-why-chip{background:rgba(255,255,255,.72);border:1px solid var(--line);border-radius:999px;padding:3px 7px;font-weight:700;color:var(--ink)}
.life-why-arrow{color:var(--gold);font-weight:800}
.life-why-bar{height:4px;background:rgba(21,20,15,.08);border-radius:3px;overflow:hidden;margin-top:11px}
.life-why-fill{height:100%;background:var(--gold);border-radius:3px}
.wc-goal-why{font-size:10.5px;color:var(--gold);font-weight:700;margin-top:4px;line-height:1.35}

'''
s=replace_once(s,css_anchor,why_css+css_anchor,'Home WHY css')

html_anchor='''  <!-- Day Arc -->
'''
why_html='''  <!-- WHY today (goal-first; no invented life taxonomy) -->
  <div id="lifeWhyWrap" style="display:none">
    <div class="life-why-card" id="lifeWhyCard" onclick="location.href='character.html#goals'"></div>
  </div>

'''
s=replace_once(s,html_anchor,why_html+html_anchor,'Home WHY card')

js_anchor='''// v10.31: "Your Skills" row — was a curated 6-skill Focus grid, now shows
'''
why_js=r'''// v10.100: compact daily reminder of Joey's own active goal WHY.
// No category inference here: this reads rpg_goals_v1 through xp.js helpers.
function renderLifeWhy(){
  const wrap=document.getElementById('lifeWhyWrap');
  const card=document.getElementById('lifeWhyCard');
  if(!wrap||!card||typeof window.getPriorityGoalReminder!=='function') return;
  const goal=window.getPriorityGoalReminder();
  if(!goal||!goal.title){ wrap.style.display='none'; card.textContent=''; return; }
  const defaults=window.RPG_DEFAULT_SKILLS||{};
  const skillChips=(goal.linkedSkills||[]).slice(0,4).map(k=>{
    const d=defaults[k]||{}; return '<span class="life-why-chip">'+escapeHtml((d.icon||'')+' '+(d.label||k))+'</span>';
  }).join('');
  let deadline='No deadline', cls='';
  if(goal.daysLeft!==null){
    if(goal.daysLeft<0){ deadline=Math.abs(goal.daysLeft)+'d overdue'; cls=' overdue'; }
    else if(goal.daysLeft===0) deadline='due today';
    else deadline=goal.daysLeft+'d left';
  }
  const why=goal.why ? '<div class="life-why-copy">'+escapeHtml(goal.why)+'</div>' : '';
  const chain=skillChips
    ? '<div class="life-why-chain">'+skillChips+'<span class="life-why-arrow">→</span><span class="life-why-chip">🎯 '+escapeHtml(goal.title)+'</span></div>'
    : '<div class="life-why-chain"><span class="life-why-chip">TODAY</span><span class="life-why-arrow">→</span><span class="life-why-chip">🎯 '+escapeHtml(goal.title)+'</span></div>';
  card.innerHTML='<div class="life-why-top"><div><div class="life-why-kicker">Why you’re doing this</div><div class="life-why-title">'+escapeHtml(goal.title)+'</div></div>'+
    '<div class="life-why-deadline'+cls+'">'+escapeHtml(deadline)+'</div></div>'+why+chain+
    '<div class="life-why-bar"><div class="life-why-fill" style="width:'+Math.max(0,Math.min(100,goal.pct||0))+'%"></div></div>';
  wrap.style.display='';
}
window.addEventListener('storage',e=>{ if(!e.key||e.key==='rpg_goals_v1') renderLifeWhy(); });
window.addEventListener('gamenfy:remote-state-applied',renderLifeWhy);

'''
s=replace_once(s,js_anchor,why_js+js_anchor,'Home WHY render function')

# Add goal-specific WHY beneath the daily challenge when the selected skill is linked.
old=r'''  const streak=workoutChallengeStreak();
  const streakBadge = streak>0 ? '<span style="font-size:12px;font-weight:700;color:var(--ember,#c8622a);margin-left:8px">\uD83D\uDD25 '+streak+'d</span>' : '';
  card.innerHTML=
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
    +'<div>'
      +'<div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--text-tertiary,#8a8a8a);margin-bottom:2px">DAILY CHALLENGE'+streakBadge+'</div>'
      +'<div style="font-size:15px;font-weight:700;color:var(--text-primary,#1a1a1a)">'+c.icon+' '+c.name+'</div>'
      +'<div style="font-size:13px;color:var(--text-secondary,#666)">'+c.target+' \u00b7 +'+c.xp+' XP</div>'
    +'</div>'
'''
new=r'''  const streak=workoutChallengeStreak();
  const streakBadge = streak>0 ? '<span style="font-size:12px;font-weight:700;color:var(--ember,#c8622a);margin-left:8px">\uD83D\uDD25 '+streak+'d</span>' : '';
  const goalLink=(typeof window.getGoalLinksForSkill==='function' ? window.getGoalLinksForSkill(c.skill)[0] : null);
  const goalWhy=goalLink&&goalLink.title ? '<div class="wc-goal-why">WHY → '+escapeHtml(goalLink.title)+'</div>' : '';
  card.innerHTML=
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
    +'<div>'
      +'<div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--text-tertiary,#8a8a8a);margin-bottom:2px">DAILY CHALLENGE'+streakBadge+'</div>'
      +'<div style="font-size:15px;font-weight:700;color:var(--text-primary,#1a1a1a)">'+c.icon+' '+c.name+'</div>'
      +'<div style="font-size:13px;color:var(--text-secondary,#666)">'+c.target+' \u00b7 +'+c.xp+' XP</div>'+goalWhy
    +'</div>'
'''
s=replace_once(s,old,new,'Daily Challenge goal WHY')

# Boot reminder after Season, while xp/goals are available.
s=replace_once(s,'  renderSeasonBanner();\n  try{renderWorkoutChallenge();}catch(e){}','  renderSeasonBanner();\n  renderLifeWhy();\n  try{renderWorkoutChallenge();}catch(e){}','Home boot WHY')
write(p,s)

# ---- Regression guard ----------------------------------------------------------
p=ROOT/'tests/why-chain-smoke.js'
p.write_text(r'''/* Goal-first WHY chain regression guard — ChatGPT (OpenAI), 2026-09-05 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const xp=fs.readFileSync(path.join(root,'xp.js'),'utf8');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(xp,/localStorage\.getItem\('rpg_goals_v1'\)/,'WHY helpers read Joey’s actual Goals');
assert.match(xp,/!g\.archived && Number\(g\.pct\|\|0\)<100/,'only active unfinished Goals can drive WHY reminders');
assert.match(xp,/g\.linkedSkills\.includes\(skillKey\)/,'skill WHY uses explicit goal links, not guessed categories');
assert.match(xp,/window\.getGoalLinksForSkill/);
assert.match(xp,/window\.getPriorityGoalReminder/);
assert.match(home,/id="lifeWhyCard"/,'Home exposes a compact goal reminder');
assert.match(home,/Why you’re doing this/);
assert.match(home,/escapeHtml\(goal\.why\)/,'user-authored goal WHY is inert text');
assert.match(home,/getGoalLinksForSkill\(c\.skill\)/,'Daily Challenge uses its selected skill to find a real linked goal');
assert.match(home,/WHY →/,'action-to-goal chain is visible when a link exists');
assert.match(home,/character\.html#goals/,'WHY card opens canonical Goals rather than a competing goal store');
console.log('WHY-chain smoke: real Goals are the primary reminder source; skill links are explicit and safely rendered.');
''',encoding='utf-8')
print('Goal-first WHY pass applied.')
