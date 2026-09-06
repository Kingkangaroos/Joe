from pathlib import Path
import re

# 1) Ventures workspace: add a Website-specific prototype workbench.
p = Path('ventures-workspace.html')
s = p.read_text()

css_anchor = '.vw-empty{padding:28px 12px;text-align:center;color:var(--muted);font-size:12px}'
css_add = '''.prototype-workbench{margin:12px 0}.prototype-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-end;margin-bottom:8px}.prototype-head strong{font-family:var(--display);font-size:14px}.prototype-head span{font-size:9px;color:var(--muted);text-align:right}.prototype-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.prototype-card{display:block;border:1px solid var(--line);border-radius:13px;padding:11px 12px;background:var(--card);color:var(--ink);text-decoration:none;min-width:0}.prototype-card.primary{border-color:#cfc9ee;background:linear-gradient(135deg,#f6f3ff,#fff)}.prototype-card small{display:block;font-size:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--violet)}.prototype-card b{display:block;font-size:12px;margin-top:3px}.prototype-card span{display:block;font-size:9px;line-height:1.4;color:var(--muted);margin-top:3px}.prototype-card:active{transform:scale(.985)}@media(max-width:430px){.prototype-grid{grid-template-columns:1fr}}
'''
if css_anchor not in s:
    raise SystemExit('ventures workspace CSS anchor missing')
s = s.replace(css_anchor, css_add + css_anchor, 1)

helper_anchor = 'function renderLab(){'
helper = r'''function prototypeWorkbench(v){
  if(!v || v.id!=='sell_websites')return '';
  const items=[
    {href:'sites.html?from=ventures',kicker:'Website Lab',title:'Alle tests',desc:'Open de centrale venture-prototypebibliotheek.',primary:true},
    {href:'site-klus-scroll-1-2.html?from=ventures',kicker:'Actief · 1.2',title:'Architectural Luxury',desc:'Huidige signature scrollrichting.',primary:true},
    {href:'site-klus-scroll-1-1.html?from=ventures',kicker:'Vergelijking · 1.1',title:'Sticky story',desc:'Vorige iteratie als vergelijking.'},
    {href:'site-klus-scroll.html?from=ventures',kicker:'Referentie · 01',title:'Potlood scroll',desc:'Originele cinematic techniek.'},
    {href:'site-klus.html?from=ventures',kicker:'Basis',title:'Klusbedrijf',desc:'Conversiegerichte basiswebsite.'},
    {href:'site-pt.html?from=ventures',kicker:'Basis',title:'Personal trainer',desc:'Donkere energieke richting.'},
    {href:'site-rijschool.html?from=ventures',kicker:'Basis',title:'Rijschool',desc:'Vriendelijke commerciële richting.'}
  ];
  return '<div class="prototype-workbench"><div class="prototype-head"><strong>Prototype workbench</strong><span>Website-tests horen bij deze venture, niet bij General Lab.</span></div><div class="prototype-grid">'+items.map(x=>'<a class="prototype-card'+(x.primary?' primary':'')+'" target="_top" href="'+esc(x.href)+'"><small>'+esc(x.kicker)+'</small><b>'+esc(x.title)+'</b><span>'+esc(x.desc)+'</span></a>').join('')+'</div></div>';
}
'''
if helper_anchor not in s:
    raise SystemExit('renderLab anchor missing')
s = s.replace(helper_anchor, helper + helper_anchor, 1)

lab_html_anchor = "+'</textarea></div>';\n(v.phases||[]).forEach"
if lab_html_anchor not in s:
    raise SystemExit('venture lab HTML anchor missing')
s = s.replace(lab_html_anchor, "+'</textarea></div>';\nhtml+=prototypeWorkbench(v);\n(v.phases||[]).forEach", 1)
p.write_text(s)

# 2) General Lab: remove only the old Website examples card. Keep all other labs.
p = Path('lab.html')
s = p.read_text()
pattern = re.compile(r'''\n\s*<a href="sites\.html" style="display:flex;align-items:center;gap:10px;background:var\(--card\);border:1px solid var\(--line\);border-radius:14px;padding:14px 16px;text-decoration:none;color:inherit;margin-bottom:4px">.*?</a>''', re.S)
s2, n = pattern.subn('', s, count=1)
if n != 1:
    raise SystemExit(f'expected one General Lab Website card, removed {n}')
p.write_text(s2)

# 3) Website Lab: return to the Websites venture instead of General Lab.
p = Path('sites.html')
s = p.read_text()
old = '<a class="back" href="lab.html#chatgpt-lab">‹ Terug naar ChatGPT Lab</a>'
new = '<a class="back" href="finance.html?tab=ventures&amp;space=lab&amp;venture=sell_websites">‹ Terug naar Websites Verkopen</a>'
if s.count(old) != 1:
    raise SystemExit(f'expected one Website Lab back link, found {s.count(old)}')
s = s.replace(old, new, 1)
p.write_text(s)

# 4) Regression contract.
t = Path('tests/venture-lab-prototype-workbench-smoke.js')
t.write_text(r'''/* Venture Lab prototype ownership — ChatGPT (OpenAI), 2026-09-07 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const ventures=fs.readFileSync(path.join(root,'ventures-workspace.html'),'utf8');
const lab=fs.readFileSync(path.join(root,'lab.html'),'utf8');
const sites=fs.readFileSync(path.join(root,'sites.html'),'utf8');

assert.ok(ventures.includes('Prototype workbench'),'Venture Lab exposes a prototype workbench');
assert.ok(ventures.includes("v.id!=='sell_websites'"),'prototype workbench is scoped to Websites Verkopen');
for(const file of ['sites.html?from=ventures','site-klus-scroll-1-2.html?from=ventures','site-klus-scroll-1-1.html?from=ventures','site-klus-scroll.html?from=ventures','site-klus.html?from=ventures','site-pt.html?from=ventures','site-rijschool.html?from=ventures']){
  assert.ok(ventures.includes(file),`Venture Lab links existing prototype ${file}`);
}
assert.ok(ventures.includes('target="_top"'),'prototype links break out of the Finance iframe cleanly');
assert.ok(!lab.includes('href="sites.html"'),'General Lab no longer owns Website Ventures prototypes');
assert.ok(sites.includes('finance.html?tab=ventures&amp;space=lab&amp;venture=sell_websites'),'Website Lab returns toward Finance → Ventures');
assert.ok(!sites.includes('Terug naar ChatGPT Lab'),'Website Lab no longer returns to General Lab');
console.log('venture lab prototype workbench smoke passed: Website prototypes live under Websites Verkopen and General Lab stays general.');
''')
print('Venture Lab prototype workbench patch staged.')
