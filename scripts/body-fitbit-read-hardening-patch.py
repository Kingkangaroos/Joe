from pathlib import Path

# ---------------------------------------------------------------------------
# Character Body: one owner-scoped Fitbit helper shared by metrics + weight.
# ---------------------------------------------------------------------------
p=Path('character.html')
s=p.read_text()
old_comp="""async function renderBodyComposition(){
  const wEl=document.getElementById('bodyCompWeight');
  const fEl=document.getElementById('bodyCompFat');
  const mEl=document.getElementById('bodyCompMuscle');
  let weight='—', fat='—', muscle='—';
  // Fitbit (cloud health_fitbit) is de enige bron voor gewicht. Fat/muscle
  // blijven '—' (Fitbit Air heeft geen vetpercentage-sensor).
  try{
    const SB='https://ttxjsoahmtennnufgeqx.supabase.co', KEY='sb_publishable_5lYXJme36ggS2dWTJbMSCA_Ir9Uogab';
    const r=await window.gamenfyAuthedFetch(SB+'/rest/v1/app_state?key=eq.health_fitbit&select=data');
    if(r.ok){
      const rows=await r.json(); const data=((rows[0]||{}).data)||{};
      const dates=Object.keys(data).sort().reverse();
      for(const dt of dates){ const kg=data[dt]&&data[dt].weightKg; if(kg!=null){ weight=Math.round(parseFloat(kg))+' kg'; break; } }
    }
  }catch(e){}
  // v10.96: Apple Health-shortcut officieel afgeschreven — geen localStorage-
  // fallback meer nodig. Fat/muscle blijven '—' (Fitbit Air heeft geen
  // vetpercentage-sensor); dat was ook zo tóen de fallback nog bestond,
  // aangezien dat kanaal al sinds 2026-06-09 stillag.
  if(wEl) wEl.textContent=weight;
  if(fEl) fEl.textContent=fat;
  if(mEl) mEl.textContent=muscle;
}
"""
new_comp="""async function readOwnerFitbitData(){
  try { if(window.gamenfyAuthReady) await window.gamenfyAuthReady; } catch(e) {
    return { ok:false, data:null, source:'auth', error:'auth-not-ready' };
  }
  const ownerId=window.gamenfyUserId;
  if(!ownerId) return { ok:false, data:null, source:'auth', error:'owner-missing' };

  // Primary path: use the same authenticated Supabase client as canonical RPG
  // sync. Explicit owner scope prevents a key-only read from ever becoming a
  // multi-user ambiguity later.
  try{
    const client=window.gamenfySupabase;
    if(client){
      const read=await client.from('app_state').select('data')
        .eq('user_id',ownerId).eq('key','health_fitbit').maybeSingle();
      if(read && !read.error && read.data){
        window.__gamenfyFitbitReadStatus={ ok:true, source:'supabase', at:Date.now() };
        return { ok:true, data:read.data.data||{}, source:'supabase', error:null };
      }
      if(read && read.error) window.__gamenfyFitbitReadStatus={ ok:false, source:'supabase', at:Date.now(), code:String(read.error.code||'query-error') };
    }
  }catch(e){
    window.__gamenfyFitbitReadStatus={ ok:false, source:'supabase', at:Date.now(), code:'client-error' };
  }

  // PWA fallback: same authenticated session, same owner row, different transport.
  // This is intentionally read-only and only used when the Supabase client path
  // failed, so a WebKit/client hiccup cannot leave a healthy Fitbit row invisible.
  try{
    if(typeof window.gamenfyAuthedFetch==='function'){
      const SB='https://ttxjsoahmtennnufgeqx.supabase.co';
      const url=SB+'/rest/v1/app_state?user_id=eq.'+encodeURIComponent(ownerId)+'&key=eq.health_fitbit&select=data';
      const response=await window.gamenfyAuthedFetch(url);
      if(response && response.ok){
        const rows=await response.json();
        if(Array.isArray(rows) && rows.length===1){
          window.__gamenfyFitbitReadStatus={ ok:true, source:'rest-fallback', at:Date.now() };
          return { ok:true, data:(rows[0]&&rows[0].data)||{}, source:'rest-fallback', error:null };
        }
      }
    }
  }catch(e){}
  window.__gamenfyFitbitReadStatus={ ok:false, source:'all', at:Date.now(), code:'fitbit-row-unavailable' };
  return { ok:false, data:null, source:'all', error:'fitbit-row-unavailable' };
}

async function renderBodyComposition(){
  const wEl=document.getElementById('bodyCompWeight');
  const fEl=document.getElementById('bodyCompFat');
  const mEl=document.getElementById('bodyCompMuscle');
  let weight='—', fat='—', muscle='—';
  // Fitbit (cloud health_fitbit) is de enige bron voor gewicht. Fat/muscle
  // blijven '—' (Fitbit Air heeft geen vetpercentage-sensor).
  try{
    const fitbit=await readOwnerFitbitData();
    if(fitbit.ok){
      const data=fitbit.data||{};
      const dates=Object.keys(data).filter(dt=>/^\\d{4}-\\d{2}-\\d{2}$/.test(dt)).sort().reverse();
      for(const dt of dates){ const kg=data[dt]&&data[dt].weightKg; if(kg!=null){ weight=Math.round(parseFloat(kg))+' kg'; break; } }
    }
  }catch(e){}
  // v10.96: Apple Health-shortcut officieel afgeschreven — geen localStorage-
  // fallback meer nodig. Fat/muscle blijven '—' (Fitbit Air heeft geen
  // vetpercentage-sensor); dat was ook zo tóen de fallback nog bestond,
  // aangezien dat kanaal al sinds 2026-06-09 stillag.
  if(wEl) wEl.textContent=weight;
  if(fEl) fEl.textContent=fat;
  if(mEl) mEl.textContent=muscle;
}
"""
if s.count(old_comp)!=1:
    raise SystemExit(f'expected one legacy Body composition reader, found {s.count(old_comp)}')
s=s.replace(old_comp,new_comp,1)

old_fetch="""async function hmFetchAll(force){
  if(hmData && !force) return hmData;
  // Character used to call the authed Fitbit endpoint before auth.js had
  // restored the session, swallow that failure, then cache the empty object
  // forever. That made a healthy Fitbit feed look \"paused\" until a reload.
  try { if(window.gamenfyAuthReady) await window.gamenfyAuthReady; } catch(e) { return hmData || { byDate:{}, hevy:{}, lastHealthDate:null }; }
  const out = { byDate:{}, hevy:{}, lastHealthDate:null };
  let fitbitReadSucceeded = false;
  // v10.96: Apple Health-shortcut officieel afgeschreven (Joey bevestigde:
  // \"die mag gewoon inderdaad opruimen want ik heb nu die Fitbit\"). Fitbit
  // is nu de enige bron — geen fallback-merge meer nodig, `cur` start
  // gewoon op de standaardwaarden.
  try{
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
        if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(k) || !v || typeof v!=='object') continue;
        const cur = { steps:0, energy:0, weight:0, sleep:0, rhr:0, hrv:0, breathing:0, spo2:0, distance:0 };
        out.byDate[k] = {
          steps:  v.steps!=null ? Math.round(Number(v.steps)) : cur.steps,
          energy: cur.energy,
          weight: v.weightKg!=null ? Number(v.weightKg) : cur.weight,
          sleep:  v.sleepMinutes!=null ? Math.round(Number(v.sleepMinutes)) : cur.sleep,
          rhr:    v.restingHR!=null ? Math.round(Number(v.restingHR)) : cur.rhr,
          hrv:      v.hrvMs!=null ? Number(v.hrvMs) : cur.hrv,
          breathing:v.breathingRate!=null ? Number(v.breathingRate) : cur.breathing,
          spo2:     v.spo2Pct!=null ? Number(v.spo2Pct) : cur.spo2,
          distance: v.distanceKm!=null ? Number(v.distanceKm) : cur.distance,
        };
        if(!out.lastHealthDate || k>out.lastHealthDate) out.lastHealthDate=k;
      }
    }
  }catch(e){}
"""
new_fetch="""async function hmFetchAll(force){
  if(hmData && !force) return hmData;
  const out = { byDate:{}, hevy:{}, lastHealthDate:null, fitbitReadStatus:'waiting' };
  let fitbitReadSucceeded = false;
  // One shared owner-scoped Fitbit reader now powers both Body cards and Body
  // composition. A failed read is never cached, so foreground/auth retries stay live.
  try{
    const fitbit=await readOwnerFitbitData();
    out.fitbitReadStatus=fitbit.ok?'ok':'failed';
    if(fitbit.ok){
      fitbitReadSucceeded = true;
      const fb = fitbit.data || {};
      for(const [k,v] of Object.entries(fb)){
        if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(k) || !v || typeof v!=='object') continue;
        const cur = { steps:0, energy:0, weight:0, sleep:0, rhr:0, hrv:0, breathing:0, spo2:0, distance:0 };
        out.byDate[k] = {
          steps:  v.steps!=null ? Math.round(Number(v.steps)) : cur.steps,
          energy: cur.energy,
          weight: v.weightKg!=null ? Number(v.weightKg) : cur.weight,
          sleep:  v.sleepMinutes!=null ? Math.round(Number(v.sleepMinutes)) : cur.sleep,
          rhr:    v.restingHR!=null ? Math.round(Number(v.restingHR)) : cur.rhr,
          hrv:      v.hrvMs!=null ? Number(v.hrvMs) : cur.hrv,
          breathing:v.breathingRate!=null ? Number(v.breathingRate) : cur.breathing,
          spo2:     v.spo2Pct!=null ? Number(v.spo2Pct) : cur.spo2,
          distance: v.distanceKm!=null ? Number(v.distanceKm) : cur.distance,
        };
        if(!out.lastHealthDate || k>out.lastHealthDate) out.lastHealthDate=k;
      }
    }
  }catch(e){ out.fitbitReadStatus='failed'; }
"""
if s.count(old_fetch)!=1:
    raise SystemExit(f'expected one hmFetchAll Fitbit block, found {s.count(old_fetch)}')
s=s.replace(old_fetch,new_fetch,1)

old_banner="""function hmStaleBanner(d){
  const last = d && d.lastHealthDate;
  if(!last) return '<div class=\"hm-stale\"><b>Nog geen Fitbit-data geladen.</b> Open Body opnieuw of trek even omlaag nadat je bent ingelogd; de app probeert de cloudfeed opnieuw.</div>';
"""
new_banner="""function hmStaleBanner(d){
  const last = d && d.lastHealthDate;
  if(!last && d && d.fitbitReadStatus==='failed') return '<div class=\"hm-stale\"><b>Fitbit kon niet worden gelezen.</b> De cloudfeed bestaat wel, maar deze app-sessie kreeg de row niet binnen. Open Body opnieuw; Gamenfy probeert zowel de normale client als een ingelogde fallback.</div>';
  if(!last) return '<div class=\"hm-stale\"><b>Fitbit wordt geladen…</b> De app wacht op je ingelogde cloudfeed en probeert opnieuw zodra auth of focus verandert.</div>';
"""
if s.count(old_banner)!=1:
    raise SystemExit(f'expected one stale banner prelude, found {s.count(old_banner)}')
s=s.replace(old_banner,new_banner,1)
p.write_text(s)

# ---------------------------------------------------------------------------
# Health Trail (Lab): same owner-scoped Supabase contract + auth-ready refresh.
# ---------------------------------------------------------------------------
p=Path('health-trail.js')
s=p.read_text()
s=s.replace('Health Trail Lab prototype v1.28', 'Health Trail Lab prototype v1.29', 1)
old_load="""  async function loadFitbit(){
    if(typeof window.gamenfyAuthedFetch!=='function')return null;
    try{
      var response=await window.gamenfyAuthedFetch(SB_URL+'/rest/v1/app_state?key=eq.health_fitbit&select=data');
      if(!response.ok)return null;
      var rows=await response.json();return ((rows[0]||{}).data)||null;
    }catch(e){return null;}
  }
"""
new_load="""  async function loadFitbit(){
    try{if(window.gamenfyAuthReady)await window.gamenfyAuthReady;}catch(e){return null;}
    if(!window.gamenfySupabase||!window.gamenfyUserId)return null;
    try{
      var result=await window.gamenfySupabase
        .from('app_state').select('data')
        .eq('user_id',window.gamenfyUserId)
        .eq('key','health_fitbit')
        .maybeSingle();
      if(!result||result.error||!result.data)return null;
      return (result.data.data)||null;
    }catch(e){return null;}
  }
"""
if s.count(old_load)!=1:
    raise SystemExit(f'expected one Health Trail legacy Fitbit loader, found {s.count(old_load)}')
s=s.replace(old_load,new_load,1)
old_listener="""    window.addEventListener('gamenfy:remote-state-applied',refresh);
    window.addEventListener('focus',refresh);
"""
new_listener="""    window.addEventListener('gamenfy:remote-state-applied',refresh);
    window.addEventListener('gamenfy-auth-ready',refresh);
    window.addEventListener('focus',refresh);
"""
if s.count(old_listener)!=1:
    raise SystemExit('Health Trail listener anchor missing')
s=s.replace(old_listener,new_listener,1)
p.write_text(s)

# Cache-bust the active Lab loader so installed PWAs request v1.29.
p=Path('lab.html')
s=p.read_text()
old_pin='<script src="health-trail.js?v=1.0" defer></script>'
new_pin='<script src="health-trail.js?v=1.29" defer></script>'
if s.count(old_pin)!=1:
    raise SystemExit(f'expected one Health Trail Lab pin, found {s.count(old_pin)}')
p.write_text(s.replace(old_pin,new_pin,1))

# ---------------------------------------------------------------------------
# Update Health Trail refresh harness to the actual Supabase client transport.
# ---------------------------------------------------------------------------
p=Path('tests/health-trail-refresh-smoke.js')
s=p.read_text()
s=s.replace("const window={\n  RPG_DEFAULT_SKILLS:{sleep:{isHabit:true,active:true}},\n  getHabits:()=>({sleep:{score:5}}),\n  addEventListener:(type,fn)=>{listeners[type]=fn;}\n};",
"""let readImpl=async()=>({data:{data:{}},error:null});
const window={
  RPG_DEFAULT_SKILLS:{sleep:{isHabit:true,active:true}},
  getHabits:()=>({sleep:{score:5}}),
  gamenfyAuthReady:Promise.resolve({user:{id:'owner-test'}}),
  gamenfyUserId:'owner-test',
  gamenfySupabase:{from(table){assert.equal(table,'app_state');return {select(fields){assert.equal(fields,'data');return this;},eq(field,value){if(field==='user_id')assert.equal(value,'owner-test');if(field==='key')assert.equal(value,'health_fitbit');return this;},maybeSingle(){return readImpl();}};}},
  addEventListener:(type,fn)=>{listeners[type]=fn;}
};""",1)
# Remove obsolete response helper and swap transport controls.
s=s.replace("function responseFor(data){return {ok:true,json:async()=>[{data}]};}\n",'',1)
s=s.replace("  window.gamenfyAuthedFetch=async()=>responseFor(firstData);\n  await api.refresh();",
            "  readImpl=async()=>({data:{data:firstData},error:null});\n  await api.refresh();",1)
s=s.replace("  window.gamenfyAuthedFetch=()=>new Promise(resolve=>{release=resolve;});\n  const pending=api.refresh();",
            "  readImpl=()=>new Promise(resolve=>{release=resolve;});\n  const pending=api.refresh();",1)
s=s.replace("  release(responseFor(firstData));",
            "  release({data:{data:firstData},error:null});",1)
s=s.replace("  window.gamenfyAuthedFetch=async()=>({ok:false,json:async()=>[]});",
            "  readImpl=async()=>({data:null,error:{message:'offline'}});",1)
# Stronger contract assertions.
s=s.replace("  assert.match(source,/var lastFitbit=null/,'Health Trail maintains only an in-memory last-good Fitbit snapshot');",
"""  assert.match(source,/var lastFitbit=null/,'Health Trail maintains only an in-memory last-good Fitbit snapshot');
  assert.ok(source.includes(".eq('user_id',window.gamenfyUserId)"),'Health Trail Fitbit read is explicitly owner-scoped');
  assert.ok(source.includes(".eq('key','health_fitbit')"),'Health Trail reads only the Fitbit row');
  assert.equal(typeof listeners['gamenfy-auth-ready'],'function','auth readiness triggers a Fitbit retry');""",1)
p.write_text(s)

# Existing Health Trail smoke should expect the new cache pin and auth listener.
p=Path('tests/health-trail-smoke.js')
s=p.read_text()
s=s.replace("assert.equal(typeof listeners['gamenfy:remote-state-applied'],'function','remote RPG sync changes refresh the trail');\nassert.equal(typeof listeners.focus,'function'",
            "assert.equal(typeof listeners['gamenfy:remote-state-applied'],'function','remote RPG sync changes refresh the trail');\nassert.equal(typeof listeners['gamenfy-auth-ready'],'function','auth readiness refreshes Fitbit inputs');\nassert.equal(typeof listeners.focus,'function'",1)
s=s.replace("assert.match(lab,/health-trail\\.js\\?v=1\\.0/,'existing Lab loader remains valid; Vercel revalidates the updated file at the same path');",
            "assert.match(lab,/health-trail\\.js\\?v=1\\.29/,'Lab cache-busts the owner-scoped Fitbit reader');",1)
p.write_text(s)

# New static regression for the exact Body path Joey reported.
Path('tests/body-fitbit-owner-read-smoke.js').write_text(r'''/* Body Fitbit owner-read hardening — ChatGPT (OpenAI), 2026-09-07 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','character.html'),'utf8');
const start=source.indexOf('async function readOwnerFitbitData()');
const end=source.indexOf('// ── Export backup',start);
assert.ok(start>=0&&end>start,'shared Body Fitbit reader must be discoverable');
const block=source.slice(start,end);
assert.ok(block.includes(".eq('user_id',ownerId).eq('key','health_fitbit').maybeSingle()"),'primary Body Fitbit read is owner-scoped');
assert.ok(block.includes("user_id=eq.'+encodeURIComponent(ownerId)+'&key=eq.health_fitbit&select=data"),'fallback REST read keeps explicit owner scope');
assert.ok(block.includes("source:'rest-fallback'"),'fallback success is diagnosable without exposing user data');
assert.ok(block.includes('if(fitbit.ok){'),'Body composition uses the shared successful Fitbit snapshot');
assert.ok(source.includes("out.fitbitReadStatus=fitbit.ok?'ok':'failed'"),'Health Metrics distinguishes failed read from genuine loading');
assert.ok(source.includes('if(fitbitReadSucceeded) hmData = out;'),'failed/empty transport is never cached as authoritative Health data');
assert.ok(source.includes("window.addEventListener('gamenfy-auth-ready'"),'Body retries after auth becomes ready');
assert.ok(!block.includes("gamenfyAuthedFetch(SB+'/rest/v1/app_state?key=eq.health_fitbit"),'legacy key-only Body read is gone');
console.log('body Fitbit owner-read smoke passed: one shared owner-scoped reader powers Body metrics/weight with a retry-safe fallback.');
''')
print('Body Fitbit read hardening staged.')
