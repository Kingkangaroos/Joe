'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const delivery=read('website-ventures-delivery-os.html');
const sales=read('ventures-sales-v2.html');
const lab=read('sites.html');

assert.ok(delivery.includes('data-gamenfy-scope="personal"'),'Delivery OS must remain personal-only');
assert.ok(delivery.includes("const KEY='venture_delivery_v1',APP_KEY='venture_delivery'"),'Delivery must use its own isolated cloud state');
assert.ok(delivery.includes('syncedKeys:[KEY]'),'Delivery must sync only its own state key');
assert.ok(!delivery.includes('xp.js'),'Delivery must not boot broad RPG cloud sync');
assert.ok(delivery.includes('Intake gate'),'Delivery must retain intake gate');
assert.ok(delivery.includes('QA gate'),'Delivery must retain QA gate');
assert.ok(delivery.includes('LAUNCH GEBLOKKEERD'),'Launch must be blocked in UI until QA is complete');
assert.ok(delivery.includes('maximaal 3 kernpagina’s'),'Founding scope guardrail must stay visible');
assert.ok(delivery.includes('één gebundelde revisieronde'),'Revision scope must stay bounded');
assert.ok(delivery.includes('10 founding slots'),'First-ten delivery capacity must remain explicit');

assert.ok(sales.includes("APP_KEY='venture_sales'"),'Sales must keep its isolated app-state key');
assert.ok(!sales.includes("APP_KEY='venture_delivery'"),'Sales and delivery cloud channels must stay separate');
assert.ok(lab.includes('venture_sales')&&lab.includes('venture_delivery'),'Website Lab must explain the state separation');

console.log('website ventures delivery ops smoke passed');
