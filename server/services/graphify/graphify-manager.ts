import type { PythonManager } from "../python/index.js";
import { ArtifactStore } from "./artifact-store.js";
import { BuildRunner } from "./build-runner.js";
import { ClaudeMdSection } from "./claude-md-section.js";
import {
  BIN_NAME,
  DEFAULT_STALE_AFTER_MS,
  QUERY_TIMEOUT_MS,
} from "./constants.js";
import { Installer, type StudioEnvCreator } from "./installer.js";
import { GraphifyPaths } from "./paths.js";
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
 * Single Responsibility: composition and delegation. Holds the
 * long-lived collaborators (Installer, BuildRunner) and builds
 * per-project ArtifactStores on demand.
 */
export class GraphifyManager {
  private readonly installer: Installer;
  private readonly builder: BuildRunner;

  constructor(
    private readonly python: PythonManager,
    createStudioEnv: StudioEnvCreator,
  ) {
    this.installer = new Installer(python, createStudioEnv);
    this.builder = new BuildRunner(python, this.installer);
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

  async query(projectRoot: string, question: string): Promise<string> {
    const output = await this.python.packages.run(
      BIN_NAME,
      ["query", question],
      { cwd: projectRoot, timeout: QUERY_TIMEOUT_MS },
    );
    if (output === null) throw new Error("Query failed");
    return output;
  }

  /* ── Status ── */

  getStatus(
    projectRoot: string,
    maxAgeMs: number = DEFAULT_STALE_AFTER_MS,
  ): GraphifyStatus {
    const store = this.storeFor(projectRoot);
    const installed = this.installer.isInstalled();
    const building = this.builder.isBuilding(projectRoot);
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
    return this.storeFor(projectRoot).readReport();
  }

  getGraph(projectRoot: string): object | null {
    return this.storeFor(projectRoot).readGraph();
  }

  getVisualizationPath(projectRoot: string): string | null {
    return this.storeFor(projectRoot).visualizationPath();
  }

  /* ── Cleanup ── */

  clean(projectRoot: string): void {
    const paths = new GraphifyPaths(projectRoot);
    new ArtifactStore(paths).clean();
    new ClaudeMdSection(paths).remove();
  }

  private storeFor(projectRoot: string): ArtifactStore {
    return new ArtifactStore(new GraphifyPaths(projectRoot));
  }
}
