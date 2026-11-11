"""ChatGPT: local Blender build of an original smooth, skinned Lab prototype.
No external generation or existing approved character assets are modified.
Run blender -b --python tools/build_observatory_fox.py -- /absolute/output.
"""
import bpy, math, sys, json, base64
from pathlib import Path
from mathutils import Vector
out=Path(sys.argv[sys.argv.index('--')+1]);out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def v(p):return Vector((p[0],-p[2],p[1]))
def material(name,col):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True;bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*col,1);bs.inputs['Roughness'].default_value=.65;return m
fur=material('Fur_Teal',(.075,.43,.43));cream=material('Fur_Cream',(.92,.84,.66));ink=material('Eyes_Ink',(.025,.045,.055));iris=material('Eyes_Amber',(.98,.55,.12));white=material('Eyes_Glint',(1,.97,.88));cloth=material('Outfit_Indigo',(.13,.17,.29));sole=material('Soles',(.13,.18,.2));pink=material('Ear_Inner',(.73,.47,.43))
parts=[]
def ell(name,pos,scale,mat,segments=24,rings=16):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=v(pos));o=bpy.context.object;o.name=name;o.scale=(scale[0],scale[2],scale[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 for f in o.data.polygons:f.use_smooth=True
 return o
def capsule(name,a,b,r,mat):
 mid=(Vector(a)+Vector(b))/2;dire=v(b)-v(a);o=ell(name,mid,(r,dire.length/2+r,r),mat);o.rotation_mode='QUATERNION';o.rotation_quaternion=Vector((0,0,1)).rotation_difference(dire);return o
# One fused organic surface: pelvis, torso, neck, head, ears and limbs.
for name,pos,scale in [('Pelvis',(0,1.02,0),(.31,.29,.25)),('Torso',(0,1.27,0),(.33,.35,.25)),('Neck',(0,1.53,0),(.23,.22,.2)),('Head',(0,1.79,.015),(.47,.39,.33)),('Cheek.L',(-.25,1.68,.2),(.22,.16,.17)),('Cheek.R',(.25,1.68,.2),(.22,.16,.17))]:parts.append(ell(name,pos,scale,fur))
for side,sign in [('L',-1),('R',1)]:
 parts.append(ell('Ear.'+side,(sign*.32,2.1,-.02),(.16,.31,.12),fur))
 for name,a,b,r in [('UpperArm',(sign*.3,1.4,0),(sign*.48,1.16,0),.12),('Forearm',(sign*.48,1.16,0),(sign*.62,.96,.02),.105),('Thigh',(sign*.18,1.0,0),(sign*.19,.57,.01),.155),('Shin',(sign*.19,.57,.01),(sign*.19,.14,.05),.12)]:parts.append(capsule(name+'.'+side,a,b,r,fur))
 parts.append(ell('Hand.'+side,(sign*.64,.94,.025),(.12,.15,.11),fur))
 parts.append(ell('Paw.'+side,(sign*.19,.12,.13),(.17,.13,.25),fur))
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();body=bpy.context.object;body.name='Fox_Skin'
rem=body.modifiers.new('Organic union','REMESH');rem.mode='VOXEL';rem.voxel_size=.035;rem.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=rem.name)
sm=body.modifiers.new('Smooth silhouette','SMOOTH');sm.factor=.8;sm.iterations=5;bpy.ops.object.modifier_apply(modifier=sm.name)
dec=body.modifiers.new('Game topology','DECIMATE');dec.ratio=.55;bpy.ops.object.modifier_apply(modifier=dec.name)
for f in body.data.polygons:f.use_smooth=True
# A real deforming skeleton, rather than parented rigid body pieces.
bpy.ops.object.armature_add(enter_editmode=True,location=(0,0,0));rig=bpy.context.object;rig.name='Observatory_Fox_Rig';eb=rig.data.edit_bones;eb.remove(eb[0]);defs={}
def bone(name,a,b,parent=None):
 n=eb.new(name);n.head=v(a);n.tail=v(b)
 if parent:n.parent=eb[parent]
 defs[name]=(Vector(a),Vector(b));return n
bone('Root',(0,0,0),(0,.2,0));bone('Hips',(0,1.0,0),(0,1.16,0),'Root');bone('Spine',(0,1.16,0),(0,1.5,0),'Hips');bone('Head',(0,1.5,0),(0,1.94,0),'Spine');bone('Jaw',(0,1.64,.17),(0,1.6,.35),'Head');bone('Tail',(0,1.02,-.18),(0,1.12,-.7),'Hips')
for side,s in [('L',-1),('R',1)]:
 bone('Thigh.'+side,(s*.18,1,0),(s*.19,.57,.01),'Hips');bone('Shin.'+side,(s*.19,.57,.01),(s*.19,.14,.05),'Thigh.'+side);bone('Foot.'+side,(s*.19,.14,.05),(s*.19,.12,.33),'Shin.'+side)
 bone('UpperArm.'+side,(s*.3,1.4,0),(s*.48,1.16,0),'Spine');bone('Forearm.'+side,(s*.48,1.16,0),(s*.62,.96,.02),'UpperArm.'+side);bone('Hand.'+side,(s*.62,.96,.02),(s*.66,.86,.04),'Forearm.'+side)
bpy.ops.object.mode_set(mode='OBJECT')
def dist_seg(p,a,b):
 d=b-a;t=max(0,min(1,(p-a).dot(d)/max(1e-8,d.length_squared)));return (p-a-d*t).length
# Each vertex gets smooth distance weights over anatomically restricted bones.
def skin(obj,forced=None):
 obj.parent=rig;mod=obj.modifiers.new('Deform','ARMATURE');mod.object=rig
 groups={n:obj.vertex_groups.new(name=n) for n in defs}
 for vertex in obj.data.vertices:
  w=obj.matrix_world@vertex.co;p=Vector((w.x,w.z,-w.y));x,y,z=p
  if forced:candidates=[forced]
  elif y>1.5:candidates=['Head','Spine'] if y<1.63 else ['Head']
  elif abs(x)>.34 and y>.74:candidates=['UpperArm.'+('R' if x>0 else 'L'),'Forearm.'+('R' if x>0 else 'L'),'Hand.'+('R' if x>0 else 'L'),'Spine']
  elif y<.98:candidates=['Thigh.'+('R' if x>0 else 'L'),'Shin.'+('R' if x>0 else 'L'),'Foot.'+('R' if x>0 else 'L'),'Hips']
  else:candidates=['Hips','Spine','Head']
  weights=[(n,1/max(.04,dist_seg(p,*defs[n]))**4) for n in candidates];weights.sort(key=lambda x:-x[1]);weights=weights[:4];total=sum(w for n,w in weights)
  for n,wgt in weights:groups[n].add([vertex.index],wgt/total,'REPLACE')
 return obj
skin(body)
extras=[]
# Continuous soft features; no geometric block joints.
extras.append(skin(ell('Muzzle',(0,1.64,.30),(.235,.12,.14),cream),'Head'))
extras.append(skin(ell('Nose',(0,1.695,.415),(.075,.049,.045),ink),'Head'))
extras.append(skin(ell('MouthLine',(0,1.6,.355),(.13,.012,.025),ink),'Head'))
extras.append(skin(ell('LowerJaw',(0,1.57,.31),(.16,.045,.08),cream),'Jaw'))
for s in [-1,1]:
 extras.append(skin(ell('InnerEar',(s*.32,2.12,.075),(.09,.19,.035),pink),'Head'))
 extras.append(skin(ell('EyeWhite',(s*.185,1.825,.3),(.10,.125,.055),white),'Head'))
 extras.append(skin(ell('Iris',(s*.185,1.822,.347),(.063,.085,.025),iris),'Head'))
 extras.append(skin(ell('Pupil',(s*.185,1.825,.365),(.035,.065,.013),ink),'Head'))
 extras.append(skin(ell('Glint',(s*.165,1.86,.378),(.018,.022,.009),white,16,10),'Head'))
extras.append(skin(ell('Belly',(0,1.22,.215),(.225,.26,.055),cream),'Spine'))
tailparts=[]
for i in range(5):tailparts.append(ell('TailFur',(.06*i,1.04+.08*i,-.2-.13*i),(.17+.02*i,.18+.02*i,.19),fur))
bpy.ops.object.select_all(action='DESELECT')
for o in tailparts:o.select_set(True)
bpy.context.view_layer.objects.active=tailparts[0];bpy.ops.object.join();tail=bpy.context.object;tail.name='Tail_Smooth';r=tail.modifiers.new('Join tail','REMESH');r.mode='VOXEL';r.voxel_size=.04;r.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=r.name);skin(tail,'Tail');extras.append(tail)
# Foot IK targets stay stationary during stance when root motion is applied in-game.
targets={};poles={}
for side,s in [('L',-1),('R',1)]:
 target=bpy.data.objects.new('CTRL_Foot_'+side,None);bpy.context.collection.objects.link(target);target.location=v((s*.19,.14,.05));targets[side]=target
 pole=bpy.data.objects.new('CTRL_Knee_'+side,None);bpy.context.collection.objects.link(pole);pole.location=v((s*.19,.57,2));poles[side]=pole
 ik=rig.pose.bones['Shin.'+side].constraints.new('IK');ik.target=target;ik.pole_target=pole;ik.chain_count=2;ik.iterations=64
 # Pose roll is chosen so the natural knee bends forwards in glTF +Z.
 ik.pole_angle=-math.pi/2
 foot=rig.pose.bones['Foot.'+side];cr=foot.constraints.new('COPY_ROTATION');cr.target=target;cr.target_space='WORLD';cr.owner_space='WORLD'
 target.rotation_euler=rig.data.bones['Foot.'+side].matrix_local.to_euler()
for p in rig.pose.bones:p.rotation_mode='XYZ'
scene=bpy.context.scene;scene.render.fps=30
for name,frames,duty,travel,lift in [('Idle',60,1,0,0),('Walk',36,.64,.50,.15),('Run',22,.36,.80,.29),('Yawn',90,1,0,0),('Celebrate',60,1,0,0)]:
 rig.animation_data_create();rig.animation_data.action=bpy.data.actions.new(name)
 for o in targets.values():o.animation_data_create();o.animation_data.action=bpy.data.actions.new(name+'_'+o.name)
 scene.frame_start=1;scene.frame_end=frames+1
 for frame in range(1,frames+2):
  phase=(frame-1)/frames;t=phase*math.tau;scene.frame_set(frame)
  for p in rig.pose.bones:p.rotation_euler=(0,0,0);p.location=(0,0,0)
  hip=rig.pose.bones['Hips'];hip.location.y=(.014*math.cos(t*2) if name=='Walk' else -.10-.07*math.cos(2*t-.72*math.pi) if name=='Run' else .005*math.sin(t))
  rig.pose.bones['Spine'].rotation_euler.y=.025*math.sin(t)
  rig.pose.bones['Head'].rotation_euler.y=.04*math.sin(t*.5)
  rig.pose.bones['Tail'].rotation_euler.y=.14*math.sin(t)
  for side,s in [('L',-1),('R',1)]:
   q=(phase+(0 if side=='L' else .5))%1;z=.05;y=.14
   if name in ['Walk','Run']:
    if q<duty:z=.05+travel/2-travel*q/duty
    else:u=(q-duty)/(1-duty);z=.05-travel/2+travel*u;y=.14+lift*math.sin(math.pi*u)
    rig.pose.bones['UpperArm.'+side].rotation_euler.x=(.42 if name=='Walk' else .82)*math.sin(t+(0 if side=='R' else math.pi))
    rig.pose.bones['Forearm.'+side].rotation_euler.x=-.2 if name=='Walk' else -.65
   if name=='Yawn':
    a=math.sin(math.pi*phase)**2;rig.pose.bones['Head'].rotation_euler.x=-.14*a;rig.pose.bones['UpperArm.R'].rotation_euler.x=-.9*a;rig.pose.bones['Jaw'].rotation_euler.x=.5*a
   if name=='Celebrate':
    a=math.sin(math.pi*phase)**2;rig.pose.bones['UpperArm.'+side].rotation_euler.y=s*.7*a;rig.pose.bones['Forearm.'+side].rotation_euler.x=-.45*a;hip.location.y=.025*math.sin(t*2)*a
   targets[side].location=v((s*.19,y,z));targets[side].keyframe_insert('location',frame=frame);targets[side].keyframe_insert('rotation_euler',frame=frame)
  for p in rig.pose.bones:p.keyframe_insert('rotation_euler',frame=frame);p.keyframe_insert('location',frame=frame)
 # Bake constraint-evaluated poses into each action so GLB contains real joint clips.
 bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig
 bpy.ops.object.mode_set(mode='POSE');bpy.ops.pose.select_all(action='SELECT')
 bpy.ops.nla.bake(frame_start=1,frame_end=frames+1,step=1,only_selected=True,visual_keying=True,clear_constraints=False,use_current_action=True,bake_types={'POSE'})
 bpy.ops.object.mode_set(mode='OBJECT')
 action=rig.animation_data.action;action.name=name;action.use_fake_user=True
 track=rig.animation_data.nla_tracks.new();track.name=name;strip=track.strips.new(name,1,action);track.mute=True
rig.animation_data.action=None
for p in rig.pose.bones:
 for c in list(p.constraints):p.constraints.remove(c)
for o in targets.values():o.animation_data_clear();bpy.data.objects.remove(o,do_unlink=True)
for o in poles.values():bpy.data.objects.remove(o,do_unlink=True)
for p in rig.pose.bones:p.matrix_basis.identity()
bpy.context.view_layer.update();scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
for o in [rig,body]+extras:o.select_set(True)
bpy.context.view_layer.objects.active=rig
path=out/'observatory-fox-v2.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_apply=False,export_extras=True)
(out/'observatory-fox-v2.b64').write_text(base64.b64encode(path.read_bytes()).decode())
report={'vertices':sum(len(o.data.vertices) for o in [body]+extras),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in [body]+extras),'bytes':path.stat().st_size,'walkDuration':1.2,'walkStride':.5/.64,'runDuration':22/30,'runStride':.8/.36,'source':'Original Blender mesh, smooth weighted skin; locally generated motion; no external services.'}
(out/'observatory-fox-v2.json').write_text(json.dumps(report,indent=2));print('ASSET_REPORT',json.dumps(report))
# Review stills use the actual exported design and the animated skeleton.
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=False;scene.cycles.device='CPU';scene.render.resolution_x=512;scene.render.resolution_y=512;scene.render.resolution_percentage=100
scene.world.color=(.06,.07,.1)
def point(name,pos,power,size):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=v(pos);o.rotation_euler=(v((0,1,0))-o.location).to_track_quat('-Z','Y').to_euler()
point('Key',(3,5,4),450,4);point('Fill',(-3,3,2),230,3);point('Rim',(1,3,-4),350,3)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.015));ground=bpy.context.object;ground.data.materials.append(material('Review floor',(.1,.13,.2)))
bpy.ops.object.camera_add(location=v((3.5,2.25,5.3)));cam=bpy.context.object;cam.rotation_euler=(v((0,1.15,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=3.0;scene.camera=cam
for name,frame in [('Idle',1),('Walk',8),('Run',6)]:
 rig.animation_data.action=bpy.data.actions.get(name);scene.frame_set(frame);scene.render.filepath=str(out/(name.lower()+'-review.png'));bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(out/'observatory-fox-v2.blend'))
