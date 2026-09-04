/* Finance durable-state sync regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','finance.html'),'utf8');

const cfg=(src.match(/initCloudSync\s*\(\s*\{[\s\S]{0,700}?appKey\s*:\s*'finance'[\s\S]{0,700}?\}\s*\)/)||[])[0]||'';
assert.ok(cfg,'Finance cloud-sync config must exist');
for(const key of ['subs','wishlist','vk_paid_v1','nw_currency','nw:activity','nw:history']){
  assert.match(cfg,new RegExp("['\"]"+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+"['\"]"),'durable Finance key must sync: '+key);
}
assert.match(cfg,/syncedPrefixes\s*:\s*\[\s*['\"]nw:['\"]\s*\]/,'all nw:* portfolio/debt/account state must remain cloud-synced');
assert.match(src,/const PF_KEY = 'nw:portfolio'/,'portfolio remains under synced nw: namespace');
assert.match(src,/const DT_KEY = 'nw:debts'/,'debts remain under synced nw: namespace');
assert.match(src,/storeGet\('vk_paid_v1'\)/,'subscription paid-state remains durable app data');
console.log('Finance sync smoke: subscriptions, paid-state, wishlist, net worth, portfolio and debts stay in the Finance cloud scope.');
