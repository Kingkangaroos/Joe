'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.events={};this.dataset={};this.style={};this.attrs={};this._text='';}
  set textContent(t){this._text=t;this.children=[];}get textContent(){return this._text+this.children.map(e=>e.textContent).join('');}
  append(...els){els.forEach(e=>{e.parent=this;this.children.push(e);});}appendChild(e){this.append(e);}
  setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,fn){this.events[k]=fn;}
  showModal(){this.open=true;}close(){this.open=false;this.events.close?.();}remove(){this.parent.children=this.parent.children.filter(e=>e!==this);}
}
function find(e,p){if(p(e))return e;for(const c of e.children){const r=find(c,p);if(r)return r;}}
function button(e,text){return find(e,x=>x.tagName==='button'&&x.textContent===text);}
async function flush(){await new Promise(r=>setImmediate(r));}
(async()=>{
  const box=new Element('section'),body=new Element('body');body.dataset.updatesSurface='home';body.append(box);
  const values=new Map(),events={};let writes=0;
  const window={gamenfyUserId:null,localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>{writes++;values.set(k,v);}},addEventListener:(k,f)=>events[k]=f};
  const document={body,getElementById:id=>id==='gamenfyUpdates'?box:null,createElement:t=>new Element(t)};
  vm.runInNewContext(read('gamenfy-updates.js'),{window,document,fetch:async()=>({ok:true,json:async()=>JSON.parse(read('GAMENFY-RELEASES.json'))})});
  await flush();assert.equal(box.children.length,0,'wait for real account event');
  window.gamenfyUserId='fixture-owner';events['gamenfy-auth-ready']();const count=JSON.parse(read('GAMENFY-RELEASES.json')).releases.filter(r=>r.surfaces.includes('home')).length;assert.ok(box.textContent.includes('Nieuw voor jou · '+count));
  button(box,'Bekijk wijzigingen').onclick();let dialog=find(body,x=>x.tagName==='dialog');assert.ok(dialog.open);assert.match(dialog.textContent,/Week- en maandquesthistorie/);assert.equal(writes,0);
  button(dialog,'Sluiten').onclick();assert.equal(find(body,x=>x.tagName==='dialog'),undefined);assert.match(box.textContent,/Nieuw voor jou/);assert.equal(writes,0);
  button(box,'Bekijk wijzigingen').onclick();dialog=find(body,x=>x.tagName==='dialog');button(dialog,'Deze updates gezien').onclick();assert.equal(writes,1);assert.match(box.textContent,/Wat is er nieuw/);
  window.gamenfyUserId='second-owner';events['gamenfy-auth-ready']();assert.match(box.textContent,/Nieuw voor jou/);
  button(box,'Bekijk wijzigingen').onclick();dialog=find(body,x=>x.tagName==='dialog');window.localStorage.setItem=()=>{throw Error('blocked')};button(dialog,'Deze updates gezien').onclick();assert.ok(dialog.open);assert.match(dialog.textContent,/Opslaan lukte niet/);
  console.log('Release DOM: delayed auth, open/close without ack, full history, explicit ack, account isolation and blocked storage pass.');
})().catch(e=>{console.error(e);process.exitCode=1;});
