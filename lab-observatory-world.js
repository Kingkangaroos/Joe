import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createFootSolver} from './world-foot-ik.js?v=2';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
const $=id=>document.getElementById(id),motion=window.WorldMotion;
const crew=[['Steps','#56bdb1'],['Sleep','#afa0dc'],['Nutrition','#d1a278'],['Workout','#b3c987'],['Brush Teeth','#a9cddd'],['Household','#dfb1a1'],['Meditation','#8cb9ae'],['Gratitude','#c8b68b'],['Good Deed','#c89db1'],['Screen Time','#91a2ca'],['Budgeting','#d1bc7b'],['Vrije plek','#acafbe']];
let selected=0,view='solo',paused=matchMedia('(prefers-reduced-motion: reduce)').matches,ready=false,renderer=null,worldScene=null,orbit=null,camera=null,actors=[],elapsed=0,last=performance.now(),contextLost=false,stopped=false,mission=false,feedbackTimer;
const actions={idle:'Idle',walk:'Walk',run:'Run',yawn:'Yawn',celebrate:'Celebrate'};
function pauseUI(){text('worldPause',paused?'Hervat':'Pauze');$('worldPause').setAttribute('aria-pressed',String(paused));}
function text(id,value){$(id).textContent=value;}
function setView(value){view=value;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===value)));if(ready){actors.forEach((a,i)=>a.root.visible=value==='crew'||i===selected);frameCamera();}text('actorCount',value==='crew'?'12 voorbeeldplaatsen':'1 companion');}
function actorLabel(){text('selectedActor',crew[selected][0]+(view==='crew'?' · gedeelde ruimte':' · nieuwe lichaamsproef'));document.querySelectorAll('[data-crew]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.crew)===selected)));}
for(let i=0;i<crew.length;i++){const b=document.createElement('button');b.dataset.crew=i;b.setAttribute('aria-pressed',String(i===0));const dot=document.createElement('i');dot.style.background=crew[i][1];const label=document.createElement('span');label.textContent=crew[i][0];b.append(dot,label);b.onclick=()=>{if(mission)return;selected=i;actorLabel();if(ready){setView(view);frameCamera();}};$('crewRoster').append(b);}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
document.querySelectorAll('[data-vibe]').forEach(b=>b.onclick=()=>{window.GamenfyTheme.setPreview(b.dataset.vibe);document.querySelectorAll('[data-vibe]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
pauseUI();$('worldPause').onclick=()=>{paused=!paused;pauseUI();};
$('worldResetCamera').onclick=()=>{if(ready)frameCamera();};
$('worldFeedback').value='';try{$('worldFeedback').value=localStorage.getItem('gamenfy_lab_observatory_feedback_v2')||'';}catch{}
$('worldFeedback').oninput=()=>{clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>{try{localStorage.setItem('gamenfy_lab_observatory_feedback_v2',$('worldFeedback').value);text('feedbackSaved','Bewaard op dit apparaat.');}catch{text('feedbackSaved','Bewaren lukt hier niet. Bewaar je feedback zelf.');}},300);};
function fallback(message){text('worldLoading',message);$('worldLoading').hidden=true;$('worldFallback').hidden=false;text('renderStatus',message);document.querySelectorAll('[data-motion],#worldPause,#worldResetCamera,#worldMission,#worldReset,#showContacts').forEach(b=>b.disabled=true);}
function frameCamera(){
 const p=actors[selected].root.position;if(view==='crew'){camera.position.set(11.5,12.5,14.5);orbit.target.set(0,.5,0);orbit.minDistance=10;orbit.maxDistance=30;}
 else {camera.position.set(p.x+3.5,2.7,p.z+5.8);orbit.target.set(p.x,1.0,p.z);orbit.minDistance=3.1;orbit.maxDistance=11;}
 camera.updateProjectionMatrix();orbit.update();
}
let floor,sun,hemi,beacon,beaconLight,stars,groundMat,pathMat,buildingMat,roofMat,trimMat,markerGroup;
function updateTheme(){
 if(!worldScene)return;const theme=window.GamenfyTheme.current(),day=theme==='paper',arcade=theme==='arcade';
 const palette=day?{sky:'#e9dfc8',ground:'#c7b995',path:'#eee3ca',wall:'#e0d2b8',roof:'#a7937b',trim:'#7d936f',light:'#fff3d5'}:arcade?{sky:'#101b28',ground:'#203d42',path:'#35565b',wall:'#233b49',roof:'#3b6872',trim:'#79dec0',light:'#b3ffe8'}:{sky:'#151d35',ground:'#3c425f',path:'#646480',wall:'#60627f',roof:'#3d4267',trim:'#c3b7e0',light:'#dbd6ff'};
 worldScene.background.set(palette.sky);worldScene.fog.color.set(palette.sky);groundMat.color.set(palette.ground);pathMat.color.set(palette.path);buildingMat.color.set(palette.wall);roofMat.color.set(palette.roof);trimMat.color.set(palette.trim);sun.color.set(palette.light);sun.intensity=day?2.6:1.8;hemi.intensity=day?2.5:1.9;stars.visible=!day;renderer.toneMappingExposure=day?1.05:1.2;
}
addEventListener('gamenfy:themechange',updateTheme);
function makeMat(color,roughness=.9){return new THREE.MeshStandardMaterial({color,roughness});}
function mesh(geo,mat,x,y,z,parent=worldScene){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.receiveShadow=true;parent.add(o);return o;}
function buildWorld(){
 groundMat=makeMat('#3c425f');pathMat=makeMat('#646480');buildingMat=makeMat('#60627f');roofMat=makeMat('#3d4267');trimMat=makeMat('#c3b7e0');
 floor=mesh(new THREE.CircleGeometry(7.5,64),groundMat,0,0,0);floor.rotation.x=-Math.PI/2;
 const island=mesh(new THREE.CylinderGeometry(7.5,6.7,.5,64),groundMat,0,-.26,0);island.castShadow=false;
 const ring=mesh(new THREE.RingGeometry(4.6,5.6,64),pathMat,0,.012,0);ring.rotation.x=-Math.PI/2;
 const center=mesh(new THREE.CircleGeometry(2.4,48),pathMat,0,.014,0);center.rotation.x=-Math.PI/2;
 for(let i=0;i<12;i++){
  const a=i/12*Math.PI*2,x=Math.sin(a)*6.6,z=Math.cos(a)*6.6;
  const base=mesh(new THREE.CylinderGeometry(.62,.68,.7,16),buildingMat,x,.35,z);
  const dome=mesh(new THREE.SphereGeometry(.68,16,12,0,Math.PI*2,0,Math.PI/2),roofMat,x,.7,z);
  const windowMat=new THREE.MeshStandardMaterial({color:crew[i][1],emissive:crew[i][1],emissiveIntensity:.35,roughness:.5});
  const window=mesh(new THREE.SphereGeometry(.18,12,10),windowMat,x*.93,.47,z*.93);window.scale.y=1.3;
  const path=mesh(new THREE.CylinderGeometry(.4,.4,.035,20),pathMat,Math.sin(a)*5.7,.02,Math.cos(a)*5.7);
 }
 // A small observatory at the far edge; it stays outside the walkable path.
 mesh(new THREE.CylinderGeometry(1.15,1.3,1.7,24),buildingMat,0,.85,-6.2);
 mesh(new THREE.SphereGeometry(1.26,24,16,0,Math.PI*2,0,Math.PI/2),roofMat,0,1.7,-6.2);
 const telescope=mesh(new THREE.CylinderGeometry(.13,.18,1.2,16),trimMat,.5,2.2,-5.8);telescope.rotation.x=Math.PI/3;
 for(let i=0;i<20;i++){
  const a=i*2.399963,r=6.5+(i%2)*.3,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(z<-4&&Math.abs(x)<2)continue;
  const trunk=mesh(new THREE.CylinderGeometry(.055,.085,.5,7),buildingMat,x,.25,z);
  const leaf=mesh(new THREE.SphereGeometry(.29+(i%3)*.07,12,8),trimMat,x,.7,z);leaf.scale.y=1.25;
 }
 mesh(new THREE.CylinderGeometry(.43,.52,.2,28),trimMat,0,.1,0);
 beaconLight=new THREE.MeshStandardMaterial({color:'#e7d2a2',emissive:'#c9b1ff',emissiveIntensity:.35,roughness:.25});beacon=mesh(new THREE.OctahedronGeometry(.2),beaconLight,0,.75,0);
 const coords=[];for(let i=0;i<120;i++){const a=i*2.399963;coords.push(Math.cos(a)*(12+i%6),4+(i%11)*.55,-7+Math.sin(a)*13);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));stars=new THREE.Points(geo,new THREE.PointsMaterial({color:'#dfdafa',size:.035,transparent:true,opacity:.7}));worldScene.add(stars);
 markerGroup=new THREE.Group();worldScene.add(markerGroup);markerGroup.visible=false;for(let i=0;i<2;i++){const m=mesh(new THREE.CircleGeometry(.1,18),new THREE.MeshBasicMaterial({color:i?'#e8bf9c':'#9fe6ca',transparent:true,opacity:.75}),0,.022,0,markerGroup);m.rotation.x=-Math.PI/2;}
 updateTheme();
}
function play(a,name,once=false){
 const action=a.actions[name];if(!action)return;if(a.current===name&&!once)return;
 a.current=name;a.actions[name].reset().setEffectiveTimeScale(1).setEffectiveWeight(1);if(once){action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;}else{action.setLoop(THREE.LoopRepeat,Infinity);action.clampWhenFinished=false;}
 const previous=a.active;if(previous&&previous!==action)previous.fadeOut(.18);action.fadeIn(.18).play();a.active=action;
}
function moveTo(a,x,z,mode='walk'){const r=Math.hypot(x,z);if(r>6.1){x*=6.1/r;z*=6.1/r;}a.sim.target={x,z};a.sim.motion=mode;a.moving=true;play(a,mode==='run'?'Run':'Walk');}
function setMotion(mode){if(!ready||mission)return;const a=actors[selected];paused=false;pauseUI();a.patrol=false;a.moving=false;
 if(mode==='walk'||mode==='run'){a.patrol=true;a.patrolSign=a.root.position.x>0?-1:1;moveTo(a,a.home.x+a.patrolSign*1.1,a.home.z,mode);}
 else play(a,actions[mode],mode==='yawn'||mode==='celebrate');
 document.querySelectorAll('[data-motion]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.motion===mode)));text('motionStatus',({idle:'Rust',walk:'Wandelen · eigen paslengte',run:'Rennen · eigen vluchtfase',yawn:'Gaap',celebrate:'Kleine viering'})[mode]);
}
document.querySelectorAll('[data-motion]').forEach(b=>b.onclick=()=>setMotion(b.dataset.motion));
$('showContacts').onchange=()=>{if(markerGroup)markerGroup.visible=$('showContacts').checked;};
function reset(){mission=false;beaconLight.emissiveIntensity=.35;text('demoText','Laat je geselecteerde companion naar het centrale baken lopen en daar de testmissie afronden.');$('worldMission').disabled=false;text('worldMission','Voltooi testmissie ✦');actors.forEach(a=>{a.sim.x=a.home.x;a.sim.z=a.home.z;a.root.position.set(a.home.x,0,a.home.z);a.moving=false;a.patrol=false;play(a,'Idle');});}
$('worldReset').onclick=()=>{if(ready)reset();};
$('worldMission').onclick=()=>{if(!ready||mission)return;mission=true;paused=false;pauseUI();const a=actors[selected];a.patrol=false;moveTo(a,0,.95,'walk');$('worldMission').disabled=true;text('worldMission','Onderweg…');text('demoText',crew[selected][0]+' loopt eerst naar het baken.');};
async function boot(){
 try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(e){fallback('WebGL niet beschikbaar · modelvoorbeeld hieronder');return;}
 const stage=$('worldStage');renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;stage.append(renderer.domElement);
 worldScene=new THREE.Scene();worldScene.background=new THREE.Color('#151d35');worldScene.fog=new THREE.Fog('#151d35',16,40);
 camera=new THREE.PerspectiveCamera(38,1,.1,60);orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.enablePan=false;orbit.maxPolarAngle=Math.PI*.47;orbit.minPolarAngle=.18;
 hemi=new THREE.HemisphereLight('#f4efff','#5a6474',1.9);worldScene.add(hemi);sun=new THREE.DirectionalLight('#dbd6ff',1.8);sun.position.set(4,9,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.1,far:25});sun.shadow.bias=-.0004;worldScene.add(sun);buildWorld();
 try{
  const response=await fetch('assets/models/observatory-fox-v2.b64');if(!response.ok)throw Error('model '+response.status);const encoded=await response.text();const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));const gltf=await new Promise((resolve,reject)=>new GLTFLoader().parse(bytes.buffer,'',resolve,reject));
  for(const [i,item]of crew.entries()){
   const root=new THREE.Group(),model=cloneSkeleton(gltf.scene);root.add(model);worldScene.add(root);const a=i/12*Math.PI*2,home={x:i?Math.sin(a)*4.0:0,z:i?Math.cos(a)*4.0:2.5};root.position.set(home.x,0,home.z);root.rotation.y=i?Math.atan2(-home.x,-home.z):0;
   const recolors=new Map();model.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=i===0;const originals=Array.isArray(o.material)?o.material:[o.material];const mapped=originals.map(m=>{if(!recolors.has(m)){const c=m.clone();if(/Fur_Teal/.test(c.name))c.color.set(item[1]);recolors.set(m,c);}return recolors.get(m);});o.material=Array.isArray(o.material)?mapped:mapped[0];}});
   const mixer=new THREE.AnimationMixer(model),dictionary={};for(const clip of gltf.animations)dictionary[clip.name]=mixer.clipAction(clip);for(const key of ['Idle','Walk','Run','Yawn','Celebrate'])if(!dictionary[key])throw Error('Clip ontbreekt: '+key);
   const solver=createFootSolver(model,root);const actor={solver,root,model,mixer,actions:dictionary,active:null,current:null,home,sim:{x:home.x,z:home.z,target:{...home},heading:root.rotation.y,motion:'idle'},moving:false,patrol:false};mixer.addEventListener('finished',()=>{if(actor.current==='Yawn'||actor.current==='Celebrate')play(actor,'Idle');});actors.push(actor);play(actor,'Idle');actor.active.time=i*.13;
  }
  motion.clips.walk.duration=actors[0].actions.Walk.getClip().duration;motion.clips.run.duration=actors[0].actions.Run.getClip().duration;
  ready=true;text('renderStatus','Nieuwe skinned GLB · 18 botten · 5 eigen clips');$('worldLoading').hidden=true;setView('solo');actorLabel();
 }catch(e){console.error('[Observatory World]',e);renderer.dispose();fallback('3D-model kon niet laden · herlaad deze proef');return;}
 let width=0,height=0;function resize(){const r=stage.getBoundingClientRect();if(r.width===width&&r.height===height)return;width=r.width;height=r.height;renderer.setSize(width,height,false);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();}const observer=new ResizeObserver(resize);observer.observe(stage);resize();
 const ray=new THREE.Raycaster(),point=new THREE.Vector2();let down=null;
 renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});renderer.domElement.addEventListener('pointerup',e=>{if(!ready||mission||!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>9)return;const r=renderer.domElement.getBoundingClientRect();point.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(point,camera);const hit=ray.intersectObject(floor)[0];if(!hit)return;paused=false;pauseUI();actors[selected].patrol=false;moveTo(actors[selected],hit.point.x,hit.point.z);text('motionStatus','Op weg naar je gekozen plek');});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;paused=true;pauseUI();text('renderStatus','3D-context onderbroken. Herlaad de proef.');});
 let frame=0,frames=0,perfTime=0;
 function tick(now){if(stopped)return;frame=requestAnimationFrame(tick);const wallDt=Math.max(0,(now-last)/1000),dt=Math.min(.05,wallDt);last=now;if(contextLost||document.hidden)return;
  if(!paused){elapsed+=dt;beacon.rotation.y+=dt*.4;beacon.position.y=.75+Math.sin(elapsed*1.4)*.035;
   actors.forEach((a,i)=>{if(!a.root.visible)return;let animationDt=dt;
    if(a.moving){const step=motion.advance(a.sim,dt);a.root.position.set(a.sim.x,0,a.sim.z);let delta=a.sim.heading-a.root.rotation.y;delta=Math.atan2(Math.sin(delta),Math.cos(delta));a.root.rotation.y+=delta*Math.min(1,dt*10);animationDt=step.clipDelta;
     if(step.arrived){a.moving=false;if(mission&&i===selected){mission=false;play(a,'Celebrate',true);beaconLight.emissiveIntensity=1.6;text('worldMission','Testmissie voltooid ✓');text('demoText','Aangekomen. '+crew[i][0]+' viert het bij het oplichtende baken.');}
      else if(a.patrol){a.patrolSign*=-1;moveTo(a,a.home.x+a.patrolSign*1.1,a.home.z,a.sim.motion);}
      else play(a,'Idle');}
    }a.mixer.update(animationDt||dt);if(a.moving)a.solver((a.active.time/a.active.getClip().duration)%1,a.sim.motion);
   });
  }
  if(markerGroup.visible){const a=actors[selected],names=['FootL','FootR'];for(let i=0;i<2;i++){const bone=a.model.getObjectByName(names[i]);if(bone){const p=new THREE.Vector3();bone.getWorldPosition(p);markerGroup.children[i].position.set(p.x,.024,p.z);}}}
  orbit.update();renderer.render(worldScene,camera);frames++;perfTime+=wallDt;if(perfTime>.8){text('frameRate',Math.round(frames/perfTime)+' FPS · deze browser');text('triangles',renderer.info.render.triangles.toLocaleString()+' driehoeken');frames=0;perfTime=0;}
 }requestAnimationFrame(tick);
 addEventListener('pagehide',()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();orbit.dispose();renderer.dispose();actors.forEach(a=>a.mixer.stopAllAction());},{once:true});
}
document.addEventListener('visibilitychange',()=>{last=performance.now();});
actorLabel();boot().catch(e=>{console.error(e);fallback('De proef kon niet starten. Herlaad deze pagina.');});
