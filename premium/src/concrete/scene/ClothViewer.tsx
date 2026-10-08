import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { drawGarment, type GarmentType } from "../garments";

const SEG_X = 40;
const SEG_Y = 44;
const W = 3.0;
const H = 3.3;

/** Paints the flat garment into a canvas texture once Anton has loaded, so the chest print uses the real face. */
const useGarmentTexture = (type: GarmentType, fill: string, ink: string) => {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    let cancelled = false;
    const scale = 4;
    const paint = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = 300 * scale;
      canvas.height = 330 * scale;
      const ctx = canvas.getContext("2d")!;
      drawGarment(ctx, type, fill, ink, scale);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      setTexture(tex);
    };
    document.fonts.load("56px Anton").then(paint, paint);
    return () => { cancelled = true; };
  }, [type, fill, ink]);
  return texture;
};

/**
 * The garment hangs from its top edge like it's pinned to a wall. A few layered sine waves,
 * scaled by distance from the top, move the vertices; the pointer acts as a gust.
 */
const Cloth = ({ texture, reduced }: { texture: THREE.Texture; reduced: boolean }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.PlaneGeometry(W, H, SEG_X, SEG_Y), []);
  const base = useMemo(() => Float32Array.from(geometry.attributes.position!.array), [geometry]);
  const gust = useRef(0);

  useFrame(({ clock, pointer }) => {
    if (reduced) return;
    const pos = geometry.attributes.position!;
    const t = clock.elapsedTime;
    gust.current += (pointer.x * 0.6 - gust.current) * 0.04;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3]!;
      const y = base[i * 3 + 1]!;
      const hang = (H / 2 - y) / H; // 0 at the top edge, 1 at the hem
      const sway = Math.sin(t * 1.4 + y * 1.6) * 0.06 + Math.sin(t * 2.3 + x * 2.1 + y) * 0.035;
      const z = (sway + gust.current * 0.25 * Math.sin(t * 2 + x)) * hang * hang * 2.2;
      pos.setXYZ(i, x + gust.current * 0.08 * hang * hang, y, z);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} geometry={geometry} castShadow>
      <meshStandardMaterial map={texture} transparent alphaTest={0.4} side={THREE.DoubleSide} roughness={0.92} />
    </mesh>
  );
};

type ClothViewerProps = { type: GarmentType; fill: string; ink: string; backdrop: string; reduced: boolean };

export const ClothViewer = ({ type, fill, ink, backdrop, reduced }: ClothViewerProps) => {
  const texture = useGarmentTexture(type, fill, ink);
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5.6], fov: 38 }}>
      <color attach="background" args={[backdrop]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[-3, 4, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[3, -2, 2]} color="#D7263D" intensity={6} distance={8} />
      {/* wall behind the garment catches its shadow */}
      <mesh position={[0, 0, -0.6]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color={backdrop} roughness={1} />
      </mesh>
      {/* two pins along the top edge */}
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, H / 2 - 0.12, 0.06]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#8A8D93" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {texture && <Cloth texture={texture} reduced={reduced} />}
      <OrbitControls enablePan={false} enableZoom={false} minAzimuthAngle={-0.7} maxAzimuthAngle={0.7} minPolarAngle={1.2} maxPolarAngle={1.9} />
    </Canvas>
  );
};
