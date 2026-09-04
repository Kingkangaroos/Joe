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
  // Only inspect real static start tags. A file-wide id= regex also matches
  // template strings inside JavaScript (for example id="${item.id}").
  for(const tagMatch of src.matchAll(/<[a-zA-Z][^>]*>/g)){
    const tag=tagMatch[0];
    const m=tag.match(/\bid\s*=\s*["']([^"']+)["']/);
    if(!m) continue;
    const id=m[1];
    if(id.includes('${')||id.includes('{{')||id.includes('<%')) continue;
    counts.set(id,(counts.get(id)||0)+1);
  }
  for(const [id,n] of counts) if(n>1) duplicates.push(path.relative(ROOT,file).replaceAll('\\','/')+' #'+id+' x'+n);
}
assert.deepEqual(duplicates,[],'duplicate static DOM ids found:\n'+duplicates.join('\n'));
console.log('DOM id smoke: '+html.length+' active HTML files contain no duplicate literal ids.');
