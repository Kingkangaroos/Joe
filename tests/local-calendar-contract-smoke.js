/* Gamenfy local civil-day contract smoke — ChatGPT (OpenAI)
   Calendar-indexed state must use the user's local civil date, not UTC slicing.
*/
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
function read(file){return fs.readFileSync(path.join(root,file),'utf8');}

// These are active runtime engines where introducing an ISO->date slice would
// silently move 00:00-02:00 Amsterdam activity onto the previous UTC day.
const calendarEngines=[
  'xp.js','checkin.js','sync.js','topbar.js','autohabit-reconcile.js',
  'daily-windows.js','park31-lab.js','park31.js','health-trail.js',
  'ventures.js','quests.js'
];
for(const file of calendarEngines){
  const source=read(file);
  assert.doesNotMatch(
    source,
    /toISOString\(\)\.slice\(0\s*,\s*10\)/,
    file+' must not derive a calendar day by slicing UTC ISO'
  );
}

const xp=read('xp.js');
assert.match(xp,/function todayStr\([^)]*\)[\s\S]{0,260}getFullYear\(\)/,'XP engine constructs its day in local calendar time');

const checkin=read('checkin.js');
assert.match(checkin,/function localDayFromTimestamp \(value\)/,'streak engine has an explicit timestamp -> local civil-day conversion');
assert.match(checkin,/const day = localDayFromTimestamp\(s\.doneAt\)/,'venture completion timestamps use that local conversion');
assert.doesNotMatch(checkin,/String\(s\.doneAt\)\.slice\(0, 10\)/,'venture timestamps can never be UTC-sliced again');

const windows=read('daily-windows.js');
assert.match(windows,/function localDateKey\(d\)[\s\S]{0,220}getFullYear\(\)/,'Daily Windows uses a local date helper');

const parkHost=read('park31-lab.js');
assert.match(parkHost,/function todayStr\(\)[\s\S]{0,220}getFullYear\(\)/,'Park 3.1 host uses local today');
assert.match(parkHost,/window\.viewedDateStr=todayStr/,'Park host supplies the supported Lab civil-day helper');

// Daily Garden still contains an old standalone UTC fallback, but it has no
// supported standalone page. The real Lab must load Park 3.1's local helper first.
const lab=read('lab.html');
const parkTag=lab.indexOf('park31-lab.js');
const gardenTag=lab.indexOf('daily-garden.js');
assert.ok(parkTag>=0&&gardenTag>=0&&parkTag<gardenTag,'supported Lab loads local viewedDateStr before Daily Garden');
const garden=read('daily-garden.js');
assert.match(garden,/typeof viewedDateStr==='function'\?viewedDateStr\(\)/,'Daily Garden prefers the host-provided local viewed date');

// ISO timestamps remain correct for absolute/audit metadata; this test is only
// about deriving calendar-indexed keys from UTC.
console.log('Local calendar contract smoke passed: active day keys are civil-day safe and Amsterdam-midnight venture attribution is locked.');
