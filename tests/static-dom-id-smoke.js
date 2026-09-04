/* Static duplicate DOM id audit — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const skipDirs=new Set(['.git','node_modules','_archive']);
const html=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  if(e.name.startsWith('.')) continue;
  const p=path.join(dir,e.name);
  if(e.isDirectory()){if(!skipDirs.has(e.name))walk(p);continue;}
  if(path.extname(e.name)==='.html')html.push(p);
}}
walk(ROOT);
const duplicates=[];
for(const file of html){
  const src=fs.readFileSync(file,'utf8');
  const counts=new Map();
  for(const m of src.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)) counts.set(m[1],(counts.get(m[1])||0)+1);
  for(const [id,n] of counts) if(n>1) duplicates.push(path.relative(ROOT,file).replaceAll('\\','/')+' #'+id+' x'+n);
}
assert.deepEqual(duplicates,[],'duplicate static DOM ids found:\n'+duplicates.join('\n'));
console.log('DOM id smoke: '+html.length+' active HTML files contain no duplicate static ids.');
