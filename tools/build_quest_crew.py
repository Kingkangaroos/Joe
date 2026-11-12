"""Original rigged Lab crew and ten cumulative Steps forms. Blender 4.3.
Run: blender -b --python tools/build_quest_crew.py -- /absolute/output
Approved Park art remains untouched; these are original 3D interpretations for Lab.
"""
import bpy,math,sys,json,base64
from pathlib import Path
from mathutils import Vector
out=Path(sys.argv[sys.argv.index('--')+1]);out.mkdir(parents=True,exist_ok=True)
source=(Path(__file__).parent/'build_observatory_fox.py').read_text()
# Reuse the tested deforming rig, organic union and five baked clips.
exec(compile(source.split('# Review stills use')[0],str(Path(__file__).parent/'build_observatory_fox.py'),'exec'))
base_objects=[o for o in list(bpy.data.objects) if o.type=='MESH' and o.parent==rig]
for o in base_objects:o['companion']='walking'
gold=material('Quest_Gold',(.88,.53,.12));green=material('Runner_Jade',(.04,.27,.18));navy=material('Midnight_Cloth',(.045,.065,.14));cyan=material('Sky_Energy',(.12,.7,.9));purple=material('Astral',(.39,.16,.66));peach=material('Warm_Skin',(.65,.35,.20));brown=material('Chestnut',(.19,.075,.025));black=material('Soft_Ink',(.025,.029,.045));red=material('Heart_Ruby',(.68,.035,.075));orange=material('Garden_Amber',(.83,.32,.04));leaf=material('Garden_Leaf',(.19,.40,.035))
for m in [cyan,gold]:
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Metallic'].default_value=.4
mats=[fur,cream,ink,iris,white,cloth,sole,pink,gold,green,navy,cyan,purple,peach,brown,black,red,orange,leaf]
active=[]
def add(o,b='Spine',form=1):
 skin(o,b);o['unlock_form']=form;active.append(o);return o
def ball(name,pos,scale,mat,b='Head',form=1):return add(ell(name,pos,scale,mat,20,12),b,form)
def pipe(name,pts,r,mat,b='Head',form=1,closed=False):
 cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=2;cu.bevel_depth=r;cu.bevel_resolution=2
 s=cu.splines.new('POLY');s.points.add(len(pts)-1)
 for p,pt in zip(s.points,pts):p.co=(*v(pt),1)
 s.use_cyclic_u=closed;o=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(o);o.data.materials.append(mat);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);return add(o,b,form)
def band(name,center,rx,rz,r,mat,b='Head',form=1):
 return pipe(name,[(center[0]+rx*math.cos(i*math.tau/32),center[1],center[2]+rz*math.sin(i*math.tau/32)) for i in range(32)],r,mat,b,form,True)
def glyph(name,text,pos,size,mat,b='Head',form=1):
 cu=bpy.data.curves.new(name,'FONT');cu.body=text;cu.align_x='CENTER';cu.align_y='CENTER';cu.size=size;cu.extrude=.004;cu.bevel_depth=.001
 o=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(o);o.location=v(pos);o.rotation_euler=(math.pi/2,0,0);cu.materials.append(mat);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);return add(o,b,form)
def cone(name,pos,r1,r2,h,mat,b='Head',form=1):
 bpy.ops.mesh.primitive_cone_add(vertices=20,radius1=r1,radius2=r2,depth=h,location=v(pos));o=bpy.context.object;o.name=name;o.data.materials.append(mat);be=o.modifiers.new('Soft edge','BEVEL');be.width=.035;be.segments=3;bpy.ops.object.modifier_apply(modifier=be.name)
 for p in o.data.polygons:p.use_smooth=True
 return add(o,b,form)
def rounded(name,pos,scale,mat,b='Head',form=1):
 bpy.ops.mesh.primitive_cube_add(size=2,location=v(pos));o=bpy.context.object;o.name=name;o.scale=(scale[0],scale[2],scale[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);be=o.modifiers.new('Soft casing','BEVEL');be.width=min(scale)*.4;be.segments=4;bpy.ops.object.modifier_apply(modifier=be.name);o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 return add(o,b,form)
def eyes(x=.185,y=1.825,z=.3,sz=1):
 for s in [-1,1]:
  ball('EyeWhite',(s*x,y,z),(.10*sz,.125*sz,.052),white);ball('AmberIris',(s*x,y-.004,z+.047),(.063*sz,.085*sz,.024),iris);ball('Pupil',(s*x,y,z+.063),(.035*sz,.064*sz,.013),ink);ball('Glint',(s*x-.018,y+.035,z+.077),(.018,.022,.009),white)
def face_mouth(y=1.60,z=.32):
 pipe('Smile',[(-.10,y+.03,z),(-.055,y,z+.025),(0,y-.01,z+.03),(.055,y,z+.025),(.10,y+.03,z)],.011,ink)
def cape(mat,b='Spine',form=1):
 verts=[v((x,y,z)) for x,y,z in [(-.27,1.46,-.18),(.27,1.46,-.18),(-.42,.68,-.36),(.42,.68,-.36),(-.25,.64,-.42),(.25,.64,-.42)]]
 me=bpy.data.meshes.new('Cape');me.from_pydata(verts,[],[(0,1,3,2),(2,3,5,4)]);me.materials.append(mat);o=bpy.data.objects.new('Cape',me);bpy.context.collection.objects.link(o);so=o.modifiers.new('Cloth thickness','SOLIDIFY');so.thickness=.015;su=o.modifiers.new('Soft folds','SUBSURF');su.levels=2;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=so.name);bpy.ops.object.modifier_apply(modifier=su.name);return add(o,b,form)
def shoes(mat,form=1):
 for s,side in [(-1,'L'),(1,'R')]:
  ball('RunnerBoot',(s*.19,.16,.14),(.177,.145,.257),mat,'Foot.'+side,form);pipe('GoldSole',[(s*.19+math.cos(i*math.tau/24)*.16,.07,.14+math.sin(i*math.tau/24)*.23) for i in range(24)],.018,gold,'Foot.'+side,form,True)
def shirt(mat,form=1):
 ball('TailoredVest',(0,1.25,.018),(.345,.29,.265),mat,'Spine',form)
 for s,side in [(-1,'L'),(1,'R')]:add(capsule('Sleeve',(s*.32,1.38,0),(s*.39,1.25,0),.139,mat),'UpperArm.'+side,form)
def tuft(pos,sz,mat=fur,form=1):
 o=cone('SweptFur',pos,sz*.55,.005,sz*1.8,mat,'Head',form);o.rotation_euler.x=-.35;return o
# Steps keeps the approved runner identity; every form gains visible equipment.
active=list(base_objects)
shirt(green);shoes(green);band('G_Headband',(0,1.96,.01),.438,.333,.034,green);glyph('Headband_G','G',(0,1.963,.358),.15,gold);glyph('Chest_G','G',(0,1.27,.294),.20,gold,'Spine')
for x,y,z,s in [(-.4,1.89,-.12,.18),(.4,1.89,-.12,.18),(0,2.12,-.2,.20)]:tuft((x,y,z),s)
for side,s in [('L',-1),('R',1)]:
 band('AnkleTrim',(s*.19,.24,.055),.137,.14,.022,gold,'Foot.'+side,2)
 ball('GoldGlove',(s*.64,.94,.025),(.125,.145,.115),green,'Hand.'+side,3)
 band('RunnerBelt',(0,1.025,0),.31,.26,.03,gold,'Hips',4)
 ball('ScoutPack',(0,1.28,-.32),(.23,.27,.13),navy,'Spine',5)
 ball('SprintHeel',(s*.19,.15,-.13),(.12,.08,.07),cyan,'Foot.'+side,6)
 ball('StormShoulder',(s*.34,1.43,-.01),(.16,.095,.17),gold,'UpperArm.'+side,7)
 pipe('SkyFin',[(s*.18,.20,-.10),(s*.27,.31,-.22),(s*.3,.13,-.12)],.023,cyan,'Foot.'+side,8)
 band('AstralWrist',(s*.63,.96,.025),.127,.12,.025,purple,'Hand.'+side,9)
for s in [-1,1]:
 for i in range(3):ball('Laurel',(s*(.22+i*.065),2.08-i*.025,.19),(.055,.09,.025),gold,'Head',10)
cone('SunCrown',(0,2.27,-.015),.10,.005,.22,gold,'Head',10)
# Entry-form sleepy lids are hidden when the runner awakens.
for s in [-1,1]:
 o=ball('SleepyLid',(s*.185,1.89,.34),(.095,.060,.035),fur,'Head');o['only_form']=1
# Stronger runner silhouette and readable jade sportswear.
for o in list(active):
 if o.name.startswith('Belly'):
  active.remove(o);bpy.data.objects.remove(o,do_unlink=True)
for o in active:
 if o.name=='Fox_Skin':
  inv=o.matrix_world.inverted()
  for ve in o.data.vertices:
   w=o.matrix_world@ve.co
   if w.z>2.0:
    t=min(1,(w.z-2)/.40);center=.32*(1 if w.x>0 else -1);w.x=center+(w.x-center)*(1-.90*t);w.z=2+(w.z-2)*.72;ve.co=inv@w
 if o.name.startswith('InnerEar'):o.scale.z*=.65
pipe('Jacket_Zip',[(0,1.04,.282),(0,1.48,.282)],.012,gold,'Spine')
for s in [-1,1]:
 ball('Runner_Shorts',(s*.16,.95,.005),(.17,.16,.25),green,'Thigh.'+('L' if s<0 else 'R'))
 for i in range(3):
  o=tuft((s*(.42+i*.035),1.87-i*.13,-.12-i*.02),.17+i*.025,fur,1);o.rotation_euler.y=-s*.7
 for i in range(3):
  o=tuft((s*(.32+i*.06),1.9-i*.14,-.24-i*.015),.21,cyan,6+i);o.rotation_euler.y=-s*.8
band('Solar_Halo',(0,2.37,-.035),.48,.35,.018,gold,'Head',10)
all_report=[]
def merge_active():
 global active
 buckets={}
 for o in active:buckets.setdefault((o.get('unlock_form',1),o.get('only_form',0)),[]).append(o)
 merged=[]
 for (unlock,only),items in buckets.items():
  bpy.ops.object.select_all(action='DESELECT')
  for o in items:o.select_set(True)
  bpy.context.view_layer.objects.active=items[0]
  if len(items)>1:bpy.ops.object.join()
  o=bpy.context.object;o['unlock_form']=unlock
  if only:o['only_form']=only
  merged.append(o)
 active=merged
def export(key,animations=False):
 merge_active()
 bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
 for o in active:o['companion']=key;o.select_set(True)
 bpy.context.view_layer.objects.active=rig;rig.animation_data.action=None
 for p in rig.pose.bones:p.matrix_basis.identity()
 bpy.context.view_layer.update()
 path=out/(key+'.glb');bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=animations,export_animation_mode='ACTIONS',export_force_sampling=True,export_extras=True)
 all_report.append({'key':key,'bytes':path.stat().st_size,'meshes':len(active),'vertices':sum(len(o.data.vertices) for o in active),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in active),'rigged':True})
def union(parts,name='Skin'):
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();o=bpy.context.object;o.name=name
 r=o.modifiers.new('Organic surface','REMESH');r.mode='VOXEL';r.voxel_size=.04;r.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=r.name);sm=o.modifiers.new('Silhouette','SMOOTH');sm.factor=.75;sm.iterations=4;bpy.ops.object.modifier_apply(modifier=sm.name);de=o.modifiers.new('Game budget','DECIMATE');de.ratio=.50;bpy.ops.object.modifier_apply(modifier=de.name)
 for p in o.data.polygons:p.use_smooth=True
 skin(o);active.append(o);return o
def humanoid(key,mat,head=(.40,.35,.31),bodyshape=(.30,.34,.24),ear=None,muscle=False):
 parts=[]
 for n,pos,sc in [('Hips',(0,1,0),(.29,.23,.23)),('Torso',(0,1.27,0),bodyshape),('Neck',(0,1.52,0),(.17,.16,.17)),('Head',(0,1.79,.01),head)]:parts.append(ell(n,pos,sc,mat))
 for side,s in [('L',-1),('R',1)]:
  for n,a,b,r in [('UpperArm',(s*.3,1.4,0),(s*.48,1.16,0),.15 if muscle else .12),('Forearm',(s*.48,1.16,0),(s*.62,.96,.02),.12 if muscle else .10),('Thigh',(s*.18,1,0),(s*.19,.57,.01),.16),('Shin',(s*.19,.57,.01),(s*.19,.14,.05),.12)]:parts.append(capsule(n+'.'+side,a,b,r,mat))
  parts.append(ell('Hand',(s*.64,.94,.025),(.12,.14,.11),mat));parts.append(ell('Foot',(s*.19,.12,.12),(.16,.13,.24),mat))
  if ear:parts.append(ell('Ear',(s*.32,2.06,-.02),ear,mat))
 if muscle:
  for s in [-1,1]:parts.append(ell('Pectoral',(s*.155,1.37,.18),(.2,.17,.13),mat))
 o=union(parts,key+'_Skin');return o
def human_face(hairmat):
 eyes(.15,1.82,.29,.88);ball('Nose',(0,1.72,.33),(.045,.06,.052),peach);face_mouth(1.63,.30)
 # Sculpted overlapping curls form a smooth hair silhouette behind the face.
 hs=[]
 for i in range(11):
  a=i*math.tau/11;hs.append(ell('HairCurl',(.34*math.cos(a),1.96+.10*math.sin(a),-.05-.16*abs(math.sin(a))),(.14,.16,.13),hairmat))
 h=union(hs,'Sculpted_Hair');h.modifiers.clear();h.vertex_groups.clear();skin(h,'Head')
# Lighting / camera used for true geometry contact sheets, not generated screenshots.
scene.render.engine='CYCLES';scene.cycles.samples=8;scene.cycles.use_denoising=False;scene.cycles.device='CPU';scene.render.resolution_x=384;scene.render.resolution_y=384;scene.render.resolution_percentage=100;scene.world.color=(.08,.09,.12);scene.render.film_transparent=True
def light(pos,power,size):
 d=bpy.data.lights.new('Softbox','AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new('Softbox',d);bpy.context.collection.objects.link(o);o.location=v(pos);o.rotation_euler=(v((0,1,0))-o.location).to_track_quat('-Z','Y').to_euler()
light((3,5,4),500,4);light((-3,3,2),220,3);light((1,3,-4),400,3)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.01));floor=bpy.context.object;floor.data.materials.append(material('Review Ground',(.065,.09,.15)));floor.hide_render=True
bpy.ops.object.camera_add(location=v((3,2.2,5.5)));cam=bpy.context.object;cam.rotation_euler=(v((0,1.15,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.95;scene.camera=cam
export('walking',True)
for form in range(1,11):
 for o in active:o.hide_render=bool(o.get('unlock_form',1)>form or (o.get('only_form') and o.get('only_form')!=form))
 scene.render.filepath=str(out/('walking-form-%02d.png'%form));bpy.ops.render.render(write_still=True)
for o in active:bpy.data.objects.remove(o,do_unlink=True)
selected=set(sys.argv[sys.argv.index('--')+2].split(',')) if len(sys.argv)>sys.argv.index('--')+2 else None
for key in ['budgeting','sleep','nutrition','teeth','household','meditation','gratitude','good_deed','screen_time','workout','discipline']:
 if selected and key not in selected:continue
 active=[]
 if key=='budgeting':
  humanoid(key,brown,head=(.48,.40,.32),bodyshape=(.34,.36,.27),ear=(.12,.19,.10));shirt(purple)
  for s in [-1,1]:
   ball('Owl_Facial_Disc',(s*.19,1.80,.28),(.23,.29,.075),cream);pipe('Spectacle',[(s*.19+.155*math.cos(i*math.tau/32),1.82+.17*math.sin(i*math.tau/32),.375) for i in range(32)],.014,gold,closed=True)
  eyes(.19,1.82,.34,1.15);o=cone('Owl_Beak',(0,1.65,.43),.09,.015,.18,gold);o.rotation_euler.x=math.pi/2;rounded('Budget_Ledger',(.68,1.08,.20),(.13,.18,.05),purple,'Hand.R');glyph('LedgerMark','G',(.68,1.08,.26),.13,gold,'Hand.R');glyph('Waistcoat_G','G',(0,1.23,.31),.16,gold,'Spine')
 elif key=='sleep':
  humanoid(key,peach,head=(.37,.34,.30));human_face(brown);shirt(navy);shoes(navy)
  
  ball('Pajama_Hip',(0,1.00,0),(.31,.24,.26),navy,'Hips')
  for side,sign in [('L',-1),('R',1)]:
   add(capsule('Pajama_Upper',(sign*.18,.98,0),(sign*.19,.57,.01),.166,navy),'Thigh.'+side)
   add(capsule('Pajama_Lower',(sign*.19,.57,.01),(sign*.19,.22,.05),.132,navy),'Shin.'+side)
  cone('Velvet_Nightcap',(0,2.10,-.01),.36,.05,.40,purple);ball('Cap_Pompom',(.05,2.34,-.04),(.09,.09,.09),gold);glyph('Moon_Pajamas','*',(0,1.27,.29),.18,gold,'Spine')
 elif key=='nutrition':
  humanoid(key,orange,head=(.35,.37,.30),bodyshape=(.34,.33,.27));eyes(.145,1.83,.29,.9);face_mouth(1.63,.30)
  for s in [-1,0,1]:ball('Sprouting_Leaves',(s*.11,2.19,-.01),(.07,.21,.055),leaf)
  rounded('Garden_Basket',(0,1.16,.28),(.24,.17,.08),brown,'Spine')
  for i,m in enumerate([red,leaf,gold]):ball('Harvest',(i*.135-.135,1.24,.38),(.082,.082,.075),m,'Spine')
  cape(leaf);shoes(leaf)
 elif key=='teeth':
  humanoid(key,white,head=(.38,.35,.25));lobes=[ell('Molar_Crown',(s*.18,1.92,.01),(.25,.30,.26),white) for s in [-1,1]];o=union(lobes,'Molar_Crown');o.modifiers.clear();o.vertex_groups.clear();skin(o,'Head');eyes(.15,1.82,.26,.9);face_mouth(1.62,.26);cape(cyan);shoes(cyan);glyph('ToothHero','*',(0,1.34,.265),.19,gold,'Spine');pipe('Toothbrush_Handle',[(-.66,.95,.12),(-.68,1.55,.12)],.025,cyan,'Hand.L');rounded('Toothbrush_Bristles',(-.68,1.57,.13),(.06,.12,.055),white,'Hand.L')
 elif key=='household':
  humanoid(key,peach,head=(.35,.34,.29));human_face(black);shirt(navy);cone('Maid_Skirt',(0,1.00,0),.36,.26,.36,navy,'Hips');ball('Linen_Apron',(0,1.17,.265),(.22,.27,.035),white,'Spine')
  for i in range(9):ball('Lace_Cap',((i-4)*.075,2.04+.10*math.sin(i/8*math.pi),.04),(.06,.08,.04),white)
  
  for side,sign in [('L',-1),('R',1)]:
   add(capsule('Stocking',(sign*.19,.56,.01),(sign*.19,.15,.05),.126,black),'Shin.'+side)
  shoes(black)
  pipe('Duster_Handle',[(.65,.93,.12),(.65,1.45,.12)],.018,gold,'Hand.R')
  for s in [-1,0,1]:ball('Feather_Duster',(.65+s*.045,1.52,.12),(.06,.15,.055),purple,'Hand.R')
 elif key=='meditation':
  o=humanoid(key,white,head=(.43,.36,.29),ear=(.14,.14,.10));o.data.materials.append(black)
  for f in o.data.polygons:
   p=o.matrix_world@f.center
   if (abs(p.x)>.34 and p.z<1.5) or p.z<.98:f.material_index=len(o.data.materials)-1
  for s in [-1,1]:ball('Panda_Ear',(s*.32,2.07,-.02),(.14,.14,.105),black);ball('Panda_EyePatch',(s*.16,1.81,.27),(.13,.15,.05),black)
  eyes(.16,1.82,.31,.75);ball('Panda_Nose',(0,1.68,.32),(.065,.043,.035),black);face_mouth(1.62,.29);shirt(purple)
  for i in range(12):ball('Meditation_Bead',(.24*math.cos(i*math.tau/12),1.43+.04*math.sin(i*math.tau/12),.23),(.027,.027,.026),gold,'Spine')
 elif key=='gratitude':
  humanoid(key,gold,head=(.32,.35,.25),bodyshape=(.25,.32,.20));eyes(.13,1.81,.24,.85);face_mouth(1.62,.25)
  for s in [-1,0,1]:o=cone('Gratitude_Flame',(s*.10,2.12+(s==0)*.08,0),.11,.005,.40,gold);o.rotation_euler.y=s*.25
  for i in range(7):a=i*math.tau/7;ball('Lotus_Petal',(.28*math.cos(a),.86,.17*math.sin(a)),(.15,.075,.10),gold,'Hips')
 elif key=='good_deed':
  humanoid(key,red,head=(.32,.28,.23));lobes=[ell('Heart_Lobe',(s*.19,1.92,.02),(.27,.27,.27),red) for s in [-1,1]];lobes.append(ell('Heart_Point',(0,1.62,.02),(.25,.22,.24),red));o=union(lobes,'Heart_Silhouette');o.modifiers.clear();o.vertex_groups.clear();skin(o,'Head');eyes(.17,1.84,.27,.95);face_mouth(1.63,.25);cape(red);shirt(navy);shoes(gold);glyph('GoodDeed_G','G',(0,1.24,.31),.19,gold,'Spine')
 elif key=='screen_time':
  humanoid(key,navy,head=(.29,.25,.24));rounded('Robot_Housing',(0,1.82,.02),(.40,.32,.27),gold);rounded('Glass_Display',(0,1.82,.29),(.34,.25,.035),black)
  for s in [-1,1]:pipe('LED_Eye',[(s*.145+.055*math.cos(i*math.tau/24),1.83+.08*math.sin(i*math.tau/24),.335) for i in range(24)],.013,cyan,closed=True);ball('Robot_Ear',(s*.43,1.82,.01),(.06,.13,.13),gold)
  pipe('LED_Smile',[(-.09,1.72,.336),(0,1.69,.34),(.09,1.72,.336)],.013,cyan);pipe('Antenna',[(0,2.12,0),(0,2.29,0)],.018,gold);ball('Signal',(0,2.31,0),(.06,.06,.06),cyan);rounded('Robot_Chest',(0,1.25,.06),(.27,.25,.23),navy,'Spine');glyph('Robot_G','G',(0,1.25,.30),.18,cyan,'Spine')
 elif key=='workout':
  humanoid(key,peach,head=(.35,.34,.28),muscle=True);human_face(brown);rounded('Training_Shorts',(0,.98,0),(.29,.17,.24),black,'Hips');band('Athlete_Headband',(0,1.96,.01),.34,.29,.028,black);glyph('Athlete_G','G',(0,1.96,.315),.13,gold);band('Shorts_Trim',(0,1.04,0),.30,.25,.018,gold,'Hips')
 elif key=='discipline':
  humanoid(key,peach,head=(.35,.34,.28));human_face(cream);shirt(white);cape(purple);shoes(white);band('Guardian_Circlet',(0,1.99,.01),.35,.28,.025,gold);glyph('Guardian_G','G',(0,1.26,.29),.16,gold,'Spine');
  for s in [-1,1]:ball('Guardian_Pauldron',(s*.33,1.44,0),(.15,.09,.17),gold,'UpperArm.'+('L' if s<0 else 'R'))
 export(key)
 scene.render.filepath=str(out/(key+'.png'));bpy.ops.render.render(write_still=True)
 for o in active:bpy.data.objects.remove(o,do_unlink=True)
(out/'crew-build-report.json').write_text(json.dumps(all_report,indent=2));print('QUEST_CREW_COMPLETE',json.dumps(all_report))
