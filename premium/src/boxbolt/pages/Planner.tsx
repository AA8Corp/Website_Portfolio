import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy, useMemo, useRef, useState } from "react";
import { AnimatedNumber } from "../../shared/AnimatedNumber";
import { formatUsd } from "../../shared/money";
import { useReducedMotion } from "../../shared/useReducedMotion";
import { ITEM_SPECS, PAYLOAD_LB, SAMPLE_ORDER, loadStats, placeItem, priceLoad, type ItemKind, type Placed } from "../data";

const PlannerScene = lazy(() => import("../scene/PlannerScene").then((m) => ({ default: m.PlannerScene })));

const KINDS: ItemKind[] = ["pallet", "half", "crate", "appliance"];

const Meter = ({ label, value, detail, warn }: { label: string; value: number; detail: string; warn?: boolean }) => (
  <div className={`meter${warn ? " is-warn" : ""}`}>
    <div className="meter-top"><span>{label}</span><b>{detail}</b></div>
    <div className="meter-bar"><motion.span animate={{ scaleX: Math.min(1, value) }} initial={false} transition={{ type: "spring", stiffness: 200, damping: 26 }} /></div>
  </div>
);

const buildSample = (): Placed[] => {
  const out: Placed[] = [];
  SAMPLE_ORDER.forEach((kind, i) => {
    const r = placeItem(out, kind, i + 1);
    if (r.ok) out.push(r.placed);
  });
  return out;
};

export const Planner = () => {
  const reduced = useReducedMotion();
  const [items, setItems] = useState<Placed[]>(buildSample);
  const [message, setMessage] = useState<string>("");
  const [lastId, setLastId] = useState<number | null>(null);
  const [miles, setMiles] = useState(60);
  const [inside, setInside] = useState(false);
  const [booked, setBooked] = useState(false);
  const nextId = useRef(100);

  const stats = useMemo(() => loadStats(items), [items]);
  const price = useMemo(() => priceLoad(miles, items.length, inside), [miles, items.length, inside]);

  const add = (kind: ItemKind) => {
    const id = nextId.current++;
    const result = placeItem(items, kind, id);
    setBooked(false);
    if (!result.ok) { setMessage(result.reason); return; }
    setItems((list) => [...list, result.placed]);
    setLastId(id);
    setMessage(`${ITEM_SPECS[kind].name} loaded.`);
  };

  /** Remove a piece and re-pack the rest so nothing floats where it used to rest. */
  const remove = (id: number) => {
    const kept = items.filter((it) => it.id !== id);
    const repacked: Placed[] = [];
    kept.forEach((it) => { const r = placeItem(repacked, it.kind, it.id); if (r.ok) repacked.push(r.placed); });
    setItems(repacked);
    setLastId(null);
    setBooked(false);
    setMessage("Removed. Load re-packed.");
  };

  const clear = () => { setItems([]); setLastId(null); setBooked(false); setMessage("Truck is empty."); };
  const sample = () => { setItems(buildSample()); setLastId(null); setBooked(false); setMessage("Sample order loaded."); };

  return (
    <section className="planner">
      <div className="planner-stage">
        <Suspense fallback={<div className="stage-loading">Loading truck</div>}>
          <PlannerScene items={items} reduced={reduced} lastId={lastId} />
        </Suspense>
        <p className="stage-hint">Drag to orbit. Scroll or pinch to zoom.</p>
        <div className="stage-meters">
          <Meter label="Payload" value={stats.weight / PAYLOAD_LB} detail={`${stats.weight.toLocaleString("en-US")} / 10,000 lb`} warn={stats.weight > PAYLOAD_LB * 0.9} />
          <Meter label="Floor" value={stats.floor} detail={`${Math.round(stats.floor * 100)}%`} />
          <Meter label="Cube" value={stats.cube} detail={`${Math.round(stats.cube * 100)}%`} />
        </div>
      </div>

      <aside className="planner-panel" aria-label="Load builder">
        <h1>Load planner</h1>
        <p className="panel-sub">Add what you’re shipping. We pack it nose to doors, stack where it’s safe, and price it flat.</p>

        <div className="add-grid">
          {KINDS.map((kind) => {
            const s = ITEM_SPECS[kind];
            return (
              <button key={kind} type="button" className="add-btn" onClick={() => add(kind)}>
                <span className="add-swatch" style={{ background: s.color }} aria-hidden="true" />
                <b>{s.name}</b>
                <span>{s.size}, {s.lb.toLocaleString("en-US")} lb</span>
              </button>
            );
          })}
        </div>
        <p className="planner-msg" role="status" aria-live="polite">{message}</p>

        <div className="manifest-head">
          <h2>Manifest <span>{items.length} pieces</span></h2>
          <div className="manifest-actions">
            <button type="button" className="link-btn" onClick={sample}>Load sample</button>
            <button type="button" className="link-btn" onClick={clear} disabled={!items.length}>Clear truck</button>
          </div>
        </div>
        <ul className="manifest">
          <AnimatePresence initial={false}>
            {items.map((it, i) => (
              <motion.li key={it.id} layout initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className={it.id === lastId ? "is-new" : undefined}>
                <span className="mf-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="mf-name">{ITEM_SPECS[it.kind].name}</span>
                <span className="mf-lb">{ITEM_SPECS[it.kind].lb.toLocaleString("en-US")} lb</span>
                <button type="button" className="mf-remove" onClick={() => remove(it.id)} aria-label={`Remove ${ITEM_SPECS[it.kind].name} ${i + 1}`}>×</button>
              </motion.li>
            ))}
          </AnimatePresence>
          {!items.length && <li className="mf-empty">Nothing loaded. Add a pallet above or load the sample order.</li>}
        </ul>

        <div className="rate">
          <div className="field">
            <label htmlFor="miles">Distance <output htmlFor="miles">{miles} mi</output></label>
            <input id="miles" type="range" min={5} max={250} step={5} value={miles} onChange={(e) => { setMiles(Number(e.target.value)); setBooked(false); }} />
          </div>
          <label className="check"><input type="checkbox" checked={inside} onChange={(e) => { setInside(e.target.checked); setBooked(false); }} /> Inside delivery, up to 2 flights (+$45)</label>
          <div className="rate-total">
            <span>Flat rate</span>
            <b><AnimatedNumber value={price.total} format={formatUsd} /></b>
          </div>
          <p className="rate-lines">Base and distance {formatUsd(price.base)}, handling {formatUsd(price.handling)}{inside ? ", inside delivery $45" : ""}. No fuel surcharge.</p>
          <button type="button" className="btn btn-orange btn-lg btn-block" disabled={!items.length} onClick={() => setBooked(true)}>
            {booked ? "Truck held" : "Book this truck"}
          </button>
          <p className="rate-note">{booked ? "Held for 15 minutes. Demo only, no booking was created." : "Demo only. No booking is created."}</p>
        </div>
      </aside>
    </section>
  );
};
