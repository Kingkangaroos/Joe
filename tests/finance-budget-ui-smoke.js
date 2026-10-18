/* Exercise real event handlers with isolated storage; no account writes. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let date='2026-10-18T20:45:00Z',fail=false,writes=0,events={},counter=0;
const data=new Map(),nodes=new Map();
const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',innerHTML:'',dataset:{},style:{},hidden:false,classList:{toggle(){}},addEventListener(name,fn){this[name]=fn;}});return nodes.get(id);};
const host={querySelector:s=>node(s.replace('#','')),querySelectorAll:()=>[],addEventListener(name,fn){events[name]=fn;},set innerHTML(value){this.html=value;node('fbDate').value='2026-10-18';}};
const win={crypto:{randomUUID:()=>String(++counter)},addEventListener(name,fn){events[name]=fn;}};
const NativeDate=Date;
class TestDate extends NativeDate {constructor(...args){super(...(args.length?args:[date]));}}
const storage={getItem:key=>data.has(key)?data.get(key):null,setItem(key,value){if(fail)throw new Error('quota');writes++;data.set(key,value);}};
vm.runInNewContext(fs.readFileSync('finance-budget.js','utf8'),{window:win,document:{readyState:'complete',getElementById:id=>id==='financeBudget'?host:null,addEventListener(){}},localStorage:storage,Date:TestDate,Intl,console:{error(){}},setInterval(){}});
const submit=id=>node(id).onsubmit({preventDefault(){}});
assert.equal(writes,0,'opening budget must not manufacture user records');
assert.equal(node('fbRemaining').textContent,'Nog instellen');
node('fbBudget').value='1.400,50';node('fbBudget').input();
assert.match(node('fbPreview').textContent,/1\.400,50/);assert.equal(writes,0,'preview is read-only');
submit('fbBudgetForm');assert.equal(writes,1);
node('fbAmount').value='100,25';node('fbLabel').value='<img src=x onerror=alert(1)>';
submit('fbExpenseForm');assert.match(node('fbRemaining').textContent,/1\.300,25/);assert.doesNotMatch(node('fbEntries').innerHTML,/<img/);
node('fbTotal').value='400,50';submit('fbTotalForm');assert.match(node('fbRemaining').textContent,/1\.000,00/);
const key=win.GamenfyBudget.PREFIX+'2026-09-22';
assert.equal(win.GamenfyBudget.spent(JSON.parse(data.get(key))),40050,'updating total only adds the difference');
const correction=JSON.parse(data.get(key)).entries.at(-1);
events.click({target:{closest:()=>({dataset:{fbDelete:correction.id}})}});
assert.match(node('fbRemaining').textContent,/1\.300,25/);node('fbUndo').onclick();assert.match(node('fbRemaining').textContent,/1\.000,00/);
// Remote repaint preserves an unfinished budget draft.
node('fbBudget').value='1234';node('fbBudget').input();events.storage({key:null});assert.equal(node('fbBudget').value,'1234');
fail=true;submit('fbBudgetForm');assert.equal(node('fbBudget').value,'1234');assert.match(node('fbStatus').textContent,/lukt nu niet/);fail=false;
node('fbBudget').value='1400,50';submit('fbBudgetForm');
node('fbTotal').value='1500';submit('fbTotalForm');assert.match(node('fbPace').textContent,/99,50.*over budget/);
const before=data.get(key),writesBefore=writes;
date='2026-10-22T06:00:00Z';events.storage({key:null});
assert.match(node('fbRemaining').textContent,/1\.400,50/);assert.match(node('fbHistory').innerHTML,/99,50 over/);
assert.equal(data.get(key),before);assert.equal(writes,writesBefore,'rollover never rewrites history');
node('fbBudget').value='1200';submit('fbBudgetForm');
assert.equal(win.GamenfyBudget.budgetAt(JSON.parse(data.get(win.GamenfyBudget.CONFIG)),'2026-09-22'),140050);
// Backdated expense goes into the old period and cannot reduce this month's room.
node('fbAmount').value='20';node('fbDate').value='2026-10-20';submit('fbExpenseForm');
assert.match(node('fbRemaining').textContent,/1\.200,00/);assert.match(node('fbHistory').innerHTML,/119,50 over/);
date='2027-01-22T06:00:00Z';events.storage({key:null});assert.match(node('fbHistory').innerHTML,/Geen uitgaven geboekt/);
// Past budgets are retained during future changes and no bank/habit keys touched.
assert.ok([...data.keys()].every(key=>key.startsWith('nw:budget:')));
console.log('Budget UI handlers: read-only opening/preview, spend/total, safe text, delete/undo, draft/save failure, remote refresh, rollover and backdated history passed.');
