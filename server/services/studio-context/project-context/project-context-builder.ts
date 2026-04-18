import { KnowledgeManager } from "../../knowledge.js";
import { getGraphContext } from "../../graphify/index.js";
import {
  TREE_DEPTH_WITHOUT_GRAPH,
  TREE_DEPTH_WITH_GRAPH,
} from "./constants.js";
import { readKeyFiles, type KeyFile } from "./key-files-reader.js";
import { scanTree } from "./tree-scanner.js";

/**
 * Assemble the project context string injected before every AI prompt.
 *
 * Composes: graph context (graphify) + directory tree + key config files
 * + knowledge-base docs. Output is a deterministic markdown block with
 * sectioned headings.
 *
 * Adding a new section means adding an `append*()` method and one call
 * in `build()` — existing sections stay untouched.
 */
export class ProjectContextBuilder {
  constructor(private readonly knowledge = new KnowledgeManager()) {}

  build(projectRoot: string): string {
    const lines: string[] = [];
    const graphReport = getGraphContext(projectRoot);

    this.appendGraphReport(lines, graphReport);
    this.appendTree(lines, projectRoot, graphReport);
    this.appendKeyFiles(lines, readKeyFiles(projectRoot));
    this.appendKnowledge(lines, projectRoot);

    return lines.join("\n");
  }

  /* ── Sections ── */

  private appendGraphReport(out: string[], graphReport: string | null): void {
    if (!graphReport) return;
    out.push("## Project Knowledge Graph");
    out.push(
      "(Pre-built codebase structure — trust this for navigation. Read specific files only when you need implementation details.)\n",
    );
    out.push(graphReport);
    out.push("");
  }

  private appendTree(
    out: string[],
    projectRoot: string,
    graphReport: string | null,
  ): void {
    const depth = graphReport
      ? TREE_DEPTH_WITH_GRAPH
      : TREE_DEPTH_WITHOUT_GRAPH;
    out.push("## Project Structure\n```");
    out.push(...scanTree(projectRoot, depth));
    out.push("```\n");
  }

  private appendKeyFiles(out: string[], keyFiles: KeyFile[]): void {
    if (keyFiles.length === 0) return;
    out.push("## Key Files\n");
    out.push(
      keyFiles
        .map(
          (file) => `### ${file.relativePath}\n\`\`\`\n${file.content}\n\`\`\``,
        )
        .join("\n\n"),
    );
  }

  private appendKnowledge(out: string[], projectRoot: string): void {
    const knowledge = this.knowledge.getAllContent(projectRoot);
    if (!knowledge) return;
    out.push("\n## Project Knowledge\n");
    out.push(knowledge);
  }
}
