import type { PythonManager } from "../python/index.js";
import { ArtifactStore } from "./artifact-store.js";
import { BuildRunner, BuildTracker } from "./build-runner.js";
import { ClaudeMdSection } from "./claude-md-section.js";
import { DEFAULT_STALE_AFTER_MS } from "./constants.js";
import { Installer } from "./installer.js";
import { GraphifyPaths } from "./paths.js";
import { QueryRunner } from "./query-runner.js";
import type {
  GraphifyBuildResult,
  GraphifyInstallCheck,
  GraphifySetupResult,
  GraphifyStatus,
  ProgressCallback,
} from "./types.js";

/**
 * Facade over the graphify subsystem.
 *
 * Single Responsibility: composition and delegation. Every method routes
 * to exactly one collaborator. The public API is preserved byte-for-byte
 * with the pre-refactor GraphifyManager so IPC handlers don't change.
 *
 * The installer, build runner, and query runner are constructed once and
 * shared across all project roots. Per-project state (paths, artifact
 * store, CLAUDE.md) is built on demand per call — project roots are
 * passed in at the method boundary, not stored.
 */
export class GraphifyManager {
  private readonly installer: Installer;
  private readonly builder: BuildRunner;
  private readonly queryRunner: QueryRunner;
  private readonly tracker: BuildTracker;

  constructor(pythonManager: PythonManager) {
    this.installer = new Installer(pythonManager);
    this.tracker = new BuildTracker();
    this.builder = new BuildRunner(pythonManager, this.installer, this.tracker);
    this.queryRunner = new QueryRunner(pythonManager);
  }

  /* ── Install ── */

  checkInstalled(): Promise<GraphifyInstallCheck> {
    return this.installer.check();
  }

  setup(
    pythonVersion?: string,
    onProgress?: ProgressCallback,
  ): Promise<GraphifySetupResult> {
    return this.installer.setup(pythonVersion, onProgress);
  }

  /* ── Build & Query ── */

  build(
    projectRoot: string,
    onProgress?: ProgressCallback,
  ): Promise<GraphifyBuildResult> {
    return this.builder.run(projectRoot, onProgress);
  }

  query(projectRoot: string, question: string): Promise<string> {
    return this.queryRunner.query(projectRoot, question);
  }

  /* ── Status ── */

  getStatus(
    projectRoot: string,
    maxAgeMs: number = DEFAULT_STALE_AFTER_MS,
  ): GraphifyStatus {
    const store = new ArtifactStore(new GraphifyPaths(projectRoot));
    const installed = this.installer.isInstalled();
    const building = this.tracker.isBuilding(projectRoot);
    const hasVisualization = store.hasVisualization();

    const meta = store.readMeta();
    if (!meta) {
      return {
        installed,
        exists: false,
        builtAt: null,
        stale: true,
        building,
        hasVisualization,
      };
    }

    const stale = Date.now() - new Date(meta.builtAt).getTime() > maxAgeMs;
    return {
      installed,
      exists: true,
      builtAt: meta.builtAt,
      stale,
      building,
      hasVisualization,
    };
  }

  isStale(projectRoot: string, maxAgeMs: number): boolean {
    return this.getStatus(projectRoot, maxAgeMs).stale;
  }

  /* ── Artifact reads ── */

  getReport(projectRoot: string): string | null {
    return new ArtifactStore(new GraphifyPaths(projectRoot)).readReport();
  }

  getGraph(projectRoot: string): object | null {
    return new ArtifactStore(new GraphifyPaths(projectRoot)).readGraph();
  }

  getVisualizationPath(projectRoot: string): string | null {
    return new ArtifactStore(new GraphifyPaths(projectRoot)).visualizationPath();
  }

  /* ── Cleanup ── */

  clean(projectRoot: string): void {
    const paths = new GraphifyPaths(projectRoot);
    new ArtifactStore(paths).clean();
    new ClaudeMdSection(paths).remove();
  }
}
