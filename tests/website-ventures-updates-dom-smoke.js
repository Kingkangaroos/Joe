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
  const box=new Element('section'),body=new Element('body');body.dataset={updatesSurface:'ventures',updatesScope:'website-ventures',updatesSource:'WEBSITE-VENTURES-RELEASES.json'};body.append(box);
  const values=new Map([['gamenfy_updates_seen_v1:fixture-owner',JSON.stringify(['old-home'])]]),events={};let writes=0,requested;
  const window={gamenfyUserId:'fixture-owner',localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>{writes++;values.set(k,v);}},addEventListener:(k,f)=>events[k]=f};
  const document={body,getElementById:id=>id==='gamenfyUpdates'?box:null,createElement:t=>new Element(t)};
  const releases=JSON.parse(read('WEBSITE-VENTURES-RELEASES.json')).releases;
  vm.runInNewContext(read('gamenfy-updates.js'),{window,document,fetch:async url=>{requested=url;return {ok:true,json:async()=>({releases:[...releases,{id:'other',surfaces:['other']}]})};}});
  await flush();assert.equal(requested,'WEBSITE-VENTURES-RELEASES.json');assert.match(box.textContent,/Nieuw voor jou/);
  button(box,'Bekijk wijzigingen').onclick();let dialog=find(body,x=>x.tagName==='dialog');assert.match(dialog.textContent,/Product A/);assert.equal(find(dialog,x=>x.tagName==='a').href,'website-ventures-credit-lab.html');assert.equal(writes,0);
  button(dialog,'Sluiten').onclick();assert.equal(writes,0);
  button(box,'Bekijk wijzigingen').onclick();dialog=find(body,x=>x.tagName==='dialog');window.gamenfyUserId='second-owner';button(dialog,'Deze updates gezien').onclick();assert.equal(writes,0);assert.match(dialog.textContent,/account is gewijzigd/);button(dialog,'Sluiten').onclick();
  events['gamenfy-auth-ready']();button(box,'Bekijk wijzigingen').onclick();dialog=find(body,x=>x.tagName==='dialog');button(dialog,'Deze updates gezien').onclick();assert.equal(writes,1);assert.equal(values.get('gamenfy_updates_seen_v1:fixture-owner'),'["old-home"]');assert.deepEqual(JSON.parse(values.get('gamenfy_updates_seen_v1:website-ventures:second-owner')),releases.map(r=>r.id));assert.match(box.textContent,/Wat is er nieuw/);
  assert.equal(values.has('gamenfy_updates_seen_v1:second-owner'),false,'Ventures acknowledgement cannot mark Gamenfy read');
  console.log('Scoped Ventures feed: correct source, relevant-only rendering, explicit acknowledgement, owner race protection and Gamenfy isolation pass.');
})().catch(e=>{console.error(e);process.exitCode=1;});
