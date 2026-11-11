// Post-animation two-bone IK: a planted foot stays on the ground as the root moves.
import * as THREE from 'three';
export function createFootSolver(model,root){
 const chains=['L','R'].map((side,i)=>{const thigh=model.getObjectByName('Thigh'+side),shin=model.getObjectByName('Shin'+side),foot=model.getObjectByName('Foot'+side);if(!thigh||!shin||!foot)throw Error('Leg chain missing '+side);return {thigh,shin,foot,side:i===0?-1:1,restFoot:foot.getWorldQuaternion(new THREE.Quaternion()).clone()};});
 const p=new THREE.Vector3(),k=new THREE.Vector3(),f=new THREE.Vector3(),desired=new THREE.Vector3(),dir=new THREE.Vector3(),pole=new THREE.Vector3(),bend=new THREE.Vector3(),targetKnee=new THREE.Vector3(),q=new THREE.Quaternion(),parent=new THREE.Quaternion(),current=new THREE.Quaternion(),rootQ=new THREE.Quaternion();
 model.updateMatrixWorld(true);chains.forEach(c=>{c.thigh.getWorldPosition(p);c.shin.getWorldPosition(k);c.foot.getWorldPosition(f);c.a=p.distanceTo(k);c.b=k.distanceTo(f);c.restFoot.copy(c.foot.getWorldQuaternion(q)).premultiply(root.getWorldQuaternion(new THREE.Quaternion()).invert());});
 function aim(bone,child,target){bone.getWorldPosition(p);child.getWorldPosition(k);const before=k.clone().sub(p).normalize(),after=target.clone().sub(p).normalize();q.setFromUnitVectors(before,after);bone.getWorldQuaternion(current);q.multiply(current);bone.parent.getWorldQuaternion(parent).invert();bone.quaternion.copy(parent.multiply(q));bone.updateWorldMatrix(false,true);}
 return function solve(phase,mode){
  if(!['walk','run'].includes(mode))return;
  model.updateWorldMatrix(true,true);root.getWorldQuaternion(rootQ);
  const run=mode==='run',duty=run?.36:.64,travel=run?.80:.50,lift=run?.29:.15;
  const hips=model.getObjectByName('Hips');hips.getWorldPosition(p);p.y-=run?.04:.07;hips.parent.worldToLocal(p);hips.position.copy(p);hips.updateWorldMatrix(false,true);
  for(let i=0;i<chains.length;i++){
   const c=chains[i],s=(phase+i*.5)%1;let z=.05,y=.14;
   if(s<duty)z=.05+travel/2-travel*s/duty;else {const u=(s-duty)/(1-duty);z=.05-travel/2+travel*u;y=.14+lift*Math.sin(Math.PI*u);}
   desired.set(c.side*.19,y,z);root.localToWorld(desired);c.thigh.getWorldPosition(p);
   dir.copy(desired).sub(p);const distance=Math.max(.001,Math.min(c.a+c.b-.0001,dir.length()));dir.normalize();
   pole.set(c.side*.19,.55,2);root.localToWorld(pole);bend.copy(pole).sub(p);bend.addScaledVector(dir,-bend.dot(dir)).normalize();
   const along=(c.a*c.a-c.b*c.b+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,c.a*c.a-along*along));
   targetKnee.copy(p).addScaledVector(dir,along).addScaledVector(bend,height);
   aim(c.thigh,c.shin,targetKnee);aim(c.shin,c.foot,desired);
   c.foot.parent.getWorldQuaternion(parent).invert();q.copy(rootQ).multiply(c.restFoot);c.foot.quaternion.copy(parent.multiply(q));c.foot.updateWorldMatrix(false,true);
  }
 };
}
