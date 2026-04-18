import fs from "node:fs";
import path from "node:path";

export interface NodeVersionHint {
  source: "nvmrc" | "engines" | "package-node-version";
  version: string;
}

/**
 * Reads project files that hint at a specific Node version.
 *
 * Single Responsibility: parse version declarations. It returns a hint;
 * resolving the hint to an actual bin path is NodeToolchain's job
 * (since that requires knowing which version managers are installed).
 */
export class NodeVersionDetector {
  detect(projectRoot: string): NodeVersionHint | null {
    return (
      this.tryNvmrc(projectRoot) ??
      this.tryPackageEngines(projectRoot) ??
      null
    );
  }

  private tryNvmrc(projectRoot: string): NodeVersionHint | null {
    const file = path.join(projectRoot, ".nvmrc");
    if (!fs.existsSync(file)) return null;
    const raw = safeReadFile(file).trim();
    if (!raw) return null;
    return { source: "nvmrc", version: raw.replace(/^v/, "") };
  }

  private tryPackageEngines(projectRoot: string): NodeVersionHint | null {
    const file = path.join(projectRoot, "package.json");
    if (!fs.existsSync(file)) return null;
    try {
      const json = JSON.parse(safeReadFile(file)) as {
        engines?: { node?: string };
      };
      const node = json.engines?.node;
      if (!node) return null;
      return { source: "engines", version: node };
    } catch {
      return null;
    }
  }
}

function safeReadFile(p: string): string {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return "";
  }
}
