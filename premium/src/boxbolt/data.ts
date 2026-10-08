/** Inside dimensions of the 26 ft box, in meters (the 3D scene works in meters). */
export const CARGO = { length: 7.8, width: 2.36, height: 2.5, deck: 1.15 } as const;
export const PAYLOAD_LB = 10000;

export type ItemKind = "pallet" | "half" | "crate" | "appliance";

export type ItemSpec = {
  kind: ItemKind;
  name: string;
  size: string;
  /** footprint along truck length (x) and width (z), and height, in meters */
  l: number;
  w: number;
  h: number;
  lb: number;
  color: string;
};

export const ITEM_SPECS: Record<ItemKind, ItemSpec> = {
  pallet: { kind: "pallet", name: "Standard pallet", size: "48 × 40 × 48 in", l: 1.22, w: 1.02, h: 1.22, lb: 1200, color: "#b98b55" },
  half: { kind: "half", name: "Half pallet", size: "48 × 20 × 36 in", l: 1.22, w: 0.51, h: 0.91, lb: 500, color: "#c9a271" },
  crate: { kind: "crate", name: "Tall crate", size: "48 × 40 × 72 in", l: 1.22, w: 1.02, h: 1.83, lb: 1800, color: "#8f6a43" },
  appliance: { kind: "appliance", name: "Appliance", size: "36 × 36 × 72 in", l: 0.92, w: 0.92, h: 1.83, lb: 320, color: "#d9dadc" },
};

export type Placed = { id: number; kind: ItemKind; x: number; y: number; z: number };

/** Two lanes across the width, six rows down the length: 12 floor slots for a standard pallet. */
const LANES = 2;
const ROWS = 6;
const SLOT_L = CARGO.length / ROWS;
const SLOT_W = CARGO.width / LANES;

const slotKey = (it: Pick<Placed, "x" | "z">) =>
  `${Math.floor((it.x + CARGO.length / 2) / SLOT_L)}-${Math.floor((it.z + CARGO.width / 2) / SLOT_W)}`;

const topOf = (it: Placed) => it.y - CARGO.deck + ITEM_SPECS[it.kind].h;

export type PlaceResult = { ok: true; placed: Placed } | { ok: false; reason: string };

/**
 * Greedy loader: fill from the nose of the box toward the doors, stacking where height allows.
 * A half pallet first looks for a lone half pallet on top of a stack and slots in beside it.
 */
export const placeItem = (items: Placed[], kind: ItemKind, id: number): PlaceResult => {
  const spec = ITEM_SPECS[kind];
  const weight = items.reduce((sum, it) => sum + ITEM_SPECS[it.kind].lb, 0);
  if (weight + spec.lb > PAYLOAD_LB) {
    return { ok: false, reason: `That puts the load ${(weight + spec.lb - PAYLOAD_LB).toLocaleString("en-US")} lb over the 10,000 lb payload.` };
  }

  for (let row = 0; row < ROWS; row++) {
    for (let lane = 0; lane < LANES; lane++) {
      const cx = -CARGO.length / 2 + SLOT_L * (row + 0.5);
      const cz = -CARGO.width / 2 + SLOT_W * (lane + 0.5);
      const inSlot = items.filter((it) => slotKey(it) === `${row}-${lane}`);
      const height = inSlot.reduce((m, it) => Math.max(m, topOf(it)), 0);
      const onTop = inSlot.filter((it) => Math.abs(topOf(it) - height) < 0.001);
      const loneHalf = onTop.length === 1 && onTop[0]!.kind === "half" ? onTop[0]! : undefined;

      if (kind === "half" && loneHalf) {
        const freeSide = loneHalf.z < cz ? 1 : -1;
        return { ok: true, placed: { id, kind, x: cx, y: loneHalf.y, z: cz + freeSide * (SLOT_W / 4) } };
      }
      if (loneHalf) continue; // don't stack a full item on half a layer
      if (height + spec.h > CARGO.height + 0.001) continue;
      const z = kind === "half" ? cz - SLOT_W / 4 : cz;
      return { ok: true, placed: { id, kind, x: cx, y: CARGO.deck + height, z } };
    }
  }
  return { ok: false, reason: "No floor or stack space left for that item. Remove something or split it across two trucks." };
};

export const loadStats = (items: Placed[]) => {
  const weight = items.reduce((sum, it) => sum + ITEM_SPECS[it.kind].lb, 0);
  const volume = items.reduce((sum, it) => { const s = ITEM_SPECS[it.kind]; return sum + s.l * s.w * s.h; }, 0);
  const cube = volume / (CARGO.length * CARGO.width * CARGO.height);
  const floorKeys = new Set(items.map(slotKey));
  return { weight, cube, floor: floorKeys.size / (ROWS * LANES), count: items.length };
};

export const SAMPLE_ORDER: ItemKind[] = ["pallet", "pallet", "pallet", "crate", "crate", "half", "half", "half", "half", "appliance", "appliance"];

/** Flat rate: base + distance + a small handling charge per piece. Mirrors the static site's calculator. */
export const priceLoad = (miles: number, pieces: number, insideDelivery: boolean) => {
  const base = Math.max(79, 49 + miles * 1.85);
  const handling = Math.max(0, pieces - 1) * 12;
  const inside = insideDelivery ? 45 : 0;
  return { base, handling, inside, total: Math.max(89, base + handling + inside) };
};

export const SERVICES = [
  { name: "Last-mile delivery", detail: "Store or warehouse to your customer’s door", range: "0–50 mi", turn: "Same day", price: "$89" },
  { name: "Regional freight", detail: "Dedicated truck, direct, no cross-docking", range: "50–250 mi", turn: "Next day", price: "$1.85/mi" },
  { name: "Job-site drops", detail: "Materials and tools for contractors, liftgate included", range: "0–120 mi", turn: "4 hr window", price: "$129" },
  { name: "Scheduled routes", detail: "Weekly store replenishment on a fixed day and time", range: "Custom", turn: "Recurring", price: "Quote" },
];
