/* Goals/Ventures source-of-truth regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');

const xp=fs.readFileSync(path.join(ROOT,'xp.js'),'utf8');
const character=fs.readFileSync(path.join(ROOT,'character.html'),'utf8');
const ventures=fs.readFileSync(path.join(ROOT,'ventures.js'),'utf8');

for (const key of ['rpg_goals_v1','rpg_ventures_v1','rpg_venture_notes_v1']) {
  assert.ok(xp.includes("'"+key+"'") || xp.includes('"'+key+'"'), key+' must remain in canonical RPG sync scope');
}
assert.match(character,/const\s+GOALS_KEY\s*=\s*['"]rpg_goals_v1['"]/,'Character Goals must use rpg_goals_v1');
assert.match(character,/const\s+VENTURE_NOTES_KEY\s*=\s*['"]rpg_venture_notes_v1['"]/,'Venture notes must use rpg_venture_notes_v1');
assert.match(ventures,/const\s+KEY\s*=\s*['"]rpg_ventures_v1['"]/,'Ventures must use rpg_ventures_v1');

const skip=new Set(['.git','node_modules','_archive','tests']);
const exts=new Set(['.js','.html','.ts']);
const legacyWriters=[];
function walk(dir){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(e.name.startsWith('.')) continue;
    const p=path.join(dir,e.name);
    if(e.isDirectory()){ if(!skip.has(e.name)) walk(p); continue; }
    if(!exts.has(path.extname(e.name))) continue;
    const src=fs.readFileSync(p,'utf8');
    if(/app_state\?[^\n"'`]*key=eq\.goals\b/.test(src) || /appKey\s*:\s*['"]goals['"]/.test(src)) {
      legacyWriters.push(path.relative(ROOT,p).replaceAll('\\','/'));
    }
  }
}
walk(ROOT);
assert.deepEqual(legacyWriters,[],'legacy standalone goals cloud source must stay inactive: '+legacyWriters.join(', '));
console.log('Goals/Ventures source smoke: canonical RPG keys active; standalone legacy goals row has no active client writer.');
