import fs from "node:fs";
import {
  CACHE_DIR,
  GRAPH_FILE,
  GRAPH_HTML,
  MAX_REPORT_SIZE,
  REPORT_FILE,
} from "./constants.js";
import { GraphifyPaths } from "./paths.js";
import type { Graph, GraphifyMeta } from "./types.js";

/**
 * Filesystem operations for graphify output artifacts.
 *
 * Single Responsibility: reading, writing, moving, and deleting the files
 * under `.blacksmith/graphify/`. Nothing here knows how artifacts are
 * generated — only how they're persisted.
 */
export class ArtifactStore {
  constructor(private readonly paths: GraphifyPaths) {}

  /* ── Read ── */

  readMeta(): GraphifyMeta | null {
    const metaPath = this.paths.meta();
    if (!fs.existsSync(metaPath)) return null;
    try {
      return JSON.parse(fs.readFileSync(metaPath, "utf-8")) as GraphifyMeta;
    } catch {
      return null;
    }
  }

  readGraph(): Graph | null {
    const graphPath = this.paths.graph();
    if (!fs.existsSync(graphPath)) return null;
    try {
      return JSON.parse(fs.readFileSync(graphPath, "utf-8")) as Graph;
    } catch {
      return null;
    }
  }

  readReport(): string | null {
    const reportPath = this.paths.report();
    if (!fs.existsSync(reportPath)) return null;
    try {
      const content = fs.readFileSync(reportPath, "utf-8");
      return content.length > MAX_REPORT_SIZE
        ? content.slice(0, MAX_REPORT_SIZE) + "\n\n[... truncated]"
        : content;
    } catch {
      return null;
    }
  }

  visualizationPath(): string | null {
    const vizPath = this.paths.visualization();
    return fs.existsSync(vizPath) ? vizPath : null;
  }

  hasVisualization(): boolean {
    return this.visualizationPath() !== null;
  }

  exists(): boolean {
    return fs.existsSync(this.paths.meta());
  }

  /* ── Write ── */

  writeMeta(meta: GraphifyMeta): void {
    fs.mkdirSync(this.paths.outputDir(), { recursive: true });
    fs.writeFileSync(this.paths.meta(), JSON.stringify(meta, null, 2));
  }

  writeVisualization(html: string): void {
    fs.mkdirSync(this.paths.outputDir(), { recursive: true });
    fs.writeFileSync(this.paths.visualization(), html);
  }

  ensureOutputDir(): void {
    fs.mkdirSync(this.paths.outputDir(), { recursive: true });
  }

  /* ── Collect & clean ── */

  /**
   * Move the CLI's default output (graphify-out/) into our managed dir.
   * Copies the files we care about + the cache, then removes the default.
   */
  collectFromDefault(): void {
    const src = this.paths.defaultOutputDir();
    if (!fs.existsSync(src)) return;

    this.ensureOutputDir();

    for (const file of [REPORT_FILE, GRAPH_FILE, GRAPH_HTML]) {
      const srcFile = this.paths.defaultFile(file);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, this.paths.outputFile(file));
      }
    }

    const cacheSrc = this.paths.defaultFile(CACHE_DIR);
    if (fs.existsSync(cacheSrc)) {
      fs.cpSync(cacheSrc, this.paths.outputFile(CACHE_DIR), {
        recursive: true,
      });
    }

    fs.rmSync(src, { recursive: true, force: true });
  }

  /** Remove both the managed output dir and any stray default-dir output. */
  clean(): void {
    const managed = this.paths.outputDir();
    if (fs.existsSync(managed)) {
      fs.rmSync(managed, { recursive: true, force: true });
    }

    const defaultDir = this.paths.defaultOutputDir();
    if (fs.existsSync(defaultDir)) {
      fs.rmSync(defaultDir, { recursive: true, force: true });
    }
  }
}
