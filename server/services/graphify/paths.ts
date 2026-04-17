import path from "node:path";
import {
  CACHE_DIR,
  CLAUDE_MD,
  GRAPH_FILE,
  GRAPH_HTML,
  GRAPHIFY_DEFAULT_DIR,
  META_FILE,
  OUTPUT_DIR,
  REPORT_FILE,
} from "./constants.js";

/**
 * Centralises every path the graphify subsystem computes from a project
 * root. Services depend on this helper rather than redoing `path.join` —
 * prevents drift when the output layout changes.
 */
export class GraphifyPaths {
  constructor(private readonly projectRoot: string) {}

  /** Managed output directory ({projectRoot}/.blacksmith/graphify). */
  outputDir(): string {
    return path.join(this.projectRoot, OUTPUT_DIR);
  }

  /** The CLI's default output directory — we collect from here into outputDir(). */
  defaultOutputDir(): string {
    return path.join(this.projectRoot, GRAPHIFY_DEFAULT_DIR);
  }

  meta(): string {
    return path.join(this.outputDir(), META_FILE);
  }

  graph(): string {
    return path.join(this.outputDir(), GRAPH_FILE);
  }

  report(): string {
    return path.join(this.outputDir(), REPORT_FILE);
  }

  visualization(): string {
    return path.join(this.outputDir(), GRAPH_HTML);
  }

  cache(): string {
    return path.join(this.outputDir(), CACHE_DIR);
  }

  claudeMd(): string {
    return path.join(this.projectRoot, CLAUDE_MD);
  }

  /** Resolve a file inside the CLI's default output directory. */
  defaultFile(name: string): string {
    return path.join(this.defaultOutputDir(), name);
  }

  /** Resolve a file inside the managed output directory. */
  outputFile(name: string): string {
    return path.join(this.outputDir(), name);
  }
}
