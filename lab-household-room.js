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

let index=0,level=1,busy=false,model,mixer,actions={},current='idle';
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
mesh(new THREE.BoxGeometry(7,.16,5.8),'#88747a',0,-.08,0);
mesh(new THREE.BoxGeometry(7,3.3,.14),'#67586f',0,1.65,-2.82);
mesh(new THREE.BoxGeometry(.14,3.3,5.8),'#5b5671',-3.43,1.65,0);
mesh(new THREE.BoxGeometry(2.4,.5,1.7),'#d7c1b7',1.75,.25,-1.65);
mesh(new THREE.BoxGeometry(2.3,.12,1.6),'#efe0d6',1.75,.56,-1.65);
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
function walkTo(v,cb){target.copy(v);moving=true;afterMove=cb;blend('walk',1)}
function updateMove(dt){
 if(!moving)return;
 tmp.subVectors(target,actorRoot.position);tmp.y=0;const d=tmp.length();
 if(d<.07){actorRoot.position.x=target.x;actorRoot.position.z=target.z;moving=false;blend('idle',.7);const cb=afterMove;afterMove=null;if(cb)cb();return}
 tmp.normalize();actorRoot.position.addScaledVector(tmp,Math.min(d,1.15*dt));
 const yaw=Math.atan2(tmp.x,tmp.z);let diff=yaw-actorRoot.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));actorRoot.rotation.y+=diff*Math.min(1,dt*8);
}

function taskTarget(id){
 const o=clutter.get(id);const p=o?o.position.clone():new THREE.Vector3();p.z+=.55;return p;
}
function startTask(){
 if(busy||index>=TASKS.length)return;busy=true;renderTasks();
 const [id,name]=TASKS[index];toast('Ze gaat '+name.toLowerCase());
 walkTo(taskTarget(id),()=>setTimeout(()=>completeCurrent(id),reduce?80:520));
}
function completeCurrent(id){
 const obj=clutter.get(id);if(obj){obj.material.emissive.set('#5ce3b1');obj.material.emissiveIntensity=.35;obj.scale.setScalar(.01);setTimeout(()=>{obj.visible=false;},180)}
 index++;busy=false;renderTasks();
 if(index>=TASKS.length){toast('Kamer schoon — evolution!');setTimeout(levelUp,320)}
 else toast('Stap '+index+' klaar · volgende: '+TASKS[index][1]);
}
function levelUp(){
 busy=true;flash.classList.remove('run');void flash.offsetWidth;flash.classList.add('run');
 setTimeout(()=>{level=Math.min(10,level+1);levelEl.textContent=level;upgradeRoom();},1400);
 setTimeout(()=>{busy=false;toast('Household level '+level+' · morgen komt er weer nieuwe rommel');},2850);
}
function upgradeRoom(){
 room.children.forEach(o=>{if(o.material&&o.material.color&&o.geometry?.type==='BoxGeometry'&&o.position.y<.1&&!o.userData.task)o.material.color.offsetHSL(0,.02,.04)});
}
function reset(){
 index=0;busy=false;clutter.forEach(o=>{o.visible=true;o.scale.setScalar(1);if(o.material?.emissive){o.material.emissive.set('#000');o.material.emissiveIntensity=0}});actorRoot.position.set(.1,0,1.9);actorRoot.rotation.y=Math.PI;renderTasks();toast('Nieuwe dag: kamer weer rommelig');
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
 const id=TASKS[index]?.[0];clutter.forEach((o,key)=>{if(!o.material?.emissive)return;o.material.emissive.set(key===id?'#8be1c1':'#000');o.material.emissiveIntensity=key===id?.22:0});
}

new GLTFLoader().load(MODEL_URL,gltf=>{
 model=gltf.scene;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false}});
 const box=new THREE.Box3().setFromObject(model,true),size=box.getSize(new THREE.Vector3()),s=1.55/Math.max(.1,size.y);model.scale.setScalar(s);model.position.y=-box.min.y*s;actorRoot.add(model);
 mixer=new THREE.AnimationMixer(model);const make=c=>c?mixer.clipAction(c):null;
 actions.idle=make(findClip(/idle|stand/i,gltf)||(gltf.animations||[])[0]);
 actions.walk=make(findClip(/walk/i,gltf)||findClip(/run|jog/i,gltf)||(gltf.animations||[])[0]);
 Object.values(actions).forEach(a=>{if(a){a.enabled=true;a.setEffectiveWeight(0);a.play()}});
 blend('idle',.7);toast('Rig geladen · klik stap 1 of de kleding');
},undefined,()=>toast('Test-rig kon niet laden'));

function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(stage);resize();reset();

let last=performance.now();
function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(mixer)mixer.update(dt);updateMove(dt);renderer.render(scene,camera);requestAnimationFrame(tick)}
requestAnimationFrame(tick);
