from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def read(path):
    return (ROOT / path).read_text(encoding='utf-8')

def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')

def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 anchor, found {count}')
    return text.replace(old, new, 1)

def replace_between(text, start, end, replacement, label):
    a = text.find(start)
    b = text.find(end, a + len(start)) if a >= 0 else -1
    if a < 0 or b < 0:
        raise SystemExit(f'{label}: anchors not found')
    return text[:a] + replacement + text[b:]

# -----------------------------------------------------------------------------
# Park 3.1 -> Daily Missions 2.0 interaction + iPhone performance
# -----------------------------------------------------------------------------
path = 'park31.js'
s = read(path)
s = replace_once(s, "  var VERSION='1.14';\n  var HOLD_MS=560;", "  var VERSION='1.15';", 'park version/hold')
s = replace_once(
    s,
    "  var tries=0,pollId=null,missionMode=false,selected=null,preview=null,pointerPress=null,keyPress=null;",
    "  var tries=0,pollId=null,missionMode=false,publicOnlyMode=false,homeSurface=false,selected=null,preview=null;",
    'park state vars'
)

new_roster_card = '''  function rosterCard(mission){
    var info=levelInfo(mission),ready=!!artworkReady[mission.key],done=missionMode&&isDone(mission);
    var neglected=missionMode&&!done&&inactivityDays(mission)>=3;
    var lit=(litUntil[mission.key]||0)>Date.now();
    var selectedNow=!!(selected&&selected.key===mission.key);
    var instruction=done?'Vandaag voltooid':(neglected?'HELP · Tik om te openen':'Tik om te openen');
    var slotClass='p31-slot'+(ready?' is-ready':' is-waiting')+(done?' is-done':'')+(neglected?' is-neglected':'')+(lit?' is-lit':'')+(selectedNow?' is-selected':'')+(mission.private?' is-private':'')+(mission.fallback?' is-fallback':'');
    return '<div class="p31-slot-wrap'+(done?' is-done':'')+(mission.private?' is-private':'')+'">'
      +'<button class="'+slotClass+'" type="button" data-mission="'+mission.key+'"'+(ready?'':' disabled')+' aria-pressed="'+(done?'true':'false')+'"'+(selectedNow?' aria-current="true"':'')+'>'
      +'<span class="p31-slot-art">'+(ready?'<img src="'+assetUrl(info.art,mission)+'" alt="" draggable="false">':mission.emoji)+(neglected?'<span class="p31-help" aria-hidden="true">HELP</span>':'')+'</span>'
      +'<span class="p31-slot-copy"><strong>'+mission.label+'</strong><small>'+artworkLabel(mission)+'</small><em>'+(missionMode?instruction:(ready?'Tik om te openen':'artwork pending'))+'</em></span>'
      +'<span class="p31-slot-level">L'+info.raw+'</span></button>'
      +(missionMode?'<button class="p31-check'+(done?' is-done':'')+'" type="button" data-p31-toggle="'+mission.key+'" aria-label="'+(done?'Maak '+mission.label+' ongedaan':'Voltooi '+mission.label+' vandaag')+'" aria-pressed="'+(done?'true':'false')+'">'+(done?'✓':'')+'</button>':'')
      +'</div>';
  }
'''
s = replace_between(s, '  function rosterCard(mission){', '  function viewedDay(){', new_roster_card, 'rosterCard block')

s = s.replace("'Vandaag voltooid · Houd de kaart vast om terug te draaien.'", "'Vandaag voltooid · tik het ronde vinkje om ongedaan te maken.'")
s = s.replace("'Nog niet voltooid · Houd de kaart vast om te voltooien.'", "'Nog niet voltooid · tik het ronde vinkje op de kaart om af te ronden.'")

interaction = '''  function slotFrom(target){return target&&typeof target.closest==='function'?target.closest('[data-mission]'):null;}
  function toggleFrom(target){return target&&typeof target.closest==='function'?target.closest('[data-p31-toggle]'):null;}
  function missionByKey(key){return MISSIONS.find(function(item){return item.key===key;})||null;}
  function onRosterClick(event){
    var toggle=toggleFrom(event.target);
    if(toggle){
      if(typeof event.preventDefault==='function')event.preventDefault();
      if(typeof event.stopPropagation==='function')event.stopPropagation();
      var toggleMissionDef=missionByKey(toggle.dataset.p31Toggle);
      if(toggleMissionDef&&missionMode)toggleMission(toggleMissionDef);
      return;
    }
    var slot=slotFrom(event.target);
    if(!slot||slot.disabled)return;
    var mission=missionByKey(slot.dataset.mission);
    if(mission)openMission(mission.key);
  }
'''
s = replace_between(s, '  function slotFrom(target){', '  function renderRoster(){', interaction, 'park interaction block')

new_render_roster = '''  function renderRoster(){
    if(!rosterEl)return;
    var markup=PUBLIC_MISSIONS.map(rosterCard).join('');
    if(!publicOnlyMode){
      markup+='<div class="p31-roster-divider"><strong>Private dailies</strong><span>PIN-backed · apart van de publieke 11</span></div>'
        +PRIVATE_MISSIONS.map(rosterCard).join('');
    }
    if(rosterEl.innerHTML!==markup)rosterEl.innerHTML=markup;
    rosterCountEl.textContent=publicOnlyMode?(PUBLIC_MISSIONS.length+' public'):(PUBLIC_MISSIONS.length+' public · '+PRIVATE_MISSIONS.length+' private');
  }
  function probeRoster(){
    MISSIONS.filter(function(mission){return mission.key!==KEY;}).forEach(function(mission){
      var image=new Image(),info=levelInfo(mission);
      image.onload=function(){if(artworkReady[mission.key]!==true){artworkReady[mission.key]=true;renderRoster();}};
      image.onerror=function(){if(artworkReady[mission.key]!==false){artworkReady[mission.key]=false;renderRoster();}};
      image.src=assetUrl(info.art,mission);
    });
  }
'''
s = replace_between(s, '  function renderRoster(){', '  function render(){', new_render_roster, 'render/probe roster block')

new_preload = '''  function preload(){
    MISSIONS.forEach(function(mission){
      var info=levelInfo(mission),levels=[info.art,info.art-1,info.art+1];
      var seen={};
      levels.forEach(function(level){
        level=clamp(level,1,10);
        var url=assetUrl(level,mission);
        if(seen[url])return;
        seen[url]=true;
        var image=new Image();image.src=url;
      });
    });
  }
'''
s = replace_between(s, '  function preload(){', '  function toggleLight(){', new_preload, 'preload block')

old_bind = '''    rosterEl.addEventListener('pointerdown',startPointerPress);
    rosterEl.addEventListener('pointermove',movePointerPress);
    rosterEl.addEventListener('pointerup',endPointerPress);
    rosterEl.addEventListener('pointercancel',cancelPointerPress);
    rosterEl.addEventListener('contextmenu',function(event){if(slotFrom(event.target))event.preventDefault();});
    rosterEl.addEventListener('keydown',startKeyPress);
    rosterEl.addEventListener('keyup',endKeyPress);'''
s = replace_once(s, old_bind, "    rosterEl.addEventListener('click',onRosterClick);", 'bind interaction')
s = replace_once(s, "    pollId=setInterval(function(){if(!document.hidden)refresh();},1200);", "    pollId=setInterval(function(){if(!document.hidden)refresh();},5000);", 'park poll')
s = replace_once(
    s,
    "    missionMode=params.get('mode')==='missions';\n    if(params.get('embed')==='1')document.body.classList.add('p31-embedded');\n    if(missionMode)document.body.classList.add('p31-mission-mode');",
    "    missionMode=params.get('mode')==='missions';\n    publicOnlyMode=params.get('privacy')==='public';\n    homeSurface=params.get('surface')==='home';\n    if(params.get('embed')==='1')document.body.classList.add('p31-embedded');\n    if(missionMode)document.body.classList.add('p31-mission-mode');\n    if(homeSurface)document.body.classList.add('p31-home');",
    'park query modes'
)
write(path, s)

# Park CSS: tap circle + light Home surface. Existing hold CSS remains inert.
path = 'park31.css'
s = read(path)
append_css = r'''
/* v1.15 — Daily Missions 2.0: iPhone-safe tap completion + Home surface */
.p31-slot-wrap{position:relative;min-width:0}
.p31-slot{width:100%;padding-right:34px;touch-action:manipulation;-webkit-touch-callout:none}
.p31-check{position:absolute;z-index:12;right:7px;bottom:8px;width:25px;height:25px;padding:0;border:1.5px solid rgba(166,184,219,.72);border-radius:50%;background:rgba(7,10,34,.9);color:#fff;font:900 14px/1 var(--display);display:grid;place-items:center;cursor:pointer;touch-action:manipulation;-webkit-touch-callout:none;box-shadow:0 2px 8px rgba(0,0,0,.22)}
.p31-check:active{transform:scale(.9)}
.p31-check.is-done{border-color:#61dfa5;background:#2e9f70;box-shadow:0 0 14px rgba(70,220,158,.28)}
.p31-embedded .p31-slot-wrap{min-width:0}
.p31-embedded .p31-slot{height:100%;padding-right:6px;padding-bottom:34px}
.p31-embedded .p31-check{right:9px;bottom:8px;width:24px;height:24px}
.p31-embedded.p31-home{background:transparent;color:#15140F}
.p31-embedded.p31-home .p31-roster{background:#fff;border:1px solid #E8E6DF;border-radius:16px}
.p31-embedded.p31-home .p31-roster-head strong{color:#15140F}
.p31-embedded.p31-home .p31-roster-head small,.p31-embedded.p31-home .p31-roster-head>span:last-child{color:#6F6C63}
.p31-embedded.p31-home .p31-slot{border-color:#E8E6DF;background:linear-gradient(145deg,#fff,#F7F6F2);color:#15140F;box-shadow:none}
.p31-embedded.p31-home .p31-slot.is-ready{border-color:#DBD8CF}
.p31-embedded.p31-home .p31-slot.is-done{border-color:rgba(46,139,95,.46);background:linear-gradient(145deg,#F4FBF7,#EDF8F2)}
.p31-embedded.p31-home .p31-slot-copy strong{color:#15140F}
.p31-embedded.p31-home .p31-slot-copy em{color:#6F6C63}
.p31-embedded.p31-home .p31-slot.is-ready .p31-slot-copy em{color:#2E8B5F}
.p31-embedded.p31-home .p31-slot-art{background:#F4F3EF}
.p31-embedded.p31-home .p31-slot-level{background:rgba(255,255,255,.88);color:#57544B;border:1px solid rgba(0,0,0,.06)}
.p31-embedded.p31-home .p31-check{background:#fff;color:#15140F;border-color:#C9C6BC;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.p31-embedded.p31-home .p31-check.is-done{background:#2E8B5F;border-color:#2E8B5F;color:#fff}
'''
if '/* v1.15 — Daily Missions 2.0' in s:
    raise SystemExit('park css patch already present')
s += append_css
write(path, s)

# Park page version/copy.
path = 'park31.html'
s = read(path)
s = s.replace('park31.css?v=1.14','park31.css?v=1.15').replace('park31.js?v=1.14','park31.js?v=1.15')
s = replace_once(
    s,
    'Tik om te openen · Houd vast om te voltooien. Met − / + bekijk je alleen bestaande evolutie-art; je echte level verandert niet.',
    'Tik de kaart om te openen · tik het ronde vinkje om vandaag te voltooien. Met − / + bekijk je alleen bestaande evolutie-art; je echte level verandert niet.',
    'park page controls copy'
)
write(path, s)

# -----------------------------------------------------------------------------
# Home: Daily Missions 2.0 visual, Gratitude cloud, challenge level correctness,
# and remove explicitly retired Your Skills/Core Tracker surfaces.
# -----------------------------------------------------------------------------
path = 'index.html'
s = read(path)

# Gratitude styling: keep card/input but turn pills into living cloud words.
old_grat_css = '''.grat-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.grat-tags:empty { margin-top: 0; }
.grat-tag {
  font-size: 11px; font-weight: 600; color: var(--green);
  border: 1px solid rgba(46,139,95,0.35); border-radius: 20px;
  padding: 4px 11px;
}
.grat-sub { font-size: 10.5px; color: var(--faint); margin-top: 8px; }'''
new_grat_css = '''.grat-tags {
  min-height: 118px; display:flex; align-items:center; align-content:center; justify-content:center;
  flex-wrap:wrap; gap:8px 12px; margin-top:12px; padding:12px 8px;
  border:1px solid var(--line); border-radius:14px;
  background:radial-gradient(circle at 50% 45%,rgba(46,139,95,.07),transparent 68%),var(--bg);
}
.grat-tags:empty { min-height:0; margin-top:0; padding:0; border:0; }
.grat-word {
  appearance:none; border:0; background:transparent; padding:2px 3px; cursor:pointer;
  font-family:var(--font-display); font-size:var(--grat-size,13px); font-weight:800;
  line-height:1; letter-spacing:-.025em; color:var(--ink); opacity:var(--grat-opacity,.82);
  -webkit-tap-highlight-color:transparent; transition:transform .12s ease,opacity .12s ease;
}
.grat-word.recent{color:var(--green);opacity:1}.grat-word:active{transform:scale(.94)}
.grat-empty{font-size:11px;color:var(--faint);padding:18px 6px;text-align:center;width:100%}
.grat-sub { font-size:10.5px; color:var(--faint); margin-top:8px; }'''
s = replace_once(s, old_grat_css, new_grat_css, 'gratitude css')

# Mission area: hidden canonical controller + visible public Park 3.1 iframe.
old_missions = '''  <div id="weekStrip" style="display:flex;gap:2px;margin:2px 0 10px;padding:0 4px"></div>
  <div class="missions-grid" id="missionsCard">
    <div style="padding:16px;text-align:center;color:var(--muted);font-size:13px;grid-column:1/-1">Loading habits…</div>
  </div>'''
new_missions = '''  <div id="weekStrip" style="display:flex;gap:2px;margin:2px 0 10px;padding:0 4px"></div>
  <div class="daily-missions-2" id="dailyMissions2Wrap" style="background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-bottom:20px">
    <iframe id="dailyMissions2Frame" title="Daily Missions 2.0" src="park31.html?embed=1&amp;mode=missions&amp;privacy=public&amp;surface=home&amp;v=1.15" style="display:block;width:100%;height:720px;border:0;background:transparent" loading="eager"></iframe>
  </div>
  <div class="missions-grid" id="missionsCard" hidden aria-hidden="true">
    <div>Loading habits…</div>
  </div>'''
s = replace_once(s, old_missions, new_missions, 'home missions visual')

# Remove explicitly retired Home skill surfaces, leaving their JS harmlessly dormant.
start = s.find('  <!-- Your Skills (v10.65')
end = s.find('</div><!-- .page -->', start)
if start < 0 or end < 0:
    raise SystemExit('Home skills/core removal anchors missing')
removed = s[start:end]
if 'id="focusGrid"' not in removed or 'id="coreSkills"' not in removed:
    raise SystemExit('Home skills/core removal safety check failed')
s = s[:start] + s[end:]

# Daily challenge uses the level of the challenge's own skill, never max(Core, Calisthenics).
old_challenge = '''  let lvl = 1;
  try {
    if (window.getCharacter && window.xpToLevel) {
      const sk = (window.getCharacter().skills) || {};
      const cal = window.xpToLevel((sk.calisthenics||{}).xp || 0);
      const core = window.xpToLevel((sk.core||{}).xp || 0);
      lvl = Math.max(cal, core);
    }
  } catch(e){}
  const band = wcBandFor(lvl);
  const eligible = WORKOUT_CHALLENGES.filter(c => (c.minBand || 1) <= band);
  const pool = eligible.length ? eligible : WORKOUT_CHALLENGES;
  const base = pool[((doy % pool.length)+pool.length)%pool.length];
  const factor = WC_SCALE[band] || 1;
  return Object.assign({}, base, { target: wcScaleTarget(base.target, factor), level: lvl });'''
new_challenge = '''  const levels = { calisthenics:1, core:1 };
  try {
    if (window.getCharacter && window.xpToLevel) {
      const sk = (window.getCharacter().skills) || {};
      levels.calisthenics = window.xpToLevel((sk.calisthenics||{}).xp || 0);
      levels.core = window.xpToLevel((sk.core||{}).xp || 0);
    }
  } catch(e){}
  const eligible = WORKOUT_CHALLENGES.filter(c => (c.minBand || 1) <= wcBandFor(levels[c.skill] || 1));
  const pool = eligible.length ? eligible : WORKOUT_CHALLENGES.filter(c => (c.minBand || 1) <= 1);
  const base = pool[((doy % pool.length)+pool.length)%pool.length];
  const lvl = levels[base.skill] || 1;
  const band = wcBandFor(lvl);
  const factor = WC_SCALE[band] || 1;
  return Object.assign({}, base, { target: wcScaleTarget(base.target, factor), level: lvl });'''
s = replace_once(s, old_challenge, new_challenge, 'daily challenge per-skill level')

# Gratitude all-time word cloud, with safe DOM text and simple count/date detail.
old_render_grat = '''function renderGratitude(){
  const box=document.getElementById('gratTags'); if(!box) return;
  const t=todayStr();
  // v10.28: prefer the dedicated race-safe store; fall back to the old
  // per-day field, then the aggregate, so nothing already stored is lost.
  let words = (typeof window.getGratitudeWordsFor==='function') ? window.getGratitudeWordsFor(t) : [];
  if(!words.length){
    const dd=gratDailyLoad();
    words = Array.isArray(dd.gratitudeWords) ? dd.gratitudeWords.slice() : [];
  }
  if(!words.length){
    // backward-compat: afleiden uit het aggregaat voor vandaag
    const items=gratLoad();
    words = Object.entries(items).filter(([,d])=>d.lastDate===t).map(([w])=>w);
  }
  box.innerHTML=words.map(w=>'<span class="grat-tag">'+escapeHtml(w)+'</span>').join('');
}'''
new_render_grat = '''function renderGratitude(){
  const box=document.getElementById('gratTags'); if(!box) return;
  const items=gratLoad();
  const entries=Object.entries(items).filter(([,d])=>d&&Number(d.count)>0)
    .sort((a,b)=>(Number(b[1].count)||0)-(Number(a[1].count)||0)||String(a[0]).localeCompare(String(b[0])));
  box.textContent='';
  if(!entries.length){
    const empty=document.createElement('div'); empty.className='grat-empty';
    empty.textContent='Your gratitude board grows here — repeated words become bigger.';
    box.appendChild(empty); return;
  }
  const max=Math.max(...entries.map(([,d])=>Number(d.count)||1));
  const today=todayStr();
  entries.forEach(([key,d])=>{
    const count=Math.max(1,Number(d.count)||1);
    const weight=max<=1?0:Math.log(count)/Math.log(max);
    const btn=document.createElement('button'); btn.type='button'; btn.className='grat-word'+(d.lastDate===today?' recent':'');
    btn.textContent=d.label||key;
    btn.style.setProperty('--grat-size',(13+Math.round(weight*20))+'px');
    btn.style.setProperty('--grat-opacity',String(.62+weight*.38));
    btn.setAttribute('aria-label',(d.label||key)+' · grateful '+count+' times');
    btn.addEventListener('click',()=>openGratitudeWord(key));
    box.appendChild(btn);
  });
}
window.openGratitudeWord=function(key){
  const d=gratLoad()[key]; if(!d) return;
  const old=document.getElementById('gratWordBg'); if(old) old.remove();
  const bg=document.createElement('div'); bg.id='gratWordBg';
  bg.style.cssText='position:fixed;inset:0;z-index:9300;background:rgba(21,20,15,.42);display:flex;align-items:flex-end;justify-content:center;padding:0';
  const card=document.createElement('div'); card.style.cssText='width:min(520px,100%);background:#fff;border-radius:22px 22px 0 0;padding:22px 20px calc(24px + env(safe-area-inset-bottom));box-shadow:0 -20px 60px rgba(0,0,0,.16)';
  const word=document.createElement('div'); word.style.cssText="font-family:'Schibsted Grotesk',sans-serif;font-weight:800;font-size:27px;letter-spacing:-.03em"; word.textContent=d.label||key;
  const count=document.createElement('div'); count.style.cssText='font-size:13px;color:#2E8B5F;font-weight:700;margin-top:4px'; count.textContent='Grateful '+(Number(d.count)||0)+'×';
  const dates=document.createElement('div'); dates.style.cssText='font-size:11px;color:#6F6C63;margin-top:10px'; dates.textContent='First: '+(d.firstDate||'—')+' · Latest: '+(d.lastDate||'—');
  const close=document.createElement('button'); close.type='button'; close.textContent='Close'; close.style.cssText='width:100%;margin-top:18px;border:0;border-radius:12px;background:#15140F;color:white;padding:12px;font-weight:800'; close.addEventListener('click',()=>bg.remove());
  card.append(word,count,dates,close); bg.appendChild(card); bg.addEventListener('click',e=>{if(e.target===bg)bg.remove()}); document.body.appendChild(bg);
};'''
s = replace_once(s, old_render_grat, new_render_grat, 'gratitude render')
s = replace_once(
    s,
    "  if(!items[key]) items[key]={ count:0, firstDate:todayStr(), lastDate:todayStr() };\n  items[key].count++; items[key].lastDate=todayStr();",
    "  if(!items[key]) items[key]={ count:0, firstDate:todayStr(), lastDate:todayStr(), label:word };\n  if(!items[key].label) items[key].label=word;\n  items[key].count++; items[key].lastDate=todayStr();",
    'gratitude label preservation'
)

# Keep embedded Park in sync when browsing/backfilling mission days.
s = replace_once(s, '  renderMissions();\n};\nwindow.toggleMissionsDay=', "  renderMissions();\n  try{window.dispatchEvent(new Event('gamenfy:daily-mission-change'));}catch(e){}\n};\nwindow.toggleMissionsDay=", 'mission day iframe sync')
write(path, s)

# -----------------------------------------------------------------------------
# Canonical sync scope: Project HQ inbox must be owner-cloud durable.
# -----------------------------------------------------------------------------
path = 'xp.js'
s = read(path)
s = replace_once(
    s,
    "'rpg_routes_v1','po_coach_weights'",
    "'rpg_routes_v1','po_coach_weights','rpg_project_hq_notes_v1'",
    'Project HQ sync key'
)
write(path, s)

# Character / Ventures cockpit gets an explicit HQ link.
path = 'character.html'
s = read(path)
s = replace_once(
    s,
    '''    <button class="skills-tab-btn" id="labViewBtn" onclick="location.href='lab.html'">🧪 Lab</button>''',
    '''    <button class="skills-tab-btn" id="labViewBtn" onclick="location.href='lab.html'">🧪 Lab</button>\n    <button class="skills-tab-btn" id="hqViewBtn" onclick="location.href='project-hq.html'">🗂 HQ</button>''',
    'Character HQ toolbar link'
)
write(path, s)

# -----------------------------------------------------------------------------
# Park smoke: update interaction contract from hold-to-complete to circle tap.
# -----------------------------------------------------------------------------
path = 'tests/park31-smoke.js'
s = read(path)
s = replace_once(
    s,
    "  closest(selector){return selector==='[data-mission]'&&this.dataset.mission?this:null;}",
    "  closest(selector){if(selector==='[data-mission]'&&this.dataset.mission)return this;if(selector==='[data-p31-toggle]'&&this.dataset.p31Toggle)return this;return null;}",
    'Park test closest helper'
)
s = replace_once(s, "assert.match(source,/var HOLD_MS=560/);", "assert.doesNotMatch(source,/HOLD_MS/,'long-press completion is retired');\nassert.match(source,/data-p31-toggle/,'each mission exposes a dedicated tap completion control');", 'Park hold assertion')
old_pointer = '''const walkingSlot=new Element('walking-slot');walkingSlot.dataset.mission='walking';
const pointerEvent={target:walkingSlot,pointerType:'touch',button:0,pointerId:7,clientX:20,clientY:30,preventDefault(){this.prevented=true;}};
ids.p31Roster.listeners.pointerdown(pointerEvent);ids.p31Roster.listeners.pointerup(pointerEvent);
assert.equal(ids.p31Modal.hidden,false);assert.equal(ids.p31ModalTitle.textContent,'Steps');assert.equal(ids.p31ModalLevel.textContent,'Level 0');assert.equal(ids.p31ModalState.textContent,'STARTER');assert.equal(ids.p31ModalProgress.style.width,'0%');assert.equal(missionToggles.length,0);'''
new_pointer = '''const walkingSlot=new Element('walking-slot');walkingSlot.dataset.mission='walking';
const openEvent={target:walkingSlot,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
ids.p31Roster.listeners.click(openEvent);
assert.equal(ids.p31Modal.hidden,false);assert.equal(ids.p31ModalTitle.textContent,'Steps');assert.equal(ids.p31ModalLevel.textContent,'Level 0');assert.equal(ids.p31ModalState.textContent,'STARTER');assert.equal(ids.p31ModalProgress.style.width,'0%');assert.equal(missionToggles.length,0);'''
s = replace_once(s, old_pointer, new_pointer, 'Park tap-open test')
old_hold = '''const holdEvent={target:walkingSlot,pointerType:'touch',button:0,pointerId:8,clientX:20,clientY:30,preventDefault(){this.prevented=true;}};
ids.p31Roster.listeners.pointerdown(holdEvent);runTimeoutsAtLeast(560);ids.p31Roster.listeners.pointerup(holdEvent);runImmediateTimeouts();
assert.deepEqual(missionToggles,['walking'],'holding completes exactly one public mission through host controller');assert.equal(ids.p31Celebration.hidden,false);assert.equal(ids.p31CelebrationMeta.textContent,'LEVEL 1');'''
new_hold = '''const walkingCheck=new Element('walking-check');walkingCheck.dataset.p31Toggle='walking';
const checkEvent={target:walkingCheck,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
ids.p31Roster.listeners.click(checkEvent);runImmediateTimeouts();
assert.deepEqual(missionToggles,['walking'],'circle tap completes exactly one public mission through host controller');assert.equal(ids.p31Celebration.hidden,false);assert.equal(ids.p31CelebrationMeta.textContent,'LEVEL 1');'''
s = replace_once(s, old_hold, new_hold, 'Park hold->circle test')
old_nutri = '''const nutritionSlot=new Element('nutrition-slot');nutritionSlot.dataset.mission='nutrition';
const nutritionTap={target:nutritionSlot,pointerType:'touch',button:0,pointerId:10,clientX:20,clientY:30,preventDefault(){this.prevented=true;}};
ids.p31Roster.listeners.pointerdown(nutritionTap);ids.p31Roster.listeners.pointerup(nutritionTap);assert.equal(ids.p31ModalTitle.textContent,'Nutrition');ids.p31MissionToggle.listeners.click();runImmediateTimeouts();assert.deepEqual(missionToggles,['walking','nutrition']);'''
new_nutri = '''const nutritionSlot=new Element('nutrition-slot');nutritionSlot.dataset.mission='nutrition';
const nutritionTap={target:nutritionSlot,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
ids.p31Roster.listeners.click(nutritionTap);assert.equal(ids.p31ModalTitle.textContent,'Nutrition');ids.p31MissionToggle.listeners.click();runImmediateTimeouts();assert.deepEqual(missionToggles,['walking','nutrition']);'''
s = replace_once(s, old_nutri, new_nutri, 'Park nutrition tap test')
s = s.replace("Tik om te openen'),'public ", "Tik om te openen'),'public ")
write(path, s)

# New regression guard for the sparring-pass contracts.
path = ROOT / 'tests/spar-product-pass-smoke.js'
path.write_text(r'''/* Sparring product pass regression guard — ChatGPT (OpenAI), 2026-09-05 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const park=fs.readFileSync(path.join(root,'park31.js'),'utf8');
const parkPage=fs.readFileSync(path.join(root,'park31.html'),'utf8');
const xp=fs.readFileSync(path.join(root,'xp.js'),'utf8');
const character=fs.readFileSync(path.join(root,'character.html'),'utf8');
const hq=fs.readFileSync(path.join(root,'project-hq.html'),'utf8');
assert.match(home,/park31\.html\?embed=1&amp;mode=missions&amp;privacy=public&amp;surface=home/,'Home embeds public-only Daily Missions 2.0');
assert.doesNotMatch(home,/id="focusGrid"/,'Your Skills surface is removed from Home');
assert.doesNotMatch(home,/id="coreSkills"/,'Core Tracker surface is removed from Home');
assert.match(home,/id="workoutChallengeCard"/,'Daily Challenge remains on Home');
assert.doesNotMatch(home,/lvl\s*=\s*Math\.max\(cal,\s*core\)/,'Daily Challenge no longer uses the stronger unrelated skill');
assert.match(home,/levels\[base\.skill\]/,'Daily Challenge scales from the selected challenge skill');
assert.match(home,/Math\.log\(count\)\/Math\.log\(max\)/,'Gratitude word size grows with repeated use');
assert.match(home,/openGratitudeWord/,'Gratitude words expose a count/date detail');
assert.match(park,/publicOnlyMode=params\.get\('privacy'\)==='public'/,'Park can hide private companions on Home');
assert.doesNotMatch(park,/HOLD_MS/,'Park no longer depends on long press');
assert.match(park,/data-p31-toggle/,'Park exposes tap-circle controls');
assert.match(park,/5000/,'Park fallback polling is throttled');
assert.match(parkPage,/park31\.js\?v=1\.15/,'Park page loads the new interaction version');
assert.match(xp,/rpg_project_hq_notes_v1/,'Project HQ feedback inbox is in canonical owner-cloud sync scope');
assert.match(character,/project-hq\.html/,'Project HQ is reachable from the Skills\/Ventures cockpit');
assert.match(hq,/PROJECT-HQ-STATE\.json/);assert.match(hq,/WEBSITE-VENTURES-HQ-STATE\.json/);assert.match(hq,/rpg_project_hq_notes_v1/);
console.log('Spar product pass smoke: Daily Missions 2.0, Home cleanup, challenge, Gratitude and Project HQ contracts passed.');
''',encoding='utf-8')

print('Sparring implementation patch applied successfully.')
