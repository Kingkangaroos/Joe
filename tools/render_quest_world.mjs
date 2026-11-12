import * as THREE from 'three';
import fs from 'node:fs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {buildQuestWorld} from '../steps-game-world.js';
import {createFootSolver} from '../world-foot-ik.js';
import Q from '../steps-quest-core.js';
global.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result='data:application/octet-stream;base64,'+Buffer.from(b).toString('base64');this.onloadend?.();});}};
const scene=new THREE.Scene();scene.background=new THREE.Color('#151e37');const world=buildQuestWorld(scene,Q);for(const m of world.markers)m.visible=false;for(const m of world.hazards)m.visible=false;world.firefly.visible=false;world.gate.visible=false;world.bridge.visible=true;world.aura.visible=false;
const loader=new GLTFLoader();
for(const [i,c] of Q.CREW.entries()){
 const b=Buffer.from(fs.readFileSync(new URL('../'+c.model,import.meta.url),'utf8'),'base64');const gltf=await new Promise((ok,no)=>loader.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'',ok,no));const root=new THREE.Group();root.add(gltf.scene);root.scale.setScalar(i?.62:.75);root.position.set(i?c.x*.83:0,0,i?c.z*.83:5);root.rotation.y=i?Math.atan2(-c.x,-c.z):.25;scene.add(root);root.updateMatrixWorld(true);
 if(!i){gltf.scene.traverse(o=>{if(o.userData.unlock_form)o.visible=o.userData.unlock_form<=10;if(o.userData.only_form)o.visible=false;});const mixer=new THREE.AnimationMixer(gltf.scene),clip=gltf.animations.find(c=>c.name==='Walk');mixer.clipAction(clip).play();mixer.update(.3);createFootSolver(gltf.scene,root)(.3/clip.duration,'walk');}
}
scene.updateMatrixWorld(true);const bytes=await new Promise((ok,no)=>new GLTFExporter().parse(scene,ok,no,{binary:true,onlyVisible:true}));fs.writeFileSync(process.argv[2],Buffer.from(bytes));console.log('Exported actual runtime world:',bytes.byteLength);
