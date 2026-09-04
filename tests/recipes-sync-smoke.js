/* Recipes cloud-durability regression — ChatGPT (OpenAI) */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const recipes=fs.readFileSync(path.join(__dirname,'..','recipes.html'),'utf8');
const xp=fs.readFileSync(path.join(__dirname,'..','xp.js'),'utf8');

assert.match(recipes,/<script src="sync\.js\?v=11\.0" defer><\/script>/,'Recipes must load shared cloud sync');
assert.match(recipes,/rpg_recipes_v1/,'Recipes must use the durable RPG recipe key');
assert.match(xp,/['\"]rpg_recipes_v1['\"]/,'central RPG sync scope must include recipes');
assert.match(recipes,/Storage: rpg_recipes_v1 \(synced, added to RPG_SYNC_KEYS in xp\.js\)/,'Recipes source should document its durable storage contract');
console.log('Recipes sync smoke: recipe state is connected to the canonical RPG cloud scope.');
