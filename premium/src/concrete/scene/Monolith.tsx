import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

const RED = "#D7263D";
const CELL = 0.62;
const GAP = 0.05;
const GRAVITY = 30;

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

/** A blocky C: 6 wide, 7 tall, 2-cell stroke, open on the right like the logo. */
const isC = (col: number, row: number) => (row < 2 || row > 4 ? col < 6 : col < 2);

type Brick = { x: number; y: number; z: number; w: number; d: number; delay: number; drop: number; spin: THREE.Euler; dir: THREE.Vector3 };

const buildBricks = (): Brick[] => {
  const rand = seeded(23);
  const bricks: Brick[] = [];
  const COLS = 13;
  const ROWS = 7;
  for (let row = 0; row < ROWS; row++) {
    let col = 0;
    while (col < COLS) {
      const letterCol = col < 6 ? col : col - 7;
      const filled = col !== 6 && isC(letterCol, row);
      if (!filled) { col++; continue; }
      // run length to the end of this filled stretch, broken into bricks of 1–3 cells
      let run = 0;
      while (col + run < COLS && col + run !== 6 && isC(col + run < 6 ? col + run : col + run - 7, row)) run++;
      let used = 0;
      while (used < run) {
        const len = Math.min(run - used, 1 + Math.floor(rand() * 3));
        const cx = (col + used + len / 2 - COLS / 2) * CELL;
        const cy = (ROWS / 2 - row - 0.5) * CELL;
        bricks.push({
          x: cx,
          y: cy,
          z: (rand() - 0.5) * 0.08,
          w: len * CELL - GAP,
          d: CELL * (0.9 + rand() * 0.25),
          delay: (ROWS - row) * 0.09 + rand() * 0.25,
          drop: 7 + rand() * 5,
          spin: new THREE.Euler((rand() - 0.5) * 1.2, (rand() - 0.5) * 0.8, (rand() - 0.5) * 1.4),
          dir: new THREE.Vector3(cx, cy, 2 + rand() * 3).normalize().multiplyScalar(2.5 + rand() * 3),
        });
        used += len;
      }
      col += run;
    }
  }
  return bricks;
};

/** Procedural concrete: mottled grey with pits and a few hairline cracks, shared by every brick. */
const useConcreteTexture = () =>
  useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const rand = seeded(5);
    ctx.fillStyle = "#cfcac0";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 2600; i++) {
      const v = 150 + Math.floor(rand() * 90);
      ctx.fillStyle = `rgba(${v},${v - 4},${v - 10},${0.08 + rand() * 0.25})`;
      const r = rand() * 10;
      ctx.beginPath();
      ctx.arc(rand() * size, rand() * size, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(40,38,35,${0.2 + rand() * 0.5})`;
      ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2);
    }
    ctx.strokeStyle = "rgba(30,28,26,.55)";
    ctx.lineWidth = 1.2;
    for (let c = 0; c < 9; c++) {
      let x = rand() * size, y = rand() * size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 6; s++) { x += (rand() - 0.5) * 70; y += (rand() - 0.5) * 70; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

type BrickProps = { brick: Brick; index: number; texture: THREE.Texture; reduced: boolean; shatterAt: RefObject<number> };

const BrickMesh = ({ brick, index, texture, reduced, shatterAt }: BrickProps) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const push = useRef(0);
  const uvOffset = useMemo(() => {
    const t = texture.clone();
    t.repeat.set(brick.w / 3, brick.d / 3);
    t.offset.set((index * 0.137) % 1, (index * 0.291) % 1);
    t.needsUpdate = true;
    return t;
  }, [texture, brick.w, brick.d, index]);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t = clock.elapsedTime;
    push.current += ((hover ? 1 : 0) - push.current) * 0.15;

    let y = brick.y;
    let rotFactor = 0;
    if (!reduced) {
      const local = Math.max(0, t - 0.3 - brick.delay);
      const fallTime = Math.sqrt((2 * brick.drop) / GRAVITY);
      if (local < fallTime) {
        y = brick.y + brick.drop - 0.5 * GRAVITY * local * local;
        rotFactor = 1 - local / fallTime;
      } else {
        const since = local - fallTime;
        y = brick.y + Math.abs(Math.sin(since * 14)) * 0.22 * Math.exp(-since * 7);
      }
    }

    // click-to-shatter: fly out along a fixed direction, then fall back into place
    const s = reduced ? 0 : t - shatterAt.current;
    const blast = s > 0 && s < 1.6 ? Math.sin((s / 1.6) * Math.PI) : 0;

    m.position.set(brick.x + brick.dir.x * blast, y + brick.dir.y * blast, brick.z + push.current * 0.4 + brick.dir.z * blast);
    m.rotation.set(
      brick.spin.x * (rotFactor + blast) + push.current * -0.12,
      brick.spin.y * (rotFactor + blast),
      brick.spin.z * (rotFactor + blast),
    );
  });

  return (
    <mesh
      ref={mesh}
      position={[brick.x, brick.y + (reduced ? 0 : brick.drop + 10), brick.z]}
      castShadow
      receiveShadow
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[brick.w, CELL - GAP, brick.d]} />
      <meshStandardMaterial map={uvOffset} color={hover ? "#f2ede3" : "#d9d4ca"} roughness={0.95} metalness={0} />
    </mesh>
  );
};

/** Hazard-red light from below that stutters like a failing streetlight. */
const Flicker = ({ reduced }: { reduced: boolean }) => {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!light.current) return;
    const t = clock.elapsedTime;
    const stutter = reduced ? 1 : (Math.sin(t * 23) > 0.96 || Math.sin(t * 7.3) > 0.985 ? 0.25 : 1);
    light.current.intensity = 26 * stutter;
  });
  return <pointLight ref={light} position={[3.5, -3.2, 3]} color={RED} distance={14} />;
};

const Rig = ({ reduced }: { reduced: boolean }) => {
  const { camera, pointer, size } = useThree();
  useFrame(() => {
    // pull back on tall, narrow screens so both Cs stay in frame
    const tz = 9.6 * Math.max(1, 1.55 / (size.width / size.height));
    camera.position.z += (tz - camera.position.z) * 0.1;
    const tx = reduced ? 0.6 : 0.6 + pointer.x * 1.4;
    const ty = reduced ? 0.4 : 0.4 + pointer.y * 0.8;
    camera.position.x += (tx - camera.position.x) * 0.05;
    camera.position.y += (ty - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
};

type MonolithProps = { reduced: boolean };

export const Monolith = ({ reduced }: MonolithProps) => {
  const bricks = useMemo(buildBricks, []);
  const texture = useConcreteTexture();
  const shatterAt = useRef(-10);
  const pending = useRef(false);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0.6, 0.4, 9.6], fov: 40 }}
      onPointerDown={(e) => {
        // ignore drags on touch so scrolling the page never triggers it
        if (e.pointerType === "touch" || reduced) return;
        pending.current = true;
      }}
    >
      <color attach="background" args={["#111111"]} />
      <fog attach="fog" args={["#111111", 14, 40]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-5, 8, 6]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} />
      <Flicker reduced={reduced} />
      <Rig reduced={reduced} />
      <ShatterClock shatterAt={shatterAt} pending={pending} />
      <group rotation={[0, -0.18, 0]}>
        {bricks.map((b, i) => <BrickMesh key={i} brick={b} index={i} texture={texture} reduced={reduced} shatterAt={shatterAt} />)}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#161616" roughness={1} />
      </mesh>
    </Canvas>
  );
};

/** Clicks happen outside the render loop; stamp them with the scene clock on the next frame. */
const ShatterClock = ({ shatterAt, pending }: { shatterAt: RefObject<number>; pending: RefObject<boolean> }) => {
  useFrame(({ clock }) => {
    if (!pending.current) return;
    pending.current = false;
    if (clock.elapsedTime - shatterAt.current > 1.6) shatterAt.current = clock.elapsedTime;
  });
  return null;
};
