import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import type { PlatformInfo } from "../platform/index.js";

/**
 * Resolve the absolute path to the bundled `uv` binary shipped via the
 * `@manzt/uv` npm package.
 *
 * Single Responsibility: one place to find `uv`. Falls back to a bare
 * `"uv"` name when the bundled package can't be resolved (dev / fresh
 * installs without node_modules fully built) so callers can still try
 * the system copy.
 */
export class UvBinaryResolver {
  private cached: string | null = null;

  constructor(private readonly platform: PlatformInfo) {}

  resolve(): string {
    if (this.cached) return this.cached;
    try {
      const req = createRequire(import.meta.url);
      const pkgDir = path.dirname(req.resolve("@manzt/uv/package.json"));
      const bin = path.join(pkgDir, this.platform.binaryName("uv"));
      if (fs.existsSync(bin)) {
        this.cached = bin;
        return bin;
      }
    } catch {
      /* package not resolved — fall through */
    }
    this.cached = "uv";
    return "uv";
  }

  /** Drop the cache — use after `npm install` so a newly-built shim resolves. */
  invalidate(): void {
    this.cached = null;
  }
}
