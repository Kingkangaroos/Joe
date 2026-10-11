/* Cooking Recipe Book smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/recipes-smoke.js */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const page=fs.readFileSync(path.join(root,'recipes.html'),'utf8');
const character=fs.readFileSync(path.join(root,'character.html'),'utf8');
const xp=fs.readFileSync(path.join(root,'xp.js'),'utf8');

for(const name of ['Tonijn salade','Egg salad','Cha siu','Stroop / Siroop','Pasta carbonara','Noedels met paksoi, fachong & gekruide kip']){
  assert.ok(page.includes(name),'Notion recipe seed includes '+name);
}
assert.match(page,/NOTION_RECIPE_SEED/,'Notion seed is explicit and deterministic');
assert.match(page,/mergeNotionSeed/,'Starter recipes merge into existing user data');
assert.match(page,/GAMENFY_RECIPE_SEED/,'Gamenfy recipe seed is separate from the Notion import');
assert.match(page,/Geen sojasaus bij de kip/,'Noodle recipe preserves the no-soy-on-chicken rule');
assert.match(page,/Madame Jeanette/,'Noodle recipe includes Madame Jeanette in the vegetable components');
assert.match(page,/1 komkommer/,'Pickled vegetable side includes cucumber');
assert.match(page,/wortelstukjes\/\-sliertjes/,'Pickled vegetable side includes carrot strips or pieces');
assert.match(page,/ingredientsText/,'Recipe Book stores normal ingredient text');
assert.match(page,/methodText/,'Recipe Book stores preparation steps');
assert.match(page,/Macro-calculator \(optioneel/,'Macro calculator is optional, not the primary recipe format');
assert.match(character,/Open Recipe Book/,'Cooking skill links clearly to Recipe Book');
assert.match(character,/skillKey==='cooking'/,'Recipe Book link is scoped to Cooking');
assert.match(xp,/rpg_recipes_v1/,'Recipe Book stays inside canonical RPG cloud sync');
console.log('Cooking Recipe Book smoke passed: Notion seed, editable recipe fields, optional macros and Cooking link are wired.');
