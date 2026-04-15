import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["electron/main.ts"],
    format: ["esm"],
    target: "node20",
    platform: "node",
    outDir: "dist/electron",
    dts: false,
    clean: true,
    splitting: false,
    sourcemap: true,
    shims: true,
    external: ["electron", "better-sqlite3", "drizzle-orm", "node-pty"],
  },
  {
    entry: ["electron/preload.ts"],
    format: ["cjs"],
    target: "node20",
    platform: "node",
    outDir: "dist/electron",
    dts: false,
    clean: false,
    splitting: false,
    sourcemap: true,
    external: ["electron"],
  },
]);
