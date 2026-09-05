from pathlib import Path

p = Path('character.html')
s = p.read_text(encoding='utf-8')

old = """  // active = not archived, not yet 100%, and not more than 3 days overdue
  // (a small grace period before a missed deadline quietly drops off).
  // Reaching 100% is Joey's own deliberate \"I did this\" signal, so it moves
  // to Past immediately regardless of the deadline date.
  const activeList = goals.filter(g => !g.archived && (g.pct||0) < 100 && daysUntil(g.deadline) >= -3);
  const pastList = goals.filter(g => g.archived || (g.pct||0) >= 100 || daysUntil(g.deadline) < -3);"""
new = """  // v10.99: overdue goals stay active until Joey deliberately closes them.
  // Auto-hiding a missed goal after three days worked directly against the
  // feature's purpose: keep important goals visible instead of silently
  // drifting to the next one. Deadline only changes urgency copy; it never
  // archives a goal by itself. Reaching 100% or an explicit archive does.
  const activeList = goals.filter(g => !g.archived && (g.pct||0) < 100);
  const pastList = goals.filter(g => g.archived || (g.pct||0) >= 100);"""
assert old in s, 'goal active/past anchor changed'
s = s.replace(old, new, 1)

old2 = '<div class="sec-head">Link skills (activity here logs automatically)</div>'
new2 = '<div class="sec-head">Link skills (recent activity appears automatically)</div>'
assert old2 in s, 'goal linked-skill copy anchor changed'
s = s.replace(old2, new2, 1)

old3 = """// Note: xpLog caps at 200 entries app-wide, so a goal running for many
// months on a very active account could miss its earliest related entries
// once they roll off — acceptable v1 tradeoff for not touching addXP."""
new3 = """// Note: xpLog caps at 200 entries app-wide. This panel therefore shows
// RECENT linked activity only; it is not the goal's progress source of truth.
// Goal progress remains Joey's explicit manual percentage, so log retention
// can never make a goal move backwards or auto-complete it."""
assert old3 in s, 'goal XP-log explanation anchor changed'
s = s.replace(old3, new3, 1)

p.write_text(s, encoding='utf-8')

# Permanent structural regression: no deadline-based auto-archiving and copy
# must not claim the retained XP log is a complete activity history.
t = Path('tests/goals-overdue-retention-smoke.js')
t.write_text(r"""/* Goals overdue-retention regression — ChatGPT (OpenAI) */
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
""", encoding='utf-8')
