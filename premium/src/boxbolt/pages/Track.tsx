import { motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useReducedMotion } from "../../shared/useReducedMotion";

const ROUTE = "M80 440 L200 440 L240 400 L240 330 L330 300 L470 300 L520 250 L520 190 L610 160 L700 110";
const STOPS = [
  { at: 0, title: "Picked up", detail: "Riverside Supply Co., 4 pallets", time: "9:47 AM" },
  { at: 0.36, title: "Merged onto I-80 E", detail: "Mile marker 112", time: "10:21 AM" },
  { at: 0.72, title: "Exit 41, Commerce Pkwy", detail: "Local roads, 9 mi to go", time: "" },
  { at: 1, title: "Delivered", detail: "Photo proof and signature to your inbox", time: "" },
];
const TOTAL_MINUTES = 118;
const DEMO_ID = "BB-240817";

const CityGrid = () => (
  <g className="map-grid">
    {Array.from({ length: 17 }, (_, i) => <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={520} />)}
    {Array.from({ length: 11 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 50} x2={800} y2={i * 50} />)}
  </g>
);

export const Track = () => {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState(DEMO_ID);
  const [loadId, setLoadId] = useState(DEMO_ID);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0.52);
  const path = useRef<SVGPathElement>(null);
  const [point, setPoint] = useState({ x: 0, y: 0, angle: 0 });

  // Advance the demo load slowly so the page feels live. One loop is about 40 seconds.
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setProgress((p) => (p >= 1 ? 1 : Math.min(1, p + dt / 40)));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, loadId]);

  useEffect(() => {
    const el = path.current;
    if (!el) return;
    const len = el.getTotalLength();
    const a = el.getPointAtLength(len * progress);
    const b = el.getPointAtLength(Math.min(len, len * progress + 2));
    setPoint({ x: a.x, y: a.y, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI });
  }, [progress]);

  const minutesLeft = Math.round(TOTAL_MINUTES * (1 - progress));
  const eta = new Date(Date.now() + minutesLeft * 60000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const delivered = progress >= 1;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const id = query.trim().toUpperCase();
    if (!/^BB-\d{6}$/.test(id)) { setError("Load numbers look like BB-240817: “BB-” and six digits."); return; }
    setError("");
    setLoadId(id);
    setProgress(0.08);
  };

  return (
    <section className="track-page">
      <div className="wrap track-layout">
        <div className="track-side">
          <h1>Where’s my load?</h1>
          <form className="track-form" onSubmit={submit} noValidate>
            <label htmlFor="track-id">Load number</label>
            <div className="track-row">
              <input id="track-id" value={query} onChange={(e) => { setQuery(e.target.value); if (error) setError(""); }} autoComplete="off" spellCheck={false} aria-invalid={!!error} aria-describedby="track-hint" />
              <button className="btn btn-orange" type="submit">Track load</button>
            </div>
            <p id="track-hint" className={error ? "track-error" : "track-hint"}>{error || "Any number in the BB-000000 format works in this demo."}</p>
          </form>

          <div className="tr-card">
            <div className="tr-head">
              <b>{loadId}</b>
              <span className={`tr-eta${delivered ? " is-done" : ""}`}>{delivered ? "Delivered" : `ETA ${eta}`}</span>
            </div>
            <div className="tr-progress"><motion.span animate={{ scaleX: progress }} initial={false} transition={{ duration: 0.2 }} /></div>
            <p className="tr-meta">{delivered ? "Signed for by J. Park at the dock." : `${minutesLeft} min out. Driver: Marcus T., (555) 555-0173`}</p>
            <ol className="timeline">
              {STOPS.map((s, i) => {
                const next = STOPS[i + 1]?.at ?? Infinity;
                const state = delivered || progress >= next ? "done" : progress >= s.at ? "now" : "todo";
                return (
                  <li key={s.title} className={`is-${state}`}>
                    <b>{s.title}</b>
                    <span>{s.detail}{s.time ? `, ${s.time}` : ""}</span>
                  </li>
                );
              })}
            </ol>
            {delivered && <button className="link-btn" type="button" onClick={() => setProgress(0.08)}>Replay this delivery</button>}
          </div>
        </div>

        <figure className="map" aria-label={`Route map. The truck is ${Math.round(progress * 100)} percent of the way to the delivery.`}>
          <svg viewBox="0 0 800 520" role="img" aria-hidden="true">
            <rect width="800" height="520" className="map-bg" />
            <CityGrid />
            <path d="M0 210 C 160 240, 280 160, 420 200 S 650 260, 800 220" className="map-river" />
            <path d="M0 300 L800 300" className="map-highway" />
            <path d="M520 0 L520 520" className="map-road" />
            <path d="M240 520 L240 0" className="map-road" />
            <text x="16" y="292" className="map-label">I-80</text>
            <path d={ROUTE} className="map-route-bg" />
            <path ref={path} d={ROUTE} className="map-route" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - progress} />
            <rect x="68" y="428" width="24" height="24" className="map-yard" />
            <text x="62" y="476" className="map-label">Pickup</text>
            <g transform="translate(700 110)">
              <circle r="22" className="map-dest-pulse" />
              <circle r="9" className="map-dest" />
              <text x="-30" y="-20" className="map-label">Drop</text>
            </g>
            <g transform={`translate(${point.x} ${point.y}) rotate(${point.angle})`}>
              <rect x="-15" y="-8" width="22" height="16" rx="2" className="map-truck-box" />
              <rect x="7" y="-7" width="9" height="14" rx="2" className="map-truck-cab" />
              <path d="M-2 -6 -8 1h4l-3 6 7-8h-4z" className="map-truck-bolt" />
            </g>
          </svg>
          <figcaption>Live GPS, pinged every 60 seconds. Demo route.</figcaption>
        </figure>
      </div>
    </section>
  );
};
