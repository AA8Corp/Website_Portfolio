/** localStorage can throw in private windows or sandboxed frames; fall back to memory so state still works for the session. */
const memory = new Map<string, string>();

export const safeStorage = {
  getItem: (k: string): string | null => {
    try { return localStorage.getItem(k); } catch { return memory.get(k) ?? null; }
  },
  setItem: (k: string, v: string): void => {
    try { localStorage.setItem(k, v); } catch { memory.set(k, v); }
  },
  removeItem: (k: string): void => {
    try { localStorage.removeItem(k); } catch { memory.delete(k); }
  },
};
