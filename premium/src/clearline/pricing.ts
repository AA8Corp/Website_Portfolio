import { SPACES, type SpaceId } from "./data";

export type AddOnId = "porter" | "windows" | "floors" | "report";

export const ADD_ONS: { id: AddOnId; name: string; detail: string; monthly: number }[] = [
  { id: "porter", name: "Daytime porter", detail: "Restrooms and spills, 4 hours a day", monthly: 1450 },
  { id: "windows", name: "Interior glass", detail: "All partitions and inside windows, monthly", monthly: 180 },
  { id: "floors", name: "Quarterly floor care", detail: "Strip, seal, and burnish hard floors", monthly: 240 },
  { id: "report", name: "Sustainability report", detail: "Product, water, and waste data for your ESG filing", monthly: 60 },
];

export type QuoteInput = {
  space: SpaceId;
  sqft: number;
  restrooms: number;
  visits: number;
  addOns: AddOnId[];
};

export type QuoteBreakdown = { base: number; restrooms: number; addOns: number; low: number; high: number; perVisit: number };

const VISITS_PER_MONTH = 4.33;

/** Per-visit cost scales sub-linearly with area; clinics and retail carry a factor for protocol work. */
export const priceQuote = (q: QuoteInput): QuoteBreakdown => {
  const factor = SPACES.find((s) => s.id === q.space)?.rateFactor ?? 1;
  const perVisit = 0.028 * Math.pow(q.sqft, 0.93) * factor;
  const base = Math.max(320, perVisit * q.visits * VISITS_PER_MONTH);
  const restrooms = q.restrooms * 9 * q.visits * VISITS_PER_MONTH;
  const addOns = ADD_ONS.filter((a) => q.addOns.includes(a.id)).reduce((sum, a) => sum + a.monthly, 0);
  const mid = base + restrooms + addOns;
  return { base, restrooms, addOns, low: mid * 0.94, high: mid * 1.1, perVisit: (base + restrooms) / (q.visits * VISITS_PER_MONTH) };
};
