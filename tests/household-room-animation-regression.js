'use strict';
// Household animation regression harness. Simulates actual updateTaskAnimation code
// without a browser / WebGL context; catches stale rig references such as the old step-4 crash.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const js=fs.readFileSync(path.join(__dirname,'..','lab-household-room.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','lab-household-room.html'),'utf8');
const expected=['clothes','trash','places','machines','prepare','wipe','vacuum','mop','finish'];

function extractFunction(name){
  const i=js.indexOf('function '+name+'(');
  assert.ok(i>=0,name+' is present');
  const open=js.indexOf('{',i);
  let depth=0;
  for(let j=open;j<js.length;j++){
    if(js[j]==='{')depth++;
    if(js[j]==='}'&&!--depth)return js.slice(i,j+1);
  }
  throw new Error(name+' has unmatched braces');
}
const env={
  taskAnim:null,completed:[],characterBaseY:1.03,Math,
  characterSprite:{position:{x:0,y:1.03},material:{rotation:0},scale:{set(){}}},
  dustGroup:{children:Array.from({length:14},()=>({visible:true}))},
  setCharacterVisual(){},visualForTask(id){return id},
  setTimeout(callback){callback()}
};
env.resetCharacterPose=()=>{
  env.characterSprite.position.x=0;
  env.characterSprite.position.y=env.characterBaseY;
  env.characterSprite.material.rotation=0;
};
const animation=new Function('env','with(env){'+extractFunction('updateTaskAnimation')+';return updateTaskAnimation}')(env);
function fakeProp(){
  return {
    position:{x:0,y:0,z:0,lerpVectors(a,b,p){this.x=a.x+(b.x-a.x)*p;this.y=a.y+(b.y-a.y)*p;this.z=a.z+(b.z-a.z)*p;},copy(other){Object.assign(this,other)}},
    material:{emissive:{set(){}},emissiveIntensity:0},
    rotation:{y:0,z:0},
    scale:{setScalar(){}},visible:true
  };
}
for(const id of expected){
  const obj=fakeProp();
  env.taskAnim={id,obj,from:{x:0,y:0,z:0},to:{x:1,y:2,z:3},fromRotation:{y:0},start:0,duration:1000,cb:()=>env.completed.push(id)};
  assert.doesNotThrow(()=>animation(500),'middle frame: '+id);
  assert.doesNotThrow(()=>animation(1000),'complete frame: '+id);
  assert.equal(env.taskAnim,null,'task state cleared for '+id);
}
assert.deepEqual(env.completed,expected,'all nine tasks complete in the required order');
assert.doesNotMatch(js,/\\brig\\./,'obsolete primitive rig code is removed');
assert.match(js,/rescueTask\\(id,token,'watchdog'\\)/,'time-out recovery is installed');
assert.match(js,/o\\.position\\.copy\\(o\\.userData\\.originalPosition\\)/,'reset restores object locations');
assert.match(js,/if\\(taskToken!==currentToken\\)return/,'evolution reset invalidates stale timers');
assert.match(html,/id="previewEvolution"/,'one-tap evolution preview is available');
console.log('PASS Household regression: nine animation callbacks, step 4, watchdog, reset and evolution preview.');