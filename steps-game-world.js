import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
function material(v,emissive=null){return new THREE.MeshStandardMaterial({color:v,roughness:.82,...(emissive?{emissive,emissiveIntensity:.5}:{})});}
export function buildQuestWorld(scene,Q){
 const ground=material('#4d5e70'),pathMat=material('#82879a'),rockMat=material('#59617e'),treeMat=material('#657f8b'),wood=material('#514c67'),gold=material('#e2bd76'),trim=material('#b6abc9'),water=material('#42647c'),glow=material('#9addce','#69cbb2');
 const meshes=[],vegetation=[],homes=[],markers=[],particles=[],hazards=[];const geo={tree:new THREE.SphereGeometry(1,12,8),stone:new THREE.DodecahedronGeometry(1,0)};
 function add(geometry,mat,x=0,y=0,z=0,parent=scene){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);meshes.push(m);return m;}
 const floor=add(new THREE.CircleGeometry(14,80),ground);floor.rotation.x=-Math.PI/2;add(new THREE.CylinderGeometry(14,12.5,1.2,64),rockMat,0,-.61,0);
 const sea=add(new THREE.CircleGeometry(36,64),water,0,-1.15,0);sea.rotation.x=-Math.PI/2;
 const path=add(new THREE.RingGeometry(8.6,9.3,80),pathMat,0,.012,0);path.rotation.x=-Math.PI/2;
 for(let i=0;i<12;i++){
  const a=i/12*Math.PI*2,x=Math.sin(a)*11.5,z=Math.cos(a)*11.5;const home=new THREE.Group();scene.add(home);home.position.set(x,0,z);homes.push(home);
  add(new THREE.CylinderGeometry(.72,.82,1.05,16),rockMat,0,.52,0,home);const roof=add(new THREE.SphereGeometry(.85,16,12,0,Math.PI*2,0,Math.PI/2),wood,0,1.04,0,home);roof.scale.y=.9;
  const lamp=material(Q.CREW[i].color,Q.CREW[i].color);lamp.emissiveIntensity=.2;add(new THREE.SphereGeometry(.19,12,10),lamp,Math.sin(a)*-.65,.63,Math.cos(a)*-.65,home);home.userData.lamp=lamp;
  const sign=add(new THREE.CylinderGeometry(.38,.38,.04,20),trim,-Math.sin(a)*1.1,.035,-Math.cos(a)*1.1,home);
 }
 // Observatory, garden landmarks and a bridge that physically unlocks at form six.
 add(new THREE.CylinderGeometry(1.3,1.45,1.8,24),rockMat,0,.9,-12);add(new THREE.SphereGeometry(1.45,24,16,0,Math.PI*2,0,Math.PI/2),wood,0,1.8,-12);const telescope=add(new THREE.CylinderGeometry(.14,.20,1.5,16),gold,.6,2.3,-11.5);telescope.rotation.x=Math.PI/3;
 const pond=add(new THREE.PlaneGeometry(6,2.4),water,0,.016,-6.0);pond.rotation.x=-Math.PI/2;
 const bridge=new THREE.Group();scene.add(bridge);for(let i=0;i<9;i++)add(new THREE.BoxGeometry(1.7,.08,.25),wood,0,.07,-7.15+i*.28,bridge);for(const x of [-.85,.85]){add(new THREE.BoxGeometry(.055,.55,2.7),trim,x,.31,-6.0,bridge);}
 const gate=new THREE.Group();scene.add(gate);for(let i=0;i<5;i++)add(new THREE.CylinderGeometry(.035,.035,1.5,8),glow,-1.1+i*.55,.75,-5.5,gate);
 const altar=add(new THREE.CylinderGeometry(.83,1,.18,40),rockMat,0,.09,0);const altarRing=add(new THREE.TorusGeometry(.72,.035,8,48),gold,0,.21,0);altarRing.rotation.x=-Math.PI/2;const crystal=add(new THREE.OctahedronGeometry(.24),glow,0,.88,0);
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const b=add(new THREE.CylinderGeometry(.13,.17,.22,12),rockMat,Math.sin(a)*1.55,.13,Math.cos(a)*1.55);b.userData.chapter=i;}
 // Deterministic decoration is kept away from mission pickups and the central routes.
 for(let i=0;i<60;i++){const a=i*2.399963,r=9.7+(i%5)*.65,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x,z)>13.5||Q.CREW.some(c=>Math.hypot(c.x-x,c.z-z)<1.4))continue;add(new THREE.CylinderGeometry(.07,.11,.7,7),wood,x,.35,z);const crown=add(geo.tree,treeMat,x,1.05,z);crown.scale.set(.4+(i%3)*.1,.62,.45);vegetation.push(crown);}
 const flowers= new THREE.InstancedMesh(new THREE.OctahedronGeometry(.055),glow,120);const dummy=new THREE.Object3D();for(let i=0;i<120;i++){const a=i*2.39996,r=2.6+(i%43)*.19;dummy.position.set(Math.cos(a)*r,.09,Math.sin(a)*r);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix);}scene.add(flowers);
 for(const [x,z,r]of [[-10,-8,1],[10,-8,1],[-10,7,.8],[10,7,.8]]){const m=add(geo.stone,rockMat,x,.55,z);m.scale.set(r,.85,r);}

 // Three readable districts, with clear traversal space around every quest point.
 const gardenMat=material('#657d72'),ridgeMat=material('#596780'),moonMat=material('#56627d');
 function patch(x,z,rx,rz,mat){const m=add(new THREE.CircleGeometry(1,24),mat,x,.019,z);m.rotation.x=-Math.PI/2;m.scale.set(rx,rz,1);return m;}
 patch(6.6,3.7,2.5,2.7,gardenMat);patch(-6.2,-2.7,2.4,3.5,ridgeMat);patch(.5,-9.8,2.9,1.7,moonMat);
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){
  const x=6.2+col*.4,z=5.1+row*.38;add(new THREE.SphereGeometry(.09,8,6),col%2?gold:glow,x,.11,z);
  add(new THREE.ConeGeometry(.04,.16,6),treeMat,x,.23,z);
 }
 // A small orchard; the trees stay outside the four harvest pickup positions.
 for(const [x,z]of [[8.5,3],[8.7,5.6],[5.7,6.8]]){add(new THREE.CylinderGeometry(.07,.12,.8,7),wood,x,.4,z);const t=add(geo.tree,treeMat,x,1.1,z);t.scale.set(.58,.64,.58);for(let j=0;j<5;j++){const a=j*Math.PI*.4;add(new THREE.SphereGeometry(.075,8,6),gold,x+Math.sin(a)*.45,.98+Math.cos(a)*.3,z+.25);}}
 // Crystal ridge and a sky observatory platform.
 for(let i=0;i<9;i++){const x=-8.8+(i%3)*.38,z=-5.9+Math.floor(i/3)*.35;const m=add(new THREE.ConeGeometry(.12,.7+(i%3)*.15,5),i%2?glow:trim,x,.35,z);m.rotation.z=(i%3-1)*.22;}
 for(const x of [-2.8,2.8]){add(new THREE.CylinderGeometry(.17,.24,1.1,8),rockMat,x,.55,-10.1);add(new THREE.OctahedronGeometry(.22),glow,x,1.25,-10.1);}
 // Visible wind gates give the dash chapter its own course silhouette.
 const courseGates=[];for(const p of Q.CHAPTERS[3].points){const m=add(new THREE.TorusGeometry(.85,.038,8,48),glow,p.x,.91,p.z);m.rotation.y=.65;courseGates.push(m);}
 // Personal house accents: moon, leaf, tooth crystal, books, exercise bars and signal antenna.
 for(let i=0;i<homes.length;i++){
  const home=homes[i],c=Q.CREW[i],accent=material(c.color,c.color);accent.emissiveIntensity=.12;
  const emblem=i===8?new THREE.BoxGeometry(.22,.18,.10):i===9?new THREE.BoxGeometry(.25,.32,.10):new THREE.OctahedronGeometry(.16);
  add(emblem,accent,0,1.74,0,home);
  if(i===1){const ring=add(new THREE.TorusGeometry(.22,.045,6,24,Math.PI*1.5),gold,0,1.85,0,home);ring.rotation.z=.4;}
  if(i===2||i===5){for(const side of [-1,1]){const leafMesh=add(geo.tree,treeMat,side*.6,.35,.6,home);leafMesh.scale.set(.15,.35,.15);}}
  if(i===8){add(new THREE.CylinderGeometry(.018,.018,.46,6),gold,0,1.9,0,home);add(new THREE.SphereGeometry(.06,8,6),glow,0,2.15,0,home);}
  if(i===10){add(new THREE.BoxGeometry(1.2,.07,.07),trim,0,1.2,.9,home);for(const x of [-.54,.54])add(new THREE.CylinderGeometry(.045,.045,1.2,6),wood,x,.6,.9,home);}
 }
 const starGeo=new THREE.BufferGeometry(),stars=[];for(let i=0;i<180;i++){const a=i*2.3999;stars.push(Math.cos(a)*25,8+i%15,Math.sin(a)*25);}starGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));const sky=new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#efe3c2',size:.04}));scene.add(sky);
 for(let i=0;i<2;i++){const g=new THREE.Group();scene.add(g);const h=add(new THREE.IcosahedronGeometry(.25,1),material('#7b6da8','#61438b'),0,.52,0,g);add(new THREE.TorusGeometry(.38,.022,6,24),trim,0,.52,0,g).rotation.x=Math.PI/2;hazards.push(g);}
 const firefly=add(new THREE.SphereGeometry(.12,12,8),glow,6,.65,4);const aura=add(new THREE.TorusGeometry(.8,.025,8,64),glow);aura.rotation.x=-Math.PI/2;
 const trail=[],orbitStars=[];for(let i=0;i<24;i++){const m=add(new THREE.OctahedronGeometry(.045),i%2?glow:gold);m.visible=false;trail.push(m);}for(let i=0;i<8;i++){const m=add(new THREE.OctahedronGeometry(.055),gold);m.visible=false;orbitStars.push(m);}const trailPoints=[];

 for(let i=0;i<50;i++){const m=add(new THREE.OctahedronGeometry(.035),i%2?gold:glow);m.visible=false;particles.push({m,life:0,v:new THREE.Vector3()});}

 // Batch static props by material; preserve every gameplay target and animated FX.
 scene.updateMatrixWorld(true);
 const dynamic=new Set([floor,crystal,firefly,aura,...courseGates,...trail,...orbitStars,...particles.map(p=>p.m)]);
 for(const group of [bridge,gate,...hazards])group.traverse(o=>dynamic.add(o));
 const groups=new Map();for(const m of meshes){if(dynamic.has(m)||Number.isInteger(m.userData.chapter)||Array.isArray(m.material))continue;const key=m.material.uuid+'|'+(m.geometry.index?'indexed':'plain')+'|'+Object.keys(m.geometry.attributes).sort().join(',');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(m);}
 for(const list of groups.values()){
  if(list.length<2)continue;const geometries=list.map(m=>m.geometry.clone().applyMatrix4(m.matrixWorld));const combined=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!combined)continue;
  const batch=new THREE.Mesh(combined,list[0].material);batch.receiveShadow=true;scene.add(batch);
  for(const m of list){m.removeFromParent();const i=meshes.indexOf(m);if(i>=0)meshes.splice(i,1);}meshes.push(batch);
 }

return {courseGates,gardenMat,ridgeMat,moonMat,add,floor,ground,pathMat,rockMat,treeMat,wood,gold,trim,water,glow,meshes,vegetation,homes,markers,particles,hazards,bridge,gate,flowers,sky,crystal,firefly,aura,trail,orbitStars,trailPoints};
}
