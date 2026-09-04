/* Static local navigation/asset integrity regression — ChatGPT (OpenAI) */
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
const missing=[];
for(const file of html){
  const src=fs.readFileSync(file,'utf8');
  const rel=path.relative(ROOT,file).replaceAll('\\','/');
  const dir=path.dirname(file);
  // Inspect real static HTML tags only. A broad href/src regex also matches JS
  // assignments such as `src = 'Fitbit'` and dynamic animation prefixes.
  const tagRe=/<(?:a|link|script|img|iframe|source|video|audio)\b[^>]*>/gi;
  const attrRe=/(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  for(const tagMatch of src.matchAll(tagRe)){
    const tag=tagMatch[0];
    for(const m of tag.matchAll(attrRe)){
      let ref=m[1].trim();
      if(!ref || ref.startsWith('#') || ref.startsWith('http:') || ref.startsWith('https:') || ref.startsWith('//') || ref.startsWith('data:') || ref.startsWith('mailto:') || ref.startsWith('tel:') || ref.startsWith('javascript:')) continue;
      ref=ref.split('#')[0].split('?')[0];
      if(!ref || ref.includes('${') || ref.includes('{{')) continue;
      const target=ref.startsWith('/')?path.join(ROOT,ref.slice(1)):path.resolve(dir,ref);
      if(!fs.existsSync(target)) missing.push(rel+' -> '+m[1]);
    }
  }
}
assert.deepEqual(missing,[],'missing local static HTML target(s):\n'+missing.join('\n'));
console.log('Navigation integrity smoke: '+html.length+' active HTML files have no missing static local href/src targets.');
