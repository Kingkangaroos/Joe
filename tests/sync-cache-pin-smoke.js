/* Current sync cache-key audit — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const sync=fs.readFileSync('sync.js','utf8');
const version=(sync.match(/Gamenfy v(\d+\.\d+) server CAS write gate/)||[])[1];
assert.equal(version,'11.9','guard expects the current generation-aware CAS sync version');
const frozen=new Set(['park3.html']);
const files=fs.readdirSync('.').filter(f=>f.endsWith('.html')&&fs.statSync(f).isFile());
const consumers=[];
const active=[];
const stale=[];
for(const file of files){
  const src=fs.readFileSync(file,'utf8');
  const matches=[...src.matchAll(/src=["'](?:\.\/)?sync\.js\?v=([^"']+)["']/g)];
  if(!matches.length)continue;
  consumers.push(file);
  if(frozen.has(file))continue;
  active.push(file);
  for(const m of matches)if(m[1]!==version)stale.push(`${file}:${m[1]}`);
}
assert.ok(active.includes('lab.html'),'General Lab remains an audited active sync consumer');
assert.ok(active.includes('project-hq.html'),'Project HQ remains an audited active sync consumer');
assert.ok(consumers.includes('park3.html')&&frozen.has('park3.html'),'Park 3.0 stays an explicit frozen rollback/reference exclusion');
assert.deepEqual(stale,[],`stale active sync cache pins: ${stale.join(', ')}`);
console.log(`Sync cache pin smoke passed: ${active.length} active top-level consumers request sync.js?v=${version}; Park 3.0 remains frozen.`);
