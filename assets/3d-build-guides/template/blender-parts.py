# Blender parts builder for the AA8 3D Build Guides
# Run inside Blender: Scripting workspace > Open this file > Run Script.
# Blender 4.x, no add-ons needed.
#
# What this does: builds every part in the Desk AI Robot as a separate
# named mesh, in the same positions and sizes as build.json, and exports
# desk-ai-robot.glb. The viewer (template/viewer.js) loads that GLB when
# it exists and swaps each named node in place of the procedural box.
# No GLB yet? The viewer falls back to the procedural parts, so the
# guide still works. This script is the upgrade path to a pretty model,
# not a blocker.
#
# Units: CENTIMETRES, to match build.json exactly. Do not change the
# scale on export, or the GLB nodes will not line up with the viewer.
# Naming: object names must match the part ids in build.json exactly
# (breadboard, xiao, oled, mic, amp, speaker, usb). The explode
# direction is stored on each object as a custom property ("explode"),
# same numbers as build.json.
#
# To make a new build: copy this file, replace the PARTS list with the
# parts from that build's build.json (same ids, positions, sizes), and
# change OUTPUT. Nothing else in the viewer changes.

import bpy

# ---------------------------------------------------------------- params
# size: [x, y, z] in cm for boxes, [radius, height] for cylinders.
# position: [x, y, z] in cm, centre of the part (same as build.json).
# explode: [x, y, z] direction the part flies in exploded view.
PARTS = [
    {"id": "breadboard", "kind": "box", "size": [8.5, 1.0, 5.5],
     "position": [0, 0.5, 0], "explode": [0, -0.6, 0],
     "color": (0.96, 0.95, 0.92, 1.0)},
    {"id": "xiao", "kind": "box", "size": [2.1, 0.3, 1.75],
     "position": [-2.2, 1.15, -0.8], "explode": [0, 2.2, 0],
     "color": (0.08, 0.13, 0.18, 1.0)},
    {"id": "oled", "kind": "box", "size": [2.7, 0.4, 2.7],
     "position": [2.2, 1.2, -1.2], "explode": [1.5, 2.2, 0],
     "color": (0.07, 0.07, 0.07, 1.0)},
    {"id": "mic", "kind": "cylinder", "size": [0.9, 0.25],
     "position": [2.2, 1.15, 1.4], "explode": [1.5, 2.2, 0],
     "color": (0.18, 0.44, 0.31, 1.0)},
    {"id": "amp", "kind": "box", "size": [2.5, 0.3, 1.8],
     "position": [-2.2, 1.15, 1.5], "explode": [-1.5, 2.2, 0],
     "color": (0.29, 0.24, 0.56, 1.0)},
    {"id": "speaker", "kind": "cylinder", "size": [1.8, 0.5],
     "position": [6.2, 0.25, 0.8], "explode": [2.5, 0, 0.5],
     "color": (0.10, 0.10, 0.10, 1.0)},
    {"id": "usb", "kind": "box", "size": [3.0, 0.35, 0.7],
     "position": [-4.9, 1.15, -0.8], "explode": [-3, 0, 0],
     "color": (0.13, 0.13, 0.13, 1.0)},
]

OUTPUT = "//desk-ai-robot.glb"  # next to the .blend file

# ---------------------------------------------------------------- helpers
def clean_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.curves, bpy.data.materials,
                  bpy.data.cameras, bpy.data.lights):
        for item in list(block):
            if item.users == 0:
                block.remove(item)

def make_material(name, color, roughness=0.5, metallic=0.15):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat

def build_part(p):
    mat = make_material(p["id"], p["color"])
    if p["kind"] == "cylinder":
        radius, height = p["size"]
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=radius,
                                            depth=height,
                                            location=p["position"])
    else:
        bpy.ops.mesh.primitive_cube_add(location=p["position"])
        obj = bpy.context.active_object
        obj.scale = (p["size"][0] / 2, p["size"][1] / 2, p["size"][2] / 2)
        bpy.ops.object.transform_apply(location=False, rotation=False,
                                       scale=True)
        obj.data.materials.append(mat)
        obj.name = p["id"]
        obj["explode"] = p["explode"]
        return obj
    obj = bpy.context.active_object
    obj.data.materials.append(mat)
    obj.name = p["id"]
    obj["explode"] = p["explode"]
    return obj

def build(parts):
    clean_scene()
    made = [build_part(p) for p in parts]
    bpy.ops.object.empty_add(location=(0, 0, 0))
    root = bpy.context.active_object
    root.name = "DeskAIRobot"
    for obj in made:
        obj.parent = root
    tris = sum(len(o.data.polygons) for o in made)
    print(f"Desk AI Robot built: {len(made)} parts, ~{tris} triangles")
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    bpy.ops.export_scene.gltf(filepath=bpy.path.abspath(OUTPUT),
                              export_format="GLB",
                              use_selection=False,
                              export_apply=True)
    print(f"Exported: {bpy.path.abspath(OUTPUT)}")
    print("Copy the .glb into desk-ai-robot/models/ and reload the guide.")
    return root

if __name__ == "__main__":
    build(PARTS)
