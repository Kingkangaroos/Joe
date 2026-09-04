/* Legacy active-quest retirement regression — ChatGPT (OpenAI)
   Current public Daily Missions come from RPG_DEFAULT_SKILLS; rpg_active_quests_v1 remains compatibility data only. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const skip=new Set(['.git','node_modules','_archive','tests']);
const exts=new Set(['.js','.html','.ts']);
const refs=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  if(e.name.startsWith('.')) continue;
  const p=path.join(dir,e.name);
  if(e.isDirectory()){if(!skip.has(e.name))walk(p);continue;}
  if(!exts.has(path.extname(e.name)))continue;
  const src=fs.readFileSync(p,'utf8');
  if(src.includes('rpg_active_quests_v1')) refs.push(path.relative(ROOT,p).replaceAll('\\','/'));
}}
walk(ROOT);
const allowed=new Set(['xp.js','settings.html','character.html']);
const unexpected=refs.filter(x=>!allowed.has(x));
assert.deepEqual(unexpected,[],'unexpected active consumer(s) of legacy rpg_active_quests_v1: '+unexpected.join(', '));

const settings=fs.readFileSync(path.join(ROOT,'settings.html'),'utf8');
assert.match(settings,/Legacy daily quest selection · inactive/,'Settings must clearly mark the old selector inactive');
assert.match(settings,/This older quest selector is no longer used by the current Daily Missions/,'Settings must explain the canonical replacement');
assert.doesNotMatch(settings,/\n\s*renderDailyQuestToggles\(\);/,'Settings boot must not render the legacy selector');
const toggle=(settings.match(/window\.toggleQuest\s*=\s*function\([^)]*\)\s*\{[\s\S]*?\n\};/)||[])[0]||'';
assert.ok(toggle,'legacy toggleQuest compatibility function should remain explicit');
assert.match(toggle,/Legacy quest selection is inactive/,'legacy toggle function must fail safe');
assert.doesNotMatch(toggle,/saveActiveQuests\(/,'inactive selector must not mutate legacy selection state');

const character=fs.readFileSync(path.join(ROOT,'character.html'),'utf8');
assert.match(character,/The old rpg_active_quests_v1 selection is legacy only/,'Character should retain the explicit legacy-only boundary');
console.log('Legacy active-quest audit: compatibility data remains, but Settings can no longer present or mutate it as current Daily Missions.');
