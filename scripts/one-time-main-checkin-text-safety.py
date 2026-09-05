from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

old = """  ventureRows.slice(0, 2).forEach(({ v, nx }) => {
    rows += '<div class=\"ci-row\"><div><div class=\"ci-row-kind\">' + v.name + '</div>' +
      '<div class=\"ci-row-title\">' + nx.step.title + '</div>' +
      (nx.step.minutes ? '<div class=\"ci-row-sub\">~' + nx.step.minutes + ' min</div>' : '') + '</div>' +
      '<button class=\"ci-do\" onclick=\"ciVenture(\\'' + v.id + '\\',\\'' + nx.step.id + '\\',this)\">Complete</button></div>';
  });"""
new = """  ventureRows.slice(0, 2).forEach(({ v, nx }) => {
    rows += '<div class=\"ci-row\"><div><div class=\"ci-row-kind\">' + escapeHtml(v.name) + '</div>' +
      '<div class=\"ci-row-title\">' + escapeHtml(nx.step.title) + '</div>' +
      (nx.step.minutes ? '<div class=\"ci-row-sub\">~' + nx.step.minutes + ' min</div>' : '') + '</div>' +
      '<button class=\"ci-do\" onclick=\"ciVenture(\\'' + v.id + '\\',\\'' + nx.step.id + '\\',this)\">Complete</button></div>';
  });"""
assert old in s, 'check-in venture row anchor changed'
s = s.replace(old, new, 1)

# Mission labels/why are canonical today, but escaping them here makes the
# check-in renderer safe if those definitions become user-editable later.
old2 = """    rows += '<div class=\"ci-row\"><div><div class=\"ci-row-kind\">Mission</div>' +
      '<div class=\"ci-row-title\">' + m.label + '</div>' +
      (whyShort ? '<div class=\"ci-row-why\">' + whyShort + '</div>' : '') + '</div>' +"""
new2 = """    rows += '<div class=\"ci-row\"><div><div class=\"ci-row-kind\">Mission</div>' +
      '<div class=\"ci-row-title\">' + escapeHtml(m.label) + '</div>' +
      (whyShort ? '<div class=\"ci-row-why\">' + escapeHtml(whyShort) + '</div>' : '') + '</div>' +"""
assert old2 in s, 'check-in mission row anchor changed'
s = s.replace(old2, new2, 1)

old3 = """    (nx ? '<div class=\"ci-row\"><div><div class=\"ci-row-kind\">'+nx.v.name+'</div>'+
      '<div class=\"ci-row-title\">'+nx.nx.step.title+'</div>'+"""
new3 = """    (nx ? '<div class=\"ci-row\"><div><div class=\"ci-row-kind\">'+escapeHtml(nx.v.name)+'</div>'+
      '<div class=\"ci-row-title\">'+escapeHtml(nx.nx.step.title)+'</div>'+"""
assert old3 in s, 'choice-gate venture row anchor changed'
s = s.replace(old3, new3, 1)

p.write_text(s, encoding='utf-8')

# Extend the existing Main free-text regression rather than create a second
# overlapping test surface.
t = Path('tests/main-user-text-safety-smoke.js')
ts = t.read_text(encoding='utf-8')
anchor = """assert.ok(src.includes(\"'<div class=\\\"focus-title\\\">'+escapeHtml(s.title)+'</div>'\"),
  'focus overlay title must be escaped');
assert.ok(!src.includes(\"'<div class=\\\"focus-title\\\">'+s.title+'</div>'\"),
  'raw focus titles must not be injected into overlay HTML');
"""
insert = anchor + """assert.ok(src.includes(\"'<div class=\\\"ci-row-title\\\">' + escapeHtml(nx.step.title) + '</div>'\"),
  'check-in venture step titles must be escaped');
assert.ok(src.includes(\"<div class=\\\"ci-row-kind\\\">' + escapeHtml(v.name) + '</div>'\"),
  'check-in venture names must be escaped');
assert.ok(src.includes(\"'<div class=\\\"ci-row-title\\\">' + escapeHtml(m.label) + '</div>'\"),
  'check-in mission labels must be inert text');
assert.ok(src.includes(\"'<div class=\\\"ci-row-why\\\">' + escapeHtml(whyShort) + '</div>'\"),
  'check-in mission why copy must be inert text');
assert.ok(src.includes(\"<div class=\\\"ci-row-kind\\\">'+escapeHtml(nx.v.name)+'</div>'\"),
  'choice gate venture names must be escaped');
assert.ok(src.includes(\"<div class=\\\"ci-row-title\\\">'+escapeHtml(nx.nx.step.title)+'</div>'\"),
  'choice gate venture step titles must be escaped');
"""
assert anchor in ts, 'main user-text test extension anchor changed'
ts = ts.replace(anchor, insert, 1)
t.write_text(ts, encoding='utf-8')
