import fs from "node:fs";
import path from "node:path";
import type { PythonManager } from "./python/index.js";

const GRAPHIFY_DIR = ".blacksmith/graphify";
const META_FILE = "meta.json";
const REPORT_FILE = "GRAPH_REPORT.md";
const GRAPH_FILE = "graph.json";
const GRAPH_HTML = "graph.html";
const MAX_REPORT_SIZE = 32 * 1024;
const PKG_NAME = "graphifyy";
const BIN_NAME = "graphify";

interface GraphifyMeta {
  builtAt: string;
  durationMs: number;
  version: string;
}

interface GraphifyStatus {
  installed: boolean;
  exists: boolean;
  builtAt: string | null;
  stale: boolean;
  building: boolean;
}

interface GraphifyBuildResult {
  success: boolean;
  durationMs: number;
  error?: string;
}

type ProgressCallback = (line: string) => void;

export class GraphifyManager {
  private _building = new Set<string>();
  private python: PythonManager;

  constructor(pythonManager: PythonManager) {
    this.python = pythonManager;
  }

  private get pkg() {
    return this.python.packages;
  }

  // ── Install & Check ──

  async checkInstalled(): Promise<{ installed: boolean; version?: string }> {
    // Check venv binary first, then pip package
    if (fs.existsSync(this.pkg.bin(BIN_NAME))) {
      const version = await this.pkg.getVersion(PKG_NAME);
      return { installed: true, version: version ?? undefined };
    }

    if (this.pkg.ready) {
      const version = await this.pkg.getVersion(PKG_NAME);
      if (version) return { installed: true, version };
    }

    return { installed: false };
  }

  async setup(
    pythonVersion?: string,
    onProgress?: ProgressCallback,
  ): Promise<{ success: boolean; error?: string }> {
    // 1. Ensure venv
    if (!this.pkg.ready) {
      onProgress?.("Creating Studio Python environment...");
      const venv = await this.pkg.createVenv(pythonVersion, onProgress);
      if (!venv.success) return venv;
    }

    // 2. Install
    onProgress?.("Installing graphifyy...");
    const install = await this.pkg.install(PKG_NAME, onProgress);
    if (!install.success) return install;

    // 3. Verify
    const check = await this.checkInstalled();
    if (!check.installed) {
      return { success: false, error: "Package installed but not detected." };
    }

    onProgress?.(`Setup complete. Graphify ${check.version ?? ""} ready.`);
    return { success: true };
  }

  // ── Build & Query ──

  async build(
    projectRoot: string,
    onProgress?: ProgressCallback,
  ): Promise<GraphifyBuildResult> {
    if (this._building.has(projectRoot)) {
      return { success: false, durationMs: 0, error: "Build already in progress" };
    }

    const outputDir = path.join(projectRoot, GRAPHIFY_DIR);
    fs.mkdirSync(outputDir, { recursive: true });

    this._building.add(projectRoot);
    const start = Date.now();

    try {
      const result = await this.pkg.runWithProgress(
        BIN_NAME,
        ["./", "--output", outputDir],
        onProgress,
        { cwd: projectRoot, timeout: 600_000 },
      );

      const durationMs = Date.now() - start;

      if (result.success) {
        const { version } = await this.checkInstalled();
        const meta: GraphifyMeta = {
          builtAt: new Date().toISOString(),
          durationMs,
          version: version ?? "unknown",
        };
        fs.writeFileSync(
          path.join(outputDir, META_FILE),
          JSON.stringify(meta, null, 2),
        );
      }

      return { success: result.success, durationMs, error: result.error };
    } finally {
      this._building.delete(projectRoot);
    }
  }

  async query(projectRoot: string, question: string): Promise<string> {
    const output = await this.pkg.run(BIN_NAME, ["query", question], {
      cwd: projectRoot,
      timeout: 30_000,
    });
    if (output === null) throw new Error("Query failed");
    return output;
  }

  // ── Status & Read ──

  getStatus(projectRoot: string, maxAgeMs = 3_600_000): GraphifyStatus {
    const installed = fs.existsSync(this.pkg.bin(BIN_NAME));
    const metaPath = path.join(projectRoot, GRAPHIFY_DIR, META_FILE);
    const building = this._building.has(projectRoot);

    if (!fs.existsSync(metaPath)) {
      return { installed, exists: false, builtAt: null, stale: true, building };
    }

    try {
      const meta: GraphifyMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      const stale = Date.now() - new Date(meta.builtAt).getTime() > maxAgeMs;
      return { installed, exists: true, builtAt: meta.builtAt, stale, building };
    } catch {
      return { installed, exists: false, builtAt: null, stale: true, building };
    }
  }

  isStale(projectRoot: string, maxAgeMs: number): boolean {
    return this.getStatus(projectRoot, maxAgeMs).stale;
  }

  getReport(projectRoot: string): string | null {
    const filePath = path.join(projectRoot, GRAPHIFY_DIR, REPORT_FILE);
    try {
      if (!fs.existsSync(filePath)) return null;
      const content = fs.readFileSync(filePath, "utf-8");
      return content.length > MAX_REPORT_SIZE
        ? content.slice(0, MAX_REPORT_SIZE) + "\n\n[... truncated]"
        : content;
    } catch {
      return null;
    }
  }

  getGraph(projectRoot: string): object | null {
    try {
      const filePath = path.join(projectRoot, GRAPHIFY_DIR, GRAPH_FILE);
      if (!fs.existsSync(filePath)) return null;
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return null;
    }
  }

  getVisualizationPath(projectRoot: string): string | null {
    const filePath = path.join(projectRoot, GRAPHIFY_DIR, GRAPH_HTML);
    return fs.existsSync(filePath) ? filePath : null;
  }

  clean(projectRoot: string): void {
    const dir = path.join(projectRoot, GRAPHIFY_DIR);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }
}
