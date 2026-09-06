from pathlib import Path

# The new Health Trail loader awaits auth before entering the mocked Supabase
# query. Give the test one microtask so its deferred read hook is installed.
p=Path('tests/health-trail-refresh-smoke.js')
s=p.read_text()
old="""  readImpl=()=>new Promise(resolve=>{release=resolve;});
  const pending=api.refresh();

  assert.equal(ids.htRecovery.textContent,recoveryBefore,'a delayed refresh keeps the last good recovery visible');
"""
new="""  readImpl=()=>new Promise(resolve=>{release=resolve;});
  const pending=api.refresh();
  await Promise.resolve();

  assert.equal(ids.htRecovery.textContent,recoveryBefore,'a delayed refresh keeps the last good recovery visible');
"""
if s.count(old)!=1:
    raise SystemExit(f'expected one deferred Health Trail fixture, found {s.count(old)}')
p.write_text(s.replace(old,new,1))

# Main's synchronous loader owns the Home path and makes auth.js stand down.
# It must therefore request the same reconciler version as auth.js.
p=Path('checkin.js')
s=p.read_text()
old="script.src = 'autohabit-reconcile.js?v=11.7';"
new="script.src = 'autohabit-reconcile.js?v=11.9';"
if s.count(old)!=1:
    raise SystemExit(f'expected one Main reconciler v11.7 pin, found {s.count(old)}')
s=s.replace(old,new,1)
s=s.replace('// v11.7: keep the Fitbit -> Daily Mission reconciliation separate from xp.js,',
            '// v11.9: keep the Fitbit -> Daily Mission reconciliation separate from xp.js,',1)
p.write_text(s)

p=Path('tests/main-autohabit-loader-retry-smoke.js')
s=p.read_text()
s=s.replace("assert.equal(appended[0].src, 'autohabit-reconcile.js?v=11.7', 'Main requests the current reconciler version');",
            "assert.equal(appended[0].src, 'autohabit-reconcile.js?v=11.9', 'Main requests the current reconciler version');",1)
s=s.replace("assert.equal(appended[1].src, 'autohabit-reconcile.js?v=11.7');",
            "assert.equal(appended[1].src, 'autohabit-reconcile.js?v=11.9');",1)
p.write_text(s)

Path('tests/autohabit-loader-version-consistency-smoke.js').write_text(r'''/* Autohabit loader version consistency — ChatGPT (OpenAI), 2026-09-07 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const auth=fs.readFileSync(path.join(root,'auth.js'),'utf8');
const checkin=fs.readFileSync(path.join(root,'checkin.js'),'utf8');
const moduleSource=fs.readFileSync(path.join(root,'autohabit-reconcile.js'),'utf8');

const authMatch=auth.match(/autohabit-reconcile\.js\?v=([0-9.]+)/);
const mainMatch=checkin.match(/autohabit-reconcile\.js\?v=([0-9.]+)/);
assert.ok(authMatch,'auth loader must pin the reconciler');
assert.ok(mainMatch,'Main synchronous loader must pin the reconciler');
assert.equal(mainMatch[1],authMatch[1],'Main and auth must request exactly the same reconciler cache version');
assert.equal(mainMatch[1],'11.9','current reconciler cache version is v11.9');
assert.match(moduleSource,/Fitbit Daily Mission auto-completion v11\.9/,'pinned URL matches the deployed reconciler generation');
console.log('autohabit loader version smoke passed: Main and auth request the same v11.9 reconciler, preventing a stale Home cache from suppressing the current loader.');
''')
print('Body Fitbit fixup staged: async fixture + Main reconciler v11.9 consistency.')
