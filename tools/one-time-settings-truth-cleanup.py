from pathlib import Path
import re

p=Path('settings.html')
s=p.read_text(encoding='utf-8')

repls={
  '<div><div class="toggle-label">Morning push (08:30)</div><div class="toggle-sub">Daily notification with your next move</div></div>':
  '<div><div class="toggle-label">Morning push</div><div class="toggle-sub">One daily notification in the server-selected morning window</div></div>',
  '<div><div class="toggle-label">Evening push (19:30)</div><div class="toggle-sub">Skips automatically when your day is closed</div></div>':
  '<div><div class="toggle-label">Evening push</div><div class="toggle-sub">One server-selected evening notification · skips when your day is closed</div></div>'
}
for old,new in repls.items():
    if s.count(old)!=1:
        raise SystemExit('copy anchor count != 1: '+old[:40])
    s=s.replace(old,new,1)

pattern=re.compile(r"  window\.saveWorkspace = function\(\)\{[\s\S]*?\n  \};")
matches=pattern.findall(s)
if len(matches)!=1:
    raise SystemExit('saveWorkspace block count != 1')
s=pattern.sub("""  window.saveWorkspace = function(){
    alert('Separate cloud workspaces are not active yet.');
    return false;
  };""",s,count=1)

for forbidden in [
    'It gets its own separate, empty data',
    'Workspace set. Reload the page',
    'Morning push (08:30)',
    'Evening push (19:30)'
]:
    if forbidden in s:
        raise SystemExit('stale Settings claim remains: '+forbidden)

p.write_text(s,encoding='utf-8')
