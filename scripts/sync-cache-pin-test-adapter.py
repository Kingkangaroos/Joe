from pathlib import Path
import re

# Only adapt regression assertions that mechanically pin an active page to the
# old cache-buster. Behavioural sync assertions remain untouched.
ACTIVE={
 'character.html','daily-windows.html','finance.html','health.html','index.html',
 'jarvis.html','lab.html','park31.html','po-water.html','recipes.html','routes.html','settings.html'
}

changed=[]
reported=[]
for p in sorted(Path('tests').glob('*-smoke.js')):
    s=p.read_text()
    if 'sync.js' not in s and 'sync\\.js' not in s:
        continue
    old=s
    # Common literal assertions.
    s=s.replace('sync.js?v=11.0','sync.js?v=11.9')
    s=s.replace('sync.js?v=11.8','sync.js?v=11.9')
    # Common regex forms.
    s=s.replace(r'sync\.js\?v=11\.0',r'sync\.js\?v=11\.9')
    s=s.replace(r'sync\.js\?v=11\.8',r'sync\.js\?v=11\.9')
    if s!=old:
        p.write_text(s)
        changed.append(p.name)
    # Report any remaining sync cache-version assertions for review in CI log.
    for i,line in enumerate(s.splitlines(),1):
        if ('sync.js?v=' in line or 'sync\\.js\\?v=' in line) and ('assert' in line or 'match' in line):
            reported.append(f'{p.name}:{i}: {line.strip()}')

print('adapted mechanical sync cache-pin tests:', ', '.join(changed) if changed else 'none')
print('remaining sync cache-pin assertions:')
for row in reported: print(row)
