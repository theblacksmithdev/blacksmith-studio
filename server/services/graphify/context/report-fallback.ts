import fs from "node:fs";
import { MAX_CONTEXT_REPORT_SIZE } from "../constants.js";
import { GraphifyPaths } from "../paths.js";

/**
 * Read the raw GRAPH_REPORT.md as a fallback when the structured context
 * can't be built (e.g. graph.json missing or unparseable).
 *
 * Uses a smaller cap than ArtifactStore.readReport() because this content
 * is destined for an LLM prompt — tighter budget.
 */
export function readGraphReportForContext(projectRoot: string): string | null {
  const paths = new GraphifyPaths(projectRoot);
  const reportPath = paths.report();
  if (!fs.existsSync(reportPath)) return null;

  try {
    const content = fs.readFileSync(reportPath, "utf-8");
    return content.length > MAX_CONTEXT_REPORT_SIZE
      ? content.slice(0, MAX_CONTEXT_REPORT_SIZE) + "\n\n[... truncated]"
      : content;
  } catch {
    return null;
  }
}
