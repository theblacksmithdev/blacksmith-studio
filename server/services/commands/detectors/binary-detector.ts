import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Locate an executable by name — the generic building block every
 * toolchain uses for "what's the absolute path to `python3`?" style
 * questions.
 *
 * Single Responsibility: binary path resolution. Knows nothing about
 * Python, Node, venvs, or settings — pure OS-level lookup.
 */
export class BinaryDetector {
  /**
   * Return the absolute path to the first candidate on disk, or null if
   * none exist. `candidates` is a priority-ordered list; callers decide
   * the order (venv first, then version manager shims, then PATH).
   */
  firstExisting(candidates: string[]): string | null {
    for (const c of candidates) {
      if (c && fs.existsSync(c)) return path.resolve(c);
    }
    return null;
  }

  /**
   * `which <name>` — returns the shell PATH's resolution or null when
   * the binary isn't installed. Uses `command -v` on POSIX (more
   * portable than `which`) and `where` on Windows.
   */
  whichFromPath(name: string): string | null {
    const isWindows = process.platform === "win32";
    const cmd = isWindows ? `where ${name}` : `command -v ${name}`;
    try {
      const out = execSync(cmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] })
        .trim()
        .split(/\r?\n/)[0]
        ?.trim();
      return out && fs.existsSync(out) ? out : null;
    } catch {
      return null;
    }
  }
}
