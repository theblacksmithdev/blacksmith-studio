import fs from "node:fs";
import { execSync } from "node:child_process";
import type { PlatformInfo } from "../platform/index.js";
import type { OllamaPaths } from "./paths.js";

export interface OllamaBinaryLocation {
  path: string;
  source: "managed" | "system" | "path";
}

/**
 * Locates an Ollama binary on the machine.
 *
 * Probe order — first hit wins:
 *   1. Our managed install (`~/.blacksmith-studio/ollama/…`) — what the
 *      in-app installer writes, so a prior install takes precedence.
 *   2. Known system paths (Ollama.app, `/usr/local/bin`, Program Files).
 *   3. Whatever `which ollama` / `where ollama` reports on PATH.
 *
 * SRP: this class answers "where is ollama?" — nothing else. The
 * installer writes the managed copy; the daemon manager launches it.
 */
export class OllamaBinaryResolver {
  constructor(
    private readonly platform: PlatformInfo,
    private readonly paths: OllamaPaths,
  ) {}

  /** Find an available binary, or null if none is installed. */
  resolve(): OllamaBinaryLocation | null {
    if (fs.existsSync(this.paths.managedBinary)) {
      return { path: this.paths.managedBinary, source: "managed" };
    }
    for (const candidate of this.paths.systemCandidates()) {
      if (fs.existsSync(candidate)) {
        return { path: candidate, source: "system" };
      }
    }
    const onPath = this.whichOllama();
    if (onPath) return { path: onPath, source: "path" };
    return null;
  }

  private whichOllama(): string | null {
    try {
      const cmd = this.platform.isWindows ? "where ollama" : 'bash -ilc "which ollama"';
      const out = execSync(cmd, { encoding: "utf-8", timeout: 3000 }).trim();
      const first = out.split("\n")[0]?.trim();
      return first && fs.existsSync(first) ? first : null;
    } catch {
      return null;
    }
  }
}
