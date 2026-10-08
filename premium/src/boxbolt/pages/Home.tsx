import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Suspense, lazy, useRef } from "react";
import { Link } from "react-router-dom";
import { CountUp } from "../../shared/CountUp";
import { useReducedMotion } from "../../shared/useReducedMotion";
import { SERVICES } from "../data";

const RoadScene = lazy(() => import("../scene/RoadScene").then((m) => ({ default: m.RoadScene })));

const Hero = () => {
  const reduced = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => { progress.current = v; });
  const firstOpacity = useTransform(scrollYProgress, [0, 0.35, 0.5], [1, 1, 0]);
  const firstY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);
  const secondOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const secondY = useTransform(scrollYProgress, [0.5, 0.7], [40, 0]);

  return (
    <section className="hero-track" ref={track} aria-labelledby="hero-title">
      <div className="hero-sticky">
        <div className="hero-canvas">
          <Suspense fallback={null}>
            <RoadScene progress={progress} reduced={reduced} />
          </Suspense>
        </div>
        <div className="hero-shade" aria-hidden="true" />
        <div className="wrap hero-overlay">
          <motion.div style={reduced ? undefined : { opacity: firstOpacity, y: firstY }} className="hero-block">
            <p className="hero-status"><span className="dot" aria-hidden="true" /> 14 trucks on the road right now</p>
            <h1 id="hero-title" className="hero-title"><span>Small truck.</span><span>Big moves.</span></h1>
            <div className="hero-row">
              <p className="hero-copy">Regional and last-mile freight for small businesses. One truck, one driver, your load. No hub transfers. No call centers.</p>
              <div className="hero-ctas">
                <Link to="/planner" className="btn btn-orange btn-lg">Plan a load in 3D</Link>
                <Link to="/track" className="btn btn-line btn-lg">Track a load</Link>
              </div>
            </div>
          </motion.div>
          {!reduced && (
            <motion.div style={{ opacity: secondOpacity, y: secondY }} className="hero-block hero-second" aria-hidden="true">
              <p className="hero-kicker">Direct. No cross-docking.</p>
              <p className="hero-title hero-title-sm"><span>Your freight never</span><span>leaves our truck.</span></p>
            </motion.div>
          )}
        </div>
        <p className="scroll-cue" aria-hidden="true">Scroll</p>
      </div>
    </section>
  );
};

const RINGS = [
  { r: 190, label: "250 MI", fill: 0.08, dash: true, text: "Next-day, by 5 PM" },
  { r: 118, label: "150", fill: 0.14, dash: false, text: "Next-day, morning delivery" },
  { r: 42, label: "50", fill: 0.35, dash: false, text: "Same-day, 2 hr pickup" },
];

export const Home = () => (
  <>
    <Hero />

    <section className="board" aria-label="BoxBolt by the numbers">
      <div><b><CountUp to={2} suffix=" hr" /></b><span>pickup window, booked same day</span></div>
      <div><b><CountUp to={99.7} decimals={1} suffix="%" /></b><span>loads delivered damage-free in 2025</span></div>
      <div><b><CountUp to={250} suffix=" mi" /></b><span>regional radius from our yard</span></div>
      <div><b><CountUp to={0} prefix="$" /></b><span>fuel surcharges or liftgate fees</span></div>
    </section>

    <section className="section" aria-labelledby="svc-title">
      <div className="wrap">
        <div className="sec-head">
          <h2 id="svc-title">What we haul</h2>
          <p>Four services. Flat rates. A real driver’s phone number on every load.</p>
        </div>
        <div className="svc-table" role="table" aria-label="Services">
          <div className="svc-row svc-row-head" role="row">
            <span role="columnheader">Service</span><span role="columnheader">Range</span><span role="columnheader">Turnaround</span><span role="columnheader">Starts at</span>
          </div>
          {SERVICES.map((s, i) => (
            <motion.div key={s.name} className="svc-row" role="row" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: i * 0.08, duration: 0.35 }}>
              <span role="cell"><b>{s.name}</b><em>{s.detail}</em></span>
              <span role="cell" data-label="Range">{s.range}</span>
              <span role="cell" data-label="Turnaround">{s.turn}</span>
              <span role="cell" data-label="Starts at" className="price">{s.price}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="section section-plate" aria-labelledby="plan-title">
      <div className="wrap teaser">
        <div>
          <h2 id="plan-title">See it fit before we show up</h2>
          <p>Drop pallets, crates, and appliances into a 26 ft box in 3D. Watch the weight, floor, and cube fill up, and get a flat rate on the spot.</p>
          <ul className="teaser-facts">
            <li><b>12</b> pallet floor positions</li>
            <li><b>10,000 lb</b> payload</li>
            <li><b>1,700 ft³</b> of cube</li>
          </ul>
          <Link to="/planner" className="btn btn-orange btn-lg">Open the load planner</Link>
        </div>
        <div className="teaser-grid" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <motion.span key={i} initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.05 * i, type: "spring", stiffness: 300, damping: 18 }} className={i < 9 ? "is-full" : undefined} />
          ))}
        </div>
      </div>
    </section>

    <section className="section" aria-labelledby="cov-title">
      <div className="wrap coverage">
        <div>
          <h2 id="cov-title">Coverage</h2>
          <p className="cov-copy">One yard. Three rings. If you’re inside 250 miles, we can be there tomorrow.</p>
          <ul className="rings-legend">
            {[...RINGS].reverse().map((r, i) => (
              <li key={r.label}><span className={`sw sw-${i + 1}`} /><b>{["0–50 mi", "50–150 mi", "150–250 mi"][i]}</b>{r.text}</li>
            ))}
          </ul>
        </div>
        <svg className="rings" viewBox="0 0 400 400" role="img" aria-label="Coverage rings at 50, 150 and 250 miles around the BoxBolt yard">
          <defs><pattern id="g2" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0v25" fill="none" stroke="#fff" strokeOpacity=".06" /></pattern></defs>
          <rect width="400" height="400" fill="url(#g2)" />
          {RINGS.map((r, i) => (
            <motion.circle key={r.r} cx={200} cy={200} r={r.r} fill="#FF5C00" fillOpacity={r.fill} stroke="#FF5C00" strokeOpacity={0.6} strokeDasharray={r.dash ? "6 6" : undefined}
              initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 * (2 - i), duration: 0.6, ease: "easeOut" }} style={{ transformOrigin: "200px 200px" }} />
          ))}
          <motion.circle cx={200} cy={200} r={42} fill="none" stroke="#FF5C00" strokeWidth={2} initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 4.5, opacity: 0 }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }} style={{ transformOrigin: "200px 200px" }} />
          <path d="M200 30v340M30 200h340" stroke="#fff" strokeOpacity=".12" />
          <rect x={192} y={192} width={16} height={16} fill="#fff" />
          <g fontFamily="Barlow Condensed, sans-serif" fontWeight={700} fontSize={14} fill="#fff">
            <text x={206} y={150}>50</text><text x={206} y={78}>150</text><text x={206} y={22}>250 MI</text>
          </g>
        </svg>
      </div>
    </section>
  </>
);
