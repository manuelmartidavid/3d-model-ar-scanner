import bpy, sys, mathutils

argv = sys.argv[sys.argv.index("--") + 1:]
stl_in, glb_out = argv[0], argv[1]
target_tris = int(argv[2]) if len(argv) > 2 else 150000

# Empty scene (drops default cube/camera/light)
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import STL (Blender 4.2+/5.x native importer)
bpy.ops.wm.stl_import(filepath=stl_in)

meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
assert meshes, "no mesh imported"
obj = meshes[0]
bpy.context.view_layer.objects.active = obj
for o in bpy.context.scene.objects:
    o.select_set(o is obj)

orig_tris = len(obj.data.polygons)

# Scale mm -> m (STL authored in mm; GLB must be true metric, 1 unit = 1 m)
obj.scale = (0.001, 0.001, 0.001)
bpy.ops.object.transform_apply(scale=True, location=False, rotation=False)

# Center on floor: X/Y centered, bottom at Z=0 (Blender Z-up; exporter converts to Y-up)
coords = [obj.matrix_world @ mathutils.Vector(c) for c in obj.bound_box]
minx = min(c.x for c in coords); maxx = max(c.x for c in coords)
miny = min(c.y for c in coords); maxy = max(c.y for c in coords)
minz = min(c.z for c in coords)
obj.location.x -= (minx + maxx) / 2
obj.location.y -= (miny + maxy) / 2
obj.location.z -= minz
bpy.ops.object.transform_apply(location=True)

# Decimate to target triangle budget for mobile
if orig_tris > target_tris:
    mod = obj.modifiers.new("dec", 'DECIMATE')
    mod.decimate_type = 'COLLAPSE'
    mod.ratio = max(0.01, target_tris / orig_tris)
    bpy.ops.object.modifier_apply(modifier="dec")

bpy.ops.object.shade_smooth()

# Neutral print-gray material (matte, non-metallic)
mat = bpy.data.materials.new("print_gray")
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.72, 0.72, 0.74, 1.0)
bsdf.inputs["Roughness"].default_value = 0.72
bsdf.inputs["Metallic"].default_value = 0.0
obj.data.materials.clear()
obj.data.materials.append(mat)

final_tris = len(obj.data.polygons)

# Export GLB, Draco-compressed, Y-up
bpy.ops.export_scene.gltf(
    filepath=glb_out,
    export_format='GLB',
    export_yup=True,
    export_apply=True,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)

dims = obj.dimensions
print(f"[stl_to_glb] tris {orig_tris} -> {final_tris}; "
      f"GLB dims (m) X={dims.x:.4f} Y={dims.y:.4f} Z={dims.z:.4f}")
