import { animate } from "framer-motion";
import { useEffect, useRef } from "react";

type AnimatedNumberProps = { value: number; format: (n: number) => string };

/** Tweens between successive values so live totals feel physical rather than jumpy. */
export const AnimatedNumber = ({ value, format }: AnimatedNumberProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = previous.current;
    previous.current = value;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = format(value);
      return;
    }
    const controls = animate(from, value, { duration: 0.5, ease: "easeOut", onUpdate: (v) => { el.textContent = format(v); } });
    return () => controls.stop();
  }, [value, format]);

  return <span ref={ref}>{format(value)}</span>;
};
