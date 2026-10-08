import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "../../shared/useReducedMotion";
import { GarmentArt } from "../components/GarmentArt";
import { LOOKS, productById } from "../data";

/**
 * Vertical scroll drives a horizontal filmstrip: the section is tall, the strip is sticky,
 * and scroll progress maps to translateX. Reduced motion falls back to a native scroller.
 */
export const Lookbook = () => {
  const reduced = useReducedMotion();
  const track = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(LOOKS.length - 1) * 100 / LOOKS.length}%`]);

  const frames = LOOKS.map((look, i) => {
    const p = productById(look.id)!;
    return (
      <figure key={look.id} className="look" style={{ background: look.bg }}>
        <span className="look-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
        <div className="look-art"><GarmentArt type={p.type} fill={p.fill} ink={p.ink} label={`${p.name} in ${p.color}`} /></div>
        <figcaption>
          <b>Look {String(i + 1).padStart(2, "0")}</b>
          <span>{p.name}, {p.color.toLowerCase()}. {look.caption}</span>
          <Link to={`/product/${p.id}`}>{p.left ? "Shop this piece" : "Sold out"}</Link>
        </figcaption>
      </figure>
    );
  });

  if (reduced) {
    return (
      <section className="lookbook">
        <div className="bar"><h1>Lookbook</h1><p>Shot on the block, after dark.</p></div>
        <div className="look-scroller" tabIndex={0} aria-label="Lookbook, scroll sideways">{frames}</div>
      </section>
    );
  }

  return (
    <section className="lookbook lookbook-pinned" ref={track} style={{ height: `${LOOKS.length * 90}vh` }}>
      <div className="look-sticky">
        <div className="bar"><h1>Lookbook</h1><p>Shot on the block, after dark. Keep scrolling.</p></div>
        <motion.div className="look-track" style={{ x, width: `${LOOKS.length * 100}%` }}>{frames}</motion.div>
        <motion.div className="look-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      </div>
    </section>
  );
};
