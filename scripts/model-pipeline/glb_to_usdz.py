import bpy, sys

argv = sys.argv[sys.argv.index("--") + 1:]
glb_in, usdz_out = argv[0], argv[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_in)

# Quick Look expects Y-up + meters. GLB is already metric (metersPerUnit=1).
def export(**extra):
    bpy.ops.wm.usd_export(filepath=usdz_out, export_materials=True, **extra)

try:
    export(convert_orientation=True,
           export_global_up_selection='Y',
           export_global_forward_selection='NEGATIVE_Z')
except TypeError as e:
    print("[glb_to_usdz] orientation args rejected, retrying plain:", e)
    export()

print("[glb_to_usdz] exported", usdz_out)
