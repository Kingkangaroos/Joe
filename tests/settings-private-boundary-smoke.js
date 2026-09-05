/* Settings private-skill boundary regression — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname,'..','settings.html'),'utf8');

assert.match(src,/\.filter\(\(\[,s\]\)\s*=>\s*s\.parentSkill\s*===\s*cat\s*&&\s*!s\.private\)/,
  'general Settings skill grid must exclude private skills while locked');
assert.ok(!src.includes('DAILY_QUEST_DEFS'),
  'stale legacy Daily quest membership definitions must stay retired from Settings');
assert.ok(!src.includes('saveActiveQuests'),
  'Settings must not retain a dormant writer for legacy active-quest selection');
assert.ok(!src.includes('renderDailyQuestToggles'),
  'Settings must not retain a dormant renderer for the legacy selector');
assert.match(src,/Legacy daily quest selection · inactive/,
  'Settings should retain a truthful explanation for compatibility data');
assert.match(src,/window\.toggleQuest\s*=\s*function\([^)]*\)\s*\{[\s\S]*?Legacy quest selection is inactive/,
  'any legacy inline/stale caller must still fail safe');

console.log('Settings private boundary smoke: general skill grid hides private skills and stale Daily membership code stays retired.');
