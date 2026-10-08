/**
 * Flat garment illustrations as plain path data, so the same drawing renders as inline SVG
 * (product cards) and onto a canvas via Path2D (the 3D cloth texture). viewBox is 300 × 330.
 */
export type GarmentType = "tee" | "crew" | "hoodie" | "pants" | "cap";

type Layer = { d: string; paint: "base" | "shade" | "ink"; stroke?: number };

const SHADE = "rgba(0,0,0,.18)";

export const GARMENT_LAYERS: Record<GarmentType, Layer[]> = {
  tee: [
    { d: "M95 34 58 46 14 92l38 38 26-18v196h144V112l26 18 38-38-44-46-37-12c-8 22-28 34-55 34S103 56 95 34z", paint: "base" },
    { d: "M95 34c8 22 28 34 55 34s47-12 55-34", paint: "shade", stroke: 7 },
    { d: "M78 112v40M222 112v40", paint: "shade", stroke: 2 },
  ],
  crew: [
    { d: "M95 34 56 48 30 120 18 292h38l22-150v166h144V142l22 150h38l-12-172-26-72-39-14c-8 20-28 32-55 32S103 54 95 34z", paint: "base" },
    { d: "M95 34c8 20 28 32 55 32s47-12 55-32", paint: "shade", stroke: 8 },
    { d: "M78 300h144", paint: "shade", stroke: 14 },
    { d: "M18 282h38M244 282h38", paint: "shade", stroke: 10 },
  ],
  hoodie: [
    { d: "M150 10c-36 0-58 22-60 52l60 26 60-26c-2-30-24-52-60-52z", paint: "base" },
    { d: "M150 22c-24 0-38 16-40 38l40 18 40-18c-2-22-16-38-40-38z", paint: "shade" },
    { d: "M92 48 56 60 30 128 18 296h38l22-150v164h144V146l22 150h38l-12-168-26-68-36-12-60 30z", paint: "base" },
    { d: "M140 80v52M160 80v52", paint: "ink", stroke: 3 },
    { d: "M98 226h104l14 60H84z", paint: "shade" },
    { d: "M78 300h144", paint: "shade", stroke: 14 },
  ],
  pants: [
    { d: "M84 16h132l22 304h-70l-18-196-18 196H62z", paint: "base" },
    { d: "M84 16h132v20H84z", paint: "shade" },
    { d: "M150 36v80", paint: "shade", stroke: 2 },
    { d: "M66 150h40v52H66zM194 150h40v52h-40z", paint: "shade" },
  ],
  cap: [
    { d: "M58 196c0-66 40-104 92-104s92 38 92 104z", paint: "base" },
    { d: "M150 92v104M104 104c-12 26-16 56-14 92M196 104c12 26 16 56 14 92", paint: "shade", stroke: 2 },
    { d: "M40 196c40-8 180-8 220 6l-6 26c-40-12-170-14-208-4z", paint: "base" },
    { d: "M44 214c40-8 170-6 212 4", paint: "shade", stroke: 6 },
  ],
};

/** Where the chest print sits for each garment: center x, baseline y, font size. */
export const PRINT: Record<GarmentType, { x: number; y: number; size: number } | null> = {
  tee: { x: 150, y: 170, size: 56 },
  crew: { x: 150, y: 172, size: 60 },
  hoodie: { x: 150, y: 198, size: 48 },
  pants: null,
  cap: { x: 150, y: 172, size: 40 },
};

export const paintFor = (paint: Layer["paint"], fill: string, ink: string) => (paint === "base" ? fill : paint === "ink" ? ink : SHADE);

/** Draw a garment into a 2D canvas context at the given scale. Used for the cloth texture. */
export const drawGarment = (ctx: CanvasRenderingContext2D, type: GarmentType, fill: string, ink: string, scale: number) => {
  ctx.save();
  ctx.scale(scale, scale);
  for (const layer of GARMENT_LAYERS[type]) {
    const path = new Path2D(layer.d);
    const color = paintFor(layer.paint, fill, ink);
    if (layer.stroke) {
      ctx.lineWidth = layer.stroke;
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.stroke(path);
    } else {
      ctx.fillStyle = color;
      ctx.fill(path);
      if (layer.paint === "base") { ctx.lineWidth = 2; ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.stroke(path); }
    }
  }
  const print = PRINT[type];
  if (print) {
    // Print on its own layer, then knock out specks so it looks screen-printed and worn
    // without punching holes through the fabric underneath.
    const layer = document.createElement("canvas");
    layer.width = 300;
    layer.height = 330;
    const p = layer.getContext("2d")!;
    p.fillStyle = ink;
    p.font = `${print.size}px Anton, Impact, sans-serif`;
    p.textAlign = "center";
    p.fillText("CC", print.x, print.y);
    p.fillRect(print.x - print.size * 0.75, print.y + 8, print.size * 1.5, 5);
    p.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 420; i++) {
      const x = print.x - print.size + Math.random() * print.size * 2;
      const y = print.y - print.size + Math.random() * (print.size + 16);
      p.fillRect(x, y, Math.random() * 2.2, Math.random() * 2.2);
    }
    ctx.drawImage(layer, 0, 0);
  }
  if (type === "pants") {
    ctx.fillStyle = ink;
    ctx.fillRect(196, 230, 22, 34);
  }
  ctx.restore();
};
