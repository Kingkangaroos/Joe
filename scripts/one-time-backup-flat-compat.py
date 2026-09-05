from pathlib import Path

p = Path('character.html')
s = p.read_text(encoding='utf-8')
old = """        dump.keys[k] = (typeof v === 'string') ? v : JSON.stringify(v);"""
new = """        // Mirror the raw localStorage representation exactly. sync.js applies
        // every parsed cloud value with JSON.stringify(), including strings.
        dump.keys[k] = JSON.stringify(v);"""
assert old in s, 'backup flat compatibility anchor changed'
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')

t = Path('tests/cloud-backup-smoke.js')
ts = t.read_text(encoding='utf-8')
anchor = """assert.ok(src.includes('pendingLocalApplied: pendingApplied'),
  'backup must record whether newer local pending edits were included');
"""
insert = anchor + """assert.ok(src.includes('dump.keys[k] = JSON.stringify(v)'),
  'flat compatibility keys must preserve the exact raw localStorage JSON representation');
assert.ok(!src.includes("(typeof v === 'string') ? v : JSON.stringify(v)"),
  'string cloud values must not lose their JSON-string layer in the flat compatibility view');
"""
assert anchor in ts, 'cloud backup test extension anchor changed'
ts = ts.replace(anchor, insert, 1)
t.write_text(ts, encoding='utf-8')
