import { ArtifactStore } from "../artifact-store.js";
import { GraphifyPaths } from "../paths.js";
import type { Graph } from "../types.js";
import { FileMapper, type FileMapEntry } from "./file-mapper.js";
import { HubDetector, type Hub } from "./hub-detector.js";
import {
  RelationshipExtractor,
  type RelationshipView,
} from "./relationship-extractor.js";

/**
 * Builds a compact, LLM-optimized context string from the knowledge graph.
 *
 * Single Responsibility: composition. Delegates every piece of analysis
 * to a dedicated collaborator (FileMapper, HubDetector, RelationshipExtractor)
 * and turns the structured results into the final markdown block.
 *
 * Open/Closed: adding a new section (e.g. "Cyclic dependencies") is a new
 * analyser + a new render method — no existing section is touched.
 */
export class GraphContextBuilder {
  constructor(
    private readonly fileMapper = new FileMapper(),
    private readonly hubDetector = new HubDetector(),
    private readonly relExtractor = new RelationshipExtractor(),
  ) {}

  build(graph: Graph): string | null {
    if (!graph.nodes?.length) return null;

    const fileMap = this.fileMapper.build(graph);
    const hubs = this.hubDetector.findTop(graph);
    const relationships = this.relExtractor.extract(graph);

    const sections: string[] = [];
    this.appendFileMap(sections, fileMap);
    this.appendHubs(sections, hubs);
    this.appendRelationships(sections, relationships);

    const stats = `${graph.nodes.length} symbols across ${fileMap.length} files, ${graph.links.length} relationships`;
    return `Codebase: ${stats}\n\n${sections.join("\n")}`.trim();
  }

  /* ── Section renderers ── */

  private appendFileMap(out: string[], entries: FileMapEntry[]): void {
    if (entries.length === 0) return;
    out.push("### File Map");
    for (const { file, symbols } of entries.slice(
      0,
      FileMapper.DEFAULT_LIMIT,
    )) {
      out.push(`- \`${file}\`: ${symbols.join(", ")}`);
    }
    out.push("");
  }

  private appendHubs(out: string[], hubs: Hub[]): void {
    if (hubs.length === 0) return;
    out.push("### Core Abstractions (most connected)");
    for (const hub of hubs) {
      const file = hub.node?.source_file ? ` (${hub.node.source_file})` : "";
      out.push(
        `- \`${hub.node?.label ?? hub.id}\`${file} — ${hub.connections} connections`,
      );
    }
    out.push("");
  }

  private appendRelationships(out: string[], rels: RelationshipView[]): void {
    if (rels.length === 0) return;
    out.push("### Key Relationships");
    for (const { source, target, relation } of rels) {
      out.push(`- \`${source}\` → \`${target}\` (${relation})`);
    }
    out.push("");
  }
}

/**
 * Public entry point. Loads the graph from the project's managed output
 * and builds the compact context. Returns null if the graph doesn't
 * exist or is unparseable — callers fall back to the raw report.
 */
export function buildGraphContext(projectRoot: string): string | null {
  const store = new ArtifactStore(new GraphifyPaths(projectRoot));
  const graph = store.readGraph();
  if (!graph) return null;
  return new GraphContextBuilder().build(graph);
}
