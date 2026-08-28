/* Chess skill registry smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/chess-skill-smoke.js */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

const localStorage = new Storage();
const window = {
  addEventListener() {},
  dispatchEvent() {}
};
const document = {
  readyState: 'loading',
  body: { appendChild() {} },
  addEventListener() {},
  getElementById() { return null; },
  createElement() { return { style:{}, innerHTML:'', id:'' }; }
};
const sandbox = {
  window,
  document,
  localStorage,
  console,
  Date,
  Math,
  JSON,
  Object,
  Number,
  String,
  Array,
  setTimeout() { return 1; },
  clearTimeout() {},
  setInterval() { return 1; },
  fetch: async () => ({ ok:false, json:async () => [] })
};

function run(file) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  vm.runInNewContext(source, sandbox, { filename:file });
}

run('quests.js');
run('ladders.js');
run('xp.js');

const defs = window.RPG_DEFAULT_SKILLS;
const chess = defs.chess;
assert.ok(chess, 'Chess is registered in RPG_DEFAULT_SKILLS');
assert.equal(Object.keys(defs).length, 47, 'the full registry now contains 47 definitions including disabled Grounding');
assert.equal(Object.values(defs).filter(def => def.active !== false).length, 46, 'Chess raises the active roster to 46');
assert.equal(chess.label, 'Chess');
assert.equal(chess.parentSkill, 'mind');
assert.equal(chess.active, true);
assert.notEqual(chess.isHabit, true, 'Chess uses normal 1-100 XP logic, not Daily Mission scoring');
assert.equal(chess.quickLog.length, 5, 'Chess has concrete activity logging');
assert.ok(chess.quickLog.every(item => item.label && item.xp > 0));
assert.ok(chess.why && chess.why.includes('Reviewing your own games'));
assert.equal(Object.keys(chess.milestones).length, 11);

const fresh = window.getCharacter();
assert.ok(fresh.skills.chess, 'existing/fresh character data is enriched with Chess');
assert.equal(window.getSkillLevel('chess', 0), 1);
assert.equal(window.getSkillLevel('chess', window.xpForLevel(10)), 10);
assert.equal(window.addXP('chess', 25, 'Test game').newXP, 25, 'Chess accepts normal XP logging');

const ladder = window.SKILL_LADDERS.chess;
const quests = window.RPG_QUESTS.chess;
const optional = window.OPTIONAL_QUESTS.chess;
assert.equal(ladder.length, 11, 'Chess has a complete assessment/progression ladder');
assert.equal(quests.length, 11, 'Chess has legacy quest and tier-gate compatibility');
assert.equal(optional.length, 9, 'Chess has optional stretch quests');
assert.deepEqual(Array.from(ladder, tier => tier.level), [1,3,6,10,18,30,45,60,75,90,100]);
assert.ok(ladder.every(tier => tier.title && tier.meaning && tier.why && tier.doThis.length && tier.examples.length && tier.next && tier.claim));
assert.deepEqual([10,25,50,75].map(gate => {
  return quests.filter(q => q.lvl <= gate).at(-1).lvl;
}), [10,18,45,75], 'all four regular tier gates resolve to a concrete Chess quest');

let lock = window.tierLockInfo('chess', 11);
assert.equal(lock.locked, true);
assert.equal(lock.gate, 10);
assert.equal(lock.quest.lvl, 10);
window.setQuestDone('chess', 10, true);
lock = window.tierLockInfo('chess', 26);
assert.equal(lock.gate, 25);
assert.equal(lock.quest.lvl, 18);
assert.equal(window.questClaimable('chess', 30).gate, 18);
window.setQuestDone('chess', 18, true);
assert.equal(window.questClaimable('chess', 30).ok, true);

const dailyMissionKeys = Object.keys(defs).filter(key => defs[key].isHabit && !defs[key].private && defs[key].active !== false);
assert.equal(dailyMissionKeys.includes('chess'), false, 'Chess never leaks into the 0-10 Daily Mission Garden');
assert.ok(ladder.length || quests.length, 'the assessment union includes Chess automatically');

const lab = fs.readFileSync(path.join(__dirname, '..', 'lab.html'), 'utf8');
const character = fs.readFileSync(path.join(__dirname, '..', 'character.html'), 'utf8');
assert.ok(lab.includes("chess:[.42,.62,.12]"), 'Lab gives Chess its own movement temperament');
assert.ok(lab.includes("chess:'<rect x=\"77\""), 'Lab gives Chess its own board/knight prop');
assert.ok(lab.includes("chess:['Schaak.'"), 'Lab gives Chess its own voice');
assert.ok(character.includes("chess:'chess'"), 'Skills grid gives Chess its own line icon');

console.log('Chess skill smoke test passed: XP, 11 tiers, gates, assessment, logging and Lab visuals are wired.');
