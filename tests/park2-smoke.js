/* Park 2.0 compatibility-loader smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/park2-smoke.js */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

class Element{
  constructor(tag,id){this.tagName=String(tag||'div').toUpperCase();this.id=id||'';this.dataset={};this.style={};this.children=[];this.parentNode=null;this.previousElementSibling=null;this.innerHTML='';this.className='';}
  appendChild(child){child.parentNode=this;this.children.push(child);return child;}
  insertBefore(child,before){child.parentNode=this;const index=this.children.indexOf(before);if(index<0)this.children.push(child);else this.children.splice(index,0,child);if(child.id)ids[child.id]=child;return child;}
}

const ids={};
const root=new Element('main','root');
const park3Heading=new Element('div','park3Heading');
const park2Heading=new Element('div','park2Heading');
const park2=new Element('section','park2');
root.appendChild(park3Heading);root.appendChild(park2Heading);root.appendChild(park2);
park2.previousElementSibling=park2Heading;
ids.park2=park2;
const head=new Element('head','head');
const source=fs.readFileSync(path.join(__dirname,'..','park2.js'),'utf8');
const sandbox={
  document:{
    readyState:'complete',head,
    querySelector:selector=>selector==='script[data-park2-legacy]'?head.children.find(child=>child.dataset.park2Legacy==='true')||null:null,
    createElement:tag=>new Element(tag),
    getElementById:id=>ids[id]||null,
    addEventListener:()=>{}
  },
  console
};

vm.runInNewContext(source,sandbox,{filename:'park2.js'});
assert.equal(head.children.length,1,'the frozen Park 2.0 rollback loader is added once');
assert.equal(head.children[0].src,'https://cdn.jsdelivr.net/gh/Kingkangaroos/Joe@38d16df06cd5a94ec8de4fb31360f60345189e93/park2.js','rollback stays pinned to the approved commit');
assert.equal(head.children[0].async,false,'the compatibility loader preserves script order');
const park3=ids.park3Lab;
assert.ok(park3,'Park 3.0 remains directly mounted beside the frozen Park 2.0 reference');
assert.match(park3.innerHTML,/<iframe[^>]+src="park3\.html\?embed=1"/,'Park 3.0 renders inside Lab');
assert.match(park3.innerHTML,/Direct in Lab/,'the mount explains that the content is already present');
assert.doesNotMatch(park3.innerHTML,/href=/,'the direct Lab mount does not add an Open link');
assert.doesNotMatch(source,/createElement\('a'\)/,'the compatibility code cannot recreate a Lab navigation link');

vm.runInNewContext(source,sandbox,{filename:'park2-second-run.js'});
assert.equal(head.children.length,1,'re-running the loader does not duplicate the rollback script');
assert.equal(root.children.filter(child=>child.id==='park3Lab').length,1,'re-running the loader does not duplicate the direct mount');
console.log('Park 2.0 smoke test passed: frozen rollback and link-free direct Park 3.0 mount.');
