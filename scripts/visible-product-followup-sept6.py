from pathlib import Path


def replace_once(path, old, new, label):
    p = Path(path)
    s = p.read_text()
    if old not in s:
        raise SystemExit(f'{label}: anchor missing in {path}')
    p.write_text(s.replace(old, new, 1))

# 1) Fitbit: use the authenticated Supabase client directly, owner-scoped.
replace_once(
    'auth.js',
    "script.src = 'autohabit-reconcile.js?v=11.8';",
    "script.src = 'autohabit-reconcile.js?v=11.9';",
    'autohabit runtime cache bump'
)

p = Path('autohabit-reconcile.js')
s = p.read_text()
s = s.replace(
    "   v11.8 keeps the retry-safe v11.6 XP ledger but indexes the retained XP audit\n   once per reconciliation pass. Manual-off inference and crash-after-addXP\n   evidence therefore share one consistent snapshot instead of repeatedly\n   parsing/scanning the near-cap character log for every Fitbit day. */",
    "   v11.9 keeps the retry-safe ledger and reads health_fitbit + rpg through the\n   authenticated Supabase client, explicitly scoped to the current owner. This\n   avoids the PWA raw-REST read path that could leave Body and auto-completion\n   waiting even while the owner row was healthy in the cloud. */"
)
s = s.replace(
    "  var STATE_URL = 'https://ttxjsoahmtennnufgeqx.supabase.co/rest/v1/app_state?key=in.(health_fitbit,rpg)&select=key,data,updated_at';\n",
    "  var CLOUD_KEYS = ['health_fitbit', 'rpg'];\n"
)
old = """      var response, rows, healthRow, rpgRow, byDate, remoteRpg, remoteMs;
      try {
        response = await window.gamenfyAuthedFetch(STATE_URL);
        if (!response || !response.ok) return 0;
        rows = await response.json();
        healthRow = (rows || []).find(function (row) { return row && row.key === 'health_fitbit'; });
        rpgRow = (rows || []).find(function (row) { return row && row.key === 'rpg'; });
        byDate = healthRow && healthRow.data;
        remoteRpg = rpgRow && rpgRow.data;
        remoteMs = rpgRow && rpgRow.updated_at ? (Date.parse(rpgRow.updated_at) || 0) : 0;
      } catch (e) { return 0; }
"""
new = """      var rows, healthRow, rpgRow, byDate, remoteRpg, remoteMs;
      try {
        var cloudClient = window.gamenfySupabase;
        var ownerId = window.gamenfyUserId;
        if (!cloudClient || !ownerId) return 0;
        var cloudResult = await cloudClient
          .from('app_state')
          .select('key,data,updated_at')
          .eq('user_id', ownerId)
          .in('key', CLOUD_KEYS);
        if (!cloudResult || cloudResult.error) return 0;
        rows = cloudResult.data || [];
        healthRow = rows.find(function (row) { return row && row.key === 'health_fitbit'; });
        rpgRow = rows.find(function (row) { return row && row.key === 'rpg'; });
        byDate = healthRow && healthRow.data;
        remoteRpg = rpgRow && rpgRow.data;
        remoteMs = rpgRow && rpgRow.updated_at ? (Date.parse(rpgRow.updated_at) || 0) : 0;
      } catch (e) { return 0; }
"""
if old not in s:
    raise SystemExit('autohabit cloud-read block missing')
s = s.replace(old, new, 1)
p.write_text(s)

p = Path('character.html')
s = p.read_text()
old = """  try{
    const r2 = await window.gamenfyAuthedFetch(HM_SB_URL+'/rest/v1/app_state?key=eq.health_fitbit&select=data');
    if(r2.ok){
      fitbitReadSucceeded = true;
      const rows2 = await r2.json();
      const fb = (rows2[0]||{}).data || {};
      for(const [k,v] of Object.entries(fb)){
"""
new = """  try{
    const cloudClient = window.gamenfySupabase;
    const ownerId = window.gamenfyUserId;
    if(!cloudClient || !ownerId) throw new Error('Authenticated Fitbit client not ready');
    const read = await cloudClient
      .from('app_state')
      .select('data')
      .eq('user_id', ownerId)
      .eq('key', 'health_fitbit')
      .maybeSingle();
    if(read && !read.error && read.data){
      fitbitReadSucceeded = true;
      const fb = read.data.data || {};
      for(const [k,v] of Object.entries(fb)){
"""
if old not in s:
    raise SystemExit('Character Fitbit raw REST block missing')
s = s.replace(old, new, 1)
s = s.replace(
    "// Cache only after the authenticated Fitbit read actually completed. A\n  // transient auth/network failure must be retryable on the next view/focus.",
    "// Cache only after the authenticated owner-scoped Supabase read completed.\n  // A transient auth/network failure remains retryable on the next view/focus.",
    1
)
p.write_text(s)

# 2) Daily Missions: visually unify the anonymized private quests and publish an overall Daily Level summary.
p = Path('park31.js')
s = p.read_text()
s = s.replace(
    "   Public roster follows the canonical 11 Daily Missions. Private dailies remain\n   available as a separate companion group and never replace public missions.",
    "   Public membership remains canonical under the hood. On Joey's personal Home,\n   the two anonymized private quests are presented in the same roster as every\n   other Daily Mission so they do not receive a separate attention-grabbing block."
)
anchor = """  var MISSIONS=PUBLIC_MISSIONS.concat(PRIVATE_MISSIONS);
"""
insert = """  var MISSIONS=PUBLIC_MISSIONS.concat(PRIVATE_MISSIONS);
  var DISPLAY_MISSIONS=[
    'budgeting','sleep','nutrition','walking','teeth','household','weed_control',
    'meditation','gratitude','good_deed','screen_time','no_porn','cold_shower'
  ].map(function(key){return MISSIONS.find(function(item){return item.key===key;});}).filter(Boolean);
"""
if anchor not in s: raise SystemExit('Park mission display anchor missing')
s = s.replace(anchor, insert, 1)
s = s.replace("    if(mission.private)return 'Private daily · 10 companion stages';\n", "    if(mission.private)return '10 evolution levels';\n", 1)
s = s.replace("+(mission.private?' is-private':'')", "", 1)
s = s.replace("+(mission.private?' is-private':'')+'\">'", "+'\">'", 1)
s = s.replace("+(selected.private?' · PRIVATE':'')", "", 1)
old = """  function renderRoster(){
    if(!rosterEl)return;
    var markup=PUBLIC_MISSIONS.map(rosterCard).join('');
    if(!publicOnlyMode){
      markup+='<div class=\"p31-roster-divider\"><strong>Private dailies</strong><span>PIN-backed · apart van de publieke 11</span></div>'
        +PRIVATE_MISSIONS.map(rosterCard).join('');
    }
    if(rosterEl.innerHTML!==markup)rosterEl.innerHTML=markup;
    rosterCountEl.textContent=publicOnlyMode?(PUBLIC_MISSIONS.length+' public'):(PUBLIC_MISSIONS.length+' public · '+PRIVATE_MISSIONS.length+' private');
    notifyEmbedHeight();
  }
"""
new = """  function notifyMissionSummary(){
    if(window.parent===window||!window.parent||typeof window.parent.postMessage!=='function')return;
    var shown=publicOnlyMode?PUBLIC_MISSIONS:DISPLAY_MISSIONS;
    var levels=shown.map(function(mission){return levelInfo(mission).raw;});
    var total=levels.reduce(function(sum,value){return sum+Number(value||0);},0);
    var overall=levels.length?Math.round((total/levels.length)*10)/10:0;
    var completed=missionMode?shown.filter(function(mission){return isDone(mission);}).length:0;
    try{window.parent.postMessage({type:'gamenfy:park31-summary',overallLevel:overall,missionCount:shown.length,completedToday:completed},location.origin);}catch(e){}
  }
  function renderRoster(){
    if(!rosterEl)return;
    var shown=publicOnlyMode?PUBLIC_MISSIONS:DISPLAY_MISSIONS;
    var markup=shown.map(rosterCard).join('');
    if(rosterEl.innerHTML!==markup)rosterEl.innerHTML=markup;
    rosterCountEl.textContent=shown.length+' missions';
    notifyMissionSummary();
    notifyEmbedHeight();
  }
"""
if old not in s: raise SystemExit('Park separated roster block missing')
s = s.replace(old, new, 1)
p.write_text(s)

p = Path('park31.html')
s = p.read_text()
s = s.replace('<script src="park31.js?v=1.16" defer></script>','<script src="park31.js?v=1.17" defer></script>',1)
s = s.replace('De elf publieke Daily Missions volgen exact dezelfde live levels als Main en Character. De twee PIN-backed private dailies staan apart eronder.','Je Daily Missions staan in één roster. De twee geanonimiseerde persoonlijke quests gebruiken intern nog hun bestaande beveiligde route, maar krijgen visueel geen aparte sectie.',1)
s = s.replace('<span><strong>Daily Mission companions</strong><small>11 public · 2 private · live mission state</small></span>\n      <span id="p31RosterCount">11 public · 2 private</span>','<span><strong>Daily Mission companions</strong><small>13 missions · één persoonlijke roster · live state</small></span>\n      <span id="p31RosterCount">13 missions</span>',1)
p.write_text(s)

# 3) Home: lightweight overall Daily Level placeholder (future character slot), fed by Park.
p = Path('index.html')
s = p.read_text()
old = """  <!-- Day Score retired visually. DOM kept hidden until Joey chooses the new health/mission visualization. -->
  <div class=\"sec-head\" style=\"display:none\" aria-hidden=\"true\">Day Score</div>
  <div class=\"day-arc-card\" id=\"dayArcCard\" style=\"display:none\" aria-hidden=\"true\">
"""
new = """  <!-- Daily Level replaces the old Day Score with a mission-only 0–10 aggregate.\n       The CSS crest is intentionally a single placeholder slot: Joey can later swap\n       it for an approved level 1–10 character set without rebuilding the logic. -->
  <div id=\"dailyLevelCard\" style=\"display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,#171712,#27251d);color:#fff;border-radius:18px;padding:14px 15px;margin:0 0 12px;box-shadow:0 12px 28px -24px rgba(21,20,15,.8)\">
    <div aria-hidden=\"true\" style=\"width:62px;height:62px;flex:0 0 62px;border-radius:20px;display:grid;place-items:center;background:radial-gradient(circle at 35% 28%,#fff7c9 0 5%,#d7b84a 6% 18%,#766425 38%,#28251a 72%);border:1px solid rgba(255,255,255,.18);box-shadow:inset 0 1px 0 rgba(255,255,255,.2)\"><span style=\"font-size:25px;filter:drop-shadow(0 2px 5px rgba(0,0,0,.35))\">✦</span></div>
    <div style=\"min-width:0;flex:1\">
      <div style=\"font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#d9d2ac\">Daily Level</div>
      <div style=\"display:flex;align-items:baseline;gap:5px;margin-top:2px\"><strong id=\"dailyLevelValue\" style=\"font-size:28px;line-height:1;font-variant-numeric:tabular-nums\">—</strong><span style=\"font-size:11px;color:#aaa58d\">/ 10</span></div>
      <div style=\"height:5px;border-radius:99px;background:rgba(255,255,255,.11);overflow:hidden;margin-top:8px\"><i id=\"dailyLevelFill\" style=\"display:block;height:100%;width:0;background:linear-gradient(90deg,#b89735,#f2d570);border-radius:99px;transition:width .35s ease\"></i></div>
      <div id=\"dailyLevelMeta\" style=\"font-size:10px;color:#aaa58d;margin-top:5px\">Daily Missions laden…</div>
    </div>
  </div>

  <!-- Legacy Day Score DOM remains hidden for rollback/history only. -->
  <div class=\"sec-head\" style=\"display:none\" aria-hidden=\"true\">Day Score</div>
  <div class=\"day-arc-card\" id=\"dayArcCard\" style=\"display:none\" aria-hidden=\"true\">
"""
if old not in s: raise SystemExit('Home old Day Score anchor missing')
s = s.replace(old,new,1)
s = s.replace('surface=home&amp;v=1.16','surface=home&amp;v=1.17',1)
old = """window.addEventListener('message', function(event){
  if(event.origin !== location.origin || !event.data || event.data.type !== 'gamenfy:park31-height') return;
  const frame=document.getElementById('dailyMissions2Frame');
  const h=Math.max(820,Math.min(1900,Number(event.data.height)||0));
  if(frame && h) frame.style.height=h+'px';
});
"""
new = """window.addEventListener('message', function(event){
  if(event.origin !== location.origin || !event.data) return;
  if(event.data.type === 'gamenfy:park31-height'){
    const frame=document.getElementById('dailyMissions2Frame');
    const h=Math.max(820,Math.min(1900,Number(event.data.height)||0));
    if(frame && h) frame.style.height=h+'px';
    return;
  }
  if(event.data.type === 'gamenfy:park31-summary'){
    const level=Math.max(0,Math.min(10,Number(event.data.overallLevel)||0));
    const count=Math.max(0,Number(event.data.missionCount)||0);
    const done=Math.max(0,Number(event.data.completedToday)||0);
    const value=document.getElementById('dailyLevelValue');
    const fill=document.getElementById('dailyLevelFill');
    const meta=document.getElementById('dailyLevelMeta');
    if(value)value.textContent=level.toFixed(1);
    if(fill)fill.style.width=(level*10)+'%';
    if(meta)meta.textContent=done+'/'+count+' vandaag voltooid · gemiddelde mission level';
  }
});
"""
if old not in s: raise SystemExit('Home Park message listener missing')
s = s.replace(old,new,1)
p.write_text(s)

# 4) Navigation: Lab belongs to Jarvis, with a safe explicit return token.
replace_once('jarvis.html','href="lab.html">🧪 Lab</a>','href="lab.html?from=jarvis">🧪 Lab</a>','Jarvis Lab origin token')
p = Path('lab.html')
s = p.read_text()
old = '<a href="character.html" style="display:inline-block;font-size:12px;font-weight:700;color:var(--muted);text-decoration:none;margin-bottom:10px">‹ Terug naar Skills</a>'
new = '''<a id="labBackLink" href="jarvis.html" style="display:inline-block;font-size:12px;font-weight:700;color:var(--muted);text-decoration:none;margin-bottom:10px">‹ Terug naar Jarvis</a>\n  <script>\n  (function(){\n    var from=new URLSearchParams(location.search).get('from');\n    var routes={jarvis:{href:'jarvis.html',label:'‹ Terug naar Jarvis'},ventures:{href:'finance.html?tab=ventures',label:'‹ Terug naar Ventures'}};\n    var target=routes[from]||routes.jarvis;\n    var link=document.getElementById('labBackLink');\n    if(link){link.href=target.href;link.textContent=target.label;}\n  })();\n  </script>'''
if old not in s: raise SystemExit('Lab old Skills back link missing')
s = s.replace(old,new,1)
p.write_text(s)

# Finance can be opened directly into Ventures, which makes the Lab return deterministic.
p = Path('finance.html')
s = p.read_text()
old = """  const savedTab = storeGet(TAB_KEY);
  setActiveTab(savedTab && ['net','subs','wish','ventures','debts'].includes(savedTab) ? savedTab : 'net');
"""
new = """  const validTabs = ['net','subs','wish','ventures','debts'];
  const requestedTab = new URLSearchParams(location.search).get('tab');
  const savedTab = storeGet(TAB_KEY);
  setActiveTab(validTabs.includes(requestedTab) ? requestedTab : (validTabs.includes(savedTab) ? savedTab : 'net'));
"""
if old not in s: raise SystemExit('Finance active-tab anchor missing')
s = s.replace(old,new,1)
p.write_text(s)

# 5) Restore the older boxed Venture overview, while keeping a separate Venture Lab + Production Line.
ventures_html = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#F4F3EF">
<title>Ventures — Gamenfy</title>
<link rel="manifest" href="manifest.json">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="auth.js?v=11.0" defer></script>
<script src="sync.js?v=11.9" defer></script>
<script src="xp.js?v=10.98" defer></script>
<script src="ventures.js?v=11.1" defer></script>
<style>
:root{--bg:#F4F3EF;--card:#fff;--ink:#15140F;--muted:#6F6C63;--faint:#A6A399;--line:#E8E6DF;--strong:#DBD8CF;--gold:#C9A227;--ember:#D4633E;--green:#2E8B5F;--violet:#7567C9;--font:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;--display:"Schibsted Grotesk",var(--font)}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font);-webkit-font-smoothing:antialiased}body{padding:18px 16px 36px}.vw-shell{max-width:760px;margin:0 auto}.vw-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:13px}.vw-kicker{font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--violet)}.vw-title{font-family:var(--display);font-size:25px;font-weight:800;letter-spacing:-.025em;margin-top:3px}.vw-sub{font-size:12px;line-height:1.45;color:var(--muted);margin-top:4px;max-width:560px}.vw-back{border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:12px;padding:8px 11px;text-decoration:none;font-weight:700;font-size:12px}.vw-spacebar{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:4px;border:1px solid var(--strong);border-radius:15px;background:rgba(255,255,255,.65);margin-bottom:14px;position:sticky;top:4px;z-index:20;backdrop-filter:blur(12px)}.vw-space{border:0;border-radius:11px;background:transparent;color:var(--muted);padding:10px 7px;font-size:11px;font-weight:800;cursor:pointer}.vw-space.on{background:var(--ink);color:#fff}.vw-panel[hidden]{display:none!important}.vw-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.venture-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px;cursor:pointer;overflow:hidden;min-width:0;box-shadow:0 1px 2px rgba(0,0,0,.025)}.venture-card:active{border-color:var(--strong);transform:scale(.99)}.venture-hero{width:calc(100% + 32px);height:108px;object-fit:cover;display:block;margin:-14px -16px 10px}.venture-top{display:flex;align-items:baseline;justify-content:space-between;gap:9px}.venture-name{font-family:var(--display);font-weight:800;font-size:16px}.venture-count{font:700 10px ui-monospace,"SF Mono",monospace;color:var(--muted);white-space:nowrap}.venture-tagline{font-size:11px;color:var(--muted);margin-top:3px;line-height:1.4}.venture-bar{height:5px;border-radius:3px;background:var(--line);margin-top:10px;overflow:hidden}.venture-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--violet),var(--gold));border-radius:3px}.venture-next{font-size:10.5px;font-weight:700;margin-top:8px;line-height:1.35}.vw-card{background:var(--card);border:1px solid var(--line);border-radius:17px;padding:15px 16px;margin-bottom:12px}.vw-card-title{font-family:var(--display);font-weight:800;font-size:15px}.vw-card-sub{font-size:11px;color:var(--muted);line-height:1.5;margin-top:3px}.vw-tools{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.vw-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:10px;padding:9px 11px;text-decoration:none;font-size:11px;font-weight:800;border:1px solid var(--strong);background:var(--bg);color:var(--ink)}.vw-btn.primary{background:var(--ink);color:#fff;border-color:var(--ink)}.lab-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.lab-select{border:1px solid var(--strong);background:var(--bg);color:var(--ink);border-radius:10px;padding:8px 9px;font-weight:700;max-width:48%}.lab-progress{height:6px;background:var(--bg);border:1px solid var(--line);border-radius:99px;overflow:hidden;margin:11px 0}.lab-progress i{display:block;height:100%;background:linear-gradient(90deg,var(--violet),var(--gold))}.note-tabs{display:flex;gap:6px;margin:10px 0 8px}.note-tabs button{flex:1;padding:8px;border:1px solid var(--line);border-radius:9px;background:var(--bg);color:var(--muted);font-size:11px;font-weight:800}.note-tabs button.on{background:var(--ink);color:#fff;border-color:var(--ink)}.vw-note{width:100%;min-height:120px;border:1px solid var(--strong);border-radius:12px;padding:11px 12px;background:var(--bg);color:var(--ink);font:13px/1.5 var(--font);resize:vertical;outline:none}.vw-note:focus{border-color:var(--violet);box-shadow:0 0 0 3px rgba(117,103,201,.1);min-height:200px}.vw-phase{font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);margin:18px 2px 8px}.vw-step{display:grid;grid-template-columns:25px 1fr auto;gap:9px;align-items:start;padding:10px 0;border-bottom:1px solid var(--line)}.vw-step:last-child{border-bottom:none}.vw-step-dot{width:22px;height:22px;border-radius:50%;border:1px solid var(--strong);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--faint)}.vw-step.done .vw-step-dot{background:var(--green);border-color:var(--green);color:#fff}.vw-step-title{font-size:13px;font-weight:800}.vw-step-desc{font-size:11px;color:var(--muted);line-height:1.45;margin-top:2px}.vw-step button{border:1px solid var(--strong);background:var(--bg);color:var(--ink);border-radius:9px;padding:7px 9px;font-size:10px;font-weight:800}.vw-step.done button{display:none}.pipeline-grid{display:grid;gap:8px}.pipe{border:1px solid var(--line);border-radius:13px;padding:12px;background:linear-gradient(135deg,rgba(117,103,201,.05),rgba(201,162,39,.04))}.pipe strong{font-size:12px;display:block}.pipe span{font-size:10.5px;line-height:1.45;color:var(--muted);display:block;margin-top:3px}.vw-empty{padding:28px 12px;text-align:center;color:var(--muted);font-size:12px}.scope-note{font-size:9px;color:var(--faint);margin-top:10px;line-height:1.45}body.is-embedded{padding:4px 4px 28px}body.is-embedded .vw-back{display:none}@media(max-width:540px){.vw-grid{grid-template-columns:1fr}.venture-hero{height:124px}.vw-space{font-size:10px;padding:9px 4px}.lab-head{display:block}.lab-select{max-width:none;width:100%;margin-top:9px}}
</style>
</head>
<body data-gamenfy-scope="personal">
<div class="vw-shell">
  <div class="vw-head"><div><div class="vw-kicker">Finance · Ventures</div><div class="vw-title">Ventures</div><div class="vw-sub">Elke venture blijft zijn eigen blok. Websitebouw, Grip, Gamenfy en toekomstige ideeën delen dezelfde Gamenfy-data, maar hun werkruimtes lopen niet door elkaar.</div></div><a class="vw-back" href="finance.html?tab=ventures">Finance</a></div>
  <nav class="vw-spacebar" aria-label="Venture ruimtes"><button class="vw-space on" data-space="overview">Ventures</button><button class="vw-space" data-space="lab">Venture Lab</button><button class="vw-space" data-space="pipeline">Productielijn</button></nav>
  <section class="vw-panel" id="space-overview"><div class="vw-grid" id="ventureGrid"><div class="vw-empty">Ventures laden…</div></div><div class="vw-card" style="margin-top:12px"><div class="vw-card-title">Builder tools</div><div class="vw-card-sub">Algemene projecttools blijven apart van het Venture Lab.</div><div class="vw-tools"><a class="vw-btn primary" target="_top" href="project-hq.html">Headquarters</a><a class="vw-btn" target="_top" href="lab.html?from=ventures">General Lab</a></div><div class="scope-note">Deze Finance → Ventures workspace is persoonlijk gemarkeerd en kan later uit een publieke Gamenfy-build worden weggelaten.</div></div></section>
  <section class="vw-panel" id="space-lab" hidden><div id="ventureLab"><div class="vw-empty">Venture Lab laden…</div></div></section>
  <section class="vw-panel" id="space-pipeline" hidden><div class="vw-card"><div class="vw-card-title">Visual production line</div><div class="vw-card-sub">Eerst bepalen wat we echt nodig hebben; pas daarna assets/characters/video in bulk produceren.</div></div><div class="pipeline-grid" id="pipelineList"></div></section>
</div>
<script>
(function(){
'use strict';
const NOTES_KEY='rpg_venture_notes_v1';
let activeId='sell_websites', notePane='venture', activeSpace='overview';
const qs=new URLSearchParams(location.search); if(qs.get('embed')==='1')document.body.classList.add('is-embedded'); if(qs.get('venture'))activeId=qs.get('venture'); if(['overview','lab','pipeline'].includes(qs.get('space')))activeSpace=qs.get('space');
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function loadNotes(){try{return JSON.parse(localStorage.getItem(NOTES_KEY))||{};}catch(e){return{};}}
function notePair(id){const raw=loadNotes()[id];if(raw&&typeof raw==='object')return{personal:raw.personal||'',venture:raw.venture||''};return{personal:'',venture:typeof raw==='string'?raw:''};}
function saveNote(id,pane,value){const all=loadNotes(),pair=notePair(id);pair[pane]=value;all[id]=pair;try{localStorage.setItem(NOTES_KEY,JSON.stringify(all));}catch(e){}}
function data(){return window.Ventures&&window.Ventures.load?window.Ventures.load():{ventures:[]};}
function progress(v){return window.Ventures&&window.Ventures.progress?window.Ventures.progress(v):{done:0,total:0};}
function next(v){return window.Ventures&&window.Ventures.nextStep?window.Ventures.nextStep(v):null;}
function setSpace(space){activeSpace=space;document.querySelectorAll('.vw-space').forEach(b=>b.classList.toggle('on',b.dataset.space===space));document.querySelectorAll('.vw-panel').forEach(p=>p.hidden=p.id!=='space-'+space);if(space==='lab')renderLab();if(space==='pipeline')renderPipeline();try{window.parent.postMessage({type:'gamenfy:ventures-height',height:document.documentElement.scrollHeight},location.origin);}catch(e){}}
function renderOverview(){const ventures=(data().ventures||[]).filter(v=>v.status!=='archived');const box=document.getElementById('ventureGrid');if(!ventures.length){box.innerHTML='<div class="vw-empty">No ventures yet.</div>';return;}box.innerHTML=ventures.map(v=>{const p=progress(v),nx=next(v),pct=p.total?Math.round(p.done/p.total*100):0;return '<article class="venture-card" data-venture="'+esc(v.id)+'">'+(v.hero?'<img class="venture-hero" src="'+esc(v.hero)+'" alt="" loading="lazy">':'')+'<div class="venture-top"><div class="venture-name">'+esc(v.name)+'</div><div class="venture-count">'+p.done+'/'+p.total+' steps</div></div><div class="venture-tagline">'+esc(v.tagline||'')+'</div><div class="venture-bar"><i style="width:'+pct+'%"></i></div><div class="venture-next">'+(nx?'Next: '+esc(nx.step.title)+(nx.step.minutes?' · ~'+nx.step.minutes+' min':''):'Completed')+'</div></article>';}).join('');box.querySelectorAll('[data-venture]').forEach(card=>card.addEventListener('click',()=>{activeId=card.dataset.venture;notePane='venture';setSpace('lab');}));}
function renderLab(){const ventures=(data().ventures||[]).filter(v=>v.status!=='archived');if(!ventures.some(v=>v.id===activeId))activeId=ventures[0]&&ventures[0].id;const v=ventures.find(x=>x.id===activeId),box=document.getElementById('ventureLab');if(!v){box.innerHTML='<div class="vw-empty">No venture selected.</div>';return;}const p=progress(v),pct=p.total?Math.round(p.done/p.total*100):0,pair=notePair(v.id);let html='<div class="vw-card"><div class="lab-head"><div><div class="vw-kicker">Venture Lab</div><div class="vw-card-title" style="font-size:19px;margin-top:3px">'+esc(v.name)+'</div><div class="vw-card-sub">'+esc(v.tagline||'')+'</div></div><select class="lab-select" id="ventureSelect">'+ventures.map(x=>'<option value="'+esc(x.id)+'"'+(x.id===v.id?' selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select></div><div class="lab-progress"><i style="width:'+pct+'%"></i></div><div class="venture-count">'+p.done+'/'+p.total+' steps · '+pct+'%</div><div class="note-tabs"><button data-pane="personal" class="'+(notePane==='personal'?'on':'')+'">🙂 Personal</button><button data-pane="venture" class="'+(notePane==='venture'?'on':'')+'">💼 Venture</button></div><textarea class="vw-note" id="ventureNote" placeholder="'+(notePane==='personal'?'Thoughts for yourself…':'Prospects, build notes, experiments, next actions…')+'">'+esc(pair[notePane])+'</textarea></div>';
(v.phases||[]).forEach(ph=>{html+='<div class="vw-phase">'+esc(ph.name)+'</div><div class="vw-card">';(ph.steps||[]).forEach(st=>{html+='<div class="vw-step'+(st.done?' done':'')+'"><div class="vw-step-dot">'+(st.done?'✓':'')+'</div><div><div class="vw-step-title">'+esc(st.title)+'</div><div class="vw-step-desc">'+esc(st.detail||'')+'</div></div><button data-step="'+esc(st.id)+'">Done</button></div>';});html+='</div>';});box.innerHTML=html;document.getElementById('ventureSelect').addEventListener('change',e=>{activeId=e.target.value;notePane='venture';renderLab();});box.querySelectorAll('[data-pane]').forEach(b=>b.addEventListener('click',()=>{notePane=b.dataset.pane;renderLab();}));const area=document.getElementById('ventureNote');if(area)area.addEventListener('input',()=>saveNote(v.id,notePane,area.value));box.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{if(window.Ventures&&window.Ventures.completeStep){window.Ventures.completeStep(v.id,b.dataset.step);renderLab();renderOverview();}}));}
function renderPipeline(){const build=(data().ventures||[]).find(v=>v.id==='app_vormgeving'),box=document.getElementById('pipelineList'),steps=[];((build&&build.phases)||[]).filter(ph=>['vp','pipe'].includes(ph.id)).forEach(ph=>(ph.steps||[]).forEach(st=>steps.push({phase:ph.name,step:st})));box.innerHTML=steps.length?steps.map(x=>'<div class="pipe"><strong>'+(x.step.done?'✓ ':'')+esc(x.step.title)+'</strong><span>'+esc(x.step.detail||'')+'</span></div>').join(''):'<div class="vw-empty">Production queue not loaded yet.</div>';}
function render(){renderOverview();renderLab();renderPipeline();setSpace(activeSpace);}
async function boot(){try{if(window.gamenfyAuthReady)await window.gamenfyAuthReady;}catch(e){}for(let i=0;i<80&&!window.Ventures;i++)await new Promise(r=>setTimeout(r,50));render();try{if(window.initCloudSync)window.initCloudSync({appKey:'rpg',syncedKeys:window.RPG_SYNC_KEYS,syncedPrefixes:window.RPG_SYNC_PREFIXES,onApplied:render});}catch(e){}}
document.querySelectorAll('.vw-space').forEach(b=>b.addEventListener('click',()=>setSpace(b.dataset.space)));window.addEventListener('storage',e=>{if(!e.key||e.key==='rpg_ventures_v1'||e.key===NOTES_KEY)render();});document.addEventListener('DOMContentLoaded',boot,{once:true});
})();
</script>
</body>
</html>'''
Path('ventures-workspace.html').write_text(ventures_html)

# 6) Contract tests for the follow-up and update intentionally changed old assertions.
p = Path('tests/autohabit-session-loader-smoke.js')
s = p.read_text().replace("autohabit-reconcile.js?v=11.8","autohabit-reconcile.js?v=11.9")
p.write_text(s)

p = Path('tests/park31-smoke.js')
s = p.read_text()
s = s.replace("for(const label of ['Gardening','Discipline'])assert.match(ids.p31Roster.innerHTML,new RegExp(label+'[\\\\s\\\\S]*Private daily'),'private '+label+' stays available but explicitly private');\nassert.match(ids.p31Roster.innerHTML,/Private dailies[\\s\\S]*apart van de publieke 11/,'private cards are visually separated from public membership');",
              "for(const label of ['Gardening','Discipline'])assert.match(ids.p31Roster.innerHTML,new RegExp(label+'[\\\\s\\\\S]*10 evolution levels'),'anonymized '+label+' is available in the unified personal roster');\nassert.doesNotMatch(ids.p31Roster.innerHTML,/Private dailies|apart van de publieke 11|is-private/,'personal roster does not visually separate private quests');")
s = s.replace("assert.equal(ids.p31RosterCount.textContent,'11 public · 2 private');","assert.equal(ids.p31RosterCount.textContent,'13 missions');")
s = s.replace("assert.match(page,/park31\\.js\\?v=1\\.16/);assert.match(page,/11 public · 2 private/);","assert.match(page,/park31\\.js\\?v=1\\.17/);assert.match(page,/13 missions/);")
s = s.replace("console.log('Park 3.1 smoke test passed: canonical public 11, separate private 2, fallbacks, assets and interactions.');","console.log('Park 3.1 smoke test passed: canonical membership stays separate internally while Joey personal roster is visually unified.');")
p.write_text(s)

followup_test = r'''/* Visible product follow-up contract — Joey walkthrough 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const home=read('index.html'), park=read('park31.js'), page=read('park31.html'), lab=read('lab.html'), jarvis=read('jarvis.html'), finance=read('finance.html'), ventures=read('ventures-workspace.html'), character=read('character.html'), auto=read('autohabit-reconcile.js');
assert.match(home,/id="dailyLevelCard"/,'Home has a Daily Level replacement for Day Score');
assert.match(home,/gamenfy:park31-summary/,'Home listens to the canonical Park summary');
assert.match(park,/DISPLAY_MISSIONS/,'Park has an explicit unified personal display order');
assert.match(park,/gamenfy:park31-summary/,'Park publishes mission-only overall level');
assert.doesNotMatch(park,/Private dailies<\/strong>|apart van de publieke 11/,'private quests are not a visual subsection');
assert.match(page,/13 missions · één persoonlijke roster/,'Park copy is visually unified');
assert.match(lab,/id="labBackLink"[\s\S]*href="jarvis\.html"/,'Lab defaults back to Jarvis, never Skills/Body');
assert.match(lab,/finance\.html\?tab=ventures/,'Lab can return safely to Ventures');
assert.doesNotMatch(lab,/Terug naar Skills/,'Lab no longer claims Skills ownership');
assert.match(jarvis,/lab\.html\?from=jarvis/,'Jarvis stamps the Lab return origin');
assert.match(finance,/new URLSearchParams\(location\.search\)\.get\('tab'\)/,'Finance accepts deterministic tab deep-link');
for(const venture of ['Grip','Websites Verkopen','Gamenfy Public','Gamenfy Build']) assert.ok(read('ventures.js').includes("name: '"+venture+"'"),venture+' remains in canonical venture data');
assert.match(ventures,/data-space="overview"/);assert.match(ventures,/data-space="lab"/);assert.match(ventures,/data-space="pipeline"/);
assert.match(ventures,/class="venture-card"/,'Ventures restores boxed card overview');
assert.match(ventures,/Venture Lab/,'Ventures has a distinct venture-specific Lab');
assert.match(ventures,/General Lab/,'General Lab stays separate from Venture Lab');
assert.doesNotMatch(ventures,/>Personal module</i,'loud Personal Module chip is removed');
assert.match(character,/window\.gamenfySupabase[\s\S]*\.from\('app_state'\)[\s\S]*\.eq\('user_id', ownerId\)[\s\S]*\.eq\('key', 'health_fitbit'\)[\s\S]*\.maybeSingle\(\)/,'Body reads Fitbit via authenticated explicit-owner Supabase client');
assert.doesNotMatch(character,/gamenfyAuthedFetch\(HM_SB_URL\+'\/rest\/v1\/app_state\?key=eq\.health_fitbit/,'Body no longer depends on raw REST health read');
assert.match(auto,/window\.gamenfySupabase[\s\S]*\.eq\('user_id', ownerId\)[\s\S]*\.in\('key', CLOUD_KEYS\)/,'auto habit reconciliation reads both cloud rows via owner-scoped Supabase client');
assert.doesNotMatch(auto,/STATE_URL|gamenfyAuthedFetch\(STATE_URL\)/,'autohabit no longer uses raw REST state URL');
console.log('Visible follow-up smoke passed: unified missions, Daily Level, owner-scoped Fitbit reads, restored Ventures structure and deterministic Lab returns.');'''
Path('tests/visible-product-followup-smoke.js').write_text(followup_test)

print('visible follow-up patch applied')
