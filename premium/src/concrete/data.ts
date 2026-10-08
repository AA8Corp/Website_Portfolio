import type { GarmentType } from "./garments";

export type Category = "tops" | "bottoms" | "headwear";

export type Product = {
  id: string;
  name: string;
  price: number;
  type: GarmentType;
  category: Category;
  fill: string;
  ink: string;
  color: string;
  fabric: string;
  fit: string;
  made: number;
  left: number;
  sizes: string[];
  out: string[];
  blurb: string;
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

export const PRODUCTS: Product[] = [
  { id: "slab-hoodie", name: "Slab Hoodie", price: 98, type: "hoodie", category: "tops", fill: "#EDEAE3", ink: "#111111", color: "Bone", fabric: "500 GSM brushed fleece, 100% cotton", fit: "Boxy, dropped shoulder. Size down for a closer fit.", made: 220, left: 14, sizes: SIZES, out: ["S"], blurb: "Heaviest thing we make. Double-lined hood, no drawcord aglets to rattle, cuffs that don’t give up." },
  { id: "cracked-tee", name: "Cracked CC Tee", price: 48, type: "tee", category: "tops", fill: "#111111", ink: "#D7263D", color: "Black", fabric: "300 GSM jersey, garment dyed", fit: "Oversized, true to size.", made: 300, left: 0, sizes: SIZES, out: SIZES, blurb: "The one that sold out in 11 minutes. Distressed water-based print that fades the right way." },
  { id: "rebar-cargo", name: "Rebar Cargo", price: 110, type: "pants", category: "bottoms", fill: "#8A8D93", ink: "#111111", color: "Concrete", fabric: "14 oz cotton canvas, bar-tacked", fit: "Relaxed straight leg, adjustable hem.", made: 180, left: 6, sizes: SIZES, out: ["S", "XXL"], blurb: "Six pockets, two of them big enough for a deck tool and a phone. Knees reinforced for when you eat it." },
  { id: "block-tee", name: "Block Logo Tee", price: 45, type: "tee", category: "tops", fill: "#EDEAE3", ink: "#D7263D", color: "Bone", fabric: "300 GSM jersey", fit: "Oversized, true to size.", made: 300, left: 22, sizes: SIZES, out: [], blurb: "The everyday one. Hazard-red CC on bone, printed four blocks from the shop." },
  { id: "curb-crew", name: "Curb Crew", price: 85, type: "crew", category: "tops", fill: "#D7263D", ink: "#EDEAE3", color: "Hazard red", fabric: "450 GSM loopback fleece", fit: "Boxy, cropped 2 in shorter than the hoodie.", made: 160, left: 3, sizes: SIZES, out: ["S", "M", "XXL"], blurb: "Loud on purpose. Ribbed side panels so it holds its shape after a hundred washes." },
  { id: "block-cap", name: "Block 5-Panel", price: 38, type: "cap", category: "headwear", fill: "#2a2a2a", ink: "#EDEAE3", color: "Black", fabric: "Nylon shell, cotton sweatband", fit: "One size, adjustable strap.", made: 120, left: 0, sizes: ["OS"], out: ["OS"], blurb: "Flat brim, unstructured crown, rubber CC patch. Gone." },
  { id: "slab-hoodie-concrete", name: "Slab Hoodie", price: 98, type: "hoodie", category: "tops", fill: "#8A8D93", ink: "#EDEAE3", color: "Concrete", fabric: "500 GSM brushed fleece, 100% cotton", fit: "Boxy, dropped shoulder. Size down for a closer fit.", made: 140, left: 9, sizes: SIZES, out: ["XXL"], blurb: "Same build as the bone, in the color of the sidewalk it was named after." },
  { id: "rebar-cargo-black", name: "Rebar Cargo", price: 110, type: "pants", category: "bottoms", fill: "#1d1d1d", ink: "#D7263D", color: "Black", fabric: "14 oz cotton canvas, bar-tacked", fit: "Relaxed straight leg, adjustable hem.", made: 140, left: 11, sizes: SIZES, out: [], blurb: "Black canvas with a red tab. Hides the grime, shows the wear." },
];

export const productById = (id: string | undefined) => PRODUCTS.find((p) => p.id === id);

export const EVENTS = [
  { date: "2026-10-17", label: "Oct 17", title: "Night session", body: "Eastside DIY spot. Bring a board, we bring lights.", tag: "Free" },
  { date: "2026-10-24", label: "Oct 24", title: "Print night", body: "Pull your own Drop 07 tee on our press. 40 spots.", tag: "RSVP" },
  { date: "2026-11-07", label: "Nov 07", title: "Sneaker swap", body: "Trade, sell, show off. Tables are first come.", tag: "Free" },
  { date: "2026-11-21", label: "Nov 21", title: "Drop 08 preview", body: "Members see it first. Text list only.", tag: "Invite" },
];

export const LOOKS = [
  { id: "slab-hoodie", caption: "5th and Main, 2:14 AM", bg: "#262626" },
  { id: "rebar-cargo", caption: "Under the Route 9 overpass", bg: "#3b3c3f" },
  { id: "curb-crew", caption: "Lot behind the laundromat", bg: "#1c1c1c" },
  { id: "cracked-tee", caption: "Rooftop on Ash St", bg: "#8A8D93" },
  { id: "block-cap", caption: "Bus stop, last stop", bg: "#2a1416" },
  { id: "slab-hoodie-concrete", caption: "Parking structure, level 4", bg: "#1a1a1a" },
];

/** Next Friday at 12 PM Eastern (16:00 UTC while daylight time is in effect). */
export const nextDrop = (): Date => {
  const now = new Date();
  const t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 16));
  t.setUTCDate(t.getUTCDate() + ((5 - t.getUTCDay() + 7) % 7));
  if (t <= now) t.setUTCDate(t.getUTCDate() + 7);
  return t;
};
