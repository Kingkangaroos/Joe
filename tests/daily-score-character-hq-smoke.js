'use strict';

const fs = require('fs');
const assert = require('assert');
const crypto = require('crypto');

function read(path) { return fs.readFileSync(path, 'utf8'); }
function verifyTransparentEvolutionSet(base, label) {
  const digests = [];
  for (let level = 1; level <= 10; level++) {
    const file = base + '/l' + String(level).padStart(2, '0') + '.webp';
    assert(fs.existsSync(file), file + ' must exist');
    const bytes = fs.readFileSync(file);
    assert(bytes.length > 1000, file + ' must contain real artwork');
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF', file + ' is WebP');
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP', file + ' has WebP signature');
    assert(bytes.includes(Buffer.from('ALPH')), file + ' preserves transparency');
    digests.push(crypto.createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(new Set(digests).size, 10, label + ' has ten distinct approved evolutions');
}

const push = read('push.js');
const sites = read('sites.html');
const park = read('park31.html');
const art = read('park31.js');
const hq = read('project-hq.html');
const rescue = read('hq-note-resync.js');
const importContract = read('img/lab/CHARACTER-IMPORTS-LAST-HORSE.md');

assert(push.includes("data.type !== 'gamenfy:park31-summary'"), 'Daily Score must listen to Park 3.1 canonical summary');
assert(push.includes('value.textContent = String(done);'), 'Daily Score headline must equal completedToday');
assert(push.includes("label.textContent = 'Daily Score'"), 'Home card must be labelled Daily Score');
assert(push.includes("suffix.style.display = 'none'"), 'legacy /10 suffix must be hidden');
assert(push.includes('done / count'), 'progress bar may still use checked/total ratio');
assert(push.includes("img/lab/daily-score/joey/l"), 'Joey Daily Score evolution path missing');
assert(push.includes('scoreArtLevel(done)'), 'Joey art must be derived from checked-count score');

verifyTransparentEvolutionSet('img/lab/daily-score/joey', 'Daily Score Joey');
verifyTransparentEvolutionSet('img/lab/park31/budgeting', 'Budgeting owl');
verifyTransparentEvolutionSet('img/lab/park31/meditation', 'Meditation panda');

assert(sites.includes('Bewaarde scroll R&D')||sites.includes('Bewaarde oude testwebsite'), 'old Website Lab tests must be visibly called out');
assert(sites.includes('site-klus-scroll-1-2.html'), 'Test 1.2 must remain in Website Lab');
assert(sites.includes('site-klus-scroll-1-1.html'), 'Test 1.1 must remain in Website Lab');
assert(sites.includes('site-klus-scroll.html'), 'original Test 1 must remain in Website Lab');
assert(sites.includes('site-plumbing-flagship-v1.html'), 'new plumbing flagship must coexist with old tests');
assert(sites.includes('website-ventures-agency-scroll-hero-lab-v1-4-archive.html'), 'integrated Agency v1.4 must remain archived after v1.5 promotion');

assert(!park.includes('character-art-overrides.js'), 'obsolete fallback bridge must not remain loaded');
assert(art.includes("key:'budgeting',label:'Budgeting',emoji:'💰',dir:'budgeting'"), 'Budgeting must map directly to the approved owl evolution');
assert(art.includes("key:'meditation',label:'Meditation',emoji:'🧘',dir:'meditation'"), 'Meditation must map directly to the approved panda evolution');
assert(art.includes("'img/lab/park31/'+mission.dir"), 'native art must read Park 3.1 existing mission-level output');
assert(!art.includes("fallback:'budgeting'"), 'Budgeting fallback wiring must be retired');
assert(!art.includes("fallback:'meditation'"), 'Meditation fallback wiring must be retired');
assert(importContract.includes('do **not** regenerate'), 'import contract must protect exact approved assets');

assert(park.includes('.p31-slot[data-mission="budgeting"] .p31-slot-art img'), 'Budgeting roster art must use transparent-character contain framing');
assert(park.includes('.p31-slot[data-mission="meditation"] .p31-slot-art img'), 'Meditation roster art must use transparent-character contain framing');
assert(park.includes('img[alt^="Budgeting companion"]'), 'Budgeting modal art must use contain framing');
assert(park.includes('img[alt^="Meditation companion"]'), 'Meditation modal art must use contain framing');

const rescuePos = hq.indexOf('hq-note-resync.js?v=1.0');
const xpPos = hq.indexOf('xp.js?v=10.98');
assert(rescuePos >= 0 && xpPos >= 0 && rescuePos < xpPos, 'HQ rescue must load before xp.js');
assert(rescue.includes("localStorage.getItem(NOTE_KEY)"), 'HQ rescue must preserve locally visible notes');
assert(rescue.includes("gamenfy:cloud-sync-ready"), 'HQ rescue must wait for canonical RPG sync readiness');
assert(rescue.includes('mergeNotes'), 'HQ rescue must merge instead of blindly replacing note arrays');
assert(rescue.includes("localStorage.setItem(NOTE_KEY"), 'rescued note payload must re-enter normal sync journal');

console.log('Daily Score + approved character sets + Website Lab history + HQ note rescue smoke checks passed.');