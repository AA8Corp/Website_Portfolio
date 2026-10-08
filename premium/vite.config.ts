import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

// Multi-page build: one HTML entry per brand plus a small premium index.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        clearline: resolve(root, "clearline/index.html"),
        boxbolt: resolve(root, "boxbolt/index.html"),
        concrete: resolve(root, "concrete-culture/index.html"),
      },
    },
  },
});
