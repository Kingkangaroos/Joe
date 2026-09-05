/* Restore Dry Run regression guard — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const engine=fs.readFileSync(path.join(root,'backup-restore-validator.js'),'utf8');
const lab=fs.readFileSync(path.join(root,'lab-restore-dry-run.html'),'utf8');
const spec=fs.readFileSync(path.join(root,'RESTORE-IMPORT-SPEC.md'),'utf8');

const window={RPG_SYNC_KEYS:['rpg_goals_v1'],RPG_SYNC_PREFIXES:['rpg_daily_v1:']};
vm.runInNewContext(engine,{window,Set,Array,Object,Number,JSON,String,Math});
const V=window.GamenfyRestoreValidator;
assert.ok(V&&typeof V.validateBackup==='function'&&typeof V.analyzeAgainstStorage==='function');

const good=V.validateBackup({app:'gamenfy',version:2,exportedAt:'2026-09-06T00:00:00Z',keys:{
  rpg_goals_v1:'[{"title":"Goal"}]',
  subs:'[]',
  'stack:items':'[]',
  mystery_key:'x'
}});
assert.equal(good.valid,true,'credential-free v2 backup should be analyzable');
assert.equal(good.restoreReady,false,'dry-run validator must never grant restore readiness');
assert.equal(good.entries.length,3,'three canonical entries are trusted');
assert.equal(good.unknown.length,1,'unknown key is excluded and surfaced');
assert.equal(good.manifest.ownerProof,false,'v2 backup has no owner proof');
assert.ok(good.warnings.some(x=>/Owner\/auth proof is missing/.test(x)));

const bad=V.validateBackup({app:'gamenfy',version:2,keys:{hevy_api_key:'secret',rpg_pin_v1:'1234'}});
assert.equal(bad.valid,false,'sensitive keys hard-fail safety validation');
assert.equal(bad.blocked.length,2);
assert.ok(bad.errors.some(x=>/sensitive/.test(x)));

function fakeStorage(obj){
  const keys=Object.keys(obj);
  return {length:keys.length,key:i=>keys[i]||null,getItem:k=>Object.prototype.hasOwnProperty.call(obj,k)?obj[k]:null};
}
const current=fakeStorage({rpg_goals_v1:'old',rpg_extra:'keep-me',subs:'[]','stack:items':'old-health'});
const merge=V.analyzeAgainstStorage(good,current,'merge');
assert.equal(merge.restoreReady,false);
assert.ok(merge.rows.some(r=>r.key==='rpg_goals_v1'&&r.status==='change'&&r.action==='set'));
assert.ok(merge.rows.some(r=>r.key==='subs'&&r.status==='same'));
assert.ok(!merge.rows.some(r=>r.key==='rpg_extra'&&r.status==='missing'),'merge must preserve local keys absent from backup');
const overwrite=V.analyzeAgainstStorage(good,current,'overwrite');
assert.ok(overwrite.rows.some(r=>r.key==='rpg_extra'&&r.status==='missing'&&r.action==='would-remove'),'overwrite preview must expose removals');

assert.match(lab,/type="file"/,'Lab accepts a local backup file');
assert.match(lab,/FileReader/,'backup must be parsed locally');
assert.match(lab,/data-strategy="merge"/);
assert.match(lab,/data-strategy="overwrite"/);
assert.match(lab,/restoreReady: <b>NEE<\/b>/,'UI must visibly keep restore blocked');
assert.doesNotMatch(lab,/localStorage\.setItem|localStorage\.removeItem|localStorage\.clear\s*\(/,'Lab must not mutate local storage');
assert.doesNotMatch(engine,/\.setItem\(|\.removeItem\(|\.clear\s*\(/,'validator must be analysis-only');
assert.match(spec,/Backup-before-restore/);
assert.match(spec,/Owner\/auth proof/);
assert.match(spec,/Cloud convergence protection/);
assert.match(spec,/Do not ship Phase 2 until executable regression coverage proves stale cloud state cannot resurrect pre-restore data/);
console.log('Restore Dry Run smoke: local parse, credential block, canonical scopes, merge/overwrite preview and hard no-apply gate passed.');
