from pathlib import Path
import re, json


def read(path):
    return Path(path).read_text()

def write(path, text):
    Path(path).write_text(text)

def replace_once(text, old, new, label):
    count=text.count(old)
    if count!=1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    return text.replace(old,new,1)

# -----------------------------------------------------------------------------
# FINANCE: Portfolio tab -> Ventures workspace. Portfolio implementation remains
# dormant so Joey can restore it later without reconstructing its data model.
# -----------------------------------------------------------------------------
p='finance.html'; s=read(p)
portfolio_btn='''  <button class="bot-tab" data-tab="portfolio">\n    <span class="bot-tab-icon">📈</span>\n    <span class="bot-tab-label">Portfolio</span>\n  </button>'''
ventures_btn='''  <button class="bot-tab" data-tab="ventures">\n    <span class="bot-tab-icon">🚀</span>\n    <span class="bot-tab-label">Ventures</span>\n  </button>'''
s=replace_once(s, portfolio_btn, ventures_btn, 'finance portfolio tab')
needle='''<!-- ===== DEBTS (v10.64) ===== -->'''
ventures_section='''<!-- ===== VENTURES — personal business workspace ===== -->\n<div class="section" data-section="ventures" hidden data-gamenfy-scope="personal">\n  <div class="section-title">\n    <span class="section-title-text">VENTURES</span>\n  </div>\n  <div class="card" style="padding:0;overflow:hidden;background:var(--bg);border-color:var(--glass-border)">\n    <iframe src="ventures-workspace.html?embed=1" title="Ventures workspace" id="venturesWorkspaceFrame"\n      style="display:block;width:100%;height:calc(100dvh - 205px);min-height:720px;border:0;background:#F4F3EF" loading="eager"></iframe>\n  </div>\n</div>\n\n<!-- ===== DEBTS (v10.64) ===== -->'''
s=replace_once(s, needle, ventures_section, 'finance ventures section')
s=replace_once(s,
    "setActiveTab(savedTab && ['net','subs','wish','portfolio','debts'].includes(savedTab) ? savedTab : 'net');",
    "setActiveTab(savedTab && ['net','subs','wish','ventures','debts'].includes(savedTab) ? savedTab : 'net');",
    'finance tab allow list')
write(p,s)

# -----------------------------------------------------------------------------
# CHARACTER: Skills means Skills + Goals only. Fix health auth/cache behavior and
# stale copy. Existing Ventures functions stay dormant for backwards compatibility.
# -----------------------------------------------------------------------------
p='character.html'; s=read(p)
old_toolbar='''  <div class="skills-toolbar">\n    <button class="skills-tab-btn active" id="skillsViewBtn" onclick="setSkillsView('skills')">⚔️ Skills</button>\n    <button class="skills-tab-btn" id="goalsViewBtn" onclick="setSkillsView('goals')">🎯 Goals</button>\n    <button class="skills-tab-btn" id="venturesViewBtn" onclick="setSkillsView('ventures')">💼 Ventures</button>\n    <button class="skills-tab-btn" id="labViewBtn" onclick="location.href='lab.html'">🧪 Lab</button>\n    <button class="skills-tab-btn" id="hqViewBtn" onclick="location.href='project-hq.html'">🗂 HQ</button>\n  </div>'''
new_toolbar='''  <div class="skills-toolbar" aria-label="Skill views">\n    <button class="skills-tab-btn active" id="skillsViewBtn" onclick="setSkillsView('skills')">⚔️ Skills</button>\n    <button class="skills-tab-btn" id="goalsViewBtn" onclick="setSkillsView('goals')">🎯 Goals</button>\n  </div>'''
s=replace_once(s,old_toolbar,new_toolbar,'character skills toolbar')
old_set='''  document.getElementById('skillsViewBtn').classList.toggle('active', view==='skills');\n  document.getElementById('goalsViewBtn').classList.toggle('active', view==='goals');\n  document.getElementById('venturesViewBtn').classList.toggle('active', view==='ventures');'''
new_set='''  document.getElementById('skillsViewBtn').classList.toggle('active', view==='skills');\n  document.getElementById('goalsViewBtn').classList.toggle('active', view==='goals');\n  const venturesBtn = document.getElementById('venturesViewBtn');\n  if(venturesBtn) venturesBtn.classList.toggle('active', view==='ventures');'''
s=replace_once(s,old_set,new_set,'character view buttons')
old_fetch='''async function hmFetchAll(){\n  if(hmData) return hmData;\n  const out = { byDate:{}, hevy:{}, lastHealthDate:null };'''
new_fetch='''async function hmFetchAll(force){\n  if(hmData && !force) return hmData;\n  // Character used to call the authed Fitbit endpoint before auth.js had\n  // restored the session, swallow that failure, then cache the empty object\n  // forever. That made a healthy Fitbit feed look "paused" until a reload.\n  try { if(window.gamenfyAuthReady) await window.gamenfyAuthReady; } catch(e) { return hmData || { byDate:{}, hevy:{}, lastHealthDate:null }; }\n  const out = { byDate:{}, hevy:{}, lastHealthDate:null };\n  let fitbitReadSucceeded = false;'''
s=replace_once(s,old_fetch,new_fetch,'character health auth gate')
old_ok='''    if(r2.ok){\n      const rows2 = await r2.json();'''
new_ok='''    if(r2.ok){\n      fitbitReadSucceeded = true;\n      const rows2 = await r2.json();'''
s=replace_once(s,old_ok,new_ok,'character fitbit success flag')
old_cache='''  hmData = out;\n  return out;\n}'''
new_cache='''  // Cache only after the authenticated Fitbit read actually completed. A\n  // transient auth/network failure must be retryable on the next view/focus.\n  if(fitbitReadSucceeded) hmData = out;\n  return out;\n}'''
s=replace_once(s,old_cache,new_cache,'character health cache')
old_banner='''function hmStaleBanner(d){\n  const last = d && d.lastHealthDate;\n  if(!last) return '<div class="hm-stale">Nog geen gezondheidsdata binnen. '\n    + 'Fitbit koppelen is tijdelijk gepauzeerd tijdens de accountbeveiliging.</div>';\n  const p = last.split('-').map(Number);\n  const days = Math.round((new Date(hmDateStr(0)) - new Date(p[0], p[1]-1, p[2])) / 86400000);\n  if(days < 2) return '';\n  return '<div class="hm-stale"><b>Gezondheidsdata staat stil.</b> Laatste meting: '+last\n    + ' (' + days + ' dagen geleden) \\u2014 de cijfers hieronder zijn dus verouderd. '\n    + 'Opnieuw koppelen is tijdelijk gepauzeerd tijdens de accountbeveiliging.</div>';\n}'''
new_banner='''function hmStaleBanner(d){\n  const last = d && d.lastHealthDate;\n  if(!last) return '<div class="hm-stale"><b>Nog geen Fitbit-data geladen.</b> Open Body opnieuw of trek even omlaag nadat je bent ingelogd; de app probeert de cloudfeed opnieuw.</div>';\n  const p = last.split('-').map(Number);\n  const days = Math.round((new Date(hmDateStr(0)) - new Date(p[0], p[1]-1, p[2])) / 86400000);\n  if(days < 2) return '';\n  return '<div class="hm-stale"><b>Gezondheidsdata staat stil.</b> Laatste meting: '+last\n    + ' (' + days + ' dagen geleden) \\u2014 de cijfers hieronder zijn dus verouderd. '\n    + 'Gamenfy probeert Fitbit automatisch opnieuw te lezen zodra je de app opent.</div>';\n}'''
s=replace_once(s,old_banner,new_banner,'character stale Fitbit banner')
insert_after='''async function loadHealthMetrics(){\n  const grid = document.getElementById('hmGrid');'''
# no replacement here; add listeners after loadHealthMetrics closing using unique marker
marker='''// v9.18: Google Health-stijl metric detail (gekloond layout, Daylight-skin)'''
health_refresh='''// Auth may become ready after Body's first render. Always invalidate an empty\n// pre-auth view and fetch the real Fitbit row without requiring a manual reload.\nwindow.addEventListener('gamenfy-auth-ready', function(){\n  hmData = null;\n  loadHealthMetrics();\n  renderBodyComposition();\n});\nwindow.addEventListener('focus', function(){\n  const body = document.getElementById('tab-body');\n  if(body && body.classList.contains('active') && (!hmData || !hmData.lastHealthDate)){\n    hmData = null; loadHealthMetrics();\n  }\n});\n\n// v9.18: Google Health-stijl metric detail (gekloond layout, Daylight-skin)'''
s=replace_once(s,marker,health_refresh,'character health refresh listeners')
write(p,s)

# -----------------------------------------------------------------------------
# JARVIS: make Lab/HQ part of the Jarvis/settings hub rather than Skills.
# -----------------------------------------------------------------------------
p='jarvis.html'; s=read(p)
s=replace_once(s,
'''.jv-empty { text-align:center; color:var(--muted); font-size:13px; line-height:1.6; margin:auto; padding:30px; }\n.jv-empty b { font-family:var(--font-display); font-size:16px; color:var(--ink); display:block; margin-bottom:6px; }''',
'''.jv-empty { text-align:center; color:var(--muted); font-size:13px; line-height:1.6; margin:auto; padding:30px; }\n.jv-empty b { font-family:var(--font-display); font-size:16px; color:var(--ink); display:block; margin-bottom:6px; }\n.jv-hubnav{display:flex;gap:7px;padding:8px 14px;border-bottom:1px solid var(--line);background:var(--bg);overflow-x:auto;scrollbar-width:none}\n.jv-hubnav::-webkit-scrollbar{display:none}.jv-hub{flex-shrink:0;text-decoration:none;border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:999px;padding:7px 12px;font-size:11px;font-weight:800}.jv-hub.active{background:var(--ink);border-color:var(--ink);color:#F4F3EF}''',
'jarvis hub css')
s=replace_once(s,
'''  </div>\n  <div class="jv-msgs" id="jvMsgs">''',
'''  </div>\n  <nav class="jv-hubnav" aria-label="Jarvis workspace">\n    <a class="jv-hub active" href="jarvis.html">🤖 Jarvis</a>\n    <a class="jv-hub" href="lab.html">🧪 Lab</a>\n    <a class="jv-hub" href="project-hq.html">🗂 Headquarters</a>\n  </nav>\n  <div class="jv-msgs" id="jvMsgs">''',
'jarvis hub markup')
write(p,s)

# -----------------------------------------------------------------------------
# HOME: retire clutter, make DM2 all-personal + auto-height, style gratitude.
# Keep Day Arc DOM hidden so legacy renderers do not crash; replacement is a
# separate design decision Joey explicitly wants to spar about.
# -----------------------------------------------------------------------------
p='index.html'; s=read(p)
s=replace_once(s,
'''  <!-- Day Arc -->\n  <div class="sec-head">Day Score</div>\n  <div class="day-arc-card" id="dayArcCard">''',
'''  <!-- Day Score retired visually. DOM kept hidden until Joey chooses the new health/mission visualization. -->\n  <div class="sec-head" style="display:none" aria-hidden="true">Day Score</div>\n  <div class="day-arc-card" id="dayArcCard" style="display:none" aria-hidden="true">''',
'home Day Score hide')
s=replace_once(s,
'''  <div id="checkinWrap" style="display:none">''',
'''  <div id="checkinWrap" style="display:none!important" data-retired="true">''',
'home checkin retire')
s=replace_once(s,
'''  <div id="weeklyWrap" style="display:none">''',
'''  <div id="weeklyWrap" style="display:none!important" data-retired="true">''',
'home weekly retire')
s=replace_once(s,
'''  <div class="choice-card" onclick="openChoiceGate()">''',
'''  <div class="choice-card" onclick="openChoiceGate()" style="display:none!important" data-retired="true" aria-hidden="true">''',
'home free time retire')
s=replace_once(s,
'''src="park31.html?embed=1&amp;mode=missions&amp;privacy=public&amp;surface=home&amp;v=1.15" style="display:block;width:100%;height:720px;border:0;background:transparent"''',
'''src="park31.html?embed=1&amp;mode=missions&amp;privacy=all&amp;surface=home&amp;v=1.16" style="display:block;width:100%;height:1180px;min-height:820px;border:0;background:transparent"''',
'home DM2 privacy/height')
s=replace_once(s,
'''  <div class="missions-grid" id="missionsCard" hidden aria-hidden="true">''',
'''  <div class="missions-grid" id="missionsCard" hidden aria-hidden="true" style="display:none!important">''',
'home legacy missions hard hide')
s=replace_once(s,
'''  <div class="grat-card">''',
'''  <div class="grat-card grat-playful" id="gratitudeHomeCard">''',
'home gratitude id')
# Add gratitude visual CSS before end style, using an existing nearby marker.
css_marker='''</style>\n</head>'''
grat_css='''.grat-card.grat-playful{position:relative;overflow:hidden;border:0;background:linear-gradient(135deg,#fff 0%,#fff7d8 42%,#eee8ff 100%);box-shadow:0 8px 26px rgba(21,20,15,.07);transition:border-radius .35s ease,transform .2s ease}.grat-card.grat-playful::before,.grat-card.grat-playful::after{content:'';position:absolute;border-radius:50%;pointer-events:none;filter:blur(.2px)}.grat-card.grat-playful::before{width:110px;height:110px;right:-38px;top:-42px;background:rgba(255,159,123,.22)}.grat-card.grat-playful::after{width:82px;height:82px;left:-28px;bottom:-32px;background:rgba(117,103,201,.15)}.grat-card.grat-playful>*{position:relative;z-index:1}.grat-card.grat-shape-0{border-radius:30px 30px 30px 10px}.grat-card.grat-shape-1{border-radius:42% 58% 34% 66% / 34% 35% 65% 66%;padding:24px 20px}.grat-card.grat-shape-2{clip-path:polygon(7% 12%,22% 5%,38% 12%,50% 3%,63% 12%,79% 5%,93% 13%,96% 88%,82% 96%,64% 91%,50% 98%,34% 91%,17% 96%,4% 87%);padding:24px 24px 22px}.grat-card.grat-shape-3{border-radius:50px 18px 50px 18px;background:linear-gradient(135deg,#e6fbf2,#fff4ca 46%,#f4e9ff)}.grat-card.grat-shape-4{border-radius:999px;padding:22px 24px;background:linear-gradient(110deg,#fff1ee,#f6edff,#eaf9f1)}\n</style>\n</head>'''
s=replace_once(s,css_marker,grat_css,'home gratitude css')
# Add behavior before helper script starts.
js_marker='''<script>\n// ── Helpers ──────────────────────────────────────────────────'''
js_add='''<script>\n// Home surface polish: DM2 reports its content height and Gratitude rotates a\n// deterministic playful silhouette every five calendar days.\nwindow.addEventListener('message', function(event){\n  if(event.origin !== location.origin || !event.data || event.data.type !== 'gamenfy:park31-height') return;\n  const frame=document.getElementById('dailyMissions2Frame');\n  const h=Math.max(820,Math.min(1900,Number(event.data.height)||0));\n  if(frame && h) frame.style.height=h+'px';\n});\nfunction applyGratitudeShape(){\n  const card=document.getElementById('gratitudeHomeCard'); if(!card)return;\n  const bucket=Math.floor(Date.now()/86400000/5)%5;\n  for(let i=0;i<5;i++)card.classList.toggle('grat-shape-'+i,i===bucket);\n}\nif(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyGratitudeShape,{once:true});else applyGratitudeShape();\n\n// ── Helpers ──────────────────────────────────────────────────'''
s=replace_once(s,js_marker,js_add,'home DM height/gratitude script')
write(p,s)

# -----------------------------------------------------------------------------
# PARK31: useful mission copy under art + notify parent of actual content height.
# -----------------------------------------------------------------------------
p='park31.js'; s=read(p)
s=s.replace("var VERSION='1.15';","var VERSION='1.16';",1)
old_label='''  function artworkLabel(mission){\n    if(mission.fallback==='budgeting')return 'Park 2 fallback · native evolution pending';\n    if(mission.fallback==='meditation')return 'Park 2 3-stage fallback · native evolution pending';\n    if(mission.private)return 'Private daily · 10 companion stages';\n    return '10 evolution levels';\n  }'''
new_label='''  function artworkLabel(mission){\n    if(mission.fallback==='budgeting')return 'Park 2 fallback · native evolution pending';\n    if(mission.fallback==='meditation')return 'Park 2 3-stage fallback · native evolution pending';\n    if(mission.private)return 'Private daily · 10 companion stages';\n    return '10 evolution levels';\n  }\n  function missionCopy(mission){\n    var w=hostWindow(),def={};\n    try{def=(w.RPG_DEFAULT_SKILLS||{})[mission.key]||{};}catch(e){}\n    var text=String(def.habitDesc||def.why||'').trim();\n    if(text)return text;\n    var fallback={\n      budgeting:'Blijf bewust binnen je budget en houd je geldplan actueel.',\n      nutrition:'Eet vandaag zoals je toekomstige lichaam nodig heeft.',\n      teeth:'Poets je tanden en houd je mondroutine op orde.',\n      household:'Doe vandaag één echte reset van je huis.',\n      meditation:'Neem bewust tijd om je aandacht stil te zetten.',\n      gratitude:'Schrijf vandaag minimaal één ding op waar je dankbaar voor bent.',\n      good_deed:'Doe vandaag bewust iets goeds voor iemand anders.',\n      screen_time:'Houd gedachteloos schermgebruik vandaag onder controle.',\n      cold_shower:'Pak vandaag je afgesproken koude douche/rinse.',\n      weed_control:'Blijf vandaag binnen je afgesproken gardening-grens.',\n      no_porn:'Houd vandaag je discipline-afspraak.'\n    };\n    return fallback[mission.key]||artworkLabel(mission);\n  }\n  function notifyEmbedHeight(){\n    if(window.parent===window)return;\n    requestAnimationFrame(function(){\n      try{\n        var h=Math.ceil(Math.max(document.body.scrollHeight,document.documentElement.scrollHeight));\n        window.parent.postMessage({type:'gamenfy:park31-height',height:h},location.origin);\n      }catch(e){}\n    });\n  }'''
s=replace_once(s,old_label,new_label,'park mission copy helper')
s=replace_once(s,
"+'<span class=\"p31-slot-copy\"><strong>'+mission.label+'</strong><small>'+artworkLabel(mission)+'</small><em>'+(missionMode?instruction:(ready?'Tik om te openen':'artwork pending'))+'</em></span>'",
"+'<span class=\"p31-slot-copy\"><strong>'+mission.label+'</strong><small title=\"'+artworkLabel(mission)+'\">'+missionCopy(mission)+'</small><em>'+(missionMode?instruction:(ready?'Tik om te openen':'artwork pending'))+'</em></span>'",
'park roster copy')
s=replace_once(s,
'''    rosterCountEl.textContent=publicOnlyMode?(PUBLIC_MISSIONS.length+' public'):(PUBLIC_MISSIONS.length+' public · '+PRIVATE_MISSIONS.length+' private');\n  }''',
'''    rosterCountEl.textContent=publicOnlyMode?(PUBLIC_MISSIONS.length+' public'):(PUBLIC_MISSIONS.length+' public · '+PRIVATE_MISSIONS.length+' private');\n    notifyEmbedHeight();\n  }''',
'park height notify')
s=replace_once(s,
'''    if(homeSurface)document.body.classList.add('p31-home');''',
'''    if(homeSurface)document.body.classList.add('p31-home');\n    if(window.parent!==window)window.addEventListener('load',notifyEmbedHeight,{once:true});\n    window.addEventListener('resize',notifyEmbedHeight);''',
'park height events')
write(p,s)

# -----------------------------------------------------------------------------
# ROUTES: book photo opens as a useful full-screen viewer. A separate change
# button retains replacement. Future photos save at useful viewer resolution.
# -----------------------------------------------------------------------------
p='routes.html'; s=read(p)
s=replace_once(s,
'''  <div class="rt-book" id="rtBook" onclick="rtPickBookPhoto()">\n    <img id="rtBookImg" alt="" style="display:none">\n    <div class="rt-book-empty" id="rtBookEmpty">📖<span>Foto toevoegen</span></div>\n  </div>\n  <input type="file" accept="image/*" id="rtBookInput" style="display:none" onchange="rtBookPhotoChosen(this)">''',
'''  <div class="rt-book" id="rtBook" onclick="rtBookTap()" title="Tik om de boekfoto groot te bekijken">\n    <img id="rtBookImg" alt="ANWB wandelboek" style="display:none">\n    <div class="rt-book-empty" id="rtBookEmpty">📖<span>Foto toevoegen</span></div>\n  </div>\n  <button class="rt-book-change" id="rtBookChange" type="button" onclick="rtPickBookPhoto()" style="display:none">Wijzig foto</button>\n  <input type="file" accept="image/*" id="rtBookInput" style="display:none" onchange="rtBookPhotoChosen(this)">''',
'routes book markup')
s=replace_once(s,
'''.rt-book.has-photo { border-style:solid; border-color:rgba(255,255,255,0.18); }''',
'''.rt-book.has-photo { border-style:solid; border-color:var(--line-strong); }\n.rt-book-change{display:block;margin:-8px auto 14px;border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:999px;padding:7px 12px;font-size:10px;font-weight:800;cursor:pointer}\n.rt-book-viewer{position:fixed;inset:0;z-index:9900;background:rgba(10,10,8,.88);display:flex;align-items:center;justify-content:center;padding:max(18px,env(safe-area-inset-top)) 16px max(18px,env(safe-area-inset-bottom));backdrop-filter:blur(12px)}\n.rt-book-viewer[hidden]{display:none}.rt-book-viewer img{display:block;max-width:min(94vw,800px);max-height:86vh;object-fit:contain;border-radius:16px;box-shadow:0 18px 70px rgba(0,0,0,.42)}.rt-book-close{position:fixed;right:18px;top:max(18px,env(safe-area-inset-top));width:40px;height:40px;border:0;border-radius:50%;background:#fff;color:#15140F;font-size:24px;cursor:pointer}''',
'routes book CSS')
s=replace_once(s,
'''<div class="rt-toast" id="rtToast"></div>''',
'''<div class="rt-toast" id="rtToast"></div>\n<div class="rt-book-viewer" id="rtBookViewer" hidden onclick="if(event.target===this)rtCloseBookViewer()">\n  <button class="rt-book-close" type="button" onclick="rtCloseBookViewer()" aria-label="Sluiten">×</button>\n  <img id="rtBookViewerImg" alt="ANWB wandelboek groot">\n</div>''',
'routes viewer markup')
s=replace_once(s,
'''  if(src){ img.src = src; img.style.display='block'; empty.style.display='none'; wrap.classList.add('has-photo'); }\n  else { img.style.display='none'; empty.style.display='flex'; wrap.classList.remove('has-photo'); }\n}\nwindow.rtPickBookPhoto = function(){''',
'''  const change=document.getElementById('rtBookChange');\n  if(src){ img.src = src; img.style.display='block'; empty.style.display='none'; wrap.classList.add('has-photo'); if(change)change.style.display='block'; }\n  else { img.style.display='none'; empty.style.display='flex'; wrap.classList.remove('has-photo'); if(change)change.style.display='none'; }\n}\nwindow.rtBookTap = function(){\n  let src=null; try{src=localStorage.getItem(RT_BOOK_KEY);}catch(e){}\n  if(!src){ window.rtPickBookPhoto(); return; }\n  const viewer=document.getElementById('rtBookViewer'),img=document.getElementById('rtBookViewerImg');\n  if(viewer&&img){img.src=src;viewer.hidden=false;document.documentElement.style.overflow='hidden';}\n};\nwindow.rtCloseBookViewer = function(){const viewer=document.getElementById('rtBookViewer');if(viewer)viewer.hidden=true;document.documentElement.style.overflow='';};\nwindow.rtPickBookPhoto = function(){''',
'routes photo actions')
s=replace_once(s,
'''  if(has && !confirm('Foto vervangen?')) return;\n  const inp = document.getElementById('rtBookInput');''',
'''  if(has && !confirm('Foto vervangen?')) return;\n  const inp = document.getElementById('rtBookInput');''',
'routes confirm preserved')
s=replace_once(s,
'''      // downscale to max 400px on the long edge — plenty for a 96px thumbnail\n      const max = 400;''',
'''      // Keep enough resolution for the full-screen viewer while avoiding a\n      // multi-megabyte localStorage image.\n      const max = 1200;''',
'routes resolution')
s=replace_once(s,
"localStorage.setItem(RT_BOOK_KEY, c.toDataURL('image/jpeg', 0.72));",
"localStorage.setItem(RT_BOOK_KEY, c.toDataURL('image/jpeg', 0.82));",
'routes image quality')
write(p,s)

# -----------------------------------------------------------------------------
# FITBIT RECONCILER: compare cloud/local JSON semantically (jsonb order is not a
# contract), rerun when the RPG baseline really becomes ready, and give baseline
# convergence longer than ~2 seconds. No direct cloud write is added here.
# -----------------------------------------------------------------------------
p='autohabit-reconcile.js'; s=read(p)
s=s.replace('v11.7 keeps the retry-safe v11.6 XP ledger', 'v11.8 keeps the retry-safe v11.6 XP ledger',1)
old_match='''  function localMatchesRemote(key, value) {\n    try { return localStorage.getItem(key) === JSON.stringify(value); }\n    catch (e) { return false; }\n  }'''
new_match='''  function stableJson(value) {\n    if(Array.isArray(value)) return value.map(stableJson);\n    if(value && typeof value==='object'){\n      var out={}; Object.keys(value).sort().forEach(function(k){out[k]=stableJson(value[k]);}); return out;\n    }\n    return value;\n  }\n  function localMatchesRemote(key, value) {\n    try {\n      var raw=localStorage.getItem(key);\n      if(raw===null)return false;\n      return JSON.stringify(stableJson(JSON.parse(raw))) === JSON.stringify(stableJson(value));\n    } catch (e) { return false; }\n  }'''
s=replace_once(s,old_match,new_match,'autohabit semantic baseline')
s=replace_once(s,
'''        if (baselineRetryCount < 2) {\n          baselineRetryCount++;\n          setTimeout(function () { window.autoCheckHealthHabits(refreshKnownMissionUI); }, 700 * baselineRetryCount);\n        }''',
'''        if (baselineRetryCount < 8) {\n          baselineRetryCount++;\n          var retryDelay=Math.min(5000, 450 * baselineRetryCount);\n          setTimeout(function () { window.autoCheckHealthHabits(refreshKnownMissionUI); }, retryDelay);\n        }''',
'autohabit baseline retries')
# Add event triggers near existing focus handlers.
old_focus='''  window.addEventListener('focus', rerunFromFocus);\n  document.addEventListener('visibilitychange', function () {\n    if (!document.hidden) rerunFromFocus();\n  });'''
new_focus='''  window.addEventListener('focus', rerunFromFocus);\n  window.addEventListener('gamenfy:cloud-sync-ready', function(event){\n    if(event && event.detail && event.detail.appKey==='rpg') window.autoCheckHealthHabits(refreshKnownMissionUI);\n  });\n  window.addEventListener('gamenfy:remote-state-applied', function(event){\n    if(!event || !event.detail || !event.detail.appKey || event.detail.appKey==='rpg') window.autoCheckHealthHabits(refreshKnownMissionUI);\n  });\n  document.addEventListener('visibilitychange', function () {\n    if (!document.hidden) rerunFromFocus();\n  });'''
s=replace_once(s,old_focus,new_focus,'autohabit sync event rerun')
write(p,s)

# Auth loader should immediately invoke reconciler after the script becomes usable.
p='auth.js'; s=read(p)
s=replace_once(s,
'''      window.__gamenfyAutohabitSessionLoaderLoaded = true;\n    };''',
'''      window.__gamenfyAutohabitSessionLoaderLoaded = true;\n      try { if(typeof window.autoCheckHealthHabits === 'function') window.autoCheckHealthHabits(); } catch (_error) {}\n    };''',
'auth reconciler kickoff')
s=s.replace("script.src = 'autohabit-reconcile.js?v=11.7';","script.src = 'autohabit-reconcile.js?v=11.8';",1)
write(p,s)

# -----------------------------------------------------------------------------
# Tests: focused visible-product contracts.
# -----------------------------------------------------------------------------
Path('tests/visible-product-sprint-smoke.js').write_text(r'''/* Visible product sprint — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const finance=read('finance.html');
assert.ok(finance.includes('data-tab="ventures"'));
assert.ok(finance.includes('ventures-workspace.html?embed=1'));
assert.ok(!finance.includes('<button class="bot-tab" data-tab="portfolio">'),'Portfolio is parked, not a visible Finance tab');
assert.ok(finance.includes("['net','subs','wish','ventures','debts']"));

const workspace=read('ventures-workspace.html');
assert.ok(workspace.includes('data-gamenfy-scope="personal"'));
assert.ok(workspace.includes('Public export: exclude'));
assert.ok(workspace.includes('Do not create a separate repo'));
assert.ok(workspace.includes('Visual production line'));
assert.ok(workspace.includes("rpg_venture_notes_v1"));

const character=read('character.html');
const toolbar=character.slice(character.indexOf('<div class="skills-toolbar"'),character.indexOf('<!-- SKILLS VIEW -->'));
assert.ok(toolbar.includes('⚔️ Skills')&&toolbar.includes('🎯 Goals'));
assert.ok(!toolbar.includes('Ventures')&&!toolbar.includes('Lab')&&!toolbar.includes('HQ'));
assert.ok(character.includes('await window.gamenfyAuthReady'));
assert.ok(character.includes('if(fitbitReadSucceeded) hmData = out'));
assert.ok(!character.includes('Fitbit koppelen is tijdelijk gepauzeerd tijdens de accountbeveiliging'));

const home=read('index.html');
assert.ok(home.includes('id="dayArcCard" style="display:none"'));
assert.ok(home.includes('id="checkinWrap" style="display:none!important" data-retired="true"'));
assert.ok(home.includes('id="weeklyWrap" style="display:none!important" data-retired="true"'));
assert.ok(home.includes('privacy=all'));
assert.ok(home.includes('gamenfy:park31-height'));
assert.ok(home.includes('id="gratitudeHomeCard"'));

const park=read('park31.js');
assert.ok(park.includes('function missionCopy(mission)'));
assert.ok(park.includes("type:'gamenfy:park31-height'"));
assert.ok(park.includes("privateKeys:PRIVATE_MISSIONS"));

const routes=read('routes.html');
assert.ok(routes.includes('rtBookTap()'));
assert.ok(routes.includes('rtBookViewer'));
assert.ok(routes.includes('const max = 1200'));

const jarvis=read('jarvis.html');
assert.ok(jarvis.includes('🧪 Lab'));
assert.ok(jarvis.includes('🗂 Headquarters'));

const reconcile=read('autohabit-reconcile.js');
assert.ok(reconcile.includes('function stableJson(value)'));
assert.ok(reconcile.includes("gamenfy:cloud-sync-ready"));
assert.ok(reconcile.includes('baselineRetryCount < 8'));
assert.ok(!reconcile.includes("method: 'POST'"),'reconciler still must not direct-write cloud app_state');
console.log('visible product sprint smoke passed');
''')

print('visible product sprint patched')
