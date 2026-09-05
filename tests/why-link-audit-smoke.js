/* WHY Link Audit Lab regression guard — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'lab-why-audit.html'),'utf8');
const lab=fs.readFileSync(path.join(root,'lab.html'),'utf8');

assert.match(src,/localStorage\.getItem\('rpg_goals_v1'\)/,'audit must read the canonical Goals store');
assert.match(src,/!g\.archived&&Number\(g\.pct\|\|0\)<100/,'only active unfinished Goals are audited');
assert.match(src,/Array\.isArray\(g\.linkedSkills\)/,'explicit linkedSkills drive the skill audit');
assert.match(src,/!defaults\[k\]/,'unknown skill keys must be surfaced rather than silently accepted');
assert.match(src,/WHY 35%/);
assert.match(src,/skill-link 35%/);
assert.match(src,/deadline 20%/);
assert.match(src,/titel 10%/);
assert.match(src,/character\.html#goals/,'audit routes edits back to canonical Goals UI');
assert.match(src,/geen automatische koppelingen/i,'copy must explicitly reject automatic goal inference');
assert.doesNotMatch(src,/localStorage\.setItem|localStorage\.removeItem|saveGoals\(|toggleGoalSkill\(|fetch\(|supabase/i,'audit must stay read-only and disconnected from remote writes');
assert.doesNotMatch(src,/linkedSkills\s*[:=]\s*\[[^\]]+\]/,'audit must not hard-code guessed goal-to-skill mappings');
assert.match(lab,/href="lab-why-audit\.html"/,'normal ChatGPT Lab must expose the WHY Link Audit');
console.log('WHY Link Audit smoke: canonical read-only Goals audit, explicit links, quality scoring and no inferred mutations are guarded.');
