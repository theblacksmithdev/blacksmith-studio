import fs from "node:fs";
import path from "node:path";
import type { PythonManager } from "./python/index.js";

const OUTPUT_DIR = ".blacksmith/graphify";
const GRAPHIFY_DEFAULT_DIR = "graphify-out"; // where graphify CLI outputs by default
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
  hasVisualization: boolean;
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

  private outputDir(projectRoot: string): string {
    return path.join(projectRoot, OUTPUT_DIR);
  }

  // ── Install & Check ──

  async checkInstalled(): Promise<{ installed: boolean; version?: string }> {
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
    if (!this.pkg.ready) {
      onProgress?.("Creating Studio Python environment...");
      const venv = await this.pkg.createVenv(pythonVersion, onProgress);
      if (!venv.success) return venv;
    }

    onProgress?.("Installing graphifyy...");
    const install = await this.pkg.install(PKG_NAME, onProgress);
    if (!install.success) return install;

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

    this._building.add(projectRoot);
    const start = Date.now();

    try {
      // `graphify update .` extracts code structure via AST (no LLM needed)
      // Outputs to graphify-out/ in cwd
      const result = await this.pkg.runWithProgress(
        BIN_NAME,
        ["update", "."],
        onProgress,
        { cwd: projectRoot, timeout: 600_000 },
      );

      const durationMs = Date.now() - start;

      if (result.success) {
        // Move output from .graphify/ → .blacksmith/graphify/
        this.collectOutput(projectRoot);

        // Ensure output dir exists (collectOutput may not have created it
        // if graphify output to a different location)
        const outDir = this.outputDir(projectRoot);
        fs.mkdirSync(outDir, { recursive: true });

        const { version } = await this.checkInstalled();
        const meta: GraphifyMeta = {
          builtAt: new Date().toISOString(),
          durationMs,
          version: version ?? "unknown",
        };
        fs.writeFileSync(
          path.join(outDir, META_FILE),
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
    const metaPath = path.join(this.outputDir(projectRoot), META_FILE);
    const building = this._building.has(projectRoot);
    const hasVisualization = this.getVisualizationPath(projectRoot) !== null;

    if (!fs.existsSync(metaPath)) {
      return { installed, exists: false, builtAt: null, stale: true, building, hasVisualization };
    }

    try {
      const meta: GraphifyMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      const stale = Date.now() - new Date(meta.builtAt).getTime() > maxAgeMs;
      return { installed, exists: true, builtAt: meta.builtAt, stale, building, hasVisualization };
    } catch {
      return { installed, exists: false, builtAt: null, stale: true, building, hasVisualization };
    }
  }

  isStale(projectRoot: string, maxAgeMs: number): boolean {
    return this.getStatus(projectRoot, maxAgeMs).stale;
  }

  getReport(projectRoot: string): string | null {
    const filePath = path.join(this.outputDir(projectRoot), REPORT_FILE);
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
    const filePath = path.join(this.outputDir(projectRoot), GRAPH_FILE);
    try {
      if (!fs.existsSync(filePath)) return null;
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return null;
    }
  }

  getVisualizationPath(projectRoot: string): string | null {
    const filePath = path.join(this.outputDir(projectRoot), GRAPH_HTML);
    return fs.existsSync(filePath) ? filePath : null;
  }

  clean(projectRoot: string): void {
    // Remove our output directory
    const out = this.outputDir(projectRoot);
    if (fs.existsSync(out)) fs.rmSync(out, { recursive: true, force: true });

    // Also remove graphify's default output if it exists
    const defaultDir = path.join(projectRoot, GRAPHIFY_DEFAULT_DIR);
    if (fs.existsSync(defaultDir)) fs.rmSync(defaultDir, { recursive: true, force: true });
  }

  // ── Private ──

  /**
   * Move graphify's default output (.graphify/) into our managed directory (.blacksmith/graphify/).
   * Copies files we care about, then removes the default output directory.
   */
  private collectOutput(projectRoot: string): void {
    const src = path.join(projectRoot, GRAPHIFY_DEFAULT_DIR);
    if (!fs.existsSync(src)) return;

    const dest = this.outputDir(projectRoot);
    fs.mkdirSync(dest, { recursive: true });

    for (const file of [REPORT_FILE, GRAPH_FILE, GRAPH_HTML]) {
      const srcFile = path.join(src, file);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(dest, file));
      }
    }

    // Also copy the cache directory for incremental rebuilds
    const cacheDir = path.join(src, "cache");
    if (fs.existsSync(cacheDir)) {
      fs.cpSync(cacheDir, path.join(dest, "cache"), { recursive: true });
    }

    // Clean up the default directory
    fs.rmSync(src, { recursive: true, force: true });
  }
}
