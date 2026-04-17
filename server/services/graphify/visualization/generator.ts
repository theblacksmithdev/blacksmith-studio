import type { ArtifactStore } from "../artifact-store.js";
import type { Graph, GraphLink, GraphNode } from "../types.js";
import { CommunityColorer } from "./palette.js";
import { renderVisualizationHtml } from "./template.js";

/**
 * Turns a graph JSON into an interactive HTML visualization.
 *
 * Single Responsibility: orchestration. Delegates colour assignment to
 * CommunityColorer and markup rendering to the template function; this
 * class maps graph shape → vis-network DataSet payloads and writes the
 * resulting HTML via the ArtifactStore.
 */
export class VisualizationGenerator {
  constructor(private readonly store: ArtifactStore) {}

  /** Generate and persist the visualization. No-ops when no graph exists. */
  generate(): void {
    const graph = this.store.readGraph();
    if (!graph) return;

    const html = this.render(graph);
    this.store.writeVisualization(html);
  }

  private render(graph: Graph): string {
    const { nodes = [], links = [] } = graph;
    const communities = [...new Set(nodes.map((n) => n.community ?? 0))];
    const colorer = new CommunityColorer(communities);

    const visNodes = nodes.map((node) => this.toVisNode(node, colorer));
    const visEdges = links.map((link) => this.toVisEdge(link));

    return renderVisualizationHtml({
      nodeCount: nodes.length,
      edgeCount: links.length,
      communityCount: communities.length,
      visNodesJson: JSON.stringify(visNodes),
      visEdgesJson: JSON.stringify(visEdges),
    });
  }

  private toVisNode(node: GraphNode, colorer: CommunityColorer) {
    const base = colorer.colorFor(node.community);
    return {
      id: node.id,
      label: node.label,
      group: node.community ?? 0,
      color: {
        background: base + "20",
        border: base,
        highlight: { background: base + "40", border: base },
      },
      font: { color: "#e0e0e0", size: 11 },
    };
  }

  private toVisEdge(link: GraphLink) {
    return {
      from: link.source,
      to: link.target,
      label: link.relation || "",
      color: {
        color: "rgba(255,255,255,0.12)",
        highlight: "rgba(255,255,255,0.3)",
      },
      font: { color: "rgba(255,255,255,0.35)", size: 9, strokeWidth: 0 },
      arrows: "to",
      smooth: { type: "continuous" },
    };
  }
}
