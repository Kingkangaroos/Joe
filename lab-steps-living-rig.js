import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';

const $=id=>document.getElementById(id);
const stage=$('stage'),loading=$('loading'),stateLabel=$('state'),meshStatus=$('meshStatus'),boneStatus=$('boneStatus'),fpsLabel=$('fps');
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
stage.append(renderer.domElement);
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
 state=name;stateLabel.textContent=name.toUpperCase();duration=0;phase=0;
 document.querySelectorAll('[data-motion]').forEach(btn=>btn.classList.toggle('on',btn.dataset.motion===name));
 if(name==='walk'||name==='run'){
   const direction=new THREE.Vector3(Math.cos(actor.rotation.y),0,Math.sin(actor.rotation.y));
   moveTarget=null;
 }
}
document.querySelectorAll('[data-motion]').forEach(btn=>btn.addEventListener('click',()=>setState(btn.dataset.motion)));

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
 if(d<.1){if(moveTarget.manual){moveTarget=null;setState('idle');return;}moveTarget.set(-moveTarget.x,0,moveTarget.z);return;}
 direction.normalize();
 actor.position.addScaledVector(direction,Math.min(d,speed*dt));
 const yaw=Math.atan2(direction.x,direction.z);let delta=yaw-actor.rotation.y;delta=Math.atan2(Math.sin(delta),Math.cos(delta));actor.rotation.y+=delta*Math.min(1,dt*9);
}
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),down={};
renderer.domElement.addEventListener('pointerdown',e=>{down.x=e.clientX;down.y=e.clientY;});
renderer.domElement.addEventListener('pointerup',e=>{
 if(!loaded)return;
 if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>12)return;
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1));
 ray.setFromCamera(pointer,camera);
 const hit=ray.intersectObject(floor)[0];if(!hit)return;
 moveTarget=hit.point.clone();moveTarget.y=0;moveTarget.manual=true;
 if(actor.position.distanceTo(moveTarget)<.2)return;
 setState('walk');moveTarget=hit.point.clone();moveTarget.y=0;moveTarget.manual=true;
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
  loader.parse(bytes.buffer,'',gltf=>{
    fox=gltf.scene;
    fox.traverse(o=>{
      if(o.name.startsWith('ENV_')||o.isLight||o.isCamera)o.visible=false;
      if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}
      if(/^(Root|Hips|Spine|Neck|Head|Jaw|Tail|UpperArm\.[LR]|Forearm\.[LR]|Hand\.[LR]|Thigh\.[LR]|Shin\.[LR]|Foot\.[LR])$/.test(o.name)){
        targets[o.name]=o;rest[o.name]=o.rotation.clone();initialPosition[o.name]=o.position.clone();
      }
    });
    actor.add(fox);
    const box=new THREE.Box3().setFromObject(fox);
    const h=box.getSize(new THREE.Vector3()).y;
    fox.scale.setScalar(2.2/Math.max(.01,h));
    fox.position.y-=box.min.y*fox.scale.y;
    boneStatus.textContent='Bones '+Object.keys(targets).length;
    meshStatus.textContent='Echte 3D · '+Math.round(bytes.length/1024)+' KB';
    loaded=true;loading.classList.add('hidden');setState('idle');
  },e=>{throw e;});
 }catch(e){console.error('[Steps rig]',e);loading.innerHTML='Model kon niet laden <small>'+e.message+'</small>';meshStatus.textContent='GLB-fout';}
}
let w=0,h=0,last=performance.now(),frames=0,fpsTime=0;
function resize(){const r=stage.getBoundingClientRect();if(r.width===w&&r.height===h)return;w=r.width;h=r.height;renderer.setSize(w,h,false);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(stage);resize();
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min((now-last)/1000,.055);last=now;const t=now*.001;
 updateWalking(reduced?0:dt);updatePose(reduced?0:dt,t);shadow.position.x=actor.position.x;shadow.position.z=actor.position.z;
 controls.update();renderer.render(scene,camera);
 fpsTime+=dt;frames++;if(fpsTime>.85){fpsLabel.textContent='FPS '+Math.round(frames/fpsTime);fpsTime=0;frames=0}
}
requestAnimationFrame(frame);
loadFox();
