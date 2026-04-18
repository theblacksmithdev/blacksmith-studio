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
  {
    // Context MCP stdio subprocess — spawned by Claude CLI from the
    // per-project .mcp.json. Emits a single self-contained bundle so
    // the Claude CLI can `node <path>` it without resolving our repo
    // layout. Bundles drizzle/better-sqlite3 like the main process.
    entry: ["server/services/agents/context-mcp/run.ts"],
    format: ["esm"],
    target: "node20",
    platform: "node",
    outDir: "dist/server/context-mcp",
    dts: false,
    clean: false,
    splitting: false,
    sourcemap: true,
    shims: true,
    external: ["better-sqlite3", "drizzle-orm"],
  },
]);
