import { motion } from "framer-motion";
import { Suspense, lazy, useMemo } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "../../shared/useReducedMotion";
import logo from "../../assets/logos/concrete-culture-light.webp";
import { ProductCard } from "../components/ProductCard";
import { pad, useCountdown } from "../components/useCountdown";
import { EVENTS, PRODUCTS, nextDrop } from "../data";

const Monolith = lazy(() => import("../scene/Monolith").then((m) => ({ default: m.Monolith })));

const RULES = [
  { big: "500 GSM", body: "Our hoodies weigh more than most jackets. Built to outlast the trend you bought it for." },
  { big: "Under 300", body: "Units per drop, per colorway. Numbered on the inside tag." },
  { big: "40 mi", body: "From our door to the shop that cuts, sews, and prints every piece." },
];

export const Home = () => {
  const reduced = useReducedMotion();
  const target = useMemo(nextDrop, []);
  const left = useCountdown(target);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-3d">
          <Suspense fallback={null}><Monolith reduced={reduced} /></Suspense>
          <p className="hero-hint" aria-hidden="true">Hover the blocks. Click to break it.</p>
        </div>
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-title">
            <span>Built</span><span>from the</span><span>block.</span>
          </h1>
          <div className="hero-side">
            <img className="hero-logo" src={logo} alt="Concrete Culture" width={300} height={200} />
            <Link to="/drop" className="mini-count" aria-label={`Drop 07 in ${left.d} days ${left.h} hours`}>
              <span className="mini-label">Drop 07 in</span>
              <span className="mini-digits">{pad(left.d)}:{pad(left.h)}:{pad(left.m)}:{pad(left.s)}</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="strip-section" aria-labelledby="live-title">
        <div className="bar">
          <h2 id="live-title">Drop 06: Slab Series</h2>
          <Link to="/shop" className="bar-link">Shop all {PRODUCTS.length}</Link>
        </div>
        <div className="grid grid-4">
          {PRODUCTS.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="manifesto" aria-labelledby="mf-title">
        <motion.h2 id="mf-title" initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }} whileInView={{ clipPath: "inset(0 0% 0 0)" }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}>
          No restocks.<br />No apologies.
        </motion.h2>
        <ul className="rules">
          {RULES.map((r) => <li key={r.big}><b>{r.big}</b><span>{r.body}</span></li>)}
        </ul>
      </section>

      <section className="block" aria-labelledby="block-title">
        <div className="bar">
          <h2 id="block-title">The Block</h2>
          <p>The brand is the people who wear it. Pull up.</p>
        </div>
        <ul className="events">
          {EVENTS.map((e, i) => (
            <motion.li key={e.date} initial={reduced ? false : { opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <time dateTime={e.date}>{e.label}</time><b>{e.title}</b><span>{e.body}</span><em>{e.tag}</em>
            </motion.li>
          ))}
        </ul>
      </section>
    </>
  );
};
