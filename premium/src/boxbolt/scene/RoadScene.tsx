import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { ORANGE, Truck } from "./Truck";

const SPEED = 16; // scene meters per second of road scrolling past
const LANE_DASHES = 26;
const DASH_GAP = 6;
const POSTS = 18;
const POST_GAP = 12;

/** Dashed centerline as one instanced mesh; dashes recycle to the front as they pass behind the truck. */
const Dashes = ({ moving }: { moving: boolean }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const span = LANE_DASHES * DASH_GAP;
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const shift = moving ? (clock.elapsedTime * SPEED) % DASH_GAP : 0;
    for (let i = 0; i < LANE_DASHES; i++) {
      dummy.position.set(span / 2 - i * DASH_GAP - shift, 0.012, -2.4);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, LANE_DASHES]} rotation={[0, 0, 0]}>
      <boxGeometry args={[3, 0.01, 0.16]} />
      <meshStandardMaterial color="#e8e8e8" roughness={0.6} />
    </instancedMesh>
  );
};

/** Roadside reflector posts with orange caps: cheap motion cues that sell the speed. */
const Posts = ({ moving }: { moving: boolean }) => {
  const poles = useRef<THREE.InstancedMesh>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const span = POSTS * POST_GAP;
  useFrame(({ clock }) => {
    if (!poles.current || !caps.current) return;
    const shift = moving ? (clock.elapsedTime * SPEED) % POST_GAP : 0;
    for (let i = 0; i < POSTS; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = span / 2 - Math.floor(i / 2) * POST_GAP * 2 - (side > 0 ? 0 : POST_GAP) - shift;
      const z = side > 0 ? 3.6 : -8.2;
      dummy.position.set(x, 0.55, z);
      dummy.updateMatrix();
      poles.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 1.12, z);
      dummy.updateMatrix();
      caps.current.setMatrixAt(i, dummy.matrix);
    }
    poles.current.instanceMatrix.needsUpdate = true;
    caps.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={poles} args={[undefined, undefined, POSTS]} castShadow>
        <boxGeometry args={[0.12, 1.1, 0.12]} />
        <meshStandardMaterial color="#d1d1d6" roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, undefined, POSTS]}>
        <boxGeometry args={[0.14, 0.16, 0.14]} />
        <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={1.2} />
      </instancedMesh>
    </>
  );
};

type CameraRigProps = { progress: MutableRefObject<number>; reduced: boolean };

/**
 * Scroll drives the camera: a low three-quarter hero shot that swings around to a chase cam
 * as the visitor scrolls past the hero. The pointer adds a little parallax on top.
 */
const CameraRig = ({ progress, reduced }: CameraRigProps) => {
  const { camera, pointer } = useThree();
  const from = useMemo(() => new THREE.Vector3(20, 3.2, 12), []);
  const to = useMemo(() => new THREE.Vector3(-16, 6, 5), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(0, -0.5, -1), []);
  useFrame(() => {
    const p = reduced ? 0 : THREE.MathUtils.smoothstep(progress.current, 0, 1);
    target.lerpVectors(from, to, p);
    if (!reduced) { target.x += pointer.x * 0.8; target.y += pointer.y * 0.4; }
    camera.position.lerp(target, 0.08);
    camera.lookAt(look);
  });
  return null;
};

type RoadSceneProps = { progress: MutableRefObject<number>; reduced: boolean };

export const RoadScene = ({ progress, reduced }: RoadSceneProps) => (
  <Canvas shadows dpr={[1, 2]} camera={{ position: [20, 3.2, 12], fov: 36 }}>
    <color attach="background" args={["#141416"]} />
    <fog attach="fog" args={["#141416", 18, 60]} />
    <ambientLight intensity={0.7} />
    <hemisphereLight args={["#ffb27a", "#1c1c1e", 0.6]} />
    <directionalLight position={[-8, 10, 6]} intensity={2.4} color="#ffd9b8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={8} shadow-camera-bottom={-8} />
    <pointLight position={[-3, 3.5, -5]} color={ORANGE} intensity={45} distance={16} />
    <pointLight position={[6, 4, 6]} color="#ffffff" intensity={20} distance={16} />
    <pointLight position={[11.8, 1.3, -1.2]} color="#fff1c9" intensity={25} distance={12} />
    <CameraRig progress={progress} reduced={reduced} />

    <group position={[3.2, 0, -1.2]}>
      <Truck driving={!reduced} />
    </group>

    {/* asphalt + shoulders */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2.3]} receiveShadow>
      <planeGeometry args={[220, 12]} />
      <meshStandardMaterial color="#2a2a2c" roughness={0.95} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[220, 80]} />
      <meshStandardMaterial color="#19191b" roughness={1} />
    </mesh>
    {[3.5, -8.1].map((z) => (
      <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, z + (z > 0 ? -0.2 : 0.2)]}>
        <planeGeometry args={[220, 0.14]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
    ))}
    <Dashes moving={!reduced} />
    <Posts moving={!reduced} />
  </Canvas>
);
