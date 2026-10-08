import { ContactShadows, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ROOMS, type Room } from "../data";

const NAVY = "#0A2540";
const TEAL = "#00B8A9";
const SLATE = "#E8EEF2";
const DUST = "#9a8f78";

const ROOM_SECONDS = 1.6;
const HOLD_SECONDS = 2.6;
const DUST_PER_ROOM = 70;
const CYCLE = ROOMS.length * ROOM_SECONDS + HOLD_SECONDS;

type Progress = { room: number; inRoom: number; done: boolean };

/** Where in the cleaning loop we are at time t. room === ROOMS.length means everything is clean. */
const progressAt = (t: number): Progress => {
  const local = t % CYCLE;
  const room = Math.floor(local / ROOM_SECONDS);
  if (room >= ROOMS.length) return { room: ROOMS.length, inRoom: 1, done: true };
  return { room, inRoom: (local % ROOM_SECONDS) / ROOM_SECONDS, done: false };
};

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

type DustSpeck = { room: number; x: number; z: number; s: number; order: number };

const makeDust = (): DustSpeck[] => {
  const rand = seeded(11);
  return ROOMS.flatMap((r, room) =>
    Array.from({ length: DUST_PER_ROOM }, () => {
      const x = r.x + (rand() - 0.5) * (r.w - 0.5);
      const z = r.z + (rand() - 0.5) * (r.d - 0.5);
      // sweep order inside the room: left to right with a little jitter, like a mop pass
      const order = (x - (r.x - r.w / 2)) / r.w + (rand() - 0.5) * 0.15;
      return { room, x, z, s: 0.035 + rand() * 0.05, order };
    }),
  );
};

const Walls = ({ room }: { room: Room }) => {
  const h = 0.55;
  const t = 0.07;
  const segments: [number, number, number, number][] = [
    [room.x, room.z - room.d / 2, room.w, t],
    [room.x, room.z + room.d / 2, room.w, t],
    [room.x - room.w / 2, room.z, t, room.d],
    [room.x + room.w / 2, room.z, t, room.d],
  ];
  return (
    <>
      {segments.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      ))}
    </>
  );
};

type RoomTileProps = { room: Room; index: number; reduced: boolean };

/** The floor of one room. It warms from grimy slate to clean white with a teal outline once its turn passes. */
const RoomTile = ({ room, index, reduced }: RoomTileProps) => {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const dirty = useMemo(() => new THREE.Color("#c9cbbf"), []);
  const clean = useMemo(() => new THREE.Color("#ffffff"), []);
  const border = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!material.current || !border.current) return;
    const p = reduced ? { room: ROOMS.length, inRoom: 1, done: true } : progressAt(clock.elapsedTime);
    const amount = p.room > index ? 1 : p.room === index ? p.inRoom : 0;
    material.current.color.copy(dirty).lerp(clean, amount);
    border.current.opacity = amount;
  });

  return (
    <group position={[room.x, 0, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh position={[0, 0, 0.009]}>
        <planeGeometry args={[room.w - 0.08, room.d - 0.08]} />
        <meshBasicMaterial ref={border} color={TEAL} transparent opacity={0} />
      </mesh>
      <mesh position={[0, 0, 0.012]} receiveShadow>
        <planeGeometry args={[room.w - 0.3, room.d - 0.3]} />
        <meshStandardMaterial ref={material} color="#c9cbbf" roughness={0.35} metalness={0.05} />
      </mesh>
    </group>
  );
};

/** Hundreds of dust specks in a single draw call; each shrinks away as the crew sweeps past it. */
const Dust = ({ reduced }: { reduced: boolean }) => {
  const specks = useMemo(makeDust, []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const p = reduced ? { room: ROOMS.length, inRoom: 1, done: true } : progressAt(clock.elapsedTime);
    specks.forEach((sp, i) => {
      let k = 1;
      if (sp.room < p.room) k = 0;
      else if (sp.room === p.room) k = THREE.MathUtils.clamp((sp.order - p.inRoom) * 6 + 0.5, 0, 1);
      dummy.position.set(sp.x, 0.03 + sp.s * 0.4, sp.z);
      dummy.scale.setScalar(sp.s * k + 0.00001);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, specks.length]} castShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={DUST} roughness={1} />
    </instancedMesh>
  );
};

const sparkleShape = (() => {
  const s = new THREE.Shape();
  const r = 1;
  const k = 0.18; // waist of the four-point star, matching the logo sparkle
  s.moveTo(0, r);
  s.quadraticCurveTo(k, k, r, 0);
  s.quadraticCurveTo(k, -k, 0, -r);
  s.quadraticCurveTo(-k, -k, -r, 0);
  s.quadraticCurveTo(-k, k, 0, r);
  return s;
})();

/** The crew marker: a teal four-point sparkle that glides room to room and spins while it works. */
const Crew = ({ reduced }: { reduced: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!group.current || !light.current) return;
    if (reduced) { group.current.visible = false; light.current.intensity = 0; return; }
    const p = progressAt(clock.elapsedTime);
    group.current.visible = !p.done;
    light.current.intensity = p.done ? 0 : 6;
    if (p.done) return;
    const room = ROOMS[p.room]!;
    const prev = ROOMS[Math.max(0, p.room - 1)]!;
    const travel = THREE.MathUtils.smoothstep(p.inRoom, 0, 0.25);
    // after arriving, sweep across the room width
    const sweepX = room.x - room.w / 2 + 0.4 + (room.w - 0.8) * THREE.MathUtils.smoothstep(p.inRoom, 0.25, 1);
    const targetX = THREE.MathUtils.lerp(prev.x + prev.w / 2 - 0.4, sweepX, travel);
    const targetZ = THREE.MathUtils.lerp(prev.z, room.z + Math.sin(p.inRoom * Math.PI * 3) * (room.d * 0.28), travel);
    group.current.position.set(targetX, 0.9 + Math.sin(clock.elapsedTime * 3) * 0.06, targetZ);
    group.current.rotation.y = clock.elapsedTime * 2.4;
    light.current.position.set(targetX, 1.2, targetZ);
  });

  return (
    <>
      <group ref={group}>
        <mesh scale={0.32}>
          <extrudeGeometry args={[sparkleShape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 }]} />
          <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.6} roughness={0.25} metalness={0.2} />
        </mesh>
      </group>
      <pointLight ref={light} color={TEAL} distance={4} decay={2} />
    </>
  );
};

/** Gentle camera drift that follows the pointer, so the plan feels like a physical model on a desk. */
const Rig = ({ reduced }: { reduced: boolean }) => {
  const { camera, pointer } = useThree();
  const base = useMemo(() => new THREE.Vector3(12, 15, 16), []);
  useFrame(() => {
    const tx = reduced ? base.x : base.x + pointer.x * 1.6;
    const ty = reduced ? base.y : base.y + pointer.y * 0.8;
    camera.position.x += (tx - camera.position.x) * 0.05;
    camera.position.y += (ty - camera.position.y) * 0.05;
    camera.lookAt(0, -0.4, 0.2);
  });
  return null;
};

/** Tells the surrounding page which room is being cleaned, only when it changes (never per frame). */
const Reporter = ({ onRoom, reduced }: { onRoom: (room: number) => void; reduced: boolean }) => {
  const last = useRef(-1);
  useFrame(({ clock }) => {
    const room = reduced ? ROOMS.length : progressAt(clock.elapsedTime).room;
    if (room !== last.current) { last.current = room; onRoom(room); }
  });
  return null;
};

type FloorSceneProps = { reduced: boolean; onRoom: (room: number) => void };

export const FloorScene = ({ reduced, onRoom }: FloorSceneProps) => (
  <Canvas shadows dpr={[1, 2]} camera={{ position: [12, 15, 16], fov: 28 }} gl={{ antialias: true }}>
    <color attach="background" args={[SLATE]} />
    <ambientLight intensity={1.5} />
    <hemisphereLight args={["#ffffff", "#c9d6e0", 0.8]} />
    <directionalLight position={[6, 12, 4]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} />
    <Rig reduced={reduced} />
    <Reporter onRoom={onRoom} reduced={reduced} />
    <group>
      <RoundedBox args={[12.6, 0.3, 8.6]} radius={0.12} position={[0, -0.15, 0]} receiveShadow>
        <meshStandardMaterial color={NAVY} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#f4f7f9" roughness={0.8} />
      </mesh>
      {ROOMS.map((room, i) => (
        <group key={room.id}>
          <RoomTile room={room} index={i} reduced={reduced} />
          <Walls room={room} />
        </group>
      ))}
      <Dust reduced={reduced} />
      <Crew reduced={reduced} />
    </group>
    <ContactShadows position={[0, -0.31, 0]} opacity={0.35} scale={22} blur={2.6} far={4} color={NAVY} />
  </Canvas>
);
