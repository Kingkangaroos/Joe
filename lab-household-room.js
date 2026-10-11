import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL='https://d8j0ntlcm91z4.cloudfront.net/user_3J11PlWTdAXdyiVgxHYnMUsJS8U/hf_20260916_220039_950a8a2c-9c1d-4854-8949-682a553945de.glb';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage=document.getElementById('householdStage');
const list=document.getElementById('hhTasks');
const progress=document.getElementById('hhProgress');
const levelEl=document.getElementById('hhLevel');
const toastEl=document.getElementById('roomToast');
const flash=document.getElementById('evolutionFlash');

const TASKS=[
 ['clothes','Kleding opruimen','Kleding → kast / wasmand','clothes'],
 ['trash','Afval weggooien','Verpakkingen en troep weg','trash'],
 ['places','Alles op zijn plek','Losse spullen terug','places'],
 ['machines','Machines aan het werk','Was / vaat starten','machines'],
 ['prepare','Dag of week voorbereiden','Spullen klaarleggen','prepare'],
 ['wipe','Schoonmaken met een doekje','Van boven naar beneden','wipe'],
 ['vacuum','Stofzuigen','Stof en kruimels weg','vacuum'],
 ['mop','Dweilen','Vloer afronden','mop'],
 ['finish','Final touch','Kussens recht · kamer fijn','finish']
];

let index=0,level=1,busy=false,model,mixer,actions={},current='idle',taskAnim=null;
const target=new THREE.Vector3(),tmp=new THREE.Vector3();
let moving=false,afterMove=null;

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.append(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#141a2c');
const camera=new THREE.PerspectiveCamera(38,1,.1,50);camera.position.set(6.8,5.2,8.5);camera.lookAt(0,.7,0);
scene.add(new THREE.HemisphereLight('#f7f2ff','#36433e',2.1));
const sun=new THREE.DirectionalLight('#fff0d4',2.6);sun.position.set(4,8,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const fill=new THREE.DirectionalLight('#b7caff',.8);fill.position.set(-5,3,4);scene.add(fill);

const mat=(c,r=.85)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const room=new THREE.Group();scene.add(room);
function mesh(g,c,x,y,z,cast=true){const m=new THREE.Mesh(g,mat(c));m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;room.add(m);return m}
const floorMesh=mesh(new THREE.BoxGeometry(7,.16,5.8),'#88747a',0,-.08,0);
const backWall=mesh(new THREE.BoxGeometry(7,3.3,.14),'#67586f',0,1.65,-2.82);
const sideWall=mesh(new THREE.BoxGeometry(.14,3.3,5.8),'#5b5671',-3.43,1.65,0);
const bedBase=mesh(new THREE.BoxGeometry(2.4,.5,1.7),'#d7c1b7',1.75,.25,-1.65);
const bedTop=mesh(new THREE.BoxGeometry(2.3,.12,1.6),'#efe0d6',1.75,.56,-1.65);
mesh(new THREE.BoxGeometry(1.2,2.25,.7),'#8d735f',-2.55,1.12,-1.9);
mesh(new THREE.BoxGeometry(1.15,.75,.7),'#a98872',-2.55,.37,-.9);
mesh(new THREE.BoxGeometry(1.1,.08,.72),'#dec7a9',-2.55,.8,-.9);
mesh(new THREE.BoxGeometry(1.7,.08,1.15),'#bfa6c9',.2,.045,.8);
mesh(new THREE.BoxGeometry(.9,.1,.45),'#cdbbd7',1.85,.63,-1.65);

const actorRoot=new THREE.Group();scene.add(actorRoot);
const actorShadow=new THREE.Mesh(new THREE.CircleGeometry(.42,28),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.25,depthWrite:false}));actorShadow.rotation.x=-Math.PI/2;actorShadow.position.y=.02;actorRoot.add(actorShadow);

const clutter=new Map();
function addClutter(id,color,pos,kind='box'){
  let g=kind==='sphere'?new THREE.SphereGeometry(.18,16,10):new THREE.BoxGeometry(.42,.14,.28);
  if(id==='vacuum')g=new THREE.BoxGeometry(.18,.72,.16);
  if(id==='mop')g=new THREE.BoxGeometry(.1,.95,.1);
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color,roughness:.7,emissive:'#000'}));m.position.copy(pos);m.castShadow=true;m.userData.task=id;room.add(m);clutter.set(id,m);return m;
}
addClutter('clothes','#e67b8e',new THREE.Vector3(1.05,.08,.85));
addClutter('trash','#d1b06c',new THREE.Vector3(-.8,.1,1.25));
addClutter('places','#7fb7d9',new THREE.Vector3(.15,.1,-.45),'sphere');
addClutter('machines','#ddd4c8',new THREE.Vector3(-2.6,.92,-.88));
addClutter('prepare','#9fcf9d',new THREE.Vector3(2.25,.68,-1.55));
addClutter('wipe','#f4e49d',new THREE.Vector3(-2.4,.87,-.75));
addClutter('vacuum','#4c556d',new THREE.Vector3(-1.65,.36,1.8));
addClutter('mop','#6ca1a8',new THREE.Vector3(2.85,.48,1.2));
addClutter('finish','#c8b5e6',new THREE.Vector3(1.82,.72,-1.62));

const upgradeGroup=new THREE.Group();room.add(upgradeGroup);upgradeGroup.visible=false;
const upgradeMat=new THREE.MeshStandardMaterial({color:'#88cfa7',roughness:.6,emissive:'#153b2c',emissiveIntensity:.08});
const pot=new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,.32,20),new THREE.MeshStandardMaterial({color:'#c28e63',roughness:.8}));pot.position.set(-1.95,.16,-1.65);upgradeGroup.add(pot);
for(let i=0;i<5;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.18,14,10),upgradeMat);leaf.scale.set(.65,1.2,.45);leaf.position.set(-1.95+(i-2)*.09,.46+Math.abs(i-2)*.05,-1.65+(i%2)*.06);upgradeGroup.add(leaf)}
const lampStem=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.9,14),new THREE.MeshStandardMaterial({color:'#d6c4aa',roughness:.7}));lampStem.position.set(2.8,.45,-2.1);upgradeGroup.add(lampStem);
const lampShade=new THREE.Mesh(new THREE.CylinderGeometry(.2,.32,.28,20),new THREE.MeshStandardMaterial({color:'#f4d59b',roughness:.55,emissive:'#f0b95b',emissiveIntensity:.18}));lampShade.position.set(2.8,.93,-2.1);upgradeGroup.add(lampShade);
const frame=new THREE.Mesh(new THREE.BoxGeometry(1.1,.72,.05),new THREE.MeshStandardMaterial({color:'#e6d7ba',roughness:.7}));frame.position.set(.3,1.85,-2.72);upgradeGroup.add(frame);

const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
renderer.domElement.addEventListener('pointerup',e=>{
 if(busy)return;
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
 raycaster.setFromCamera(pointer,camera);
 const hits=raycaster.intersectObjects([...clutter.values()].filter(o=>o.visible),false);
 if(!hits.length)return;
 const id=hits[0].object.userData.task;
 const currentTask=TASKS[index]?.[0];
 if(id!==currentTask){toast('Eerst stap '+(index+1)+': '+TASKS[index][1]);pulse(clutter.get(currentTask));return;}
 startTask();
});

function pulse(obj){if(!obj)return;const base=obj.scale.clone();obj.scale.multiplyScalar(1.22);setTimeout(()=>obj.scale.copy(base),220)}
function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>toastEl.classList.remove('show'),1400)}
function findClip(re,gltf){return (gltf.animations||[]).find(c=>re.test(c.name))}
function blend(name,speed=1){
 if(!mixer)return;const chosen=actions[name]||actions.walk||actions.idle||Object.values(actions).find(Boolean);if(!chosen)return;current=name;chosen.timeScale=speed;
 Object.values(actions).forEach(a=>{if(a){a.enabled=true;a.play();a.fadeOut(.16)}});chosen.reset().fadeIn(.16).play();
}
let moveSpeed=3.4;
function walkTo(v,cb){target.copy(v);moving=true;afterMove=cb;const d=actorRoot.position.distanceTo(target);moveSpeed=Math.max(3.4,d/.42);blend('walk',1.85)}
function updateMove(dt){
 if(!moving)return;
 tmp.subVectors(target,actorRoot.position);tmp.y=0;const d=tmp.length();
 if(d<.07){actorRoot.position.x=target.x;actorRoot.position.z=target.z;moving=false;blend('idle',.7);const cb=afterMove;afterMove=null;if(cb)cb();return}
 tmp.normalize();actorRoot.position.addScaledVector(tmp,Math.min(d,moveSpeed*dt));
 const yaw=Math.atan2(tmp.x,tmp.z);let diff=yaw-actorRoot.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));actorRoot.rotation.y+=diff*Math.min(1,dt*8);
}

function taskTarget(id){
 const o=clutter.get(id);const p=o?o.position.clone():new THREE.Vector3();p.z+=.55;return p;
}
function actionDestination(id,obj){
 const map={
  clothes:new THREE.Vector3(-2.55,1.35,-1.9),
  trash:new THREE.Vector3(-2.55,.45,-.9),
  places:new THREE.Vector3(-2.55,1.05,-1.9),
  machines:new THREE.Vector3(-2.55,.98,-.88),
  prepare:new THREE.Vector3(2.0,.72,-1.55),
  wipe:new THREE.Vector3(-2.25,.88,-.75),
  vacuum:new THREE.Vector3(-.25,.18,.9),
  mop:new THREE.Vector3(.65,.18,.8),
  finish:new THREE.Vector3(1.85,.73,-1.62)
 };
 return (map[id]||obj.position).clone();
}
function startTaskAnimation(id,cb){
 const obj=clutter.get(id);if(!obj){cb();return}
 const long=id==='vacuum'||id==='mop'||id==='wipe';
 taskAnim={id,obj,from:obj.position.clone(),to:actionDestination(id,obj),start:performance.now(),duration:reduce?80:(long?520:330),cb};
 blend('idle',1.2);
}
function updateTaskAnimation(now){
 if(!taskAnim)return;
 const a=taskAnim,p=Math.min(1,(now-a.start)/a.duration),ease=1-Math.pow(1-p,3),wave=Math.sin(p*Math.PI);
 if(model){
  model.rotation.x=(a.id==='clothes'||a.id==='trash'||a.id==='places')?wave*.26:(a.id==='wipe'?wave*.12:0);
  model.rotation.z=(a.id==='wipe'||a.id==='vacuum'||a.id==='mop')?Math.sin(p*Math.PI*6)*.08:0;
 }
 if(a.id==='vacuum'||a.id==='mop'){
  a.obj.position.x=a.from.x+Math.sin(p*Math.PI*3)*.75;
  a.obj.position.z=a.from.z+(a.id==='mop'?Math.sin(p*Math.PI*2)*.35:0);
 }else if(a.id==='wipe'){
  a.obj.position.x=a.from.x+Math.sin(p*Math.PI*5)*.28;
 }else{
  a.obj.position.lerpVectors(a.from,a.to,ease);
  a.obj.position.y+=wave*.28;
  a.obj.rotation.y+=.18;
 }
 a.obj.material.emissive.set('#5ce3b1');a.obj.material.emissiveIntensity=.25+.45*wave;
 if(p>=1){
  if(model){model.rotation.x=0;model.rotation.z=0}
  a.obj.scale.setScalar(.01);setTimeout(()=>{a.obj.visible=false;},100);
  taskAnim=null;const cb=a.cb;if(cb)cb();
 }
}
function startTask(){
 if(busy||index>=TASKS.length)return;busy=true;renderTasks();
 const [id,name]=TASKS[index];toast('Ze gaat '+name.toLowerCase());
 walkTo(taskTarget(id),()=>{pulse(clutter.get(id));setTimeout(()=>startTaskAnimation(id,()=>completeCurrent(id)),reduce?20:60)});
}
function completeCurrent(id){
 index++;busy=false;renderTasks();
 if(index>=TASKS.length){toast('Kamer schoon — evolution!');setTimeout(levelUp,320)}
 else toast('Stap '+index+' klaar · volgende: '+TASKS[index][1]);
}
function levelUp(){
 busy=true;flash.classList.remove('run');void flash.offsetWidth;flash.classList.add('run');
 setTimeout(()=>{level=Math.min(10,level+1);levelEl.textContent=level;upgradeRoom();},900);
 setTimeout(()=>{busy=false;toast('Household level '+level+' · morgen komt er weer nieuwe rommel');},2850);
}
function upgradeRoom(){
 upgradeGroup.visible=true;
 scene.background=new THREE.Color('#191d2d');
 floorMesh.material.color.set('#b48f78');
 backWall.material.color.set('#8f7a94');
 sideWall.material.color.set('#786d8d');
 bedBase.material.color.set('#c7a78e');
 bedTop.material.color.set('#fff3e7');
 sun.intensity=3.15;fill.intensity=1.05;
 camera.position.set(6.25,4.75,7.8);camera.lookAt(0,.75,0);
 upgradeGroup.scale.setScalar(.72);
 const t0=performance.now();
 function grow(now){const p=Math.min(1,(now-t0)/520);const e=1-Math.pow(1-p,3);upgradeGroup.scale.setScalar(.72+.28*e);if(p<1)requestAnimationFrame(grow)}
 requestAnimationFrame(grow);
}
function reset(){
 index=0;busy=false;taskAnim=null;
 const upgraded=level>1;
 upgradeGroup.visible=upgraded;
 scene.background=new THREE.Color(upgraded?'#191d2d':'#141a2c');
 floorMesh.material.color.set(upgraded?'#b48f78':'#88747a');
 backWall.material.color.set(upgraded?'#8f7a94':'#67586f');
 sideWall.material.color.set(upgraded?'#786d8d':'#5b5671');
 bedBase.material.color.set(upgraded?'#c7a78e':'#d7c1b7');
 bedTop.material.color.set(upgraded?'#fff3e7':'#efe0d6');
 sun.intensity=upgraded?3.15:2.6;fill.intensity=upgraded?1.05:.8;
 camera.position.set(upgraded?6.25:6.8,upgraded?4.75:5.2,upgraded?7.8:8.5);camera.lookAt(0,.7,0);
 clutter.forEach(o=>{o.visible=true;o.scale.setScalar(1);if(o.material?.emissive){o.material.emissive.set('#000');o.material.emissiveIntensity=0}});
 actorRoot.position.set(.1,0,1.9);actorRoot.rotation.y=Math.PI;renderTasks();toast(upgraded?'Nieuwe dag: level blijft, nieuwe rommel':'Nieuwe dag: kamer weer rommelig');
}
document.getElementById('resetRoom').onclick=reset;
function renderTasks(){
 progress.textContent=Math.min(index,TASKS.length)+' / '+TASKS.length;
 list.innerHTML=TASKS.map((t,i)=>{
  const status=i<index?'✓':i===index?(busy?'bezig…':'doen'):'slot';
  const cls=i<index?'done':i===index?'active':'locked';
  return '<li class="'+cls+'"><button type="button" data-i="'+i+'" '+(i===index&&!busy?'':'disabled')+'><span class="num">'+(i+1)+'</span><span><strong>'+t[1]+'</strong><small>'+t[2]+'</small></span><span class="state">'+status+'</span></button></li>';
 }).join('');
 const active=list.querySelector('li.active button');if(active)active.onclick=startTask;
 const id=TASKS[index]?.[0];clutter.forEach((o,key)=>{if(!o.material?.emissive)return;o.material.emissive.set(key===id?'#8be1c1':'#000');o.material.emissiveIntensity=key===id ? .22 : 0});
}

new GLTFLoader().load(MODEL_URL,gltf=>{
 model=gltf.scene;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false}});
 const box=new THREE.Box3().setFromObject(model,true),size=box.getSize(new THREE.Vector3()),s=1.55/Math.max(.1,size.y);model.scale.setScalar(s);model.position.y=-box.min.y*s;model.userData.baseY=model.position.y;actorRoot.add(model);
 mixer=new THREE.AnimationMixer(model);const make=c=>c?mixer.clipAction(c):null;
 actions.idle=make(findClip(/idle|stand/i,gltf)||(gltf.animations||[])[0]);
 actions.walk=make(findClip(/walk/i,gltf)||findClip(/run|jog/i,gltf)||(gltf.animations||[])[0]);
 Object.values(actions).forEach(a=>{if(a){a.enabled=true;a.setEffectiveWeight(0);a.play()}});
 blend('idle',.7);toast('Rig geladen · klik stap 1 of de kleding');
},undefined,()=>toast('Test-rig kon niet laden'));

function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(stage);resize();reset();

let last=performance.now();
function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(mixer)mixer.update(dt);updateMove(dt);updateTaskAnimation(now);if(model){model.position.y=model.userData.baseY||model.position.y;if(!taskAnim)model.rotation.z=moving?Math.sin(now*.022)*.025:0;}renderer.render(scene,camera);requestAnimationFrame(tick)}
requestAnimationFrame(tick);
