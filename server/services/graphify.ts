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
        this.collectOutput(projectRoot);

        const outDir = this.outputDir(projectRoot);
        fs.mkdirSync(outDir, { recursive: true });

        // Generate interactive HTML visualization from graph.json
        this.generateVisualization(projectRoot);

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

  /**
   * Generate an interactive HTML visualization from graph.json using vis-network.
   * This replaces the graph.html that the full graphify skill would produce.
   */
  private generateVisualization(projectRoot: string): void {
    const graph = this.getGraph(projectRoot);
    if (!graph) return;

    const { nodes = [], links = [] } = graph as {
      nodes?: { id: string; label: string; community?: number }[];
      links?: { source: string; target: string; relation?: string }[];
    };

    // Community → color mapping
    const communities = [...new Set(nodes.map((n) => n.community ?? 0))];
    const palette = [
      "#4ade80", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
      "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
      "#a855f7", "#10b981", "#6366f1", "#e11d48", "#0ea5e9",
    ];
    const colorMap: Record<number, string> = {};
    communities.forEach((c, i) => {
      colorMap[c] = palette[i % palette.length];
    });

    const visNodes = JSON.stringify(
      nodes.map((n) => ({
        id: n.id,
        label: n.label,
        group: n.community ?? 0,
        color: {
          background: colorMap[n.community ?? 0] + "20",
          border: colorMap[n.community ?? 0],
          highlight: { background: colorMap[n.community ?? 0] + "40", border: colorMap[n.community ?? 0] },
        },
        font: { color: "#e0e0e0", size: 11 },
      })),
    );

    const visEdges = JSON.stringify(
      links.map((l) => ({
        from: l.source,
        to: l.target,
        label: l.relation || "",
        color: { color: "rgba(255,255,255,0.12)", highlight: "rgba(255,255,255,0.3)" },
        font: { color: "rgba(255,255,255,0.35)", size: 9, strokeWidth: 0 },
        arrows: "to",
        smooth: { type: "continuous" },
      })),
    );

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Knowledge Graph</title>
  <script src="https://unpkg.com/vis-network@9.1.9/standalone/umd/vis-network.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0d0d0d; color: #e0e0e0; font-family: -apple-system, system-ui, sans-serif; overflow: hidden; }
    #graph { width: 100vw; height: 100vh; }
    #info {
      position: fixed; top: 16px; left: 16px;
      padding: 10px 14px; border-radius: 10px;
      background: rgba(20,20,20,0.85); border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px); font-size: 12px; color: rgba(255,255,255,0.5);
      pointer-events: none; z-index: 10;
    }
    #info strong { color: rgba(255,255,255,0.8); }
    #selected {
      position: fixed; bottom: 16px; left: 16px; max-width: 360px;
      padding: 12px 16px; border-radius: 10px;
      background: rgba(20,20,20,0.9); border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(12px); font-size: 12px; color: rgba(255,255,255,0.6);
      z-index: 10; display: none;
    }
    #selected .label { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
    #selected .meta { font-size: 11px; color: rgba(255,255,255,0.4); }
  </style>
</head>
<body>
  <div id="info"><strong>${nodes.length}</strong> nodes · <strong>${links.length}</strong> edges · <strong>${communities.length}</strong> communities</div>
  <div id="selected"></div>
  <div id="graph"></div>
  <script>
    const nodes = new vis.DataSet(${visNodes});
    const edges = new vis.DataSet(${visEdges});
    const container = document.getElementById("graph");
    const network = new vis.Network(container, { nodes, edges }, {
      physics: {
        solver: "forceAtlas2Based",
        forceAtlas2Based: { gravitationalConstant: -40, centralGravity: 0.005, springLength: 120 },
        stabilization: { iterations: 200 },
      },
      interaction: { hover: true, tooltipDelay: 100, zoomView: true },
      edges: { width: 0.8, selectionWidth: 2 },
      nodes: { shape: "dot", size: 12, borderWidth: 1.5 },
    });
    const sel = document.getElementById("selected");
    network.on("selectNode", (e) => {
      const node = nodes.get(e.nodes[0]);
      if (!node) return;
      sel.style.display = "block";
      sel.innerHTML = '<div class="label">' + node.label + '</div><div class="meta">Community ' + (node.group ?? "—") + '</div>';
    });
    network.on("deselectNode", () => { sel.style.display = "none"; });
  </script>
</body>
</html>`;

    const outPath = path.join(this.outputDir(projectRoot), GRAPH_HTML);
    fs.writeFileSync(outPath, html);
  }
}
