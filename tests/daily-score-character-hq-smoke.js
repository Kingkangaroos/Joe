'use strict';

const fs = require('fs');
const assert = require('assert');

function read(path) { return fs.readFileSync(path, 'utf8'); }

const push = read('push.js');
const sites = read('sites.html');
const park = read('park31.html');
const art = read('character-art-overrides.js');
const hq = read('project-hq.html');
const rescue = read('hq-note-resync.js');
const importContract = read('img/lab/CHARACTER-IMPORTS-LAST-HORSE.md');

// Home Daily Score: the headline is ONLY today's checked count.
assert(push.includes("data.type !== 'gamenfy:park31-summary'"), 'Daily Score must listen to Park 3.1 canonical summary');
assert(push.includes('value.textContent = String(done);'), 'Daily Score headline must equal completedToday');
assert(push.includes("label.textContent = 'Daily Score'"), 'Home card must be labelled Daily Score');
assert(push.includes("suffix.style.display = 'none'"), 'legacy /10 suffix must be hidden');
assert(push.includes('done / count'), 'progress bar may still use checked/total ratio');
assert(push.includes("img/lab/daily-score/joey/l"), 'Joey Daily Score evolution path missing');
assert(push.includes('scoreArtLevel(done)'), 'Joey art must be derived from checked-count score');

// Accepted Website Lab history remains visibly available.
assert(sites.includes('Bewaarde oude testwebsite'), 'old Website Lab test must be visibly called out');
assert(sites.includes('site-klus-scroll-1-2.html'), 'Test 1.2 must remain in Website Lab');
assert(sites.includes('site-klus-scroll-1-1.html'), 'Test 1.1 must remain in Website Lab');
assert(sites.includes('site-klus-scroll.html'), 'original Test 1 must remain in Website Lab');
assert(sites.includes('site-plumbing-flagship-v1.html'), 'new plumbing flagship must coexist with old tests');

// The Last Horse character bridge: use current mission level, never a second level engine.
assert(park.includes('character-art-overrides.js?v=1.0'), 'Park 3.1 must load native character bridge');
assert(art.includes("character: 'owl'"), 'Budgeting must map to approved owl character');
assert(art.includes("character: 'panda'"), 'Meditation must map to approved panda character');
assert(art.includes('img/lab/park31/budgeting/'), 'Budgeting native evolution path missing');
assert(art.includes('img/lab/park31/meditation/'), 'Meditation native evolution path missing');
assert(art.includes("slot.querySelector('.p31-slot-level')"), 'native art must read Park 3.1 existing level output');
assert(importContract.includes('do **not** regenerate'), 'import contract must protect exact approved assets');

// HQ notes: rescue script must capture local state before xp.js starts RPG sync.
const rescuePos = hq.indexOf('hq-note-resync.js?v=1.0');
const xpPos = hq.indexOf('xp.js?v=10.98');
assert(rescuePos >= 0 && xpPos >= 0 && rescuePos < xpPos, 'HQ rescue must load before xp.js');
assert(rescue.includes("localStorage.getItem(NOTE_KEY)"), 'HQ rescue must preserve locally visible notes');
assert(rescue.includes("gamenfy:cloud-sync-ready"), 'HQ rescue must wait for canonical RPG sync readiness');
assert(rescue.includes('mergeNotes'), 'HQ rescue must merge instead of blindly replacing note arrays');
assert(rescue.includes("localStorage.setItem(NOTE_KEY"), 'rescued note payload must re-enter normal sync journal');

console.log('Daily Score + Last Horse character bridge + HQ note rescue smoke checks passed.');
