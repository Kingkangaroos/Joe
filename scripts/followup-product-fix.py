from pathlib import Path

# Remove the obsolete raw-REST readiness gate now that reconciliation uses the authenticated Supabase client.
p=Path('autohabit-reconcile.js')
s=p.read_text()
old="""    inFlight = (async function () {
      if (typeof window.gamenfyAuthedFetch !== 'function') return 0;
      try { if (window.gamenfyAuthReady) await window.gamenfyAuthReady; } catch (e) { return 0; }
"""
new="""    inFlight = (async function () {
      try { if(window.gamenfyAuthReady) await window.gamenfyAuthReady; } catch (e) { return 0; }
      if(!window.gamenfySupabase || !window.gamenfyUserId) return 0;
"""
if old not in s: raise SystemExit('stale authed-fetch readiness gate missing')
p.write_text(s.replace(old,new,1))

# Keep the explicit builder/deployment boundary in the redesigned Venture overview.
p=Path('ventures-workspace.html')
s=p.read_text()
old='''<div class="scope-note">Deze Finance → Ventures workspace is persoonlijk gemarkeerd en kan later uit een publieke Gamenfy-build worden weggelaten.</div>'''
new='''<div class="scope-note"><strong>Public export: exclude.</strong> Deze Finance → Ventures workspace is persoonlijk gemarkeerd en kan later uit een publieke Gamenfy-build worden weggelaten. <strong>Do not create a separate repo</strong> voor Website Ventures: bouw in deze bestaande Gamenfy-workspace en houd General Lab en Venture Lab wel logisch gescheiden.</div>'''
if old not in s: raise SystemExit('venture personal-scope handoff anchor missing')
p.write_text(s.replace(old,new,1))
print('stale REST gate removed and Venture handoff preserved')
