import { useEffect, useState } from "react";

export type Remaining = { d: number; h: number; m: number; s: number; done: boolean };

const split = (ms: number): Remaining => {
  let s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400); s %= 86400;
  const h = Math.floor(s / 3600); s %= 3600;
  const m = Math.floor(s / 60); s %= 60;
  return { d, h, m, s, done: ms <= 0 };
};

export const useCountdown = (target: Date): Remaining => {
  const [left, setLeft] = useState(() => split(target.getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setLeft(split(target.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
};

export const pad = (n: number) => String(n).padStart(2, "0");
