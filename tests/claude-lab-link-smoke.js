'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
class E{
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.dataset={};this.attrs={};this.textContent='';}
 append(...es){for(const e of es){e.parent=this;this.children.push(e);}}setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,f){this.events[k]=f;}showModal(){this.open=true;}close(){this.events.close?.();}remove(){this.parent.children=this.parent.children.filter(e=>e!==this);}
}
const external=new E('a');external.href='https://gamenfy-claude-lab.vercel.app/';external.dataset.gwTitle='Claude Lab · Companion Park 3D';
const internal=new E('a');internal.href='https://joe-silk.vercel.app/lab-older-experiments.html?experiment=park31';
const unknown=new E('a');unknown.href='https://unapproved.invalid/';
const body=new E('body'),document={body,createElement:t=>new E(t),querySelectorAll:()=>[external,internal,unknown],getElementById:()=>null};
vm.runInNewContext(read('gamenfy-workspace.js'),{document,URL,location:{href:'https://joe-silk.vercel.app/lab.html',origin:'https://joe-silk.vercel.app'}});
assert.equal(body.children.length,0,'no automatic external frame request');let prevented=false;
external.events.click({preventDefault(){prevented=true;}});assert.ok(prevented);
let d=body.children[0],frame=d.children.find(e=>e.tag==='iframe');assert.ok(d.open);assert.equal(frame.src,external.href);assert.equal(frame.referrerPolicy,'no-referrer');assert.equal(frame.attrs.sandbox,'allow-scripts allow-same-origin');assert.equal(frame.title,external.dataset.gwTitle);
assert.ok(d.children.find(e=>e.tag==='a'&&e.textContent==='Apart openen'),'permanent escape hatch');
d.children[0].children.find(e=>e.tag==='button').onclick();assert.equal(body.children.length,0,'closing unloads external frame');
internal.events.click({preventDefault(){}});d=body.children[0];frame=d.children.find(e=>e.tag==='iframe');assert.equal(frame.src,internal.href);assert.equal(frame.attrs.sandbox,undefined,'old experiment behavior retained');d.close();
unknown.events.click({preventDefault(){throw Error('unapproved origin intercepted');}});assert.equal(body.children.length,0);
const plan=JSON.parse(read('GAMENFY-WORKSPACE.json'));assert.ok(plan.feedback.some(x=>x.includes('WHY-link blijft open')));assert.ok(plan.agreements.some(x=>x.includes('Toevoegen betekent niet weghalen')));
assert.match(read('lab.html'),/id="gwActiveExperiments"/);assert.match(read('lab.html'),/Older Lab Experiments/);assert.match(read('gamenfy-workspace.js'),/Feedback die open blijft/);
console.log('Claude Lab: explicit click, exact external origin, sandbox, no referrer, fallback link, frame cleanup, existing experiment behavior and open feedback pass.');
