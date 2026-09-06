from pathlib import Path
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
print('stale REST readiness gate removed')
