from pathlib import Path
import re

CURRENT='11.9'
# Park 3.0 is a deliberate read-only rollback/reference surface. Keep its
# historical dependency URL untouched; every other top-level consumer is active.
FROZEN={'park3.html'}
changed=[]
seen=[]
pat=re.compile(r'(src=["\'](?:\./)?sync\.js\?v=)([^"\']+)(["\'])')
for p in sorted(Path('.').glob('*.html')):
    text=p.read_text()
    matches=list(pat.finditer(text))
    if not matches:
        continue
    seen.append(p.name)
    if p.name in FROZEN:
        continue
    new=pat.sub(lambda m:m.group(1)+CURRENT+m.group(3),text)
    if new!=text:
        p.write_text(new)
        changed.append(p.name)

if not seen:
    raise SystemExit('No top-level sync.js consumers found')
print('sync consumers:', ', '.join(seen))
print('frozen/reference exclusions:', ', '.join(sorted(FROZEN)))
print('updated stale cache pins:', ', '.join(changed) if changed else 'none')

# Durable regression guard: every ACTIVE top-level HTML consumer must request
# the current sync implementation URL. Frozen rollback/reference pages are
# explicit named exclusions rather than silently tolerated stale pins.
t=Path('tests/sync-cache-pin-smoke.js')
t.write_text(r'''/* Current sync cache-key audit — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const sync=fs.readFileSync('sync.js','utf8');
const version=(sync.match(/Gamenfy v(\d+\.\d+) server CAS write gate/)||[])[1];
assert.equal(version,'11.9','guard expects the current generation-aware CAS sync version');
const frozen=new Set(['park3.html']);
const files=fs.readdirSync('.').filter(f=>f.endsWith('.html')&&fs.statSync(f).isFile());
const consumers=[];
const active=[];
const stale=[];
for(const file of files){
  const src=fs.readFileSync(file,'utf8');
  const matches=[...src.matchAll(/src=["'](?:\.\/)?sync\.js\?v=([^"']+)["']/g)];
  if(!matches.length)continue;
  consumers.push(file);
  if(frozen.has(file))continue;
  active.push(file);
  for(const m of matches)if(m[1]!==version)stale.push(`${file}:${m[1]}`);
}
assert.ok(active.includes('lab.html'),'General Lab remains an audited active sync consumer');
assert.ok(active.includes('project-hq.html'),'Project HQ remains an audited active sync consumer');
assert.ok(consumers.includes('park3.html')&&frozen.has('park3.html'),'Park 3.0 stays an explicit frozen rollback/reference exclusion');
assert.deepEqual(stale,[],`stale active sync cache pins: ${stale.join(', ')}`);
console.log(`Sync cache pin smoke passed: ${active.length} active top-level consumers request sync.js?v=${version}; Park 3.0 remains frozen.`);
''')
