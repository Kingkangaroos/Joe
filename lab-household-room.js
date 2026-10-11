import * as THREE from 'three';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage=document.getElementById('householdStage');
const list=document.getElementById('hhTasks');
const progress=document.getElementById('hhProgress');
const currentTaskTitle=document.getElementById('currentTaskTitle');
const currentTaskHint=document.getElementById('currentTaskHint');
const currentTaskButton=document.getElementById('currentTaskButton');
const taskProgressFill=document.getElementById('taskProgressFill');
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

let index=0,level=1,busy=false,current='idle',taskAnim=null,celebrateUntil=0,walkClock=0;
const target=new THREE.Vector3(),tmp=new THREE.Vector3();
let moving=false,afterMove=null;

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.append(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#6d6673');
const camera=new THREE.PerspectiveCamera(38,1,.1,50);camera.position.set(6.8,5.2,8.5);camera.lookAt(0,.7,0);
scene.add(new THREE.HemisphereLight('#fff4e9','#4b4050',2.35));
const sun=new THREE.DirectionalLight('#fff1da',2.85);sun.position.set(4,8,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const fill=new THREE.DirectionalLight('#c6d5ff',.9);fill.position.set(-5,3,4);scene.add(fill);

const mat=(c,r=.85)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const room=new THREE.Group();scene.add(room);
function mesh(g,c,x,y,z,cast=true){const m=new THREE.Mesh(g,mat(c));m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;room.add(m);return m}
const floorMesh=mesh(new THREE.BoxGeometry(7,.16,5.8),'#9b735b',0,-.08,0);
const backWall=mesh(new THREE.BoxGeometry(7,3.3,.14),'#c4adb7',0,1.65,-2.82);
const sideWall=mesh(new THREE.BoxGeometry(.14,3.3,5.8),'#b49da9',-3.43,1.65,0);
const bedBase=mesh(new THREE.BoxGeometry(2.4,.5,1.7),'#b99684',1.75,.25,-1.65);
const bedTop=mesh(new THREE.BoxGeometry(2.3,.12,1.6),'#f4e9e2',1.75,.56,-1.65);
mesh(new THREE.BoxGeometry(1.2,2.25,.7),'#8d735f',-2.55,1.12,-1.9);
mesh(new THREE.BoxGeometry(1.15,.75,.7),'#a98872',-2.55,.37,-.9);
mesh(new THREE.BoxGeometry(1.1,.08,.72),'#dec7a9',-2.55,.8,-.9);
mesh(new THREE.BoxGeometry(1.7,.08,1.15),'#bfa6c9',.2,.045,.8);
mesh(new THREE.BoxGeometry(.9,.1,.45),'#d9c3cf',1.85,.63,-1.65);

// Cozy room shell: rug, window, curtains, shelf, nightstand, lamp and hamper.
const rug=new THREE.Mesh(new THREE.CylinderGeometry(1.18,1.18,.035,48),new THREE.MeshStandardMaterial({color:'#d9b8a4',roughness:.95}));
rug.position.set(.15,.018,.85);rug.receiveShadow=true;room.add(rug);
const windowPane=mesh(new THREE.BoxGeometry(1.45,1.15,.035),'#a9d5df',-.55,1.88,-2.735,false);
windowPane.material.roughness=.4;windowPane.material.emissive=new THREE.Color('#618fa0');windowPane.material.emissiveIntensity=.12;
mesh(new THREE.BoxGeometry(1.58,.055,.07),'#f0e0d5',-.55,2.47,-2.69);
mesh(new THREE.BoxGeometry(1.58,.055,.07),'#f0e0d5',-.55,1.30,-2.69);
mesh(new THREE.BoxGeometry(.055,1.2,.07),'#f0e0d5',-1.32,1.88,-2.69);
mesh(new THREE.BoxGeometry(.055,1.2,.07),'#f0e0d5',.22,1.88,-2.69);
mesh(new THREE.BoxGeometry(.045,1.13,.065),'#f0e0d5',-.55,1.88,-2.68);
mesh(new THREE.BoxGeometry(.38,1.55,.09),'#b8899f',-1.57,1.77,-2.62);
mesh(new THREE.BoxGeometry(.38,1.55,.09),'#b8899f',.47,1.77,-2.62);
mesh(new THREE.BoxGeometry(1.25,.10,.32),'#7f654f',.85,2.48,-2.56);
const bookA=mesh(new THREE.BoxGeometry(.12,.28,.18),'#e5b46f',.55,2.67,-2.48);
const bookB=mesh(new THREE.BoxGeometry(.11,.24,.18),'#6f9f91',.69,2.65,-2.48);
const nightstand=mesh(new THREE.BoxGeometry(.58,.52,.55),'#8e6f59',2.88,.26,-1.72);
const lampBase=mesh(new THREE.CylinderGeometry(.11,.15,.16,20),'#d2b690',2.88,.60,-1.72);
const lampShadeBase=mesh(new THREE.CylinderGeometry(.16,.27,.30,24),'#f0cf9e',2.88,.82,-1.72);
lampShadeBase.material.emissive=new THREE.Color('#d99f55');lampShadeBase.material.emissiveIntensity=.12;
const practical=new THREE.PointLight('#ffd9a8',.42,4.2,2);practical.position.set(2.88,1.05,-1.68);scene.add(practical);
const hamper=new THREE.Mesh(new THREE.CylinderGeometry(.33,.29,.58,24),new THREE.MeshStandardMaterial({color:'#b89472',roughness:.9}));
hamper.position.set(-2.85,.29,.75);hamper.castShadow=true;room.add(hamper);
const poster=mesh(new THREE.BoxGeometry(.72,.96,.035),'#e7d9ca',1.15,1.98,-2.73,false);
const posterInner=mesh(new THREE.BoxGeometry(.58,.78,.025),'#8da59a',1.15,1.98,-2.705,false);

const actorRoot=new THREE.Group();scene.add(actorRoot);
const actorShadow=new THREE.Mesh(new THREE.CircleGeometry(.42,28),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.25,depthWrite:false}));actorShadow.rotation.x=-Math.PI/2;actorShadow.position.y=.02;actorRoot.add(actorShadow);

const rig={};
function joint(parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g}
function bodyMesh(parent,geo,color,x=0,y=0,z=0,rough=.78){
 const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:rough}));
 m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function buildHouseholdCharacter(){
 const root=new THREE.Group();root.name='HouseholdCharacter';actorRoot.add(root);rig.root=root;
 const skin='#e7a17f',hair='#3a231d',sweater='#9b79bd',pants='#29344d',slippers='#d596aa',eye='#17213a',accent='#72d3bc';
 const hips=joint(root,0,.78,0);rig.hips=hips;
 const pelvis=bodyMesh(hips,new THREE.SphereGeometry(.22,18,12),pants,0,0,0);pelvis.scale.set(1.15,.82,.9);
 const torso=joint(hips,0,.22,0);rig.torso=torso;
 bodyMesh(torso,new THREE.BoxGeometry(.54,.58,.38),sweater,0,.18,0);
 const head=joint(torso,0,.58,0);rig.head=head;
 const face=bodyMesh(head,new THREE.SphereGeometry(.23,24,16),skin,0,0,0);face.scale.set(1,.96,.92);
 const hairCap=bodyMesh(head,new THREE.SphereGeometry(.235,24,14),hair,0,.06,.035);hairCap.scale.set(1.02,.62,.94);
 bodyMesh(head,new THREE.SphereGeometry(.11,18,12),hair,0,.25,.08);
 bodyMesh(head,new THREE.SphereGeometry(.022,12,8),eye,-.075,-.205,.02);
 bodyMesh(head,new THREE.SphereGeometry(.022,12,8),eye,.075,-.205,.02);
 bodyMesh(torso,new THREE.SphereGeometry(.065,14,10),accent,0,.20,-.205);

 function arm(side){
  const s=side==='L'?-1:1;
  const upper=joint(torso,s*.31,.39,0);upper.rotation.z=s*.10;rig['upper'+side]=upper;
  bodyMesh(upper,new THREE.CylinderGeometry(.085,.10,.31,16),sweater,0,-.155,0);
  const fore=joint(upper,0,-.31,0);rig['fore'+side]=fore;
  bodyMesh(fore,new THREE.CylinderGeometry(.068,.078,.29,16),skin,0,-.145,0);
  const hand=joint(fore,0,-.29,0);rig['hand'+side]=hand;
  bodyMesh(hand,new THREE.SphereGeometry(.075,14,10),skin,0,-.05,0);
 }
 function leg(side){
  const s=side==='L'?-1:1;
  const thigh=joint(hips,s*.13,0,0);rig['thigh'+side]=thigh;
  bodyMesh(thigh,new THREE.CylinderGeometry(.11,.125,.34,18),pants,0,-.17,0);
  const shin=joint(thigh,0,-.34,0);rig['shin'+side]=shin;
  bodyMesh(shin,new THREE.CylinderGeometry(.09,.105,.34,18),pants,0,-.17,0);
  const foot=joint(shin,0,-.34,0);rig['foot'+side]=foot;
  bodyMesh(foot,new THREE.BoxGeometry(.22,.12,.34),slippers,0,-.06,-.10);
 }
 arm('L');arm('R');leg('L');leg('R');
}
buildHouseholdCharacter();

function resetRigPose(){
 if(!rig.root)return;
 ['thighL','thighR','shinL','shinR','footL','footR','upperL','upperR','foreL','foreR','torso','head'].forEach(k=>{if(rig[k])rig[k].rotation.set(0,0,0)});
 if(rig.hips)rig.hips.position.y=.78;
 if(rig.upperL)rig.upperL.rotation.z=-.10;
 if(rig.upperR)rig.upperR.rotation.z=.10;
}
function updateRigAnimation(dt,now){
 if(!rig.root)return;
 if(taskAnim)return;
 if(now<celebrateUntil){
  const p=1-(celebrateUntil-now)/2200,w=Math.sin(Math.min(1,Math.max(0,p))*Math.PI);
  resetRigPose();rig.upperL.rotation.x=-2.15*w;rig.upperR.rotation.x=-2.15*w;rig.hips.position.y=.78+Math.sin(p*Math.PI*3)*.08*w;rig.torso.rotation.x=-.10*w;return;
 }
 if(moving){
  walkClock+=dt*14.5;const s=Math.sin(walkClock),a=Math.abs(s);
  resetRigPose();rig.thighL.rotation.x=s*.72;rig.thighR.rotation.x=-s*.72;
  rig.shinL.rotation.x=Math.max(0,-s)*.62;rig.shinR.rotation.x=Math.max(0,s)*.62;
  rig.footL.rotation.x=-s*.14;rig.footR.rotation.x=s*.14;
  rig.upperL.rotation.x=-s*.58;rig.upperR.rotation.x=s*.58;
  rig.hips.position.y=.78+a*.025;rig.torso.rotation.z=-s*.035;return;
 }
 resetRigPose();const t=now*.001;
 rig.hips.position.y=.78+Math.sin(t*2.1)*.006;rig.torso.rotation.z=Math.sin(t*.9)*.015;rig.head.rotation.y=Math.sin(t*.55)*.06;
}

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
function setState(name){current=name}
let moveSpeed=3.4;
function walkTo(v,cb){target.copy(v);moving=true;afterMove=cb;const d=actorRoot.position.distanceTo(target);moveSpeed=Math.max(3.4,d/.42);setState('walk')}
function updateMove(dt){
 if(!moving)return;
 tmp.subVectors(target,actorRoot.position);tmp.y=0;const d=tmp.length();
 if(d<.07){actorRoot.position.x=target.x;actorRoot.position.z=target.z;moving=false;setState('idle');const cb=afterMove;afterMove=null;if(cb)cb();return}
 tmp.normalize();actorRoot.position.addScaledVector(tmp,Math.min(d,moveSpeed*dt));
 const yaw=Math.atan2(-tmp.x,-tmp.z);let diff=yaw-actorRoot.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));actorRoot.rotation.y+=diff*Math.min(1,dt*13);if(rig.head)rig.head.rotation.y=THREE.MathUtils.clamp(diff*1.35,-.34,.34);
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
 setState(id);
}
function updateTaskAnimation(now){
 if(!taskAnim)return;
 const a=taskAnim,p=Math.min(1,(now-a.start)/a.duration),ease=1-Math.pow(1-p,3),wave=Math.sin(p*Math.PI);
 resetRigPose();
 if(a.id==='clothes'||a.id==='trash'||a.id==='places'){
  rig.torso.rotation.x=wave*.48;rig.upperL.rotation.x=-wave*.95;rig.upperR.rotation.x=-wave*.95;rig.foreL.rotation.x=-wave*.65;rig.foreR.rotation.x=-wave*.65;
 }else if(a.id==='wipe'){
  rig.torso.rotation.x=.12*wave;rig.upperR.rotation.x=-1.0*wave;rig.foreR.rotation.z=Math.sin(p*Math.PI*6)*.75;rig.head.rotation.y=.18*wave;
 }else if(a.id==='vacuum'||a.id==='mop'){
  rig.torso.rotation.x=.16*wave;rig.upperL.rotation.x=-.75*wave;rig.upperR.rotation.x=-.75*wave;rig.foreL.rotation.x=-.55*wave;rig.foreR.rotation.x=-.55*wave;rig.torso.rotation.z=Math.sin(p*Math.PI*6)*.14;
 }else if(a.id==='machines'||a.id==='prepare'||a.id==='finish'){
  rig.upperR.rotation.x=-.85*wave;rig.foreR.rotation.x=-.55*wave;rig.torso.rotation.z=.08*wave;
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
  resetRigPose();
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
 busy=true;celebrateUntil=performance.now()+2200;flash.classList.remove('run');void flash.offsetWidth;flash.classList.add('run');
 setTimeout(()=>{level=Math.min(10,level+1);levelEl.textContent=level;upgradeRoom();},900);
 setTimeout(()=>{busy=false;toast('Household level '+level+' · morgen komt er weer nieuwe rommel');},2850);
}
function upgradeRoom(){
 upgradeGroup.visible=true;
 scene.background=new THREE.Color('#6d6a78');
 floorMesh.material.color.set('#b48667');
 backWall.material.color.set('#d4b8c2');
 sideWall.material.color.set('#c1a5b1');
 bedBase.material.color.set('#c59e87');
 bedTop.material.color.set('#fff6ee');
 sun.intensity=3.35;fill.intensity=1.1;practical.intensity=.62;
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
 scene.background=new THREE.Color(upgraded?'#6d6a78':'#6d6673');
 floorMesh.material.color.set(upgraded?'#b48667':'#9b735b');
 backWall.material.color.set(upgraded?'#d4b8c2':'#c4adb7');
 sideWall.material.color.set(upgraded?'#c1a5b1':'#b49da9');
 bedBase.material.color.set(upgraded?'#c59e87':'#b99684');
 bedTop.material.color.set(upgraded?'#fff6ee':'#f4e9e2');
 sun.intensity=upgraded?3.35:2.85;fill.intensity=upgraded?1.1:.9;practical.intensity=upgraded?.62:.42;
 camera.position.set(upgraded?6.25:6.8,upgraded?4.75:5.2,upgraded?7.8:8.5);camera.lookAt(0,.7,0);
 clutter.forEach(o=>{o.visible=true;o.scale.setScalar(1);if(o.material?.emissive){o.material.emissive.set('#000');o.material.emissiveIntensity=0}});
 actorRoot.position.set(.1,0,1.9);actorRoot.rotation.y=Math.PI;renderTasks();toast(upgraded?'Nieuwe dag: level blijft, nieuwe rommel':'Nieuwe dag: kamer weer rommelig');
}
document.getElementById('resetRoom').onclick=reset;
currentTaskButton.onclick=startTask;
function renderTasks(){
 const done=Math.min(index,TASKS.length);
 const currentTask=TASKS[Math.min(index,TASKS.length-1)];
 progress.textContent=(index>=TASKS.length?TASKS.length:index+1)+' / '+TASKS.length;
 taskProgressFill.style.width=((done/TASKS.length)*100)+'%';
 if(index>=TASKS.length){
  currentTaskTitle.textContent='Kamer schoon';
  currentTaskHint.textContent='Alle 9 stappen zijn klaar — evolution gestart.';
  currentTaskButton.disabled=true;
  currentTaskButton.innerHTML='Vandaag klaar <span>✓</span>';
 }else{
  currentTaskTitle.textContent=currentTask[1];
  currentTaskHint.textContent=currentTask[2];
  currentTaskButton.disabled=busy;
  currentTaskButton.innerHTML=(busy?'Bezig…':'Doe deze stap')+' <span>→</span>';
  currentTaskButton.onclick=startTask;
 }
 const id=TASKS[index]?.[0];
 clutter.forEach((o,key)=>{if(!o.material?.emissive)return;o.material.emissive.set(key===id?'#8be1c1':'#000');o.material.emissiveIntensity=key===id ? .22 : 0});
}

toast('Eigen Household rig actief · klik stap 1 of de kleding');

function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(stage);resize();reset();

let last=performance.now();
function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;updateMove(dt);updateTaskAnimation(now);updateRigAnimation(dt,now);renderer.render(scene,camera);requestAnimationFrame(tick)}
requestAnimationFrame(tick);
