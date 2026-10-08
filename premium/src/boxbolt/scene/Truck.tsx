import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { forwardRef, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { CARGO } from "../data";

export const ORANGE = "#FF5C00";
const CHARCOAL = "#1C1C1E";
const BOX = "#4a4a4e";

/** Bolt outline, the same cut as the logo, drawn once and extruded for each side of the box. */
const boltShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(0.55, 1.1);
  s.lineTo(-0.25, -0.05);
  s.lineTo(0.12, -0.05);
  s.lineTo(-0.35, -1.1);
  s.lineTo(0.45, 0.2);
  s.lineTo(0.05, 0.2);
  s.lineTo(0.55, 1.1);
  return s;
})();

const Wheel = ({ x, z, spin }: { x: number; z: number; spin: boolean }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (spin && ref.current) ref.current.rotation.z -= dt * 9;
  });
  return (
    <group position={[x, 0.5, z]}>
      <group ref={ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.34, 28]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z > 0 ? 0.172 : -0.172]}>
          <cylinderGeometry args={[0.26, 0.26, 0.02, 6]} />
          <meshStandardMaterial color="#8e8e93" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

type TruckProps = {
  /** spin wheels and bob the body, for the driving hero */
  driving?: boolean;
  /** see-through cargo box with one side open, for the load planner */
  cutaway?: boolean;
  children?: ReactNode;
};

/**
 * A 26 ft box truck built from primitives, facing +x. The cargo floor sits at CARGO.deck,
 * so anything rendered as children in cargo coordinates lands inside the box.
 */
export const Truck = forwardRef<THREE.Group, TruckProps>(({ driving = false, cutaway = false, children }, ref) => {
  const body = useRef<THREE.Group>(null);
  const boxX = -0.6;
  const cabX = CARGO.length / 2 + boxX + 1.3;
  const boxH = CARGO.height + 0.12;
  const boxY = CARGO.deck + boxH / 2 - 0.04;
  const w = CARGO.width + 0.12;

  useFrame(({ clock }) => {
    if (driving && body.current) body.current.position.y = Math.sin(clock.elapsedTime * 11) * 0.012 + Math.sin(clock.elapsedTime * 2.3) * 0.01;
  });

  const shell = useMemo(
    () => (cutaway
      ? { color: "#9ea3ab", transparent: true, opacity: 0.12, depthWrite: false }
      : { color: BOX, transparent: false, opacity: 1, depthWrite: true }),
    [cutaway],
  );

  return (
    <group ref={ref}>
      <group ref={body}>
        {/* chassis rail */}
        <mesh position={[0.6, 0.85, 0]} castShadow>
          <boxGeometry args={[CARGO.length + 3.4, 0.22, 1.6]} />
          <meshStandardMaterial color="#222" roughness={0.8} />
        </mesh>

        {/* cargo box */}
        <group position={[boxX, 0, 0]}>
          <mesh position={[0, boxY, 0]} castShadow={!cutaway} receiveShadow>
            <boxGeometry args={[CARGO.length + 0.12, boxH, w]} />
            <meshStandardMaterial {...shell} roughness={0.55} metalness={0.1} side={cutaway ? THREE.DoubleSide : THREE.FrontSide} />
          </mesh>
          {cutaway && (
            <>
              <lineSegments position={[0, boxY, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(CARGO.length + 0.12, boxH, w)]} />
                <lineBasicMaterial color={ORANGE} />
              </lineSegments>
              <mesh position={[0, CARGO.deck - 0.03, 0]} receiveShadow>
                <boxGeometry args={[CARGO.length, 0.06, CARGO.width]} />
                <meshStandardMaterial color="#5b4a3a" roughness={0.9} />
              </mesh>
            </>
          )}
          {!cutaway && (
            <>
              {/* ribs */}
              {[-3, -1.5, 0, 1.5, 3].map((x) => (
                <mesh key={x} position={[x, boxY, 0]}>
                  <boxGeometry args={[0.05, boxH + 0.01, w + 0.01]} />
                  <meshStandardMaterial color="#2c2c2e" roughness={0.6} />
                </mesh>
              ))}
              {[1, -1].map((side) => (
                <mesh key={side} position={[0.9, boxY + 0.05, side * (w / 2 + 0.03)]} rotation={[0, side > 0 ? 0 : Math.PI, 0]} scale={0.95}>
                  <extrudeGeometry args={[boltShape, { depth: 0.04, bevelEnabled: false }]} />
                  <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={0.35} roughness={0.4} />
                </mesh>
              ))}
            </>
          )}
          {children}
        </group>

        {/* cab */}
        <group position={[cabX, 0, 0]}>
          <RoundedBox args={[2.1, 1.75, 2.3]} radius={0.12} position={[0, 1.95, 0]} castShadow>
            <meshStandardMaterial color="#f2f2f2" roughness={0.35} metalness={0.15} />
          </RoundedBox>
          <RoundedBox args={[1.1, 1.0, 2.3]} radius={0.12} position={[0.95, 1.45, 0]} castShadow>
            <meshStandardMaterial color="#f2f2f2" roughness={0.35} metalness={0.15} />
          </RoundedBox>
          {/* windshield and side windows */}
          <mesh position={[1.06, 2.35, 0]} rotation={[0, 0, -0.22]}>
            <boxGeometry args={[0.05, 0.8, 2.1]} />
            <meshStandardMaterial color="#0d1117" roughness={0.1} metalness={0.6} />
          </mesh>
          {[1, -1].map((side) => (
            <mesh key={side} position={[0.25, 2.4, side * 1.16]}>
              <boxGeometry args={[0.9, 0.62, 0.02]} />
              <meshStandardMaterial color="#0d1117" roughness={0.1} metalness={0.6} />
            </mesh>
          ))}
          {/* orange stripe */}
          {[1, -1].map((side) => (
            <mesh key={`s${side}`} position={[0.4, 1.35, side * 1.16]}>
              <boxGeometry args={[2.6, 0.12, 0.02]} />
              <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={0.3} />
            </mesh>
          ))}
          {/* headlights */}
          {[0.8, -0.8].map((z) => (
            <mesh key={z} position={[1.51, 1.3, z]}>
              <boxGeometry args={[0.02, 0.18, 0.36]} />
              <meshStandardMaterial color="#fff6e0" emissive="#fff1c9" emissiveIntensity={driving ? 2.5 : 0.6} />
            </mesh>
          ))}
          <mesh position={[1.52, 0.95, 0]}>
            <boxGeometry args={[0.08, 0.28, 2.2]} />
            <meshStandardMaterial color={CHARCOAL} roughness={0.5} />
          </mesh>
        </group>
      </group>

      <Wheel x={cabX + 0.2} z={1.05} spin={driving} />
      <Wheel x={cabX + 0.2} z={-1.05} spin={driving} />
      <Wheel x={boxX - CARGO.length / 2 + 1.6} z={1.05} spin={driving} />
      <Wheel x={boxX - CARGO.length / 2 + 1.6} z={-1.05} spin={driving} />
      <Wheel x={boxX - CARGO.length / 2 + 2.7} z={1.05} spin={driving} />
      <Wheel x={boxX - CARGO.length / 2 + 2.7} z={-1.05} spin={driving} />
    </group>
  );
});
Truck.displayName = "Truck";
