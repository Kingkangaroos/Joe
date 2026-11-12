import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import R from '@dimforge/rapier3d-compat';
import Q from '../steps-quest-core.js';
import {createQuestPhysics} from '../steps-game-physics.js';
import {createFootSolver} from '../world-foot-ik.js';
const physics=await createQuestPhysics(R),s=Q.fresh();let frames=0;const evolutions=[];
while(!s.won&&frames++<40000){physics.setForm(s.form);if(Q.chapter(s).kind==='dashroute'&&!s.dashUsed)Q.dash(s);if(Q.complete(s)&&Q.distance(s.player,Q.ALTAR)<1.7)Q.interact(s);else if(Q.chapter(s).kind==='switches')Q.interact(s);const t=Q.next(s),d=Q.distance(s.player,t);Q.step(s,{x:d>.1?(t.x-s.player.x)/d:0,z:d>.1?(t.z-s.player.z)/d:0},.04,(o,d)=>physics.move(o,d));for(const e of Q.drain(s))if(e.type==='evolution')evolutions.push(e.form);}
assert(s.won,'all ten chapters reachable with real Rapier collision');assert.equal(s.form,10);assert.equal(s.history.length,10);assert.equal(s.stars,1475);physics.dispose();
const loader=new GLTFLoader(),assets={};const manifest=JSON.parse(fs.readFileSync(new URL('../assets/game/crew/manifest.json',import.meta.url)));for(const item of manifest.models){const bytes=Buffer.from(fs.readFileSync(new URL('../assets/game/crew/'+item.key+'.b64',import.meta.url),'utf8'),'base64');assets[item.key]=await new Promise((ok,no)=>loader.parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'',ok,no));}
const clips=assets.walking.animations,report={campaign:{won:s.won,chapters:s.history.length,forms:evolutions,stars:s.stars,frames},models:[]};
for(const [key,gltf] of Object.entries(assets)){
 const root=new THREE.Group();root.scale.setScalar(.75);root.rotation.y=.6;root.add(gltf.scene);root.updateMatrixWorld(true);const solve=createFootSolver(gltf.scene,root),mixer=new THREE.AnimationMixer(gltf.scene);let meshes=0;gltf.scene.traverse(o=>{if(o.isSkinnedMesh){meshes++;assert(o.skeleton.bones.length>=16);}});assert(meshes);const checks=[];
 for(const mode of ['Walk','Run']){
  const clip=clips.find(c=>c.name===mode);mixer.stopAllAction();mixer.clipAction(clip).play();let minimum=1e9;
  for(let i=0;i<80;i++){mixer.setTime(i/80*clip.duration);solve(i/80,mode.toLowerCase());root.updateMatrixWorld(true);for(const name of ['FootL','FootR']){const p=new THREE.Vector3();gltf.scene.getObjectByName(name).getWorldPosition(p);assert(Number.isFinite(p.y));minimum=Math.min(p.y,minimum);}}
  assert(minimum>.08&&minimum<.2,key+' foot anchor stays above ground');checks.push({clip:mode,minFootY:minimum});
 }
 report.models.push({key,skinnedMeshes:meshes,checks});
}
console.log(JSON.stringify(report,null,2));
