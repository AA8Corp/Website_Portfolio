import { ContactShadows, Edges, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { ITEM_SPECS, type Placed } from "../data";
import { ORANGE, Truck } from "./Truck";

const DROP_FROM = 3.2;

/** One loaded piece. It drops in from above and settles with a small overshoot. */
const Piece = ({ item, reduced, selected }: { item: Placed; reduced: boolean; selected: boolean }) => {
  const spec = ITEM_SPECS[item.kind];
  const group = useRef<THREE.Group>(null);
  const velocity = useRef(0);
  const startY = reduced ? item.y : item.y + DROP_FROM;

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    // critically-damped-ish spring toward the resting height
    const k = 120, c = 14;
    const force = -k * (g.position.y - item.y) - c * velocity.current;
    velocity.current += force * Math.min(dt, 0.033);
    g.position.y += velocity.current * Math.min(dt, 0.033);
    g.position.x += (item.x - g.position.x) * 0.2;
    g.position.z += (item.z - g.position.z) * 0.2;
  });

  const isPallet = item.kind !== "appliance";
  const deckH = isPallet ? 0.14 : 0;
  const loadH = spec.h - deckH;

  return (
    <group ref={group} position={[item.x, startY, item.z]}>
      {isPallet && (
        <group position={[0, deckH / 2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[spec.l - 0.02, 0.03, spec.w - 0.02]} />
            <meshStandardMaterial color="#c8a06a" roughness={0.9} />
          </mesh>
          {[-1, 0, 1].map((i) => (
            <mesh key={i} position={[0, -0.05, i * (spec.w / 2 - 0.06)]} castShadow>
              <boxGeometry args={[spec.l - 0.02, 0.08, 0.08]} />
              <meshStandardMaterial color="#a57f4c" roughness={0.9} />
            </mesh>
          ))}
        </group>
      )}
      <mesh position={[0, deckH + loadH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[spec.l - 0.06, loadH - 0.01, spec.w - 0.06]} />
        <meshStandardMaterial color={spec.color} roughness={item.kind === "appliance" ? 0.3 : 0.85} metalness={item.kind === "appliance" ? 0.4 : 0} />
        <Edges color={selected ? ORANGE : "#3a2a18"} lineWidth={selected ? 2 : 1} />
      </mesh>
      {item.kind !== "appliance" && (
        <mesh position={[0, deckH + loadH - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, spec.w - 0.08]} />
          <meshStandardMaterial color="#d9c49a" roughness={0.6} />
        </mesh>
      )}
    </group>
  );
};

type PlannerSceneProps = { items: Placed[]; reduced: boolean; lastId: number | null };

/** Narrow screens start further back so the whole truck fits; orbit controls take over from there. */
const startPosition = (): [number, number, number] => (window.matchMedia("(max-width: 700px)").matches ? [15, 12, 21] : [9.5, 8, 13.5]);

export const PlannerScene = ({ items, reduced, lastId }: PlannerSceneProps) => (
  <Canvas shadows dpr={[1, 2]} camera={{ position: startPosition(), fov: 38 }}>
    <color attach="background" args={["#1f1f21"]} />
    <ambientLight intensity={0.8} />
    <hemisphereLight args={["#ffffff", "#2a2a2c", 0.7]} />
    <directionalLight position={[6, 12, 8]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
    <pointLight position={[-2, 4.5, 0]} intensity={12} distance={9} color="#fff4e6" />
    <group position={[-0.4, 0, 0]}>
      <Truck cutaway>
        {items.map((item) => <Piece key={item.id} item={item} reduced={reduced} selected={item.id === lastId} />)}
      </Truck>
    </group>
    <gridHelper args={[40, 40, "#333336", "#2a2a2c"]} position={[0, 0.001, 0]} />
    <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={24} blur={2} far={3} />
    <OrbitControls makeDefault enablePan={false} minDistance={7} maxDistance={30} minPolarAngle={0.25} maxPolarAngle={1.35} target={[-0.6, 1.6, 0]} autoRotate={!reduced} autoRotateSpeed={0.35} />
  </Canvas>
);
