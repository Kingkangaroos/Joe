import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createFootSolver} from '../world-foot-ik.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const b=Buffer.from(fs.readFileSync(new URL('../assets/models/observatory-fox-v2.b64',import.meta.url),'utf8'),'base64');
const gltf=await new Promise((resolve,reject)=>new GLTFLoader().parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'',resolve,reject));
const model=gltf.scene,mixer=new THREE.AnimationMixer(model),report={};const root=new THREE.Group();root.add(model);model.updateMatrixWorld(true);const solve=createFootSolver(model,root);
for(const [name,duty,stride] of [['Walk',.64,.78125],['Run',.36,2.2222222222222223]]){
 mixer.stopAllAction();const clip=gltf.animations.find(c=>c.name===name);assert(clip);const action=mixer.clipAction(clip).play();const feet=['FootL','FootR'].map(n=>model.getObjectByName(n));const values=[[],[]];let minY=99;
 for(let i=0;i<120;i++){
  const p=i/120,t=p*clip.duration;mixer.setTime(t);model.updateMatrixWorld(true);solve(p,name.toLowerCase());
  for(let j=0;j<2;j++){const phase=(p+j*.5)%1;if(phase>.03&&phase<duty-.03){const v=new THREE.Vector3();feet[j].getWorldPosition(v);values[j].push({z:v.z+p*stride-Math.floor(p+j*.5)*stride,y:v.y});}}
 }
 report[name]={duration:clip.duration,contact:values.map(points=>({zDrift:Math.max(...points.map(p=>p.z))-Math.min(...points.map(p=>p.z)),verticalDrift:Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y)),minY:Math.min(...points.map(p=>p.y))}))};
}
for(const mode of Object.values(report))for(const foot of mode.contact){assert(foot.zDrift<.001,'stance drift');assert(foot.verticalDrift<.001,'vertical drift');}console.log(JSON.stringify(report,null,2));
