import type { PythonManager } from "../python/index.js";
import { ArtifactStore } from "./artifact-store.js";
import { ClaudeMdSection, buildGraphifySection } from "./claude-md-section.js";
import { BIN_NAME, BUILD_TIMEOUT_MS } from "./constants.js";
import type { Installer } from "./installer.js";
import { GraphifyPaths } from "./paths.js";
import type {
  GraphifyBuildResult,
  GraphifyMeta,
  ProgressCallback,
} from "./types.js";
import { VisualizationGenerator } from "./visualization/index.js";

/**
 * Orchestrates a full graphify build.
 *
 * Owns the in-flight set that guards against concurrent rebuilds of the
 * same project — small enough not to warrant its own class.
 *
 * After the CLI succeeds the post-processing is sequential: collect
 * artifacts → generate visualization → write meta → update CLAUDE.md.
 * Each step is idempotent so replays are safe.
 */
export class BuildRunner {
  private readonly inFlight = new Set<string>();

  constructor(
    private readonly python: PythonManager,
    private readonly installer: Installer,
  ) {}

  isBuilding(projectRoot: string): boolean {
    return this.inFlight.has(projectRoot);
  }

  async run(
    projectRoot: string,
    onProgress?: ProgressCallback,
  ): Promise<GraphifyBuildResult> {
    if (this.inFlight.has(projectRoot)) {
      return {
        success: false,
        durationMs: 0,
        error: "Build already in progress",
      };
    }

    this.inFlight.add(projectRoot);
    const start = Date.now();

    try {
      // `graphify update .` extracts structure via AST — no LLM needed.
      const result = await this.python.packages.runWithProgress(
        BIN_NAME,
        ["update", "."],
        onProgress,
        { cwd: projectRoot, timeout: BUILD_TIMEOUT_MS },
      );

      const durationMs = Date.now() - start;

      if (result.success) {
        await this.postProcess(projectRoot, durationMs);
      }

      return { success: result.success, durationMs, error: result.error };
    } finally {
      this.inFlight.delete(projectRoot);
    }
  }

  /** Collect artifacts, generate viz, write meta, update CLAUDE.md. */
  private async postProcess(
    projectRoot: string,
    durationMs: number,
  ): Promise<void> {
    const paths = new GraphifyPaths(projectRoot);
    const store = new ArtifactStore(paths);

    store.collectFromDefault();
    store.ensureOutputDir();

    new VisualizationGenerator(store).generate();

    const { version } = await this.installer.check();
    const meta: GraphifyMeta = {
      builtAt: new Date().toISOString(),
      durationMs,
      version: version ?? "unknown",
    };
    store.writeMeta(meta);

    const graph = store.readGraph();
    const nodes = graph?.nodes?.length ?? 0;
    const edges = graph?.links?.length ?? 0;
    new ClaudeMdSection(paths).upsert(buildGraphifySection({ nodes, edges }));
  }
}
