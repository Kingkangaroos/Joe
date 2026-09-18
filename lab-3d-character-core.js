import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const MODE = document.body.dataset.mode || 'rig';
const MODEL_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_3J11PlWTdAXdyiVgxHYnMUsJS8U/hf_20260916_220039_950a8a2c-9c1d-4854-8949-682a553945de.glb';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);
const stage = $('stage');
const status = $('status');
const toast = msg => { const t=$('toast'); if(!t)return; t.textContent=msg; t.classList.add('show'); clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),1500); };

const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38,1,.1,120);
const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 2.2;
controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI*.48;

scene.add(new THREE.HemisphereLight('#f8f3ff','#41504b',1.55));
const sun = new THREE.DirectionalLight('#fff1da',2.4);
sun.position.set(5,10,6); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.5,far:30});
sun.shadow.bias=-.0004; scene.add(sun);
const fill=new THREE.DirectionalLight('#bfcaff',.9); fill.position.set(-6,4,5); scene.add(fill);

const mat=(color,rough=.9)=>new THREE.MeshStandardMaterial({color,roughness:rough});
const floor=new THREE.Mesh(new THREE.CircleGeometry(14,64),mat('#263a31'));
floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
const inner=new THREE.Mesh(new THREE.CircleGeometry(6.5,64),mat('#314e40'));
inner.rotation.x=-Math.PI/2; inner.position.y=.006; inner.receiveShadow=true; scene.add(inner);
const ring=new THREE.Mesh(new THREE.RingGeometry(4.2,4.35,64),mat('#7e8d7d'));
ring.rotation.x=-Math.PI/2; ring.position.y=.012; scene.add(ring);

const actorRoot=new THREE.Group(), actorBody=new THREE.Group();
actorRoot.add(actorBody); scene.add(actorRoot);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.44,32),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.24,depthWrite:false}));
shadow.rotation.x=-Math.PI/2; shadow.position.y=.025; actorRoot.add(shadow);

let model,mixer,clips=[],actions={},current='idle',boneCount=0,feet=[],modelHeight=1.5;
let perfActors=[],perfTargetCount=1,perfFrames=0,perfElapsed=0,perfFps=0,lastTriangleCount=0;
let footMarkers=[],footPrev=[],footFloor=Infinity,slipAccum=0,slipSamples=0,contactSamples=0;
const tmp=new THREE.Vector3();
function findClip(re){return clips.find(c=>re.test(c.name))}
function findBone(re){let hit=null; model?.traverse(o=>{if(!hit&&o.isBone&&re.test(o.name))hit=o}); return hit}
function setAction(name, speed=1){
  if(!mixer) return;
  const chosen = actions[name] || actions.walk || actions.idle || Object.values(actions).find(Boolean);
  if(!chosen) return;
  current=name;
  Object.values(actions).forEach(a=>{ if(!a)return; a.enabled=true; a.play(); const want=a===chosen?1:0; a.setEffectiveWeight(want); });
  chosen.timeScale = speed;
  $('stateValue') && ($('stateValue').textContent=name);
}
function blendAction(name,speed=1){
  if(!mixer)return;
  const chosen=actions[name]||actions.walk||actions.idle||Object.values(actions).find(Boolean);
  if(!chosen)return;
  current=name; chosen.timeScale=speed;
  Object.values(actions).forEach(a=>{if(!a)return;a.enabled=true;a.play();a.fadeOut(.18)});
  chosen.reset().fadeIn(.18).play();
  $('stateValue') && ($('stateValue').textContent=name);
}
function setInfo(){
  const names=clips.map(c=>c.name).filter(Boolean);
  if($('clipValue')) $('clipValue').textContent=(findClip(/run|sprint|jog/i)?.name||findClip(/walk/i)?.name||names[0]||'none');
  if($('boneValue')) $('boneValue').textContent=String(boneCount);
  if($('footValue')) $('footValue').textContent=feet.length?feet.map(f=>f.name).join(' / '):'not found';
  if($('debug')) $('debug').textContent='MODEL SOURCE\n'+MODEL_URL+'\n\nCLIPS\n'+clips.map(c=>c.name+' · '+c.duration.toFixed(2)+'s').join('\n')+'\n\nBONES '+boneCount+'\nFEET '+(feet.map(f=>f.name).join(', ')||'not matched');
}
function normalizeModel(gltf){
  model=gltf.scene;
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false} if(o.isBone)boneCount++});
  const box=new THREE.Box3().setFromObject(model,true);
  const h=Math.max(.1,box.max.y-box.min.y); modelHeight=1.55; const s=modelHeight/h;
  model.scale.setScalar(s);
  model.position.y=-box.min.y*s;
  actorBody.add(model);
  mixer=new THREE.AnimationMixer(model); clips=gltf.animations||[];
  const run=findClip(/run|sprint|jog/i), walk=findClip(/walk/i), idle=findClip(/idle|stand/i);
  const make=c=>c?mixer.clipAction(c):null;
  actions={idle:make(idle||clips[0]),walk:make(walk||run||clips[0]),run:make(run||walk||clips[0])};
  Object.values(actions).forEach(a=>{if(a){a.enabled=true;a.setEffectiveWeight(0);a.play()}});
  feet=[findBone(/left.?foot|foot.?l\b/i),findBone(/right.?foot|foot.?r\b/i)].filter(Boolean);
  setInfo();
}

const nodes=[];
function addNode(name,x,z,color='#c8b8ff'){
  const g=new THREE.Group();
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(.5,.62,.16,32),mat('#e8dfcf')); pad.position.y=.08; pad.castShadow=true; pad.receiveShadow=true;
  const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.23,1),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.18,roughness:.35})); orb.position.y=.56;
  g.add(pad,orb); g.position.set(x,0,z); scene.add(g);
  nodes.push({name,group:g,orb,pos:new THREE.Vector3(x,0,z),done:false});
  return nodes[nodes.length-1];
}
function clearNodes(){while(nodes.length){const n=nodes.pop();scene.remove(n.group)}}

let target=new THREE.Vector3(),moving=false,moveSpeed=1.2,sideDir=1,wanderWait=0,selectedNode=null,celebrate=0;
function walkTo(v,speed=1.2){target.copy(v);moving=true;moveSpeed=speed;blendAction(speed>1.8?'run':'walk',speed>1.8?1.25:1)}
function stopMove(){moving=false;blendAction('idle',.65)}
function rootLocomotion(dt){
  if(!moving)return;
  tmp.subVectors(target,actorRoot.position);tmp.y=0;
  const d=tmp.length(); if(d<.06){actorRoot.position.x=target.x;actorRoot.position.z=target.z;stopMove();return}
  tmp.normalize(); actorRoot.position.addScaledVector(tmp,Math.min(d,moveSpeed*dt));
  const yaw=Math.atan2(tmp.x,tmp.z); let diff=yaw-actorRoot.rotation.y; diff=Math.atan2(Math.sin(diff),Math.cos(diff));
  actorRoot.rotation.y+=diff*Math.min(1,dt*9);
}
function addParkDecor(){
  for(let i=0;i<16;i++){
    const a=(i/16)*Math.PI*2+(i%2)*.12,r=7.5+(i%3)*1.4;
    const tr=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,.7,8),mat('#8b6e53'));tr.position.set(Math.cos(a)*r,.35,Math.sin(a)*r);tr.castShadow=true;scene.add(tr);
    const cr=new THREE.Mesh(new THREE.IcosahedronGeometry(.42+(i%4)*.07,0),mat(i%2?'#6d9d73':'#7eaa75'));cr.position.set(Math.cos(a)*r,.9,Math.sin(a)*r);cr.castShadow=true;scene.add(cr);
  }
}
function setCamera(pos,targetPos,orbit=true){
  camera.position.copy(pos);controls.target.copy(targetPos);controls.enabled=orbit;controls.update();
}
function setupFootQa(){
  footMarkers.forEach(m=>scene.remove(m)); footMarkers=[]; footPrev=[]; footFloor=Infinity; slipAccum=0; slipSamples=0; contactSamples=0;
  feet.forEach((f,i)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.045,16,12),new THREE.MeshBasicMaterial({color:i?'#8fd7ff':'#9cf0b8'}));m.position.y=.04;scene.add(m);footMarkers.push(m);footPrev.push(new THREE.Vector3())});
}
function updateFootQa(dt){
  if(!feet.length||!footMarkers.length||!dt)return;
  feet.forEach((f,i)=>{f.getWorldPosition(tmp);footFloor=Math.min(footFloor,tmp.y);footMarkers[i].position.set(tmp.x,Math.max(.035,tmp.y),tmp.z);const prev=footPrev[i];if(prev.lengthSq()>0){const dx=Math.hypot(tmp.x-prev.x,tmp.z-prev.z),v=dx/dt;const contact=tmp.y<=footFloor+.065;if(contact){contactSamples++;slipAccum+=v;slipSamples++;footMarkers[i].material.color.set(v<.22?'#8ef0b0':v<.5?'#f2d388':'#ff8f9a')}}prev.copy(tmp)});
  if($('slipValue')){const avg=slipSamples?slipAccum/slipSamples:0;$('slipValue').textContent=avg.toFixed(2)+' m/s';$('slipValue').dataset.band=avg<.22?'good':avg<.5?'warn':'bad'}
  if($('contactValue'))$('contactValue').textContent=String(contactSamples);
}
function applyToonLook(){
  scene.background=new THREE.Color('#f2efe8');floor.material.color.set('#d9e3cf');inner.material.color.set('#e9e4db');ring.visible=false;renderer.toneMappingExposure=.95;camera.fov=24;camera.updateProjectionMatrix();
  model?.traverse(o=>{if(o.isMesh){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(!m)return;m.roughness=1;m.metalness=0;m.flatShading=true;m.needsUpdate=true})}});
}
function clearPerfActors(){for(const p of perfActors){p.group.removeFromParent()}perfActors=[]}
function buildPerfActors(n){
  perfTargetCount=n;clearPerfActors();
  const radius=n<=3?2.2:3.8;
  for(let i=1;i<n;i++){
    const clone=SkeletonUtils.clone(model),g=new THREE.Group();g.add(clone);scene.add(g);const a=(i/(n))*Math.PI*2;g.position.set(Math.cos(a)*radius,0,Math.sin(a)*radius);g.rotation.y=-a+Math.PI/2;
    const mx=new THREE.AnimationMixer(clone);const cl=findClip(/run|sprint|jog/i)||findClip(/walk/i)||clips[0];const ac=cl?mx.clipAction(cl):null;if(ac){ac.play();ac.timeScale=.8+(i%4)*.12}perfActors.push({group:g,mixer:mx});
  }
  if($('actorCount'))$('actorCount').textContent=String(n);
}
function updatePerf(dt){
  perfActors.forEach(p=>p.mixer.update(dt));perfFrames++;perfElapsed+=dt;if(perfElapsed>=.75){perfFps=perfFrames/perfElapsed;perfFrames=0;perfElapsed=0;lastTriangleCount=renderer.info.render.triangles||0;if($('fpsValue'))$('fpsValue').textContent=perfFps.toFixed(0)+' fps';if($('triValue'))$('triValue').textContent=lastTriangleCount.toLocaleString();if($('qualityValue'))$('qualityValue').textContent=perfFps>=52?'strong':perfFps>=42?'borderline':'too heavy';}
}
function reactiveHome(section){
  const map={missions:new THREE.Vector3(1.65,0,.35),agenda:new THREE.Vector3(.15,0,-.15),skills:new THREE.Vector3(-1.55,0,.3),money:new THREE.Vector3(.75,0,-.8)};const v=map[section]||map.missions;walkTo(v,1.15);if($('homeFocus'))$('homeFocus').textContent=section;document.querySelectorAll('[data-home-anchor]').forEach(b=>b.classList.toggle('on',b.dataset.homeAnchor===section));toast('Focus: '+section);
}
function modeSetup(){
  if(MODE==='rig'){
    floor.material.color.set('#222a35');inner.material.color.set('#2d3748');ring.visible=false;
    actorRoot.position.set(0,0,0);setCamera(new THREE.Vector3(2.6,1.8,4.2),new THREE.Vector3(0,.8,0),true);blendAction('walk',1);
  }
  if(MODE==='home'){
    floor.material.color.set('#17253b');inner.material.color.set('#1f3350');ring.visible=false;
    actorRoot.position.set(1.15,0,0); actorRoot.rotation.y=-.25; setCamera(new THREE.Vector3(2.8,1.4,4.4),new THREE.Vector3(.8,.72,0),false);blendAction('idle',.55);
  }
  if(MODE==='runner'){
    floor.scale.set(1.8,1,1); inner.visible=false; ring.visible=false;
    actorRoot.position.set(-3.8,0,0);target.set(3.8,0,0);moving=true;moveSpeed=2;sideDir=1;
    setCamera(new THREE.Vector3(0,1.25,7.4),new THREE.Vector3(0,.75,0),false);blendAction('run',1.2);
    for(let i=-5;i<=5;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.03,.02,.34),mat('#7f9f8d'));m.position.set(i, .025, .7);scene.add(m)}
  }
  if(MODE==='park'){
    addParkDecor(); clearNodes(); addNode('Focus',-3.4,-1.8,'#9ed5ff');addNode('Steps',2.8,-2.4,'#8ce0b5');addNode('Reset',3.2,2.1,'#f0bd8e');addNode('Explore',-2.7,2.6,'#c8b8ff');
    actorRoot.position.set(0,0,0);setCamera(new THREE.Vector3(7.8,5.6,8.8),new THREE.Vector3(0,.3,0),true);wanderWait=.5;blendAction('idle',.6);
  }
  if(MODE==='interact'){
    floor.material.color.set('#223a31');inner.material.color.set('#29493b');ring.visible=false;clearNodes();
    addNode('10K Steps',-2.7,0,'#85e4bf'); addNode('Meditation',0,0,'#bdafff'); addNode('Household',2.7,0,'#f0c88e');
    actorRoot.position.set(0,0,2.3);actorRoot.rotation.y=Math.PI; setCamera(new THREE.Vector3(0,3.4,7.4),new THREE.Vector3(0,.4,0),false);blendAction('idle',.6);
    buildMissionStrip();
  }
  if(MODE==='grounded'){
    floor.scale.set(1.8,1,1);inner.visible=false;ring.visible=false;actorRoot.position.set(-3.6,0,0);target.set(3.6,0,0);moving=true;moveSpeed=1.15;sideDir=1;setCamera(new THREE.Vector3(0,1.15,7.2),new THREE.Vector3(0,.7,0),false);blendAction('walk',1);setupFootQa();
  }
  if(MODE==='toon'){
    applyToonLook();actorRoot.position.set(.8,0,0);actorRoot.rotation.y=-.2;setCamera(new THREE.Vector3(2.9,1.35,7.6),new THREE.Vector3(.75,.72,0),false);blendAction('idle',.58);
  }
  if(MODE==='reactive'){
    floor.material.color.set('#19283a');inner.material.color.set('#20364b');ring.visible=false;actorRoot.position.set(.15,0,.1);setCamera(new THREE.Vector3(2.6,1.55,5.6),new THREE.Vector3(.2,.68,0),false);blendAction('idle',.6);reactiveHome('agenda');
  }
  if(MODE==='perf'){
    floor.material.color.set('#20283a');inner.material.color.set('#27344d');ring.visible=false;actorRoot.position.set(0,0,0);setCamera(new THREE.Vector3(8.5,5.4,9.5),new THREE.Vector3(0,.45,0),true);blendAction('walk',1);buildPerfActors(6);
  }
  if(MODE==='synthesis'){
    applyToonLook();scene.background=new THREE.Color('#101529');floor.material.color.set('#1e3145');inner.material.color.set('#273e55');ring.visible=false;actorRoot.position.set(.15,0,.05);setCamera(new THREE.Vector3(2.9,1.45,7.2),new THREE.Vector3(.2,.72,0),false);blendAction('idle',.58);reactiveHome('agenda');
  }
}
function buildMissionStrip(){
  const strip=$('missionStrip'); if(!strip)return; strip.innerHTML='';
  nodes.forEach((n,i)=>{const b=document.createElement('button');b.className='mission';b.innerHTML='<strong>'+n.name+'</strong><small>nog te doen</small>';b.onclick=()=>selectMission(i,b);strip.appendChild(b)});
}
function selectMission(i,btn){
  selectedNode=nodes[i];document.querySelectorAll('.mission').forEach(x=>x.classList.toggle('on',x===btn));
  $('selectedMission') && ($('selectedMission').textContent=selectedNode.name);
  target.copy(selectedNode.pos);target.z+=.8;walkTo(target,1.35);toast('Op weg naar '+selectedNode.name);
}
function completeSelected(){
  if(!selectedNode){toast('Kies eerst een missie');return}
  const d=actorRoot.position.distanceTo(target);
  if(d>.3){walkTo(target,1.45);toast('Eerst erheen lopen');setTimeout(()=>completeSelected(),900);return}
  selectedNode.done=true;selectedNode.orb.material.emissiveIntensity=1.1;selectedNode.orb.scale.setScalar(1.35);celebrate=1.15;
  const ix=nodes.indexOf(selectedNode),b=document.querySelectorAll('.mission')[ix]; if(b){b.querySelector('small').textContent='gedaan ✓';b.classList.add('on')}
  $('levelCounter') && ($('levelCounter').textContent=String(Math.min(10,Number($('levelCounter').textContent||0)+1)));
  toast('Missie voltooid · echte 3D reactie');
}
function bindUI(){
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action;document.querySelectorAll('[data-action]').forEach(x=>x.classList.toggle('on',x===b));
    if(a==='idle')blendAction('idle',.65); if(a==='walk')blendAction('walk',1); if(a==='run')blendAction('run',1.25);
  });
  $('debugToggle') && ($('debugToggle').onclick=()=>{$('debug').style.display=$('debug').style.display==='block'?'none':'block'});
  if($('energy')){
    $('energy').oninput=()=>{const n=+$('energy').value; $('energyValue').textContent=n+'/10'; if(n<=2)blendAction('idle',.45); else if(n<=7)blendAction('walk',.85+(n-3)*.06); else blendAction('run',1+(n-8)*.12);};
  }
  $('completeMission') && ($('completeMission').onclick=completeSelected);
  $('followToggle') && ($('followToggle').onclick=()=>{controls.enabled=!controls.enabled;$('followToggle').textContent=controls.enabled?'Vrije camera':'Volg camera'});
  if($('rootSpeed')){$('rootSpeed').oninput=()=>{moveSpeed=+$('rootSpeed').value;$('rootSpeedValue').textContent=moveSpeed.toFixed(2)+' m/s'}}
  document.querySelectorAll('[data-home-anchor]').forEach(b=>b.onclick=()=>reactiveHome(b.dataset.homeAnchor));
  document.querySelectorAll('[data-perf-count]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-perf-count]').forEach(x=>x.classList.toggle('on',x===b));buildPerfActors(+b.dataset.perfCount)});
  $('synthesisComplete') && ($('synthesisComplete').onclick=()=>{celebrate=1.15;const n=Number($('synthesisLevel')?.textContent||6);if($('synthesisLevel'))$('synthesisLevel').textContent=String(Math.min(10,n+1));toast('Missie voltooid · world reacts');});
}

function updateMode(dt,t){
  if(MODE==='runner'){
    rootLocomotion(dt);
    if(!moving){sideDir*=-1; target.set(sideDir>0?3.8:-3.8,0,0);moving=true;moveSpeed=2;blendAction('run',1.2)}
    camera.position.x=THREE.MathUtils.lerp(camera.position.x,actorRoot.position.x*.18,.04);controls.target.x=THREE.MathUtils.lerp(controls.target.x,actorRoot.position.x*.12,.05);
  }
  if(MODE==='park'){
    rootLocomotion(dt);
    if(!moving){wanderWait-=dt;if(wanderWait<=0){const a=Math.random()*Math.PI*2,r=.8+Math.random()*3.6;walkTo(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r),.85+Math.random()*.75);wanderWait=.6+Math.random()*1.5}}
    if($('distanceValue')) $('distanceValue').textContent=(Math.hypot(actorRoot.position.x,actorRoot.position.z)).toFixed(1)+' m';
  }
  if(MODE==='interact')rootLocomotion(dt);
  if(MODE==='grounded'){
    rootLocomotion(dt);if(!moving){sideDir*=-1;target.set(sideDir>0?3.6:-3.6,0,0);moving=true;blendAction('walk',1)}updateFootQa(dt);
  }
  if(MODE==='reactive'||MODE==='synthesis')rootLocomotion(dt);
  if(MODE==='perf')updatePerf(dt);
  if(celebrate>0){
    celebrate-=dt; actorBody.position.y=Math.sin((1.15-celebrate)*Math.PI*3)*.15*Math.max(0,celebrate/.45);actorBody.rotation.z=Math.sin((1.15-celebrate)*Math.PI*4)*.06;
    if(celebrate<=0){actorBody.position.y=0;actorBody.rotation.z=0;selectedNode?.orb.scale.setScalar(1)}
  }
  if(MODE==='home'||MODE==='toon'){
    actorBody.rotation.y=Math.sin(t*.45)*.08;
  }
}
const clock=new THREE.Clock();
function frame(){
  const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
  if(mixer)mixer.update(dt);
  updateMode(reduce?0:dt,t);
  nodes.forEach((n,i)=>{n.orb.rotation.y+=dt*(.7+i*.1);n.orb.position.y=.56+Math.sin(t*1.5+i)*.035});
  controls.update();renderer.render(scene,camera);requestAnimationFrame(frame);
}
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();

new GLTFLoader().load(MODEL_URL,gltf=>{
  normalizeModel(gltf);modeSetup();bindUI();status?.remove();frame();
},undefined,e=>{
  console.error(e); if(status)status.innerHTML='3D-model kon niet laden.<small>De test blijft apart; je echte app is niet geraakt.</small>';
});
