# models/ — Desk AI Robot

No GLB here yet. That is fine: the viewer falls back to the procedural
parts built from `build.json`, so the guide works today.

To upgrade to a real model:

1. Open Blender 4.x, Scripting workspace.
2. Open `../template/blender-parts.py` and run it.
3. Copy the exported `desk-ai-robot.glb` into this folder.
4. Reload `index.html`. The viewer swaps each GLB node in place of the
   procedural part when the node name matches a part id in `build.json`.

Do not rename the nodes. Names are the join between the model and the
step data: breadboard, xiao, oled, mic, amp, speaker, usb.
