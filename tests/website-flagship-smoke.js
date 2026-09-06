'use strict';

const fs = require('fs');
const assert = require('assert');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

const flagship = read('site-plumbing-flagship-v1.html');
const lab = read('sites.html');
const hq = read('project-hq.html');
const xp = read('xp.js');

assert(flagship.includes('Premium Plumbing flagship'), 'flagship identity missing');
assert(flagship.includes('data-beat="0"') && flagship.includes('data-beat="5"'), 'six-beat story shell missing');
assert(flagship.includes('finance.html?tab=ventures&amp;space=lab&amp;venture=sell_websites'), 'flagship must return to exact Website Venture Lab context');
assert(flagship.includes('no client claims') || flagship.includes('geen fictieve keurmerken'), 'prototype must clearly avoid invented client proof');
assert(!/tel:\+?[0-9]/i.test(flagship), 'prototype must not ship an invented phone number');
assert(lab.includes('site-plumbing-flagship-v1.html'), 'Website Lab must surface the production flagship');

const noteKey = 'rpg_project_hq_notes_v1';
assert(hq.includes(`const NOTE_KEY='${noteKey}'`), 'Project HQ note key changed unexpectedly');
assert(xp.includes(`'${noteKey}'`), 'Project HQ notes must remain in the RPG cloud-sync scope');
assert(hq.includes('gamenfy:project-hq-change'), 'Project HQ must emit a local note-change signal');

console.log('Website flagship + HQ handoff smoke checks passed.');
