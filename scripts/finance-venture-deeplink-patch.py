from pathlib import Path

p=Path('finance.html')
s=p.read_text()
old="""  const validTabs = ['net','subs','wish','ventures','debts'];
  const requestedTab = new URLSearchParams(location.search).get('tab');
  const savedTab = storeGet(TAB_KEY);
  setActiveTab(validTabs.includes(requestedTab) ? requestedTab : (validTabs.includes(savedTab) ? savedTab : 'net'));
"""
new="""  const validTabs = ['net','subs','wish','ventures','debts'];
  const pageParams = new URLSearchParams(location.search);
  const requestedTab = pageParams.get('tab');
  const savedTab = storeGet(TAB_KEY);
  setActiveTab(validTabs.includes(requestedTab) ? requestedTab : (validTabs.includes(savedTab) ? savedTab : 'net'));

  // Finance owns the shell; the embedded Ventures workspace owns its own
  // sub-space. Preserve Venture Lab deep links when returning from prototypes.
  const venturesFrame = document.getElementById('venturesWorkspaceFrame');
  if (venturesFrame && requestedTab === 'ventures') {
    const requestedSpace = pageParams.get('space');
    const requestedVenture = pageParams.get('venture');
    const params = new URLSearchParams('embed=1');
    if (['overview','lab','pipeline'].includes(requestedSpace)) params.set('space', requestedSpace);
    if (/^[a-z0-9_-]{1,64}$/i.test(requestedVenture || '')) params.set('venture', requestedVenture);
    venturesFrame.src = 'ventures-workspace.html?' + params.toString();
  }
"""
if s.count(old)!=1:
    raise SystemExit(f'expected one Finance tab bootstrap, found {s.count(old)}')
p.write_text(s.replace(old,new,1))

Path('tests/finance-venture-deeplink-smoke.js').write_text(r'''/* Finance → Venture Lab deeplink contract — ChatGPT (OpenAI), 2026-09-07 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','finance.html'),'utf8');
assert.ok(source.includes("const pageParams = new URLSearchParams(location.search);"),'Finance reads the full deeplink query once');
assert.ok(source.includes("const requestedSpace = pageParams.get('space');"),'Finance forwards Venture sub-space');
assert.ok(source.includes("const requestedVenture = pageParams.get('venture');"),'Finance forwards selected venture');
assert.ok(source.includes("['overview','lab','pipeline'].includes(requestedSpace)"),'only known Venture spaces are accepted');
assert.ok(source.includes("/^[a-z0-9_-]{1,64}$/i.test(requestedVenture || '')"),'venture id is constrained before iframe forwarding');
assert.ok(source.includes("venturesFrame.src = 'ventures-workspace.html?' + params.toString();"),'Finance rewrites embedded Venture URL deterministically');
assert.ok(source.includes('id="venturesWorkspaceFrame"'),'Ventures iframe remains present');
console.log('finance venture deeplink smoke passed: Website Lab can return to the exact Venture Lab context.');
''')
print('Finance Venture deeplink patch staged.')
