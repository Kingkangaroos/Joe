/* Accountancy flow: native registry, financial invariants, workbook state and answer checking. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'), values=new Map(),domHandlers={},appHandlers={};
const app={innerHTML:'',addEventListener:(k,f)=>appHandlers[k]=f,contains:()=>false};
const status={textContent:''};
const document={readyState:'loading',activeElement:null,body:{appendChild(){}},addEventListener:(k,f)=>domHandlers[k]=f,getElementById:id=>id==='accountancyApp'?app:id==='saveStatus'?status:null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({style:{}})};
const window={addEventListener(){},dispatchEvent(){}};
const localStorage={getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
const sandbox={window,document,localStorage,console,Intl,Date,Math,JSON,Object,Number,String,Array,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1};
function run(name){vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),sandbox,{filename:name});}
run('xp.js');run('quests.js');run('ladders.js');run('accountancy-data.js');run('accountancy.js');
const data=window.GamenfyAccountancyData,api=window.GamenfyAccountancy;
assert.equal(window.RPG_DEFAULT_SKILLS.accountancy.parentSkill,'business');
assert.equal(window.RPG_DEFAULT_SKILLS.accountancy.isHabit,false);
assert.ok(window.getCharacter().skills.accountancy);
assert.ok(window.RPG_SYNC_KEYS.includes('rpg_accountancy_v1'));
assert.equal(data.stages.length,10);assert.equal(data.stages.filter(s=>s.track==='Nederland'||s.track==='Basis').length,7);
assert.deepEqual(Array.from(window.SKILL_LADDERS.accountancy,t=>t.level),Array.from(data.stages,t=>t.level));
for(const s of data.stages){assert.ok(s.steps.length&&s.deliverables.length&&s.criterion);for(const id of s.sources)assert.ok(data.sources.some(x=>x.id===id));}
assert.equal(values.has('rpg_accountancy_v1'),false,'opening content must not seed/claim personal mastery');
for(const [input,expected] of [['13.200',13200],['13.200,00',13200],['13200.50',13200.5],['€ 13.200,50',13200.5],['',null],['abc',null]])assert.equal(api.numeric(input),expected);
for(const c of data.cases){assert.equal(api.grade(c,{}).filter(r=>r.correct).length,0);const answers=Object.fromEntries(c.questions.map(q=>[q.id,String(q.answer)]));assert.ok(api.grade(c,answers).every(r=>r.correct));answers[c.questions[0].id]='0';assert.equal(api.grade(c,answers)[0].correct,false);}
const c1=data.cases[0];assert.equal(c1.trial.reduce((a,r)=>a+r[1]-r[2],0),0);
const result=64000+2000-(12000+30000+5500+2400+600+1200+1100);
const assets=18000+(12100-1100)+(12000-2400-2400)+1800+2000;
assert.equal(result,13200);assert.equal(assets,40000);assert.equal(20000-6000+result+8100+3500+1200,assets);
const pbt=30000-3000-2000,tax=(pbt+1000)*.2,eq=70000+pbt-tax;
assert.equal(eq+50000+2000+tax,150000-3000);assert.equal(eq,89800);
assert.equal(70000-15000+(15000-10000),60000);assert.equal(30000-(15000-10000),25000);
domHandlers.DOMContentLoaded();assert.ok(app.innerHTML.includes('0 / 7 fases'));
const click=dataset=>appHandlers.click({preventDefault(){},target:{closest(){return {dataset,hasAttribute:()=>false};}}});
const input=(dataset,value,checked,type='text')=>appHandlers.input({target:{dataset,value,checked,type}});
click({complete:'dossier'});assert.equal(values.has('rpg_accountancy_v1'),false,'cannot skip stages');
input({stage:'start',field:'evidence'},'<img src=x onerror=alert(1)> mijn testnotitie met voldoende uitleg');
click({tab:'pad'});assert.ok(app.innerHTML.includes('&lt;img src=x onerror=alert(1)&gt;'));
for(const stage of data.stages){for(let i=0;i<stage.deliverables.length;i++)input({stage:stage.id,check:String(i)},'',true,'checkbox');input({stage:stage.id,field:'evidence'},'Fictief oefendossier: berekeningen gecontroleerd en de fouten hersteld; bron en leerpunten vastgelegd.');input({stage:stage.id,field:'criterion'},'',true,'checkbox');if(['zelfstandig','group'].includes(stage.id)){click({complete:stage.id});assert.ok(!api.read().stages[stage.id].done,'senior review reference required');input({stage:stage.id,field:'reviewer'},'Senior A · 19 oktober · punten opgelost');}click({complete:stage.id});assert.ok(api.read().stages[stage.id].done);}
assert.ok(app.innerHTML.includes('7 / 7 fases'));
const before=localStorage.getItem('rpg_character_v1');click({complete:'start'});assert.ok(data.stages.every(s=>!api.read().stages[s.id].done));assert.equal(localStorage.getItem('rpg_character_v1'),before,'mastery toggles cannot manufacture XP or alter other skills');
click({tab:'cases'});input({answer:'profit'},'13.200');click({grade:'dienst'});assert.ok(app.innerHTML.includes('1 / 4 cijfers goed'));
input({answer:'profit'},'12.200');assert.equal(api.read().cases.dienst.checked,false);
values.set('rpg_accountancy_v1','bad json');assert.deepEqual(Object.keys(api.read()),[]);
console.log('Accountancy smoke passed: registry, scope, 3 balanced cases, NL numbers, evidence/review gates, sequential progress, reopen, escaped notes and answer persistence.');
