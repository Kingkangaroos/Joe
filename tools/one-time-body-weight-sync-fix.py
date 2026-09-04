from pathlib import Path

p=Path('xp.js')
s=p.read_text(encoding='utf-8')
anchor="    'rpg_routes_v1'];"
addition="    'rpg_routes_v1','po_coach_weights']; // manual Body weight history; user data, not derived cache"
if "'po_coach_weights'" in s:
    raise SystemExit('po_coach_weights already present in RPG sync scope')
if s.count(anchor)!=1:
    raise SystemExit('RPG sync anchor count != 1')
s=s.replace(anchor,addition,1)
p.write_text(s,encoding='utf-8')
