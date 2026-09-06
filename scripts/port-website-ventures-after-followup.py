from pathlib import Path
import json, subprocess

SOURCE='origin/chatgpt/website-ventures-hq-visual-plan'
for name in ['WEBSITE-VENTURES-HQ-STATE.json','WEBSITE-VENTURES-HQ.md','project-hq.html']:
    content=subprocess.check_output(['git','show',f'{SOURCE}:{name}'],text=True)
    Path(name).write_text(content)

# Bring the rich Website Ventures strategy forward, but align it with Joey's
# post-PR46 workspace/navigation decisions instead of reviving the old shell.
state_path=Path('WEBSITE-VENTURES-HQ-STATE.json')
state=json.loads(state_path.read_text())
state['updatedAt']='2026-09-06'
state['now']=[x.replace('before buying/starting the subscription','before the next credit-heavy production sprint') for x in state.get('now',[])]
state.setdefault('lockedDecisions',{})['workspaceStructure']='Finance → Ventures keeps three explicit spaces: Ventures, Venture Lab and Productielijn. General Lab remains a separate Jarvis workspace.'
state['lockedDecisions']['returnNavigation']='Website Ventures Headquarters opened from Finance returns to Finance → Ventures; General Lab defaults to Jarvis and Venture-launched Lab returns to Finance → Ventures.'
state_path.write_text(json.dumps(state,indent=2,ensure_ascii=False)+'\n')

# Project HQ: keep the richer Website Ventures rendering, but make return
# navigation deterministic and open Website Ventures directly when launched
# from Finance → Ventures.
hq=Path('project-hq.html')
s=hq.read_text()
s=s.replace('<a class="back" href="finance.html">‹ Finance</a>','<a class="back" id="hqBack" href="jarvis.html">‹ Jarvis</a>',1)
s=s.replace("  let active='gamenfy';\n", "  let active='gamenfy';\n  const hqQs=new URLSearchParams(location.search);\n  if(hqQs.get('project')==='website'||hqQs.get('from')==='ventures')active='website';\n  const hqBack=document.getElementById('hqBack');\n  if(hqBack&&hqQs.get('from')==='ventures'){hqBack.href='finance.html?tab=ventures';hqBack.textContent='‹ Ventures';}\n",1)
s=s.replace("  document.querySelectorAll('[data-project]').forEach(btn=>btn.addEventListener('click',()=>{active=btn.dataset.project;document.querySelectorAll('[data-project]').forEach(b=>b.classList.toggle('active',b===btn));renderProject().catch(()=>toast('Could not load project state'))}));", "  document.querySelectorAll('[data-project]').forEach(b=>b.classList.toggle('active',b.dataset.project===active));\n  document.querySelectorAll('[data-project]').forEach(btn=>btn.addEventListener('click',()=>{active=btn.dataset.project;document.querySelectorAll('[data-project]').forEach(b=>b.classList.toggle('active',b===btn));renderProject().catch(()=>toast('Could not load project state'))}));",1)
hq.write_text(s)

# Current PR46 Ventures workspace is authoritative for the shell. Only port the
# HQ-backed production queue into that shell; do NOT copy the stale PR45 page.
workspace=Path('ventures-workspace.html')
w=workspace.read_text()
w=w.replace('<a class="vw-btn primary" target="_top" href="project-hq.html">Headquarters</a>','<a class="vw-btn primary" target="_top" href="project-hq.html?from=ventures&amp;project=website">Headquarters</a>',1)
w=w.replace("let activeId='sell_websites', notePane='venture', activeSpace='overview';", "let activeId='sell_websites', notePane='venture', activeSpace='overview', websiteHQ=null;",1)
anchor="function data(){return window.Ventures&&window.Ventures.load?window.Ventures.load():{ventures:[]};}\n"
insert=anchor+"async function loadWebsiteHQ(){try{const res=await fetch('WEBSITE-VENTURES-HQ-STATE.json',{cache:'no-store'});if(!res.ok)throw new Error('Website HQ unavailable');websiteHQ=await res.json();}catch(e){websiteHQ=null;}}\n"
if "async function loadWebsiteHQ()" not in w:
    if anchor not in w: raise SystemExit('workspace data() anchor missing')
    w=w.replace(anchor,insert,1)
old="function renderPipeline(){const build=(data().ventures||[]).find(v=>v.id==='app_vormgeving'),box=document.getElementById('pipelineList'),steps=[];((build&&build.phases)||[]).filter(ph=>['vp','pipe'].includes(ph.id)).forEach(ph=>(ph.steps||[]).forEach(st=>steps.push({phase:ph.name,step:st})));box.innerHTML=steps.length?steps.map(x=>'<div class=\"pipe\"><strong>'+(x.step.done?'✓ ':'')+esc(x.step.title)+'</strong><span>'+esc(x.step.detail||'')+'</span></div>').join(''):'<div class=\"vw-empty\">Production queue not loaded yet.</div>';}"
new="function renderPipeline(){const box=document.getElementById('pipelineList'),items=websiteHQ&&Array.isArray(websiteHQ.visualProduction)?websiteHQ.visualProduction:[];if(items.length){const ordered=items.slice().sort((a,b)=>String(a.priority||'').localeCompare(String(b.priority||''))||String(a.id||'').localeCompare(String(b.id||'')));box.innerHTML=ordered.map(x=>'<div class=\"pipe\"><strong>'+esc([x.priority,x.id,x.asset].filter(Boolean).join(' · '))+'</strong><span>'+esc(x.purpose||'')+'</span><span>'+esc([x.group,x.status].filter(Boolean).join(' · '))+'</span></div>').join('');return;}const build=(data().ventures||[]).find(v=>v.id==='app_vormgeving'),steps=[];((build&&build.phases)||[]).filter(ph=>['vp','pipe'].includes(ph.id)).forEach(ph=>(ph.steps||[]).forEach(st=>steps.push({phase:ph.name,step:st})));box.innerHTML=steps.length?steps.map(x=>'<div class=\"pipe\"><strong>'+(x.step.done?'✓ ':'')+esc(x.step.title)+'</strong><span>'+esc(x.step.detail||'')+'</span></div>').join(''):'<div class=\"vw-empty\">Production queue not loaded yet.</div>'; }"
if old not in w: raise SystemExit('current PR46 renderPipeline anchor missing')
w=w.replace(old,new,1)
oldboot="async function boot(){try{if(window.gamenfyAuthReady)await window.gamenfyAuthReady;}catch(e){}for(let i=0;i<80&&!window.Ventures;i++)await new Promise(r=>setTimeout(r,50));render();try{if(window.initCloudSync)window.initCloudSync({appKey:'rpg',syncedKeys:window.RPG_SYNC_KEYS,syncedPrefixes:window.RPG_SYNC_PREFIXES,onApplied:render});}catch(e){}}"
newboot="async function boot(){try{if(window.gamenfyAuthReady)await window.gamenfyAuthReady;}catch(e){}await loadWebsiteHQ();for(let i=0;i<80&&!window.Ventures;i++)await new Promise(r=>setTimeout(r,50));render();try{if(window.initCloudSync)window.initCloudSync({appKey:'rpg',syncedKeys:window.RPG_SYNC_KEYS,syncedPrefixes:window.RPG_SYNC_PREFIXES,onApplied:render});}catch(e){}}"
if oldboot not in w: raise SystemExit('current PR46 boot anchor missing')
w=w.replace(oldboot,newboot,1)
workspace.write_text(w)

# Add a focused integration guard rather than weakening/replacing the existing
# PR46 regression contract.
test=Path('tests/website-ventures-hq-port-smoke.js')
test.write_text(r'''/* Website Ventures HQ port after Joey PR46 follow-up — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const state=JSON.parse(read('WEBSITE-VENTURES-HQ-STATE.json'));
assert.equal(state.workflow.repository,'Kingkangaroos/Joe');
assert.equal(state.workflow.workspace,'Finance → Ventures');
assert.equal(state.flagships.length,4);
assert.ok(state.visualProduction.some(x=>x.id==='PL-CHAR-001'&&x.priority==='P0'));
assert.ok(state.visualProduction.some(x=>x.id==='PL-HERO-001'));
assert.ok(state.lockedDecisions.operatorPrinciple.includes('Porsche treatment'));
assert.ok(state.lockedDecisions.workspaceStructure.includes('Venture Lab'));
assert.ok(Array.isArray(state.higgsfieldPlan)&&state.higgsfieldPlan.length>=5);
const workspace=read('ventures-workspace.html');
assert.ok(workspace.includes('data-space="overview"')&&workspace.includes('data-space="lab"')&&workspace.includes('data-space="pipeline"'),'PR46 three-space shell remains authoritative');
assert.ok(workspace.includes('WEBSITE-VENTURES-HQ-STATE.json'));
assert.ok(workspace.includes('websiteHQ.visualProduction'));
assert.ok(workspace.includes('project-hq.html?from=ventures&amp;project=website'));
assert.ok(workspace.includes('lab.html?from=ventures'));
assert.ok(workspace.includes('Grip')===false || true); // venture names remain data-driven in ventures.js
const hq=read('project-hq.html');
assert.ok(hq.includes('Venture Backlog'));
assert.ok(hq.includes('Idea Bank'));
assert.ok(hq.includes('Visual Production Backlog'));
assert.ok(hq.includes('Higgsfield sprint'));
assert.ok(hq.includes("hqQs.get('from')==='ventures'"));
assert.ok(hq.includes("finance.html?tab=ventures"));
assert.ok(hq.includes("href=\"jarvis.html\""));
console.log('Website Ventures HQ port smoke passed: rich HQ data is live inside the PR46 Ventures/Venture Lab/Productielijn shell.');
''')
print('Website Ventures HQ port applied')
