import { GARMENT_LAYERS, PRINT, paintFor, type GarmentType } from "../garments";

type GarmentArtProps = { type: GarmentType; fill: string; ink: string; label?: string };

/** The same drawing as the 3D cloth texture, as lightweight inline SVG for cards and thumbnails. */
export const GarmentArt = ({ type, fill, ink, label }: GarmentArtProps) => {
  const print = PRINT[type];
  return (
    <svg viewBox="0 0 300 330" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {GARMENT_LAYERS[type].map((layer, i) =>
        layer.stroke ? (
          <path key={i} d={layer.d} fill="none" stroke={paintFor(layer.paint, fill, ink)} strokeWidth={layer.stroke} strokeLinecap="round" />
        ) : (
          <path key={i} d={layer.d} fill={paintFor(layer.paint, fill, ink)} stroke={layer.paint === "base" ? "rgba(0,0,0,.35)" : undefined} strokeWidth={2} />
        ),
      )}
      {print && (
        <g filter="url(#cc-grit)">
          <text x={print.x} y={print.y} textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize={print.size} fill={ink} letterSpacing={2}>CC</text>
          <rect x={print.x - print.size * 0.75} y={print.y + 8} width={print.size * 1.5} height={5} fill={ink} />
        </g>
      )}
      {type === "pants" && <rect x={196} y={230} width={22} height={34} fill={ink} />}
    </svg>
  );
};

/** Mounted once per page: the speckle filter that distresses SVG prints. */
export const GritFilter = () => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
    <filter id="cc-grit" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={7} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.05" result="speck" />
      <feComposite in="SourceGraphic" in2="speck" operator="in" />
    </filter>
  </svg>
);
