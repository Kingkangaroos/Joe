/* Legacy active-quest reference audit — ChatGPT (OpenAI)
   Current public Daily Missions come from RPG_DEFAULT_SKILLS; this key is legacy. */
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
assert.ok(refs.includes('settings.html'),'legacy Settings control is still inventoried until deliberately retired');
assert.ok(refs.includes('character.html'),'Character should retain the explicit legacy-only boundary comment');
console.log('Legacy active-quest audit: refs='+refs.join(', ')+'; no unexpected active consumer exists.');
