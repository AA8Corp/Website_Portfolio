import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeStorage } from "../shared/safeStorage";

export type BagLine = { key: string; productId: string; size: string; qty: number };

type BagState = {
  lines: BagLine[];
  open: boolean;
  add: (productId: string, size: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  setOpen: (open: boolean) => void;
};

/** The bag persists across visits; drawer open state does not. */
export const useBag = create<BagState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (productId, size) =>
        set((s) => {
          const key = `${productId}:${size}`;
          const existing = s.lines.find((l) => l.key === key);
          const lines = existing
            ? s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(3, l.qty + 1) } : l))
            : [...s.lines, { key, productId, size, qty: 1 }];
          return { lines };
        }),
      setQty: (key, qty) => set((s) => ({ lines: s.lines.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(3, qty)) } : l)) })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      setOpen: (open) => set({ open }),
    }),
    { name: "cc-bag", storage: createJSONStorage(() => safeStorage), partialize: (s) => ({ lines: s.lines }) },
  ),
);
