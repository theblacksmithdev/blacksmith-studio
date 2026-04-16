import fs from "node:fs";
import path from "node:path";
import { spawn, execFile } from "node:child_process";
import type { PythonManager } from "./python/index.js";

const GRAPHIFY_DIR = ".blacksmith/graphify";
const META_FILE = "meta.json";
const REPORT_FILE = "GRAPH_REPORT.md";
const GRAPH_FILE = "graph.json";
const GRAPH_HTML = "graph.html";
const MAX_REPORT_SIZE = 32 * 1024; // 32KB cap for context injection

interface GraphifyMeta {
  builtAt: string;
  durationMs: number;
  graphifyVersion: string;
  fileCount: number;
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

type BuildProgressCallback = (line: string) => void;

export class GraphifyManager {
  private _building = new Set<string>();
  private python: PythonManager;

  constructor(pythonManager: PythonManager) {
    this.python = pythonManager;
  }

  /** Resolve the graphify binary — uses venv if available, falls back to system. */
  private getGraphifyBin(): string {
    const venvBin = this.python.getVenvBin("graphify");
    if (fs.existsSync(venvBin)) return venvBin;
    return "graphify";
  }

  /**
   * Check if graphify CLI is installed (in venv or system) and return its version.
   */
  async checkInstalled(): Promise<{ installed: boolean; version?: string }> {
    const bin = this.getGraphifyBin();
    return new Promise((resolve) => {
      execFile(bin, ["--version"], { timeout: 5000 }, (err, stdout) => {
        if (err) {
          resolve({ installed: false });
          return;
        }
        const version =
          stdout.trim().replace(/^graphify\s*/i, "") || undefined;
        resolve({ installed: true, version });
      });
    });
  }

  /**
   * Full setup: ensure venv exists, install graphifyy, run graphify install.
   * Uses PythonManager for all operations — never touches system pip.
   */
  async setup(
    onProgress?: BuildProgressCallback,
  ): Promise<{ success: boolean; error?: string }> {
    // Step 1: Ensure Studio venv exists
    if (!this.python.isVenvReady()) {
      onProgress?.("Creating Studio Python environment...");
      const venvResult = await this.python.createVenv(undefined, onProgress);
      if (!venvResult.success) {
        return {
          success: false,
          error:
            venvResult.error ??
            "Failed to create Python venv. Make sure Python 3.10+ is available.",
        };
      }
    }

    // Step 2: Install graphifyy into venv
    onProgress?.("Installing graphifyy...");
    const installResult = await this.python.installPackage(
      "graphifyy",
      onProgress,
    );
    if (!installResult.success) {
      return {
        success: false,
        error: installResult.error ?? "Failed to install graphifyy",
      };
    }

    // Step 3: Run graphify install (registers with coding assistants)
    onProgress?.("Configuring graphify...");
    const graphifyBin = this.python.getVenvBin("graphify");
    const configResult = await this.spawnCommand(
      graphifyBin,
      ["install"],
      onProgress,
    );
    if (!configResult.success) {
      return {
        success: false,
        error: configResult.error ?? "graphify install failed",
      };
    }

    onProgress?.("Setup complete.");
    return { success: true };
  }

  /**
   * Build the knowledge graph for a project.
   */
  async build(
    projectRoot: string,
    onProgress?: BuildProgressCallback,
  ): Promise<GraphifyBuildResult> {
    if (this._building.has(projectRoot)) {
      return {
        success: false,
        durationMs: 0,
        error: "Build already in progress",
      };
    }

    this._building.add(projectRoot);
    const startTime = Date.now();
    const outputDir = path.join(projectRoot, GRAPHIFY_DIR);

    fs.mkdirSync(outputDir, { recursive: true });

    try {
      const bin = this.getGraphifyBin();
      const result = await new Promise<{ success: boolean; error?: string }>(
        (resolve) => {
          const proc = spawn(bin, ["./", "--output", outputDir], {
            cwd: projectRoot,
            stdio: ["ignore", "pipe", "pipe"],
            timeout: 600_000,
          });

          let stderr = "";

          proc.stdout?.on("data", (data: Buffer) => {
            for (const line of data.toString().split("\n").filter(Boolean)) {
              onProgress?.(line);
            }
          });

          proc.stderr?.on("data", (data: Buffer) => {
            stderr += data.toString();
            for (const line of data.toString().split("\n").filter(Boolean)) {
              onProgress?.(line);
            }
          });

          proc.on("close", (code) => {
            if (code === 0) resolve({ success: true });
            else
              resolve({
                success: false,
                error: stderr.trim().slice(0, 500) || `Exit code ${code}`,
              });
          });

          proc.on("error", (err) => {
            resolve({ success: false, error: err.message });
          });
        },
      );

      const durationMs = Date.now() - startTime;

      if (result.success) {
        const { version } = await this.checkInstalled();
        const meta: GraphifyMeta = {
          builtAt: new Date().toISOString(),
          durationMs,
          graphifyVersion: version ?? "unknown",
          fileCount: this.countGraphNodes(projectRoot),
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

  /**
   * Get the current status of the knowledge graph for a project.
   */
  getStatus(projectRoot: string, maxAgeMs = 3_600_000): GraphifyStatus {
    const installed = fs.existsSync(this.getGraphifyBin());
    const outputDir = path.join(projectRoot, GRAPHIFY_DIR);
    const metaPath = path.join(outputDir, META_FILE);
    const building = this._building.has(projectRoot);

    if (!fs.existsSync(metaPath)) {
      return { installed, exists: false, builtAt: null, stale: true, building };
    }

    try {
      const meta: GraphifyMeta = JSON.parse(
        fs.readFileSync(metaPath, "utf-8"),
      );
      const age = Date.now() - new Date(meta.builtAt).getTime();
      return {
        installed,
        exists: true,
        builtAt: meta.builtAt,
        stale: age > maxAgeMs,
        building,
      };
    } catch {
      return { installed, exists: false, builtAt: null, stale: true, building };
    }
  }

  /** Check if the graph is stale beyond a given threshold. */
  isStale(projectRoot: string, maxAgeMs: number): boolean {
    return this.getStatus(projectRoot, maxAgeMs).stale;
  }

  /** Read the graph report for context injection. Capped at MAX_REPORT_SIZE. */
  getReport(projectRoot: string): string | null {
    const reportPath = path.join(projectRoot, GRAPHIFY_DIR, REPORT_FILE);
    if (!fs.existsSync(reportPath)) return null;

    try {
      const stat = fs.statSync(reportPath);
      if (!stat.isFile()) return null;

      const content = fs.readFileSync(reportPath, "utf-8");
      if (content.length > MAX_REPORT_SIZE) {
        return content.slice(0, MAX_REPORT_SIZE) + "\n\n[... truncated]";
      }
      return content;
    } catch {
      return null;
    }
  }

  /** Read the graph.json for programmatic queries. */
  getGraph(projectRoot: string): object | null {
    const graphPath = path.join(projectRoot, GRAPHIFY_DIR, GRAPH_FILE);
    if (!fs.existsSync(graphPath)) return null;

    try {
      return JSON.parse(fs.readFileSync(graphPath, "utf-8"));
    } catch {
      return null;
    }
  }

  /** Get the path to the visualization HTML file. */
  getVisualizationPath(projectRoot: string): string | null {
    const htmlPath = path.join(projectRoot, GRAPHIFY_DIR, GRAPH_HTML);
    return fs.existsSync(htmlPath) ? htmlPath : null;
  }

  /** Query the knowledge graph using graphify CLI. */
  async query(projectRoot: string, question: string): Promise<string> {
    const bin = this.getGraphifyBin();
    return new Promise((resolve, reject) => {
      execFile(
        bin,
        ["query", question],
        { cwd: projectRoot, timeout: 30_000 },
        (err, stdout, stderr) => {
          if (err) {
            reject(new Error(stderr.trim() || err.message));
            return;
          }
          resolve(stdout.trim());
        },
      );
    });
  }

  /** Remove all graph artifacts for a project. */
  clean(projectRoot: string): void {
    const outputDir = path.join(projectRoot, GRAPHIFY_DIR);
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  }

  // ── Private ──

  private spawnCommand(
    cmd: string,
    args: string[],
    onProgress?: BuildProgressCallback,
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const proc = spawn(cmd, args, {
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 300_000,
      });

      let stderr = "";

      proc.stdout?.on("data", (data: Buffer) => {
        for (const line of data.toString().split("\n").filter(Boolean)) {
          onProgress?.(line);
        }
      });

      proc.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString();
        for (const line of data.toString().split("\n").filter(Boolean)) {
          onProgress?.(line);
        }
      });

      proc.on("close", (code) => {
        if (code === 0) resolve({ success: true });
        else
          resolve({
            success: false,
            error: stderr.trim().slice(0, 500) || `Exit code ${code}`,
          });
      });

      proc.on("error", (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }

  private countGraphNodes(projectRoot: string): number {
    const graph = this.getGraph(projectRoot);
    if (!graph || typeof graph !== "object") return 0;
    const nodes = (graph as any).nodes;
    return Array.isArray(nodes) ? nodes.length : 0;
  }
}
