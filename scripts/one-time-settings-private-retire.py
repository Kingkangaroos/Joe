from pathlib import Path

p = Path('settings.html')
s = p.read_text(encoding='utf-8')

# General Settings skill grid must never enumerate private skills. Private
# missions already have their own PIN-gated routes; showing them here defeated
# the UI privacy boundary even when the private session was locked.
old_filter = """    const catSkills = Object.entries(defaults)
      .filter(([,s]) => s.parentSkill === cat)
      .sort((a,b) => a[1].label.localeCompare(b[1].label));"""
new_filter = """    const catSkills = Object.entries(defaults)
      .filter(([,s]) => s.parentSkill === cat && !s.private)
      .sort((a,b) => a[1].label.localeCompare(b[1].label));"""
assert old_filter in s, 'Settings skill-grid filter anchor changed'
s = s.replace(old_filter, new_filter, 1)

# Remove stale, fully inactive quest definitions from Settings. Their old map
# included membership that no longer matches the canonical Daily Mission set.
# Keep the visible inactive explanation + fail-safe toggleQuest stub only.
start = s.index("const DAILY_QUEST_DEFS = [")
end_marker = "function showToast(msg, isError) {"
end = s.index(end_marker, start)
legacy_state_block = s[start:end]
assert "rpg_active_quests_v1" in legacy_state_block
assert "function saveActiveQuests" in legacy_state_block
s = s[:start] + s[end:]

render_start = s.index("// ── Daily quest toggles")
toggle_start = s.index("window.toggleQuest = function", render_start)
# Retain only a compact explicit fail-safe boundary.
prefix = "// ── Legacy Daily Mission compatibility guard ───────────────────\n"
s = s[:render_start] + prefix + s[toggle_start:]

assert 'DAILY_QUEST_DEFS' not in s
assert 'DEFAULT_ACTIVE_QUESTS' not in s
assert 'getActiveQuests' not in s
assert 'saveActiveQuests' not in s
assert 'renderDailyQuestToggles' not in s
assert "showToast('Legacy quest selection is inactive')" in s

p.write_text(s, encoding='utf-8')

Path('tests/settings-private-boundary-smoke.js').write_text(r'''/* Settings private-skill boundary regression — ChatGPT (OpenAI) */
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
''', encoding='utf-8')
