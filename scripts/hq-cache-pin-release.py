from pathlib import Path
import json

# Align the Project HQ cache-buster with the current generation-aware sync client.
p=Path('project-hq.html')
s=p.read_text()
old='<script src="sync.js?v=11.0" defer></script>'
new='<script src="sync.js?v=11.9" defer></script>'
if old not in s:
    raise SystemExit('expected stale Project HQ sync cache pin not found')
p.write_text(s.replace(old,new,1))

# Lock the pin in the existing Website Ventures integration guard.
t=Path('tests/website-ventures-hq-port-smoke.js')
ts=t.read_text()
anchor='const hq=read(\'project-hq.html\');\n'
assertion="assert.ok(hq.includes('sync.js?v=11.9'),'Project HQ must request the current generation-aware sync cache key');\n"
if assertion not in ts:
    if anchor not in ts: raise SystemExit('HQ smoke anchor missing')
    ts=ts.replace(anchor,anchor+assertion,1)
t.write_text(ts)

# Record the verified Website Ventures consolidation release in durable state.
state_path=Path('PROJECT-HQ-STATE.json')
data=json.loads(state_path.read_text())
data['updatedAt']='2026-09-06'
release=data.setdefault('release',{})
release['websiteVenturesPortMainSha']='bf848821695bed98a229273eacfb7c707a98c595'
release['websiteVenturesPortGuardedRun']='34056812291'
release['websiteVenturesPortPrSmokeRun']='34056844197'
release['websiteVenturesPortProductionDeployment']='dpl_WruV9vzjJ7ZYxWyrPcPrccY2Tkpy'
release['websiteVenturesPortProductionState']='READY'
item='2026-09-06 Website Ventures consolidation: rich four-flagship/Higgsfield/visual-production HQ was ported into the restored Ventures/Venture Lab/Productielijn shell; PR #48 merged as bf848821695bed98a229273eacfb7c707a98c595 and production dpl_WruV9vzjJ7ZYxWyrPcPrccY2Tkpy is READY'
if item not in data.setdefault('completedThisPass',[]): data['completedThisPass'].append(item)
state_path.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')

md=Path('PROJECT-HQ.md')
ms=md.read_text()
entry='''### 2026-09-06 — Website Ventures HQ consolidated onto restored shell\n- Superseded Website Ventures PR #45 was **not merged** because its workspace shell predated Joey's restored Ventures / Venture Lab / Productielijn structure.\n- Its useful commercial strategy was ported forward instead: four flagships, plumbing first-niche hypothesis, premium/authentic operator principle, Visual Vault, Higgsfield still-first sprint and the structured visual-production backlog.\n- Finance → Ventures remains the authoritative three-space shell; Productielijn now reads the Website Ventures HQ production queue with a safe local fallback.\n- Project HQ now renders Flagships, Venture Backlog, Idea Bank, Visual Production Backlog, Production Rules and Higgsfield Sprint, with Jarvis default return and Ventures-origin return preserved.\n- Guarded full suite `34056812291` and PR smoke `34056844197` passed. PR #48 merged as `bf848821695bed98a229273eacfb7c707a98c595`; Vercel production `dpl_WruV9vzjJ7ZYxWyrPcPrccY2Tkpy` verified READY.\n\n'''
marker='## HUMAN CHANGELOG\n\n'
if entry not in ms:
    if marker not in ms: raise SystemExit('HQ changelog marker missing')
    ms=ms.replace(marker,marker+entry,1)
md.write_text(ms)
print('Project HQ cache pin + Website Ventures release metadata updated')
