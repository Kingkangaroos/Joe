import {worlds} from './lab-world-directions-ui.js?v=1';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';

const $=id=>document.getElementById(id);
const stage=$('stage'),loading=$('loading'),stateLabel=$('state'),meshStatus=$('meshStatus'),boneStatus=$('boneStatus'),fpsLabel=$('fps');
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
let paused=reduced, missionPhase='ready', demoCompleted=false;
const pauseButton=$('pauseWorld');
function updatePause(){pauseButton.textContent=paused?'Hervat':'Pauze';pauseButton.setAttribute('aria-pressed',String(paused));}
updatePause();
pauseButton.onclick=()=>{paused=!paused;updatePause();};
addEventListener('visibilitychange',()=>{last=performance.now();});
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}
catch(e){loading.textContent='Deze browser kan de 3D-wereld niet tonen. De vijf sferen en je feedback blijven beschikbaar.';document.querySelectorAll('[data-motion],#demoMission,#resetDemo,#pauseWorld').forEach(b=>b.disabled=true);meshStatus.textContent='WebGL niet beschikbaar';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
stage.append(renderer.domElement);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;updatePause();loading.classList.remove('hidden');loading.textContent='3D onderbroken. Herlaad deze proef om verder te gaan.';});
const scene=new THREE.Scene();scene.background=new THREE.Color('#152738');
scene.fog=new THREE.Fog('#152738',9,18);
const camera=new THREE.PerspectiveCamera(38,1,.1,35);camera.position.set(3.7,3.0,6.2);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,1,0);controls.enablePan=false;controls.enableDamping=true;controls.minDistance=3.0;controls.maxDistance=9;controls.minPolarAngle=.35;controls.maxPolarAngle=1.55;controls.update();
scene.add(new THREE.HemisphereLight('#f7fcff','#385c54',2.3));
const sun=new THREE.DirectionalLight('#fff0c4',3.1);sun.position.set(4,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;scene.add(sun);
const rim=new THREE.DirectionalLight('#55cbaa',1.5);rim.position.set(-5,4,-2);scene.add(rim);

const groundMat=new THREE.MeshStandardMaterial({color:'#235c52',roughness:.88});
const floor=new THREE.Mesh(new THREE.CircleGeometry(4.4,64),groundMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const oval=new THREE.Mesh(new THREE.RingGeometry(3.7,3.82,64),new THREE.MeshBasicMaterial({color:'#70baa7',transparent:true,opacity:.4,side:THREE.DoubleSide}));oval.rotation.x=-Math.PI/2;oval.position.y=.01;scene.add(oval);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.4,28),new THREE.MeshBasicMaterial({color:'#091d1b',transparent:true,opacity:.22,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;scene.add(shadow);
const actor=new THREE.Group();scene.add(actor);

const targets={},rest={},initialPosition={};
let fox=null,loaded=false,state='idle',phase=0,duration=0,moveTarget=null,moveSpeed=0,activePreview=1;
const animationScale={walk:1,run:1.6};
function bone(n){return targets[n]||null}
function pose(n,x=0,y=0,z=0){const b=bone(n);if(!b)return;const r=rest[n];b.rotation.set(r.x+x,r.y+y,r.z+z)}
function positionBone(n,x=0,y=0,z=0){const b=bone(n);if(!b)return;const r=initialPosition[n];b.position.set(r.x+x,r.y+y,r.z+z)}
function zeroPose(){for(const n of Object.keys(targets)){const b=targets[n];b.rotation.copy(rest[n]);b.position.copy(initialPosition[n]);}}
function setState(name){
 if(!loaded)return;
 state=name;stateLabel.textContent=name.toUpperCase();duration=0;phase=0;
 document.querySelectorAll('[data-motion]').forEach(btn=>btn.classList.toggle('on',btn.dataset.motion===name));
 if(name==='walk'||name==='run'){
   moveTarget=null;
 }
}
document.querySelectorAll('[data-motion]').forEach(btn=>btn.addEventListener('click',()=>{if(missionPhase==='walking')return;paused=false;updatePause();actor.position.y=0;setState(btn.dataset.motion);}));

function updatePose(dt,t){
 if(!loaded||!fox)return;
 zeroPose();
 const speed=state==='run'?15.4:state==='walk'?9.3:0;
 phase+=Math.min(.05,dt)*speed;
 const s=Math.sin(phase),s2=Math.sin(phase*2),kick=Math.abs(s);
 if(state==='walk'||state==='run'){
  const run=state==='run',amp=run?.78:.54;
  pose('Thigh.L',amp*s);pose('Thigh.R',-amp*s);
  pose('Shin.L',Math.max(0,-s)*(run?.92:.62));
  pose('Shin.R',Math.max(0,s)*(run?.92:.62));
  pose('Foot.L',-.19*s);pose('Foot.R',.19*s);
  pose('UpperArm.L',-.55*s);pose('UpperArm.R',.55*s);
  pose('Forearm.L',-.12*s);pose('Forearm.R',.12*s);
  pose('Spine',run?.10:.04,0,.036*s);
  pose('Head',run?-.07:-.025,0,-.03*s);
  pose('Tail',0,.15*s,.12*Math.cos(phase));
  positionBone('Hips',0,Math.max(0,kick)*(run?.047:.018),0);
  actor.position.y=Math.max(0,Math.sin(phase*2))*(run?.025:.008);
 }else if(state==='idle'){
  pose('Spine',Math.sin(t*2.1)*.025,0,Math.sin(t*.74)*.019);
  pose('Head',-.065+Math.sin(t*.88)*.025,Math.sin(t*.61)*.065);
  pose('Tail',0,Math.sin(t*1.1)*.17);
  pose('UpperArm.L',.05,0,-.04);pose('UpperArm.R',.05,0,.04);
  positionBone('Hips',0,Math.sin(t*2.0)*.006,0);
 }else if(state==='yawn'){
  duration+=dt;const up=THREE.MathUtils.smoothstep(duration,0,.42),down=1-THREE.MathUtils.smoothstep(duration,1.9,2.75),v=up*down;
  pose('Jaw',.78*v);pose('Head',-.12*v);pose('Spine',-.13*v);
  pose('UpperArm.R',-.95*v);pose('Forearm.R',-.72*v);
  pose('Tail',0,.13*Math.sin(t));
  if(duration>2.9)setState('idle');
 }else if(state==='celebrate'){
  duration+=dt;const up=THREE.MathUtils.smoothstep(duration,0,.25),down=1-THREE.MathUtils.smoothstep(duration,1.75,2.5),v=up*down;
  pose('UpperArm.L',-1.5*v);pose('UpperArm.R',-1.5*v);
  pose('Spine',-.16*v,0,.13*Math.sin(duration*8)*v);
  pose('Head',-.12*v,0,.07*Math.sin(duration*8)*v);
  positionBone('Hips',0,.10*Math.max(0,Math.sin(duration*10))*v,0);
  actor.position.y=.09*Math.max(0,Math.sin(duration*10))*v;
  if(duration>2.65){actor.position.y=0;setState('idle');}
 }
}
function updateWalking(dt){
 if(state!=='walk'&&state!=='run')return;
 const speed=state==='run'?2.45:1.05;
 if(!moveTarget){
  const x=actor.position.x;
  moveTarget=new THREE.Vector3(x>1? -2.0:2.0,0,actor.position.z);
 }
 const direction=moveTarget.clone().sub(actor.position);direction.y=0;const d=direction.length();
 if(d<.1){if(moveTarget.manual){moveTarget=null;if(missionPhase==='walking')finishDemo();else setState('idle');return;}moveTarget.set(-moveTarget.x,0,moveTarget.z);return;}
 direction.normalize();
 actor.position.addScaledVector(direction,Math.min(d,speed*dt));
 const yaw=Math.atan2(direction.x,direction.z);let delta=yaw-actor.rotation.y;delta=Math.atan2(Math.sin(delta),Math.cos(delta));actor.rotation.y+=delta*Math.min(1,dt*9);
}
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),down={};
renderer.domElement.addEventListener('pointerdown',e=>{down.x=e.clientX;down.y=e.clientY;});
renderer.domElement.addEventListener('pointerup',e=>{
 if(!loaded||missionPhase==='walking')return;
 if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>12)return;
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1));
 ray.setFromCamera(pointer,camera);
 const hit=ray.intersectObject(floor)[0];if(!hit)return;
 moveTarget=hit.point.clone();moveTarget.y=0;moveTarget.manual=true;
 if(actor.position.distanceTo(moveTarget)<.2)return;
 paused=false;updatePause();setState('walk');moveTarget=hit.point.clone();moveTarget.y=0;moveTarget.manual=true;
});

document.querySelectorAll('[data-level]').forEach(btn=>btn.addEventListener('click',()=>{
 activePreview=Number(btn.dataset.level);
 document.querySelectorAll('[data-level]').forEach(b=>b.classList.toggle('selected',b===btn));
 $('levelNote').textContent='Level '+activePreview+' is originele referentiekunst. Hetzelfde 3D-model blijft zichtbaar; level-art wordt niet als animatieframe gebruikt.';
}));

const draco=new DRACOLoader();draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/');
const loader=new GLTFLoader();loader.setDRACOLoader(draco);

async function loadFox(){
 try{
  const files=['assets/models/steps-fox-rig-v1.part1.b64','assets/models/steps-fox-rig-v1.part2.b64'];
  const [a,b]=await Promise.all(files.map(async f=>{const r=await fetch(f);if(!r.ok)throw new Error('Asset '+r.status+' '+f);return r.text()}));
  const encoded=a+b;
  if(encoded.length!==304908)throw new Error('Incomplete GLB payload: '+encoded.length);
  const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
  const gltf=await new Promise((resolve,reject)=>loader.parse(bytes.buffer,'',resolve,reject));
    fox=gltf.scene;
    const excluded=[];
    fox.traverse(o=>{
      if(o.name.startsWith('ENV_')||o.isLight||o.isCamera)excluded.push(o);
      if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}
      if(/^(Root|Hips|Spine|Neck|Head|Jaw|Tail|UpperArm\.[LR]|Forearm\.[LR]|Hand\.[LR]|Thigh\.[LR]|Shin\.[LR]|Foot\.[LR])$/.test(o.name)){
        targets[o.name]=o;rest[o.name]=o.rotation.clone();initialPosition[o.name]=o.position.clone();
      }
    });
    excluded.forEach(o=>o.removeFromParent());
    actor.add(fox);
    const box=new THREE.Box3().setFromObject(fox);
    const h=box.getSize(new THREE.Vector3()).y;
    fox.scale.setScalar(2.2/Math.max(.01,h));
    fox.position.y-=box.min.y*fox.scale.y;
    boneStatus.textContent='Bones '+Object.keys(targets).length;
    meshStatus.textContent='Echte 3D · '+Math.round(bytes.length/1024)+' KB';
    loaded=true;$('demoMission').disabled=false;loading.classList.add('hidden');setState('idle');
 }catch(e){console.error('[World Studio]',e);loading.textContent='Model kon niet laden. Herlaad de proef om opnieuw te proberen.';meshStatus.textContent='GLB-fout';$('demoMission').disabled=true;}
}
let w=0,h=0,last=performance.now(),frames=0,fpsTime=0;
function resize(){const r=stage.getBoundingClientRect();if(r.width===w&&r.height===h)return;w=r.width;h=r.height;renderer.setSize(w,h,false);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(stage);resize();
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min((now-last)/1000,.055);last=now;const t=now*.001;
 if(!paused&&!document.hidden){worldTime+=dt;updateWalking(dt);updatePose(dt,worldTime);updateWorld(dt,worldTime);}shadow.position.x=actor.position.x;shadow.position.z=actor.position.z;
 controls.update();renderer.render(scene,camera);
 fpsTime+=dt;frames++;if(fpsTime>.85){fpsLabel.textContent='FPS '+Math.round(frames/fpsTime);fpsTime=0;frames=0}
}
requestAnimationFrame(frame);
loadFox();

// This Lab owns only its simulation and one namespaced local review key.
// Existing Steps model and rig are reused; no RPG/auth/sync scripts are loaded.
let worldTime=0,world='garden';
const decor=new THREE.Group();scene.add(decor);
const mats={trunk:new THREE.MeshStandardMaterial({roughness:1}),leaf:new THREE.MeshStandardMaterial({roughness:1}),stone:new THREE.MeshStandardMaterial({roughness:1})};
function prop(geometry,material,x,y,z){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;decor.add(mesh);return mesh;}
const crowns=[];
for(let i=0;i<9;i++){
 const angle=Math.PI*.12+i*Math.PI*.095,x=Math.cos(angle)*3.4,z=-Math.sin(angle)*3.4;
 prop(new THREE.CylinderGeometry(.075,.12,.7,7),mats.trunk,x,.35,z);
 crowns.push(prop(new THREE.IcosahedronGeometry(.5+(i%3)*.11,1),mats.leaf,x,1.02+(i%3)*.08,z));
}
for(let i=0;i<16;i++){const angle=i/16*Math.PI*2;const tile=prop(new THREE.CylinderGeometry(.19,.22,.04,7),mats.stone,Math.cos(angle)*2.15,.02,Math.sin(angle)*1.5);tile.rotation.y=i*.47;}
const beacon=new THREE.Group();beacon.position.set(1.35,0,-.9);scene.add(beacon);
const beaconBase=new THREE.Mesh(new THREE.CylinderGeometry(.36,.43,.16,24),mats.stone);beaconBase.position.y=.08;beacon.add(beaconBase);
const crystalMat=new THREE.MeshStandardMaterial({color:'#f5d789',emissive:'#edc961',emissiveIntensity:.28,roughness:.35});
const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.19),crystalMat);crystal.position.y=.58;beacon.add(crystal);
const starGeometry=new THREE.BufferGeometry();
const starPositions=[];for(let i=0;i<90;i++){const a=i*2.39996323;starPositions.push(Math.cos(a)*(5+i%4),3+(i%7)*.6,-4-Math.sin(a)*4);}
starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
const stars=new THREE.Points(starGeometry,new THREE.PointsMaterial({color:'#d3d8ff',size:.045,transparent:true,opacity:.75}));scene.add(stars);
function applyWorld(key){
 const style=worlds[key]||worlds.garden;
 scene.background.set(style.sky);scene.fog.color.set(style.sky);groundMat.color.set(style.ground);oval.material.color.set(style.stone);
 for(const k of Object.keys(mats))mats[k].color.set(style[k]);
 sun.color.set(style.light);sun.intensity=key==='night'||key==='arcade'?1.9:3.1;
 rim.intensity=key==='arcade'?2:1;stars.visible=key==='night';
 crowns.forEach(c=>{c.scale.y=key==='paper'?.75:key==='clay'?1.15:1;c.material.flatShading=key==='paper';c.material.needsUpdate=true;});
}
addEventListener('gamenfy:lab-world',e=>applyWorld(e.detail));
function finishDemo(){
 if(demoCompleted)return;
 demoCompleted=true;missionPhase='done';setState('celebrate');crystalMat.emissiveIntensity=1.5;
 $('missionText').textContent='Gelukt. Steps viert de overwinning en de missieplek licht op.';
 $('demoMission').textContent='Testmissie voltooid ✓';
}
$('demoMission').onclick=()=>{
 if(!loaded||missionPhase!=='ready')return;
 missionPhase='walking';paused=false;updatePause();$('demoMission').disabled=true;
 $('demoMission').textContent='Steps is onderweg…';$('missionText').textContent='Eerst naar de missieplek, dan vieren.';
 setState('walk');moveTarget=beacon.position.clone();moveTarget.z+=.6;moveTarget.manual=true;
};
$('resetDemo').onclick=()=>{missionPhase='ready';demoCompleted=false;moveTarget=null;actor.position.set(0,0,0);setState('idle');crystalMat.emissiveIntensity=.28;$('demoMission').disabled=!loaded;$('demoMission').textContent='Voltooi testmissie ✦';$('missionText').textContent='Laat Steps naar de missieplek lopen en kijk hoe de wereld reageert.';};
function updateWorld(dt,t){crystal.rotation.y+=dt*.65;crystal.position.y=.58+Math.sin(t*1.5)*.035;}
applyWorld(document.body.dataset.world);
