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

let index=0,level=1,busy=false,current='idle',taskAnim=null,celebrateUntil=0,walkClock=0,taskToken=0,taskStartedAt=0;
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
const posterInner=mesh(new THREE.BoxGeometry(.58,.78,.025),'#8d6bac',1.15,1.98,-2.705,false);
const goldTrimMat=new THREE.MeshStandardMaterial({color:'#cda457',roughness:.4,metalness:.18,emissive:'#5b3a0a',emissiveIntensity:.06});
const trim1=new THREE.Mesh(new THREE.BoxGeometry(6.7,.045,.055),goldTrimMat);trim1.position.set(0,.23,-2.70);room.add(trim1);
const trim2=new THREE.Mesh(new THREE.BoxGeometry(6.7,.045,.055),goldTrimMat);trim2.position.set(0,2.93,-2.70);room.add(trim2);
const sparkleGroup=new THREE.Group();room.add(sparkleGroup);
for(let i=0;i<10;i++){
 const s=new THREE.Mesh(new THREE.OctahedronGeometry(.035,0),new THREE.MeshStandardMaterial({color:'#ffd86a',emissive:'#ffb52e',emissiveIntensity:.9,roughness:.25}));
 s.position.set(-2.7+(i%5)*1.25,.35+(i%3)*.62,-2.52+(i%2)*.18);s.visible=false;s.userData.phase=i*.7;sparkleGroup.add(s);
}

const actorRoot=new THREE.Group();scene.add(actorRoot);
const actorShadow=new THREE.Mesh(new THREE.CircleGeometry(.42,28),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.25,depthWrite:false}));actorShadow.rotation.x=-Math.PI/2;actorShadow.position.y=.02;actorRoot.add(actorShadow);

const CHARACTER_ART={
 idle:'img/lab/park31/household/l03.webp',
 general:'img/lab/park31/household/l02.webp',
 prepare:'img/lab/park31/household/l04.webp',
 wipe:'img/lab/park31/household/l05.webp',
 vacuum:'img/lab/park31/household/l08.webp',
 mop:'img/lab/park31/household/l07.webp',
 finish:'img/lab/park31/household/l03.webp'
};
const charTextures={},charMaterials={};
let characterSprite=null,characterBaseY=1.03,currentVisual='idle';
const loader=new THREE.TextureLoader();

function makeCharacterTexture(path){
 const tex=loader.load(path);
 tex.colorSpace=THREE.SRGBColorSpace;
 tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
 // Assets include the purple display pedestal at the bottom.
 // Crop it away so only Joey's canon Household character lives in the room.
 tex.repeat.set(1,.68);
 tex.offset.set(0,.32);
 return tex;
}
for(const [key,path] of Object.entries(CHARACTER_ART)){
 const tex=makeCharacterTexture(path);
 charTextures[key]=tex;
 charMaterials[key]=new THREE.SpriteMaterial({
   map:tex,transparent:true,depthWrite:false,alphaTest:.025,
   toneMapped:false
 });
}
characterSprite=new THREE.Sprite(charMaterials.idle);
characterSprite.name='HouseholdCanonCharacter';
characterSprite.scale.set(1.58,2.16,1);
characterSprite.position.set(0,characterBaseY,0);
actorRoot.add(characterSprite);

function setCharacterVisual(key){
 const wanted=charMaterials[key]||charMaterials.general||charMaterials.idle;
 if(characterSprite.material!==wanted) characterSprite.material=wanted;
 currentVisual=key;
}
function visualForTask(id){
 if(id==='wipe') return 'wipe';
 if(id==='vacuum') return 'vacuum';
 if(id==='mop') return 'mop';
 if(id==='prepare'||id==='machines') return 'prepare';
 if(id==='finish') return 'finish';
 return 'general';
}
function resetCharacterPose(){
 if(!characterSprite)return;
 characterSprite.position.x=0;
 characterSprite.position.y=characterBaseY;
 characterSprite.scale.set(1.58,2.16,1);
 characterSprite.material.rotation=0;
}
function updateCharacterAnimation(dt,now){
 if(!characterSprite)return;
 if(taskAnim) return;
 if(now<celebrateUntil){
   const p=1-(celebrateUntil-now)/2200;
   const w=Math.sin(Math.max(0,Math.min(1,p))*Math.PI);
   setCharacterVisual('finish');
   characterSprite.position.y=characterBaseY+Math.sin(p*Math.PI*3)*.14*w;
   const s=1+w*.08;characterSprite.scale.set(1.58*s,2.16*s,1);
   characterSprite.material.rotation=Math.sin(p*Math.PI*5)*.055*w;
   return;
 }
 if(moving){
   setCharacterVisual('idle');
   walkClock+=dt*18;
   const step=Math.sin(walkClock),lift=Math.abs(Math.sin(walkClock*.5));
   characterSprite.position.y=characterBaseY+.035*lift;
   characterSprite.material.rotation=step*.026;
   characterSprite.scale.set(1.58*(1+.018*lift),2.16*(1-.012*lift),1);
   return;
 }
 setCharacterVisual('idle');
 const t=now*.001;
 characterSprite.position.y=characterBaseY+Math.sin(t*2.0)*.012;
 characterSprite.material.rotation=Math.sin(t*.75)*.008;
 characterSprite.scale.set(1.58,2.16,1);
}

// Small game-FX layer: visible confirmation that the room reacts to her actions.
const actionFx=new THREE.Group();scene.add(actionFx);
const cleanRing=new THREE.Mesh(
 new THREE.RingGeometry(.26,.34,32),
 new THREE.MeshBasicMaterial({color:'#c7a7ff',transparent:true,opacity:.0,depthWrite:false,side:THREE.DoubleSide})
);
cleanRing.rotation.x=-Math.PI/2;cleanRing.position.y=.025;scene.add(cleanRing);
let fxUntil=0,fxMode='';
const fxParticles=[];
for(let i=0;i<12;i++){
 const p=new THREE.Mesh(
   new THREE.OctahedronGeometry(.035+(i%3)*.008,0),
   new THREE.MeshBasicMaterial({color:i%2?'#fff2c8':'#c9a8ff',transparent:true,opacity:0,depthWrite:false})
 );
 p.visible=false;actionFx.add(p);fxParticles.push(p);
}
function startActionFx(id,obj){
 fxMode=id;fxUntil=performance.now()+(id==='vacuum'||id==='mop'?650:480);
 cleanRing.position.set(obj.position.x,.025,obj.position.z);
 cleanRing.material.opacity=.62;
 fxParticles.forEach((p,i)=>{
   p.visible=true;p.material.opacity=.85;
   p.position.set(obj.position.x+(i%4-.5)*.12,.10+(i%3)*.07,obj.position.z+((i*7)%5-2)*.08);
   p.userData.seed=i*.61;
 });
}
function updateActionFx(now){
 const left=fxUntil-now;
 if(left<=0){
   cleanRing.material.opacity=Math.max(0,cleanRing.material.opacity-.08);
   fxParticles.forEach(p=>{p.visible=false;p.material.opacity=0});
   return;
 }
 const q=1-left/(fxMode==='vacuum'||fxMode==='mop'?650:480);
 cleanRing.scale.setScalar(.82+q*.65);
 cleanRing.material.opacity=.62*(1-q);
 cleanRing.rotation.z=now*.003;
 fxParticles.forEach((p,i)=>{
   const a=p.userData.seed+q*Math.PI*2;
   p.position.y=.10+q*.48+(i%3)*.025;
   p.position.x+=Math.cos(a)*.004;
   p.position.z+=Math.sin(a)*.004;
   p.rotation.y+=.12;
   p.material.opacity=.85*(1-q);
 });
}
const clutter=new Map();
function addClutter(id,color,pos,kind='box'){
  let g=kind==='sphere'?new THREE.SphereGeometry(.18,16,10):new THREE.BoxGeometry(.42,.14,.28);
  if(id==='vacuum')g=new THREE.BoxGeometry(.34,.18,.42);
  if(id==='mop')g=new THREE.CylinderGeometry(.045,.045,.95,14);
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color,roughness:.7,emissive:'#000'}));m.position.copy(pos);m.userData.originalPosition=pos.clone();m.userData.originalRotation=m.rotation.clone();m.castShadow=true;m.userData.task=id;room.add(m);clutter.set(id,m);return m;
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

// Turn the functional task proxies into cute game props.
const clothesObj=clutter.get('clothes');
for(let i=0;i<4;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.16,14,9),new THREE.MeshStandardMaterial({color:['#7e4bae','#d98ba8','#eee1cf','#493a7b'][i],roughness:.7}));p.scale.set(1.4,.45,.9);p.position.set((i-1.5)*.10,.08*(i%2),.04*(i%3));clothesObj.add(p)}
const trashObj=clutter.get('trash');
const can=new THREE.Mesh(new THREE.CylinderGeometry(.22,.18,.38,18),new THREE.MeshStandardMaterial({color:'#766b70',roughness:.7,metalness:.05}));can.position.y=.18;trashObj.add(can);
for(let i=0;i<3;i++){const scrap=new THREE.Mesh(new THREE.SphereGeometry(.075,10,7),new THREE.MeshStandardMaterial({color:['#e2c078','#d9806e','#e8e0d8'][i],roughness:.9}));scrap.position.set((i-1)*.13,.38,.04*(i-1));scrap.scale.set(1.1,.6,.9);trashObj.add(scrap)}
const vac=clutter.get('vacuum');
const vacHandle=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.72,14),new THREE.MeshStandardMaterial({color:'#47355d',roughness:.35,metalness:.08}));vacHandle.position.set(0,.42,-.12);vacHandle.rotation.x=-.22;vac.add(vacHandle);
const vacGrip=new THREE.Mesh(new THREE.BoxGeometry(.19,.07,.10),new THREE.MeshStandardMaterial({color:'#e7dbe8',roughness:.4}));vacGrip.position.set(0,.76,-.20);vac.add(vacGrip);
const vacGlow=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),new THREE.MeshStandardMaterial({color:'#a85bea',emissive:'#7a34bb',emissiveIntensity:.65}));vacGlow.position.set(.09,.06,-.20);vac.add(vacGlow);
const dustGroup=new THREE.Group();room.add(dustGroup);
for(let i=0;i<14;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.018+(i%3)*.006,8,6),new THREE.MeshStandardMaterial({color:i%2?'#715b4b':'#8f7661',roughness:1}));d.position.set(-1.6+(i%7)*.43,.025,.55+Math.floor(i/7)*.55+(i%2)*.08);d.userData.original=d.scale.clone();dustGroup.add(d)}
const mop=clutter.get('mop');
const mopHead=new THREE.Mesh(new THREE.BoxGeometry(.42,.08,.18),new THREE.MeshStandardMaterial({color:'#ede3dc',roughness:.82}));mopHead.position.set(0,-.47,0);mop.add(mopHead);
const mopBand=new THREE.Mesh(new THREE.TorusGeometry(.055,.018,8,16),new THREE.MeshStandardMaterial({color:'#6c43a0',roughness:.45}));mopBand.position.set(0,.28,0);mopBand.rotation.x=Math.PI/2;mop.add(mopBand);
const wipeObj=clutter.get('wipe');
wipeObj.geometry=new THREE.BoxGeometry(.32,.035,.28);wipeObj.material.color.set('#f5e6d8');
const finishObj=clutter.get('finish');
const dusterHandle=new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.52,14),new THREE.MeshStandardMaterial({color:'#d3a253',roughness:.35,metalness:.12}));dusterHandle.position.set(0,.32,0);finishObj.add(dusterHandle);
for(let i=0;i<8;i++){const plume=new THREE.Mesh(new THREE.SphereGeometry(.07,12,8),new THREE.MeshStandardMaterial({color:'#f3e9e4',roughness:.9}));plume.position.set(Math.sin(i)*.08,.60+(i%3)*.045,Math.cos(i)*.04);plume.scale.set(.7,1.6,.7);finishObj.add(plume)}

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
 const yaw=Math.atan2(tmp.x,tmp.z);let diff=yaw-actorRoot.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));actorRoot.rotation.y+=diff*Math.min(1,dt*10);
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
 taskAnim={id,obj,from:obj.position.clone(),fromRotation:obj.rotation.clone(),to:actionDestination(id,obj),start:performance.now(),duration:reduce?80:(long?650:420),cb};
 setState(id);setCharacterVisual(visualForTask(id));startActionFx(id,obj);
 if(id==='vacuum'||id==='mop') obj.visible=false;
}
function updateTaskAnimation(now){
 if(!taskAnim)return;
 const a=taskAnim,p=Math.min(1,(now-a.start)/a.duration),ease=1-Math.pow(1-p,3),wave=Math.sin(p*Math.PI);
 resetCharacterPose();
 setCharacterVisual(visualForTask(a.id));
 // Every task has its own readable body-language beat while keeping the exact canon art.
 if(a.id==='clothes'||a.id==='trash'||a.id==='places'){
   characterSprite.material.rotation=-.08*wave;
   characterSprite.position.y=characterBaseY-.10*wave;
   characterSprite.scale.set(1.58*(1+.035*wave),2.16*(1-.08*wave),1);
 }else if(a.id==='wipe'){
   characterSprite.material.rotation=Math.sin(p*Math.PI*5)*.055;
   characterSprite.position.y=characterBaseY+.025*Math.sin(p*Math.PI*4);
 }else if(a.id==='vacuum'){
   characterSprite.material.rotation=Math.sin(p*Math.PI*3)*.07;
   characterSprite.position.y=characterBaseY-.035*wave;
   characterSprite.scale.set(1.58*(1+.025*wave),2.16*(1-.025*wave),1);
 }else if(a.id==='mop'){
   characterSprite.material.rotation=Math.sin(p*Math.PI*4)*.08;
   characterSprite.position.y=characterBaseY-.02*wave;
 }else if(a.id==='machines'||a.id==='prepare'){
   characterSprite.material.rotation=.045*wave;
   characterSprite.position.y=characterBaseY+.025*wave;
 }else if(a.id==='finish'){
   characterSprite.position.y=characterBaseY+.10*wave;
   characterSprite.material.rotation=Math.sin(p*Math.PI*2)*.05;

 }
 if(a.id==='vacuum'||a.id==='mop'){
  const cleaned=Math.floor(p*dustGroup.children.length);dustGroup.children.forEach((d,i)=>d.visible=i>=cleaned);
  // The canon l07/l08 artwork already contains the mop/vacuum in her hands.
  // Animate the whole character as the action carrier instead of faking arm mechanics.
  characterSprite.position.x=Math.sin(p*Math.PI*4)*.06;
  characterSprite.position.y=characterBaseY-.025*wave;
  characterSprite.material.rotation=Math.sin(p*Math.PI*4)*(a.id==='mop'?.055:.04);
  a.obj.position.copy(a.from);
 }else if(a.id==='wipe'){
  a.obj.position.x=a.from.x+Math.sin(p*Math.PI*5)*.28;
 }else{
  a.obj.position.lerpVectors(a.from,a.to,ease);
  a.obj.position.y+=wave*.28;
  a.obj.rotation.y=a.fromRotation.y+ease*.48;
 }
 a.obj.material.emissive.set('#5ce3b1');a.obj.material.emissiveIntensity=.25+.45*wave;
 if(p>=1){
  resetCharacterPose();setCharacterVisual('idle');
  a.obj.scale.setScalar(.01);setTimeout(()=>{a.obj.visible=false;},100);
  taskAnim=null;const cb=a.cb;if(cb)cb();
 }
}
function startTask(){
 if(busy||index>=TASKS.length)return;
 busy=true;const token=++taskToken;taskStartedAt=performance.now();renderTasks();
 const [id,name]=TASKS[index];
 toast('Ze gaat '+name.toLowerCase());
 console.info('[Household]',index+1,id,'start');
 // Watchdog: this task cannot permanently block the UI after a failed animation/callback.
 setTimeout(()=>{if(taskToken===token&&busy&&index<TASKS.length)rescueTask(id,token,'watchdog');},2200);
 walkTo(taskTarget(id),()=>{
   if(taskToken!==token)return;
   console.info('[Household]',index+1,id,'arrived');
   pulse(clutter.get(id));
   setTimeout(()=>{
     if(taskToken!==token)return;
     try{startTaskAnimation(id,()=>completeCurrent(id,token));}
     catch(err){console.error('[Household] animation start error',id,err);rescueTask(id,token,'animation-start');}
   },reduce?20:60);
 });
}
function rescueTask(id,token,reason){
 if(taskToken!==token||index>=TASKS.length||TASKS[index]?.[0]!==id)return;
 console.warn('[Household] recovered task',index+1,id,reason);
 moving=false;afterMove=null;taskAnim=null;
 resetCharacterPose();setCharacterVisual('idle');
 const obj=clutter.get(id);if(obj){obj.visible=false;obj.scale.setScalar(.01);}
 completeCurrent(id,token);
}
function completeCurrent(id,token){
 if(token!==taskToken||index>=TASKS.length||TASKS[index]?.[0]!==id)return;
 taskToken++;taskAnim=null;moving=false;afterMove=null;taskStartedAt=0;
 console.info('[Household]',index+1,id,'complete');
 index++;busy=false;renderTasks();
 if(index>=TASKS.length){toast('Kamer schoon — evolution!');const completedToken=taskToken;setTimeout(()=>{if(taskToken===completedToken)levelUp();},320)}
 else toast('Stap '+index+' klaar · volgende: '+TASKS[index][1]);
}
function levelUp(){
 const currentToken=taskToken;busy=true;celebrateUntil=performance.now()+2200;flash.classList.remove('run');void flash.offsetWidth;flash.classList.add('run');
 setTimeout(()=>{if(taskToken!==currentToken)return;level=Math.min(10,level+1);levelEl.textContent=level;upgradeRoom();},900);
 setTimeout(()=>{if(taskToken!==currentToken)return;busy=false;toast('Household level '+level+' · morgen komt er weer nieuwe rommel');},2850);
}
function upgradeRoom(){
 upgradeGroup.visible=true;sparkleGroup.children.forEach(s=>s.visible=true);
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
 taskToken++;index=0;busy=false;taskAnim=null;moving=false;afterMove=null;taskStartedAt=0;celebrateUntil=0;flash.classList.remove('run');
 const upgraded=level>1;
 upgradeGroup.visible=upgraded;sparkleGroup.children.forEach(s=>s.visible=upgraded);
 scene.background=new THREE.Color(upgraded?'#6d6a78':'#6d6673');
 floorMesh.material.color.set(upgraded?'#b48667':'#9b735b');
 backWall.material.color.set(upgraded?'#d4b8c2':'#c4adb7');
 sideWall.material.color.set(upgraded?'#c1a5b1':'#b49da9');
 bedBase.material.color.set(upgraded?'#c59e87':'#b99684');
 bedTop.material.color.set(upgraded?'#fff6ee':'#f4e9e2');
 sun.intensity=upgraded?3.35:2.85;fill.intensity=upgraded?1.1:.9;practical.intensity=upgraded?.62:.42;
 camera.position.set(upgraded?6.25:6.8,upgraded?4.75:5.2,upgraded?7.8:8.5);camera.lookAt(0,.7,0);
 clutter.forEach(o=>{o.visible=true;o.scale.setScalar(1);o.position.copy(o.userData.originalPosition);o.rotation.copy(o.userData.originalRotation);if(o.material?.emissive){o.material.emissive.set('#000');o.material.emissiveIntensity=0}});dustGroup.children.forEach(d=>d.visible=true);
 actorRoot.position.set(.1,0,1.9);actorRoot.rotation.y=0;resetCharacterPose();setCharacterVisual('idle');renderTasks();toast(upgraded?'Nieuwe dag: level blijft, nieuwe rommel':'Nieuwe dag: kamer weer rommelig');
}
document.getElementById('resetRoom').onclick=reset;
document.getElementById('previewEvolution').onclick=()=>{
 // Lab-only shortcut: inspect the visible upgrade without repeating nine tasks.
 taskToken++;moving=false;afterMove=null;taskAnim=null;taskStartedAt=0;busy=false;
 resetCharacterPose();setCharacterVisual('idle');
 index=TASKS.length;clutter.forEach(o=>{o.visible=false;o.scale.setScalar(.01)});
 dustGroup.children.forEach(d=>d.visible=false);
 renderTasks();levelUp();
};
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

toast('Canon Household character actief · klik stap 1 of de kleding');

function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(stage);resize();reset();

let last=performance.now();
function tick(now){
 requestAnimationFrame(tick);
 const dt=Math.min(.05,(now-last)/1000);last=now;
 try{
   updateMove(dt);updateTaskAnimation(now);updateCharacterAnimation(dt,now);updateActionFx(now);
   sparkleGroup.children.forEach(s=>{if(s.visible){const t=now*.002+s.userData.phase;s.rotation.y=t;s.scale.setScalar(.75+Math.sin(t*2)*.28)}});
   renderer.render(scene,camera);
 }catch(err){
   console.error('[Household] frame error',err);
   if(taskStartedAt&&taskAnim&&TASKS[index]?.[0]===taskAnim.id)rescueTask(taskAnim.id,taskToken,'frame-error');
 }
}
requestAnimationFrame(tick);
