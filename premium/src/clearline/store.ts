import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeStorage } from "../shared/safeStorage";
import type { SpaceId } from "./data";
import type { AddOnId, QuoteInput } from "./pricing";

export type Contact = { name: string; email: string; company: string };

type QuoteState = QuoteInput & {
  step: number;
  contact: Contact;
  submitted: boolean;
  setSpace: (space: SpaceId) => void;
  setNumber: (key: "sqft" | "restrooms" | "visits", value: number) => void;
  toggleAddOn: (id: AddOnId) => void;
  setContact: (patch: Partial<Contact>) => void;
  goTo: (step: number) => void;
  submit: () => void;
  reset: () => void;
};

const initial = {
  step: 0,
  space: "office" as SpaceId,
  sqft: 8000,
  restrooms: 2,
  visits: 5,
  addOns: [] as AddOnId[],
  contact: { name: "", email: "", company: "" },
  submitted: false,
};

/** Quote wizard state survives a refresh, so a half-finished quote is still there when the visitor comes back. */
export const useQuote = create<QuoteState>()(
  persist(
    (set) => ({
      ...initial,
      setSpace: (space) => set({ space }),
      setNumber: (key, value) => set({ [key]: value } as Pick<QuoteInput, typeof key>),
      toggleAddOn: (id) => set((s) => ({ addOns: s.addOns.includes(id) ? s.addOns.filter((a) => a !== id) : [...s.addOns, id] })),
      setContact: (patch) => set((s) => ({ contact: { ...s.contact, ...patch } })),
      goTo: (step) => set({ step }),
      submit: () => set({ submitted: true }),
      reset: () => set(initial),
    }),
    { name: "clearline-quote", storage: createJSONStorage(() => safeStorage) },
  ),
);

