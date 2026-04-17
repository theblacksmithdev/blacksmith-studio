export { GraphifyManager } from "./graphify-manager.js";
export { GraphifyPaths } from "./paths.js";
export { ArtifactStore } from "./artifact-store.js";
export { Installer } from "./installer.js";
export { BuildRunner, BuildTracker } from "./build-runner.js";
export { QueryRunner } from "./query-runner.js";
export {
  ClaudeMdSection,
  GraphifySectionBuilder,
} from "./claude-md-section.js";

export type {
  GraphifyMeta,
  GraphifyStatus,
  GraphifyBuildResult,
  GraphifyInstallCheck,
  GraphifySetupResult,
  ProgressCallback,
  Graph,
  GraphNode,
  GraphLink,
} from "./types.js";

export {
  VisualizationGenerator,
  CommunityColorer,
  COMMUNITY_PALETTE,
  renderVisualizationHtml,
  type VisTemplateInput,
} from "./visualization/index.js";

export {
  GraphContextBuilder,
  buildGraphContext,
  readGraphReportForContext,
  getGraphContext,
  FileMapper,
  HubDetector,
  RelationshipExtractor,
  type FileMapEntry,
  type Hub,
  type RelationshipView,
} from "./context/index.js";
