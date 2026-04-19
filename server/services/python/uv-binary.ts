import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import type { PlatformInfo } from "../platform/index.js";

/**
 * Rewrite a path that traverses the read-only `app.asar` archive to
 * the `app.asar.unpacked` sibling that electron-builder materialises
 * on disk. Required for binaries — `spawn()` can't execute a file
 * inside asar (it errors ENOTDIR). Returns the input path untouched
 * when it doesn't contain `app.asar` (dev mode).
 */
function toAsarUnpacked(p: string): string {
  const marker = `${path.sep}app.asar${path.sep}`;
  const replacement = `${path.sep}app.asar.unpacked${path.sep}`;
  return p.includes(marker) ? p.replace(marker, replacement) : p;
}

/**
 * Resolve the absolute path to the bundled `uv` binary shipped via the
 * `@manzt/uv` npm package.
 *
 * Prefers the platform/arch-specific package (e.g. `@manzt/uv-darwin-arm64`)
 * because a universal macOS build carries both arch binaries and we pick
 * the one matching `process.arch` at runtime. Falls back to `@manzt/uv/<bin>`
 * (populated by the package's install.cjs) and finally to `"uv"` on
 * PATH. All resolved paths are rewritten out of `app.asar` into
 * `app.asar.unpacked` so `spawn()` can exec them in production builds.
 */
export class UvBinaryResolver {
  private cached: string | null = null;

  constructor(private readonly platform: PlatformInfo) {}

  resolve(): string {
    if (this.cached) return this.cached;

    const req = createRequire(import.meta.url);
    const binName = this.platform.binaryName("uv");

    // Arch-specific package stores the binary at `bin/<name>`; the
    // `@manzt/uv` shim copies it to the package root as `<name>`.
    const candidates = [
      this.tryResolveIn(req, `@manzt/uv-${process.platform}-${process.arch}`, "bin", binName),
      this.tryResolveIn(req, "@manzt/uv", binName),
    ].filter((p): p is string => !!p);

    for (const candidate of candidates) {
      const unpacked = toAsarUnpacked(candidate);
      if (unpacked !== candidate && fs.existsSync(unpacked)) {
        this.cached = unpacked;
        return unpacked;
      }
      if (fs.existsSync(candidate)) {
        this.cached = candidate;
        return candidate;
      }
    }

    this.cached = "uv";
    return "uv";
  }

  /** Drop the cache — use after `npm install` so a newly-built shim resolves. */
  invalidate(): void {
    this.cached = null;
  }

  private tryResolveIn(
    req: ReturnType<typeof createRequire>,
    pkg: string,
    ...subPath: string[]
  ): string | null {
    try {
      const pkgDir = path.dirname(req.resolve(`${pkg}/package.json`));
      return path.join(pkgDir, ...subPath);
    } catch {
      return null;
    }
  }
}
