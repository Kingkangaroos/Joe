"""CPU visual review of the actual exported Three.js game scene.
blender -b --python tools/render_quest_world.py -- /absolute/world.glb /absolute/review.png
"""
import bpy,math,sys
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=args[0])
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=16;s.cycles.use_denoising=False;s.cycles.device='CPU';s.render.resolution_x=1280;s.render.resolution_y=840;s.render.resolution_percentage=100;s.world.color=(.13,.16,.23)
for pos,power,size in [((5,5,14),1800,8),((-8,2,10),1600,10),((0,-9,12),2100,10)]:
 d=bpy.data.lights.new('Review light','AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new('Review light',d);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(9,-17,11));cam=bpy.context.object;cam.rotation_euler=(Vector((0,-5,.65))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='PERSP';cam.data.angle=math.radians(43);cam.data.clip_end=100;s.camera=cam;s.render.filepath=args[1];bpy.ops.render.render(write_still=True)
