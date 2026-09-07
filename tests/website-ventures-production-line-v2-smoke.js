'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const data=JSON.parse(read('WEBSITE-VENTURES-PRODUCTION-LINE-V2.json'));
const elements=JSON.parse(read('HIGGSFIELD-ELEMENTS-REGISTRY.json'));
const ui=read('website-ventures-production-line-v2.html');
const workspace=read('ventures-workspace.html');
const park=read('img/lab/park31/ASSET-MAP.md');

const web=(data.websiteBatches||[]).flatMap(b=>(b.assets||[]).map(a=>({...a,_batch:b})));
const gf=(data.gamenfyBatches||[]).flatMap(b=>(b.assets||[]).map(a=>({...a,_batch:b})));
const all=[...web,...gf];
const ids=all.map(x=>x.id);
assert.equal(web.length,18,'Production Line v2 should retain 18 planned Website assets');
assert.equal(gf.length,32,'Production Line v2 should retain 32 planned Gamenfy assets/objects');
assert.equal(new Set(ids).size,ids.length,'Every production asset ID must be unique');
assert.equal(all.filter(x=>x._batch.priority==='P0').length,23,'P0 queue count should stay deliberate and bounded');

assert.ok(data.hardRules.some(x=>x.includes('No paid generation without an asset ID')),'Paid generation must remain gated by exact slot');
assert.ok(data.recommendedSubscriptionSprintOrder.some(x=>x.includes('AutoSprite')),'Subscription sprint must include an AutoSprite pilot before batching sprites');
assert.ok(data.stopConditions.some(x=>x.includes('AutoSprite')),'Sprite failures need an explicit stop condition');
assert.ok(JSON.stringify(data.modelMatrix).includes('Seedream 5.0 Pro remove_bg=true'),'Transparent Gamenfy props must have a planned cutout workflow');
assert.ok(JSON.stringify(data.modelMatrix).includes('AutoSprite Animation'),'Game-ready sprite generation must be a first-class workflow');

const publicMissionProps=gf.filter(x=>x.id.startsWith('GF-DM-'));
assert.equal(publicMissionProps.length,11,'All 11 public Daily Missions need one interaction-prop slot');
const missions=new Set(publicMissionProps.map(x=>x.mission));
['budgeting','sleep','nutrition','walking','teeth','household','meditation','gratitude','good_deed','screen_time','cold_shower'].forEach(k=>assert.ok(missions.has(k),'Missing Daily Mission prop: '+k));
assert.ok(gf.some(x=>x.id==='GF-SK-CHESS-001'),'Chess skill object must be planned');
assert.ok(gf.some(x=>x.id==='GF-DS-SPRITE-WALK-001'&&String(x.model).includes('AutoSprite')),'Daily Score walk cycle must use the sprite pipeline');
assert.ok(gf.some(x=>x.id==='GF-PRIV-WEED-001'&&x.scope==='private'),'Weed-control object must stay private');
assert.ok(gf.some(x=>x.id==='GF-PRIV-DISCIPLINE-001'&&x.scope==='private'),'No-porn temptation FX must stay private');

assert.ok(park.includes('13 native Park 3.1 evolution sets × 10 levels = 130 WebP assets'),'Existing Park 3.1 art inventory must remain the source of truth');
assert.ok(data.gamenfyStrategy.existingInventory.includes('130 committed WebPs'),'Production plan must avoid recreating existing Daily evolution art');

assert.ok(ui.includes("fetch('WEBSITE-VENTURES-PRODUCTION-LINE-V2.json'"),'Visual production board must read the durable production JSON');
assert.ok(ui.includes('Gamenfy Objects')&&ui.includes('Model Matrix')&&ui.includes('Sprintvolgorde'),'Production UI must expose all planning views');
assert.ok(workspace.includes('website-ventures-production-line-v2.html'),'Finance → Ventures Productielijn must link to the detailed factory');
assert.ok(workspace.includes('18 Website-assets + 32 Gamenfy objects/sprites'),'Workspace summary must keep scope visible');
assert.ok(workspace.includes('130 evolution WebPs'),'Workspace must warn against wasting credits on existing Park art');

assert.ok(elements.currentHiggsfieldState.includes('No reusable Elements currently exist'),'Element registry must not imply Elements were already created');
assert.ok((elements.planned||[]).some(x=>x.sourceAsset==='PL-CHAR-001'&&x.category==='character'),'Master technician must have a planned character Element');
assert.ok((elements.planned||[]).some(x=>x.sourceAsset==='GF-ENV-PARK-001'&&x.category==='environment'),'Gamenfy park world must have a planned environment Element');
assert.ok(!(elements.planned||[]).some(x=>x.element_id),'No Element ID may be invented before Higgsfield actually creates it');

console.log('website ventures production line v2 smoke passed');
