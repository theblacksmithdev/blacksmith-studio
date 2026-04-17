import type { PythonManager } from "../python/index.js";
import { ArtifactStore } from "./artifact-store.js";
import { ClaudeMdSection, GraphifySectionBuilder } from "./claude-md-section.js";
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
 * Tracks project roots that are currently mid-build to prevent concurrent
 * rebuilds. Kept as its own value object rather than a loose set so the
 * BuildRunner stays stateless between projects.
 */
export class BuildTracker {
  private readonly inFlight = new Set<string>();

  isBuilding(projectRoot: string): boolean {
    return this.inFlight.has(projectRoot);
  }

  begin(projectRoot: string): void {
    this.inFlight.add(projectRoot);
  }

  end(projectRoot: string): void {
    this.inFlight.delete(projectRoot);
  }
}

/**
 * Orchestrates a full graphify build.
 *
 * Single Responsibility: run `graphify update .`, persist its output, and
 * do the post-processing (visualization, meta, CLAUDE.md). The actual
 * filesystem work, HTML generation, and CLAUDE.md manipulation are
 * delegated to focused collaborators so the orchestrator stays thin.
 *
 * Dependency Inversion: depends on Installer + PythonManager for the CLI
 * invocation, and an injected ArtifactStore/VisualizationGenerator/section
 * manager for persistence. All collaborators are constructed once and
 * parameterised by the project root for each call.
 */
export class BuildRunner {
  constructor(
    private readonly python: PythonManager,
    private readonly installer: Installer,
    private readonly tracker: BuildTracker = new BuildTracker(),
  ) {}

  get buildTracker(): BuildTracker {
    return this.tracker;
  }

  async run(
    projectRoot: string,
    onProgress?: ProgressCallback,
  ): Promise<GraphifyBuildResult> {
    if (this.tracker.isBuilding(projectRoot)) {
      return {
        success: false,
        durationMs: 0,
        error: "Build already in progress",
      };
    }

    this.tracker.begin(projectRoot);
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
      this.tracker.end(projectRoot);
    }
  }

  /**
   * After a successful build: move artifacts into the managed dir,
   * generate the visualization, write meta, and update CLAUDE.md.
   * Each step is idempotent on re-run.
   */
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

    this.updateClaudeMd(paths, store);
  }

  private updateClaudeMd(paths: GraphifyPaths, store: ArtifactStore): void {
    const graph = store.readGraph();
    const nodes = graph?.nodes?.length ?? 0;
    const edges = graph?.links?.length ?? 0;

    const body = new GraphifySectionBuilder().build({ nodes, edges });
    new ClaudeMdSection(paths).upsert(body);
  }
}
