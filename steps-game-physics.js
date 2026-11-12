/* Rapier owns the kinematic capsule, obstacle sliding and the unlockable bridge gate. */
export async function createQuestPhysics(provided){
 const R=provided||(await import('https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.18.0/rapier.mjs')).default;await R.init();
 const world=new R.World({x:0,y:-9.81,z:0});world.timestep=1/60;
 const body=world.createRigidBody(R.RigidBodyDesc.kinematicPositionBased().setTranslation(0,.72,5));const collider=world.createCollider(R.ColliderDesc.capsule(.43,.23),body);const controller=world.createCharacterController(.015);controller.setSlideEnabled(true);
 world.createCollider(R.ColliderDesc.cuboid(18,.1,18).setTranslation(0,-.1,0));
 for(let i=0;i<64;i++){const a=i/64*Math.PI*2;world.createCollider(R.ColliderDesc.cuboid(.7,.8,.10).setTranslation(Math.sin(a)*13.3,.8,Math.cos(a)*13.3).setRotation({x:0,y:Math.sin(a/2),z:0,w:Math.cos(a/2)}));}
 const obstacles=[[-10,-8,1],[10,-8,1],[-10,7,.8],[10,7,.8]];
 for(const [x,z,r]of obstacles)world.createCollider(R.ColliderDesc.cylinder(.7,r).setTranslation(x,.7,z));
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;world.createCollider(R.ColliderDesc.cylinder(.8,.70).setTranslation(Math.sin(a)*11.5,.8,Math.cos(a)*11.5));}
 let gate=world.createCollider(R.ColliderDesc.cuboid(1.45,.85,.15).setTranslation(0,.85,-5.5));let unlocked=false;
 world.step();
 return {move(origin,desired){body.setTranslation({x:origin.x,y:.72,z:origin.z},true);world.propagateModifiedBodyPositionsToColliders();controller.computeColliderMovement(collider,{x:desired.x,y:0,z:desired.z});const v=controller.computedMovement(),next={x:origin.x+v.x,z:origin.z+v.z};body.setNextKinematicTranslation({x:next.x,y:.72,z:next.z});world.step();return next;},setForm(form){if(form>=6&&!unlocked){world.removeCollider(gate,true);unlocked=true;}else if(form<6&&unlocked){gate=world.createCollider(R.ColliderDesc.cuboid(1.45,.85,.15).setTranslation(0,.85,-5.5));unlocked=false;world.step();}},dispose(){world.free();}};
}
