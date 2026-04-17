import { buildGraphContext } from "./graph-context-builder.js";
import { readGraphReportForContext } from "./report-fallback.js";

export { GraphContextBuilder, buildGraphContext } from "./graph-context-builder.js";
export { readGraphReportForContext } from "./report-fallback.js";
export { FileMapper, type FileMapEntry } from "./file-mapper.js";
export { HubDetector, type Hub } from "./hub-detector.js";
export {
  RelationshipExtractor,
  type RelationshipView,
} from "./relationship-extractor.js";

/**
 * Get the best available knowledge-graph context for LLM injection.
 *
 * Prefers the compact structured builder; falls back to the raw
 * GRAPH_REPORT.md when the graph JSON isn't available.
 */
export function getGraphContext(projectRoot: string): string | null {
  return buildGraphContext(projectRoot) ?? readGraphReportForContext(projectRoot);
}
