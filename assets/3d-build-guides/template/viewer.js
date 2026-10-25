// AA8 3D Build Guide viewer — the reusable Flat Pack pattern.
// One viewer, any build. All build-specific data lives in build.json:
//   parts, hardware, steps, camera presets, explode directions, wires.
// No build logic is hardcoded here. To add a new build, copy the
// template folder, edit build.json, and (optionally) drop a GLB in
// models/ with node names matching the part ids.
//
// Stack: Three.js (WebGL) via CDN import map + OrbitControls.
// No build step, no server needed for the procedural path. Open
// index.html over http (python3 -m http.server) so fetch() can load
// build.json. Opening with file:// blocks fetch in most browsers.
//
// Keyboard, matching Flat Pack: Space next step, 0-9 jump to a step,
// Shift+X exploded view, Shift+V Drawing view, Shift+K parts list.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const BUILD_URL = new URLSearchParams(location.search).get('build') || 'build.json';

const state = {
  build: null,
  step: 0,
  explodeTarget: 0,
  explodeNow: 0,
  drawing: false,
  partsListOpen: true,
  camTween: null,
};

let renderer, scene, perspCam, orthoCam, activeCam, controls;
let partObjects = new Map(); // id -> THREE.Group
let wireObjects = [];        // {mesh, step}
let edgeLines = [];
let origMaterials = new Map();
const drawingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const drawingEdgeMat = new THREE.LineBasicMaterial({ color: 0x111111 });

const $ = (id) => document.getElementById(id);

async function loadBuild() {
  const res = await fetch(BUILD_URL);
  if (!res.ok) throw new Error('Could not load ' + BUILD_URL + ' (' + res.status + ')');
  return res.json();
}

function init(build) {
  document.title = build.title + ' — 3D Build Guide';
  $('build-title').textContent = build.title;
  $('build-sub').textContent = build.subtitle || '';

  const container = $('viewport');
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Filmic look, from the motion-graphic skill's LOOK block (AgX filmic
  // in Blender; ACES filmic is the closest real-time equivalent here).
  // It keeps part colors reading as their hex instead of blowing out.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2efe8); // warm paper, like a manual page
  // Image-based lighting: a virtual studio room bounced into every
  // material, so plastic and metal read as real instead of flat.
  // No external HDR file needed; RoomEnvironment is built into Three.js.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  perspCam = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 200);
  orthoCam = new THREE.OrthographicCamera(-8, 8, 6, -6, 0.1, 200);
  activeCam = perspCam;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8378, 0.45);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1.25);
  dir.position.set(6, 10, 4);
  dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  scene.add(dir);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.ShadowMaterial({ opacity: 0.18 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(30, 30, 0xcccccc, 0xe0ddd2);
  grid.position.y = 0.001;
  scene.add(grid);

  controls = new OrbitControls(activeCam, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = 40;

  buildParts(build);
  buildWires(build);
  tryLoadGLB(build); // upgrades procedural parts to GLB nodes when present
  buildPartsList(build);
  buildStepDots(build);
  wireUI(build);
  applyStep(0, false);
  setExplode(0);

  addEventListener('resize', () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    perspCam.aspect = w / h;
    perspCam.updateProjectionMatrix();
    fitOrtho(w, h);
  });
  fitOrtho(container.clientWidth, container.clientHeight);
  renderer.setAnimationLoop(tick);
}

function fitOrtho(w, h) {
  const s = 9;
  orthoCam.left = -s * (w / h);
  orthoCam.right = s * (w / h);
  orthoCam.top = s;
  orthoCam.bottom = -s;
  orthoCam.updateProjectionMatrix();
}

// ---- parts: procedural primitives driven by build.json -----------------
function partMesh(part) {
  const s = part.shape || {};
  // Glassy parts (OLED screen) get a clearcoat physical material:
  // a hard shiny top layer over the color, like glass over a display.
  // Everything else is standard PBR with a capped environment
  // reflection, so colors stay true and nothing blows out.
  const mat = (part.clearcoat || s.clearcoat)
    ? new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(part.color || '#888888'),
        roughness: 0.08, metalness: 0.0,
        clearcoat: 1.0, clearcoatRoughness: 0.08,
        envMapIntensity: 1.0,
      })
    : new THREE.MeshStandardMaterial({
        color: new THREE.Color(part.color || '#888888'),
        roughness: part.roughness ?? 0.6,
        metalness: part.metalness ?? 0.15,
        envMapIntensity: 0.55,
      });
  let geo;
  if (s.type === 'cylinder') {
    geo = new THREE.CylinderGeometry(s.radiusTop ?? s.radius ?? 1, s.radiusBottom ?? s.radius ?? 1, s.height ?? 1, s.segments ?? 32);
  } else if (s.type === 'sphere') {
    geo = new THREE.SphereGeometry(s.radius ?? 1, 32, 24);
  } else { // box with a soft rounded bevel, like a molded part.
    // The motion-graphic skill's hero spec is "rounded bevels" for a
    // reason: a sharp CG box reads as fake before anything else does.
    const w = s.size?.[0] ?? 1, h = s.size?.[1] ?? 0.2, d = s.size?.[2] ?? 1;
    const r = Math.min(0.09, Math.min(w, h, d) * 0.3);
    geo = new RoundedBoxGeometry(w, h, d, 3, r);
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (s.rotation) mesh.rotation.set(s.rotation[0], s.rotation[1], s.rotation[2]);
  return mesh;
}

function buildParts(build) {
  for (const part of build.parts) {
    const group = new THREE.Group();
    group.name = part.id;
    group.position.set(...(part.position || [0, 0, 0]));
    group.userData.basePos = new THREE.Vector3(...(part.position || [0, 0, 0]));
    group.userData.explode = new THREE.Vector3(...(part.explode || [0, 0, 0]));
    group.userData.firstStep = part.firstStep ?? 0;
    group.userData.part = part;

    const mesh = partMesh(part);
    group.add(mesh);
    // Optional second mesh: a screen, lens, or top detail.
    if (part.detail) {
      const d = partMesh({ ...part.detail, color: part.detail.color });
      d.position.set(...(part.detail.offset || [0, 0, 0]));
      group.add(d);
    }
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, 35),
      new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 })
    );
    if (part.shape?.rotation) edges.rotation.set(...part.shape.rotation);
    group.add(edges);
    edgeLines.push(edges);

    scene.add(group);
    partObjects.set(part.id, group);
  }
}

function buildWires(build) {
  for (const w of build.wires || []) {
    const a = new THREE.Vector3(...w.from);
    const b = new THREE.Vector3(...w.to);
    const mid = a.clone().lerp(b, 0.5);
    mid.y += w.sag ?? 0.9; // arc up so wires read as loose jumpers, not rods
    const curve = new THREE.CatmullRomCurve3([a, mid, b]);
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, w.radius ?? 0.07, 8),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(w.color || '#ff0000'), roughness: 0.6 })
    );
    mesh.castShadow = true;
    mesh.userData.step = w.step ?? 0;
    mesh.visible = false;
    scene.add(mesh);
    wireObjects.push(mesh);
  }
}

// If a GLB exists with nodes named after part ids, swap the procedural
// mesh for the real model. Failure is silent: procedural stays.
function tryLoadGLB(build) {
  if (!build.model) return;
  new GLTFLoader().load(build.model, (gltf) => {
    gltf.scene.traverse((node) => {
      if (!node.isMesh || !partObjects.has(node.name)) return;
      const group = partObjects.get(node.name);
      // Keep position/explode metadata, replace the drawn mesh.
      [...group.children].forEach((c) => { if (c.isMesh) group.remove(c); });
      node.castShadow = true;
      node.receiveShadow = true;
      node.position.set(0, 0, 0);
      group.add(node);
    });
  }, undefined, () => { /* no GLB yet: procedural model stands */ });
}

// ---- steps ---------------------------------------------------------------
function visiblePartsAt(stepIndex) {
  const step = state.build.steps[stepIndex];
  const shown = new Set();
  for (let i = 0; i <= stepIndex; i++) {
    for (const id of state.build.steps[i].add || []) shown.add(id);
  }
  return { shown, highlight: new Set(step.highlight || step.add || []) };
}

function applyStep(i, animate = true) {
  const build = state.build;
  state.step = Math.max(0, Math.min(build.steps.length - 1, i));
  const step = build.steps[state.step];
  const { shown, highlight } = visiblePartsAt(state.step);

  for (const [id, group] of partObjects) {
    group.visible = shown.has(id);
    group.traverse((c) => {
      if (c.isMesh && c.material && c.material.emissive) {
        c.material.emissive = new THREE.Color(highlight.has(id) ? 0x332200 : 0x000000);
        c.material.emissiveIntensity = highlight.has(id) ? 0.55 : 0;
      }
    });
  }
  for (const w of wireObjects) w.visible = (w.userData.step ?? 0) <= state.step;

  // Step text panel
  $('step-count').textContent = 'Step ' + state.step + ' of ' + (build.steps.length - 1);
  $('step-title').textContent = step.title;
  $('step-text').textContent = step.text || '';
  $('step-tip').textContent = step.tip ? 'Tip: ' + step.tip : '';
  $('step-tip').style.display = step.tip ? 'block' : 'none';
  $('manual-ref').textContent = step.manualRef || build.manualRef || '';
  const hw = step.hardware || [];
  $('step-hardware').innerHTML = hw.length
    ? '<strong>Uses this step:</strong> ' + hw.map((h) => escapeHtml(h)).join(' · ')
    : '';

  // Parts list checkmarks
  document.querySelectorAll('#parts-list li').forEach((li) => {
    li.classList.toggle('done', shown.has(li.dataset.part));
    li.classList.toggle('now', highlight.has(li.dataset.part));
  });
  document.querySelectorAll('.step-dot').forEach((d, idx) => {
    d.classList.toggle('active', idx === state.step);
    d.classList.toggle('done', idx < state.step);
  });
  $('prev-btn').disabled = state.step === 0;
  $('next-btn').disabled = state.step === build.steps.length - 1;
  $('explode-btn').classList.toggle('on', state.explodeTarget > 0);

  // Camera: each step starts at its fixed preset angle, then the
  // user is free to orbit. That is the Flat Pack contract.
  if (step.camera) flyTo(step.camera.pos, step.camera.target, animate);
}

function flyTo(pos, target, animate = true) {
  const toPos = new THREE.Vector3(...pos);
  const toTarget = new THREE.Vector3(...target);
  if (!animate) {
    activeCam.position.copy(toPos);
    controls.target.copy(toTarget);
    controls.update();
    return;
  }
  state.camTween = {
    fromPos: activeCam.position.clone(), toPos,
    fromTarget: controls.target.clone(), toTarget,
    t: 0,
  };
}

function setExplode(v) {
  state.explodeTarget = v;
  $('explode-btn').classList.toggle('on', v > 0);
  $('explode-range').value = String(Math.round(v * 100));
}

function setDrawing(on) {
  state.drawing = on;
  const from = activeCam;
  activeCam = on ? orthoCam : perspCam;
  activeCam.position.copy(from.position);
  controls.object = activeCam;
  fitOrtho($('viewport').clientWidth, $('viewport').clientHeight);
  controls.update();
  scene.background = new THREE.Color(on ? 0xffffff : 0xf2efe8);
  for (const [id, group] of partObjects) {
    group.traverse((c) => {
      if (!c.isMesh) return;
      if (on) {
        if (!origMaterials.has(c)) origMaterials.set(c, c.material);
        c.material = drawingMat;
      } else if (origMaterials.has(c)) {
        c.material = origMaterials.get(c);
      }
    });
  }
  for (const e of edgeLines) {
    e.material = on ? drawingEdgeMat : new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 });
  }
  $('drawing-btn').classList.toggle('on', on);
}

// ---- UI ------------------------------------------------------------------
function buildPartsList(build) {
  const ul = $('parts-list');
  ul.innerHTML = '';
  for (const part of build.parts) {
    const li = document.createElement('li');
    li.dataset.part = part.id;
    li.innerHTML = '<span class="swatch" style="background:' + escapeHtml(part.color || '#888') + '"></span>'
      + '<span class="pname">' + escapeHtml(part.name) + '</span>'
      + '<span class="qty">×' + (part.qty || 1) + '</span>';
    li.title = part.notes || '';
    ul.appendChild(li);
  }
  const hw = $('hardware-list');
  hw.innerHTML = (build.hardware || []).map((h) =>
    '<li><span class="pname">' + escapeHtml(h.name) + '</span><span class="qty">×' + (h.qty || 1) + '</span></li>'
  ).join('');
  $('total-count').textContent = build.parts.length + ' parts · ' + (build.hardware || []).reduce((a, h) => a + (h.qty || 1), 0) + ' hardware pieces';
}

function buildStepDots(build) {
  const wrap = $('step-dots');
  wrap.innerHTML = '';
  build.steps.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'step-dot';
    b.textContent = String(i);
    b.title = s.title;
    b.addEventListener('click', () => applyStep(i));
    wrap.appendChild(b);
  });
}

function wireUI(build) {
  $('prev-btn').addEventListener('click', () => applyStep(state.step - 1));
  $('next-btn').addEventListener('click', () => applyStep(state.step + 1));
  $('explode-btn').addEventListener('click', () => setExplode(state.explodeTarget > 0 ? 0 : 1));
  $('explode-range').addEventListener('input', (e) => setExplode(Number(e.target.value) / 100));
  $('drawing-btn').addEventListener('click', () => setDrawing(!state.drawing));
  $('parts-btn').addEventListener('click', () => {
    state.partsListOpen = !state.partsListOpen;
    $('parts-panel').classList.toggle('closed', !state.partsListOpen);
  });
  addEventListener('keydown', (e) => {
    if (e.key === ' ') { e.preventDefault(); applyStep(state.step + 1); }
    else if (e.key === 'ArrowRight') applyStep(state.step + 1);
    else if (e.key === 'ArrowLeft') applyStep(state.step - 1);
    else if (/^[0-9]$/.test(e.key)) applyStep(Number(e.key));
    else if (e.shiftKey && (e.key === 'X' || e.key === 'x')) setExplode(state.explodeTarget > 0 ? 0 : 1);
    else if (e.shiftKey && (e.key === 'V' || e.key === 'v')) setDrawing(!state.drawing);
    else if (e.shiftKey && (e.key === 'K' || e.key === 'k')) $('parts-btn').click();
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---- frame loop ------------------------------------------------------------
function tick() {
  const dt = 0.016;
  if (state.camTween) {
    const tw = state.camTween;
    tw.t += dt / 0.9;
    const k = tw.t >= 1 ? 1 : 1 - Math.pow(1 - tw.t, 3);
    activeCam.position.lerpVectors(tw.fromPos, tw.toPos, k);
    controls.target.lerpVectors(tw.fromTarget, tw.toTarget, k);
    if (tw.t >= 1) state.camTween = null;
  }
  // Exploded view eases toward its target.
  state.explodeNow += (state.explodeTarget - state.explodeNow) * 0.12;
  if (Math.abs(state.explodeTarget - state.explodeNow) < 0.001) state.explodeNow = state.explodeTarget;
  for (const [, group] of partObjects) {
    const e = group.userData.explode;
    group.position.copy(group.userData.basePos).addScaledVector(e, state.explodeNow);
  }
  controls.update();
  renderer.render(scene, activeCam);
}

loadBuild()
  .then((build) => { state.build = build; init(build); })
  .catch((err) => {
    $('step-title').textContent = 'Could not load this build';
    $('step-text').textContent = String(err.message || err) + ' — serve the folder over http (python3 -m http.server) and reload.';
  });
