'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {createDemo,toggleMission}=require('../lab-home-v2.js');
const a=createDemo(),b=createDemo();assert.equal(a.missions.length,11);assert.equal(a.missions.filter(x=>x.done).length,4);
assert.deepEqual(a.missions.map(x=>x.key),['budgeting','sleep','nutrition','walking','teeth','household','meditation','gratitude','good_deed','screen_time','cold_shower']);
const levels=a.missions.map(x=>x.level);toggleMission(a,'meditation');assert.equal(a.missions.filter(x=>x.done).length,5);assert.equal(b.missions.filter(x=>x.done).length,4,'demo states isolated');toggleMission(a,'meditation');assert.equal(a.missions.filter(x=>x.done).length,4);assert.deepEqual(a.missions.map(x=>x.level),levels,'no simulated level policy silently introduced');assert.equal(toggleMission(a,'unknown'),null);
for(const m of a.missions)assert.ok(fs.existsSync(path.join(root,'img/lab/park31',m.dir,'l'+String(m.level).padStart(2,'0')+'.webp')));
const html=read('lab-home-v2.html'),js=read('lab-home-v2.js');new vm.Script(js);
assert.match(html,/ALLE CIJFERS ZIJN DEMO/);assert.doesNotMatch(html+js,/localStorage|sessionStorage|indexedDB|supabase|fetch\(|XMLHttpRequest|sendBeacon|auth\.js|sync\.js|xp\.js/,'experiment must not use real account, persistence or data network APIs');
for(const m of html.matchAll(/(?:src|href)="([^"?#]+)[^"]*"/g)){if(!/^https?:/.test(m[1]))assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);}
assert.match(read('lab.html'),/id="gwHomeV2"/);assert.match(read('GAMENFY-WORKSPACE.json'),/"reviewUrl":"lab-home-v2.html"/);
console.log('Home v2: all public missions, reversible isolated demo actions, source assets and no real-state APIs pass.');
