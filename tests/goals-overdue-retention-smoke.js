/* Goals overdue-retention regression — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname,'..','character.html'),'utf8');

assert.match(src,/const\s+activeList\s*=\s*goals\.filter\(g\s*=>\s*!g\.archived\s*&&\s*\(g\.pct\|\|0\)\s*<\s*100\)/,
  'unfinished goals must remain active regardless of how overdue they are');
assert.match(src,/const\s+pastList\s*=\s*goals\.filter\(g\s*=>\s*g\.archived\s*\|\|\s*\(g\.pct\|\|0\)\s*>=\s*100\)/,
  'Past goals must require deliberate completion/archive, not elapsed deadline');
assert.ok(!src.includes('daysUntil(g.deadline) >= -3'), 'three-day auto-hide rule must stay retired');
assert.ok(!src.includes('daysUntil(g.deadline) < -3'), 'deadline must not auto-move unfinished goals to Past');
assert.ok(src.includes('Link skills (recent activity appears automatically)'),
  'Goals UI must describe the capped XP log as recent activity, not complete automatic logging');
console.log('Goals overdue retention smoke: unfinished goals stay visible until deliberately closed; linked XP is recent evidence only.');
