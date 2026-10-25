# How to add a new build — 5 steps, no viewer changes

The viewer never changes per build. Only `build.json` changes, plus an
optional GLB. Copy the template folder and edit the data.

## 1. Copy the template

```
cp -r template/ my-new-build/
cd my-new-build/
```

You now have `index.html`, `viewer.js`, `viewer.css`, `build.json`,
`blender-parts.py`. Delete `blender-parts.py` from here if you will not
model this build in Blender yet; the procedural parts carry the guide.

## 2. List the parts

Each part in `build.json` needs:

- `id`: short, no spaces. This is the join key everywhere: steps,
  wires, and GLB node names all use it.
- `name`, `qty`, `color` (hex), `notes` (one line, what the student
  must not get wrong about this part).
- `shape`: `box` with `size: [x, y, z]`, `cylinder` with
  `radius` and `height`, or `sphere` with `radius`. Units are cm.
- `position`: `[x, y, z]` in cm, centre of the part. Y is up.
  Put the biggest part at the origin first, then lay the rest around it.
- `explode`: `[x, y, z]` direction the part flies in exploded view.
  Up is `[0, 2, 0]`. Parts that stay put get `[0, 0, 0]`.
- `firstStep`: the step number where this part first appears.

Measure the real part with a ruler or calipers and write the real
numbers in. Do not eyeball from a photo. That is exactly the mistake
Flat Pack's maker warns about on BILLY.

## 3. Write the steps

One step equals one assembly action. Each step needs:

- `title`: the action, in verb form. "Seat the XIAO", not "XIAO".
- `text`: two or three sentences max. What to do, in order.
- `tip`: optional, the one mistake students actually make here.
- `add`: part ids that appear in this step.
- `highlight`: part ids that glow in this step. Usually the same as
  `add`, or the parts the step is about.
- `hardware`: what this step consumes, as short strings.
- `camera`: `pos` and `target`, `[x, y, z]` in cm. Each step starts
  at this fixed angle, then the student orbits freely. Pick the angle
  that shows the connection being made, not the prettiest angle.
- `manualRef`: where this step lives in the paper manual, wiring
  table, or plan, so the 3D guide never becomes the only source.

Step 0 is always "What is in the box", with `add: []`. Steps are
numbered 0 to 9 on the keyboard, so keep a build to 10 steps or fewer.
If a build needs more, split it into two guides (mechanical, then
wiring) rather than a 20-step scroll.

## 4. Add the wires (optional, but do it for electronics)

Each wire in `build.json` needs `from` and `to` points in cm,
a `color`, a `sag` (how high the arc rises, 0.5 to 1.0 reads well),
and the `step` it appears on. Endpoints should sit on the parts they
connect, roughly where the pin is. The arc is a visual lie, the wire
in real life will not arc that neatly, but the endpoints and the color
are the truth, and those are what students check.

## 5. Serve it and test it

```
python3 -m http.server 8123
```

Open `http://localhost:8123/my-new-build/`. Walk every step. Check:
every part appears on the right step, every camera preset shows the
connection, explode does not throw a part through the floor, and the
Drawing view is readable. Then fix the numbers in `build.json` and
reload. No rebuild step, no deploy.

## Optional: the pretty model

1. Copy the part list into `blender-parts.py` (same ids, positions,
   sizes). Run it in Blender 4.x. It exports a GLB.
2. Put the GLB in `models/` and set `"model": "models/<name>.glb"`
   in `build.json`. Node names must match part ids exactly.
3. Reload. The viewer swaps GLB nodes in for the procedural parts.
   If the GLB is missing or a name does not match, the procedural
   part stays. Nothing breaks.

## What not to do

- Do not put pin numbers only in the 3D scene. Pins live in the
  wiring table and in the step text. The model shows where, the
  table says which.
- Do not model screws, headers, or pin rows at real scale unless the
  step is about them. A box with a correct outline beats a detailed
  model with wrong measurements.
- Do not let a build pass 10 steps. Split it.
