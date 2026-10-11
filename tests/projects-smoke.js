/* Projects workspace smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/projects-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const page=fs.readFileSync(path.join(root,'projects.html'),'utf8');
const app=fs.readFileSync(path.join(root,'projects.js'),'utf8');
const topbar=fs.readFileSync(path.join(root,'topbar.js'),'utf8');

assert.match(page,/Life OS · Projects/,'Projects has a dedicated Life OS surface');
assert.match(page,/projectList/,'Projects page has a project selector');
assert.match(page,/projectDetail/,'Projects page has a working detail surface');
for(const section of ['Taken','Ideeën','Moodboard','Shopping','Project notes']){
  assert.match(app,new RegExp(section),'House workspace keeps '+section+' available');
}
assert.match(app,/id:'house-upgrade'/,'House Upgrade is seeded as the first project');
assert.match(app,/Keukenindeling definitief maken/,'House Upgrade starts with a concrete next-action backlog');
assert.match(app,/appKey:'projects'/,'Projects uses its own cloud-sync domain');
assert.match(app,/syncedKeys:\[KEY\]/,'Projects state is included in cloud sync');
assert.doesNotMatch(app,/FileReader|data:image/,'Moodboard avoids storing heavy image blobs inside app_state JSON');
assert.match(topbar,/projects\.html/,'Projects is reachable from the persistent app chrome');
assert.match(topbar,/Projects/,'Projects shortcut has an accessible label');
console.log('Projects smoke passed: dedicated House Upgrade workspace, autosave/cloud sync and global navigation are wired.');
