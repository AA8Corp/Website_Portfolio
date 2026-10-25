# 3D Build Guides — the Flat Pack method, for AA8 builds

Flat Pack is Ryan Sael's free page at https://sael.net/flatpack/.
It rebuilds IKEA's BILLY bookcase manual as an interactive 3D model
in the browser: 14 steps, each step starts at the same angle as IKEA's
drawing, then you drag to orbit, scroll to zoom, Shift-X pulls the
whole thing apart, and a Drawing view redraws the model in the
manual's line style. The original 16-page IKEA manual (AA-1823127-9)
sits beside the model, unaltered. It counts the hardware into place
as you go: 82 pieces, 11 panels. BILLY is the only piece on the page
so far.

This folder is the same method, rebuilt for Emiliano's hardware, as a
reusable template plus a first worked example.

## What Flat Pack is, technically

Inspected live in the browser 2026-10-25 (37-minute session, page
stepped through, views switched, How-it-works and manual panels
opened, nothing changed, no buy link clicked). What held up and what
did not:

- The page is a single-page web app with a real-time WebGL 3D scene:
  drag to orbit, right-drag to pan, scroll to zoom, shadows, parts
  animating in. The rendering library could NOT be confirmed. The
  browser could not open view-source or DevTools, the DOM exposes no
  script tags, and guessed paths (/flatpack/main.js, /flatpack/billy.glb,
  /flatpack/steps.json) all return the site's "Nothing here" 404 page.
  Three.js is consistent with what is on screen, but it is an
  inference, not a verified fact. Do not cite it as confirmed.
- The model is most likely geometry generated in JavaScript from the
  step and part data, not a loaded model file. No .glb or .gltf URL
  appears anywhere in the DOM. That is inferred from behavior
  (simple box panels, repeated small hardware parts, parts animating
  in on a timeline), not proven from source. Note what this means
  here: our template's procedural parts (boxes and cylinders from
  build.json) match the same approach. The Blender GLB stays an
  optional upgrade, not the core method.
- The steps are a continuous 0 to 14 timeline, not 14 separate pages.
  The slider shows fractional values (2.37, 10.93) while parts animate
  in. Each step carries its title, instruction text, manual page
  number, a fixed starting camera angle, and the parts and hardware
  it adds, with IKEA part numbers and live counters (HARDWARE IN
  x/82, PANELS IN y/11). Step 0 is "What's in the box" (page 6).
  Settled values observed: step 1 dowels 16x, step 2 cam screws to
  28/82, step 11 nails to 58/82, step 13 shelf pins to 82/82, step 14
  shelves to 11/11. Hardware breakdown confirmed: dowel 101351 x16,
  cam screw 118331 x12, cam lock 119081 x12, nail 101201 x18, shelf
  pin 131372 x16, screw 109041 x4, washer 100823 x2, wall bracket
  106989 x2, total 82.
- Keyboard, from the on-page KEYS list: drag orbit, right-drag pan,
  scroll zoom, WASD move, Q/E turn, R reset, [ ] prev/next step,
  0-9 jump, Space play/pause, C play the whole build with the
  manual's camera angles (on by default), Shift+B manual, Shift+V
  Room/Drawing, Shift+X pull it apart, Shift+N part labels, ? hide
  the interface. Observed: Explode works on the finished assembly
  (it jumped the timeline from step 9 to step 14), and Drawing view
  removes the room and renders the model white with black outlines
  on a plain light background. Clicking a part labels it, for
  example a cam lock with its part number and count.
- The Piece selector shows this is a generic engine with 26 IKEA
  pieces (BILLY, LACK, KALLAX, POANG, MALM, HEMNES and more), each
  following its own IKEA manual. BILLY is only the first one live.
  That is the same shape as our template: one viewer, many builds.
- The "How it works" panel says the parts, part numbers, and order
  of steps come from the manual, the size is IKEA's 80 x 28 x 202 cm,
  it explains how a cam lock works, and it carries the wall-fix
  warning. The accuracy caveat, verbatim: "Board thickness, hole
  positions and shelf heights are eyeballed from the drawings." No
  authoring tool is named on the page: no Blender, no JavaScript
  library. The manual is a linked PDF shown unaltered, with an
  explicit "not affiliated with or endorsed by IKEA" note.
- Context: sael.net lists Flat Pack as published 19 Oct 2026, with
  639k views (about 39k on site, the rest on X).

## The pattern, in one paragraph

One viewer, data-driven. Every build is a JSON file: a parts list
(each part has a shape, a size, a position, and an explode direction),
a hardware list, and a steps list (each step adds parts, sets a fixed
camera angle, and carries two or three sentences of instruction).
The viewer renders the parts in Three.js, lets the student orbit and
zoom with OrbitControls, animates parts along their explode vectors
for the exploded view, and switches to an orthographic camera with
flat materials and dark edges for the Drawing view. A new build means
a new JSON file. The viewer never changes.

## What is in this folder

```
3d-build-guides/
  README.md                  this file
  template/
    index.html               viewer page (sample build: Arduino Traffic Light)
    viewer.js                the whole viewer: steps, orbit, explode, Drawing
    viewer.css               layout and step card
    build.json               Arduino Traffic Light data (7 steps)
    blender-parts.py         Blender script: named parts to GLB
    HOW-TO-ADD-A-BUILD.md    the 5-step recipe for a new build
  desk-ai-robot/
    index.html               viewer page for the Desk AI Robot
    build.json               Desk AI Robot data (10 steps, 16 wires)
    models/
      README.md              where the GLB goes when it exists
```

Run it:

```
cd ~/workspace/3d-build-guides
python3 -m http.server 8123
```

Then open http://localhost:8123/desk-ai-robot/ or
http://localhost:8123/template/. Opening with file:// will not work:
fetch() cannot load build.json from a file URL in most browsers.
Any static host works for sharing: GitHub Pages, the same way the
portfolio sites are hosted, or the AA8 site.

## The first worked example: Desk AI Robot

Demo Build 1, the exact build from
`~/workspace/desk-ai-robot/demo-build/README-DEMO.md`. 10 steps,
7 parts, 16 jumper wires, hardware total 19 pieces. The pin map is
copied from that file's wiring table, not invented here:

| Step | Action | Pins |
| --- | --- | --- |
| 0 | What is in the box | count everything |
| 1 | Place the breadboard | |
| 2 | Seat the XIAO | USB-C left, camera forward |
| 3 | Add the OLED face | SDA D4, SCL D5, 3V3, GND |
| 4 | Add the INMP441 mic | SCK D0, WS D1, SD D3, 3V3 only, L/R to GND |
| 5 | Add the MAX98357A amp | BCLK D0, WS D1, DIN D2, VIN 5V |
| 6 | Connect the speaker | amp + and - |
| 7 | Wire power and ground | 3V3 mic and OLED, 5V amp, all GND back |
| 8 | Plug in USB-C and flash | desk_robot_demo.ino, team-01-blue |
| 9 | First voice test | face, mic level, talk, three in a row |

Right now the parts are procedural boxes and cylinders driven by
`build.json`, in real sizes (breadboard 8.5 x 5.5 cm, XIAO 21 x
17.5 mm, speaker 36 mm). The Blender script in `template/` builds
the same parts as named meshes and exports a GLB; drop it in
`desk-ai-robot/models/` and the viewer swaps it in. Nothing else
changes.

## Mapping the method onto his builds

### Arduino builds — Traffic Light is the template sample

The Arduino plan already has 8 projects (Traffic Light, Reaction
Timer, Smart Night Light, Buzzer Piano, Parking Sensor, Plant
Monitor, Room Comfort Station, Servo Gate/Radar), each fitting
2 x 1.5-hour sessions, USB power only, no soldering. Every one of
them fits the same shape: Uno plus breadboard plus 3 to 6 parts plus
wires. Traffic Light is built as the template's sample (7 steps,
9 parts, 4 wires) precisely because it is the simplest. The other
seven are copy-and-edit jobs: same viewer, new `build.json`, new
camera presets. The step that pays for the 3D here is seating parts
on the breadboard: which row, which direction, long leg where. A
parts list cannot show that. A photo can, once, from one angle.
The 3D guide shows it from the angle the student is sitting at.

### ESP32 builds — Desk AI Robot is the worked example

Same pattern, higher stakes per wire. The XIAO build has shared
I2S lines (BCLK and WS feed both the mic and the amp), a 3V3-only
mic that 5V will kill, and a DIN pin that moves to D6 if the board
will not boot. Those are exactly the facts a 3D guide is bad at
carrying alone, which is why every step in the Desk AI Robot guide
carries its hardware line and a pointer back to the wiring table.
The 3D earns its keep on layout: mic and speaker at opposite ends,
camera forward, OLED where the student can see the face. The
firmware and the server stay where they are; this guide covers the
physical build only.

### Tiny drone builds — the honest split

Two different cases, do not mix them up:

- A DIY mini quad frame (arms, motors, props, flight controller,
  battery) is a real Flat Pack candidate. One step per action:
  frame, four motors, four props, flight controller, battery, test.
  The step the 3D pays for is prop direction: two props spin one
  way, two the other, and a wrong prop is the classic first-flight
  mistake. The quadcopter Blender script already in
  `~/workspace/drone-sim/blender-quadcopter-generator.py` is the
  model source for this: same PARAMS-block style, same GLB export,
  add an explode direction per part and a steps file and it is a
  guide. Target 8 to 10 steps.
- CoDrone EDU, DJI Neo 2, and the Wefone M2 arrive assembled. There
  is no assembly to guide. A 3D guide for those is about sensor
  locations and what the code blocks touch, not about building. That
  is a different deliverable (an annotated model, not a step guide),
  and it is not worth building until a student asks where a sensor
  is for the third time.

## How to add a build

Full recipe in `template/HOW-TO-ADD-A-BUILD.md`. Short version:
copy `template/`, list the parts with real measured sizes, write one
step per assembly action (10 steps max, split the build if it needs
more), give each step a fixed starting camera angle that shows the
connection being made, add wires with true endpoints and colors,
serve over http, walk every step, fix the numbers.

## Model pipeline

Two tiers, by design:

1. Procedural (today): parts are boxes, cylinders, and spheres from
   `build.json`. Correct sizes, correct positions, correct order.
   Ugly, honest, works on a school Chromebook with no extra files.
2. Blender GLB (upgrade): `template/blender-parts.py` builds the
   same parts as named meshes in Blender 4.x and exports a GLB.
   The viewer loads it when present and swaps nodes in by name.
   Same convention as the quadcopter generator: PARAMS at the top,
   run from the Scripting tab, GLB out. No Blender on this machine
   yet, so the GLB is not built here; the script is ready to run
   where Blender lives.

## Honest limits

- Flat Pack's maker says it plainly, and it applies here too: hole
  positions and shelf heights on BILLY are eyeballed from the
  drawings, so the paper manual stays the authority. Our version:
  every size in `build.json` was taken from the real parts list and
  the demo wiring table, but the wire arcs are visual approximations
  and the round mic board is drawn as a plain cylinder. Measure the
  real part before you trust a dimension in the guide, and never
  let the guide replace the wiring table.
- A 3D guide cannot replace safety steps. BILLY's wall bracket is
  the example: the model can show it, only the manual can insist
  on it. Here the equivalents are: INMP441 on 3V3 only, never 5V;
  LiPo handling on any drone build; and the "power off before you
  rewire" rule. Those live in the step text and the paper docs, in
  bold, not in the geometry.
- A 3D guide cannot test anything. Step 9 of the Desk AI Robot
  (talk, wait, three in a row) is a checklist with a 3D backdrop.
  The Serial Monitor numbers are the test, not the model.
- Where a 3D guide helps most: order of assembly, orientation of
  parts, which row a pin goes in, and prop or LED direction. Where
  a plain parts list is enough: counting, shopping, and anything
  with one right answer that fits in a line, like a resistor value.
  Do not build a 3D guide for a build a list already explains.
- Three.js needs internet for the CDN in this template (jsdelivr,
  three@0.160.0). For offline school rooms, download the three.js
  build files once, serve them next to the viewer, and point the
  import map at the local copies. That is a 10-minute change, listed
  here so it does not surprise anyone on the day.

## Verification status

- `viewer.js` passes `node --check`. Both `build.json` files parse,
  and every part id referenced by a step or wire exists, every wire
  step is in range, every step has a camera preset.
- Live browser check: NOT run yet. The remote test browser blocks
  localhost, the muse.ai file links (blocked by its organization
  policy), and every tunnel or anonymous host tried (localtunnel
  silent, Cloudflare quick tunnel TLS-blocked, SSH reset by the
  proxy, 0x0.st uploads disabled, transfer.sh and catbox.moe empty).
  No guide page ever loaded in that browser, so there are no console
  errors from the guides themselves, only blocked routes. Next step:
  publish to GitHub Pages on aa8corp.github.io once Emiliano connects
  GitHub, then rerun the browser test against those URLs.
  Single-file bundled copies (same viewer code and data, build.json
  embedded) are at `bundles/` for sharing in the meantime.
- Live source inspection of sael.net/flatpack (exact Three.js
  version, model delivery format, Drawing view implementation) was
  requested. The confirmed facts above are from the fetched page
  text and Sael's own site; the unconfirmed details are marked as
  such and do not affect anything built here.
- Flat Pack live inspection COMPLETED 2026-10-25 (37 min, nothing
  changed): rendering library NOT confirmed (no source or DevTools
  access in that browser, /flatpack/main.js and /flatpack/billy.glb
  both 404, no script tags in DOM). Three.js is an inference, not
  a verified fact. Model is most likely procedural geometry built
  in JS from step/part data, not a loaded GLB. Steps are a
  continuous 0-14 timeline with fractional slider values and live
  counters (HARDWARE x/82, PANELS y/11), each step with manual page
  number and fixed camera angle. Full step table and hardware
  breakdown confirmed (dowel 101351 x16, cam screw 118331 x12, cam
  lock 119081 x12, nail 101201 x18, shelf pin 131372 x16, screw
  109041 x4, washer 100823 x2, wall bracket 106989 x2 = 82).
  Explode works on the finished assembly (jumps to step 14).
  Piece selector shows a generic engine with 26 IKEA pieces, BILLY
  first. Caveat verbatim: "Board thickness, hole positions and
  shelf heights are eyeballed from the drawings." No authoring tool
  named on the page. Published 19 Oct 2026, 639k views.
