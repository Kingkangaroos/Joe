import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Reuses the existing rig; no invented idle or transformation clips.
export async function createRig(container,reduced){
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,50);
  camera.position.set(4,3.1,6);camera.lookAt(0,.65,0);
  scene.add(new THREE.HemisphereLight(0xf2edff,0x444067,2.5));
  const light=new THREE.DirectionalLight(0xffefcc,3);light.position.set(3,6,4);scene.add(light);
  const scenery=new THREE.Group();scene.add(scenery);
  let model,mixer,action,frame=0,enabled=false,dead=false,phase='idle',phaseAt=0,level=1,habit='gratitude';
  function free(group){group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{for(const value of Object.values(m))if(value&&value.isTexture)value.dispose();m.dispose();});}});}
  function shape(geometry,color,x,y,z){const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.8}));mesh.position.set(x,y,z);scenery.add(mesh);return mesh;}
  function box(color,x,y,z,w,h,d){return shape(new THREE.BoxGeometry(w,h,d),color,x,y,z);}
  function ball(color,x,y,z,r){return shape(new THREE.SphereGeometry(r,12,8),color,x,y,z);}
  function build(){
    free(scenery);scenery.clear();
    const room=habit==='household',trail=habit==='walking';
    shape(new THREE.CylinderGeometry(2.15,2.05,.2,48),room?0x987b9d:trail?0x759b65:0x615080,0,-.12,0);
    if(room){
      box(0x655577,0,.85,-1.4,3.4,1.9,.12);box(0xb4e7ed,-.65,1.05,-1.31,.85,.75,.08);
      box(0xdcc3ba,1,.35,-.95,.7,.65,.5);box(0xbaa1ce,0,.015,.4,1.8,.035,1.2);
      for(let i=0;i<Math.max(0,6-level);i++)box(0xbba366,-1+i*.35,.12,.7+(i%2)*.3,.25,.2,.2);
    }else{
      for(let i=0;i<8;i++)box(trail?0xbcb6a0:0x9681ac,-1.5+i*.43,.005,Math.sin(i*.65)*.5,.32,.045,.32);
      for(let i=0;i<level+3;i++){
        const a=i*2.399,x=Math.cos(a)*1.65,z=Math.sin(a)*1.65;
        box(0x455c54,x,.13,z,.055,.26,.055);ball(i%2?0xf2c878:0xd4b3f2,x,.32,z,.12);
      }
      if(trail){box(0x6b675b,1.3,.45,-1,.12,.9,.12);box(0xf5d395,1.3,.82,-1,.6,.25,.1);}
    }
    ball(0x637f66,-1.3,.3,-.9,.3);ball(0x82ab80,-1.3,.55,-.9,.26);
  }
  function resize(){const w=container.clientWidth||container.parentElement.clientWidth||600,h=container.clientHeight||330;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function tick(now){
    if(!enabled||dead)return;
    const t=(now-phaseAt)/1000;
    if(model){
      const moving=!reduced&&phase==='reveal'&&t<1.1;
      action.paused=!moving;
      if(moving){mixer.update(Math.min(.04,(now-(tick.last||now))/1000));model.position.x=-.3+Math.min(1,t/1.1)*.6;model.rotation.y=Math.PI/2;}
      else {model.rotation.y=.3;model.position.x=0;}
      model.position.y=model.userData.baseY+(!reduced&&phase==='burst'?Math.sin(Math.min(1,t/.7)*Math.PI)*.4:0);
      model.scale.setScalar(model.userData.baseScale*(phase==='gather'&&!reduced?.96:1));
    }
    tick.last=now;renderer.render(scene,camera);frame=requestAnimationFrame(tick);
  }
  const observer=new ResizeObserver(resize);
  try{
    const gltf=await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(Error('3D load timeout')),15000);
      new GLTFLoader().load('https://d8j0ntlcm91z4.cloudfront.net/user_3J11PlWTdAXdyiVgxHYnMUsJS8U/hf_20260916_220039_950a8a2c-9c1d-4854-8949-682a553945de.glb',g=>{clearTimeout(timer);if(dead)free(g.scene);else resolve(g);},undefined,e=>{clearTimeout(timer);reject(e);});
    });
    model=gltf.scene;const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),scale=1.45/size.y;
    model.userData.baseScale=scale;model.userData.baseY=-bounds.min.y*scale;model.scale.setScalar(scale);model.position.y=model.userData.baseY;scene.add(model);
    mixer=new THREE.AnimationMixer(model);action=mixer.clipAction(gltf.animations[0]);action.play();mixer.update(.15);action.paused=true;
    container.append(renderer.domElement);observer.observe(container);resize();build();
  }catch(error){dead=true;observer.disconnect();free(scene);renderer.dispose();throw error;}
  return {
    setWorld(h,l){habit=h;level=l;build();},
    phase(p){phase=p;phaseAt=performance.now();},
    active(on){enabled=on;cancelAnimationFrame(frame);tick.last=0;if(on&&!dead){resize();frame=requestAnimationFrame(tick);}},
    dispose(){dead=true;enabled=false;cancelAnimationFrame(frame);observer.disconnect();mixer.stopAllAction();free(scene);renderer.dispose();renderer.domElement.remove();}
  };
}
