import type { Graph, GraphLink, GraphNode } from "../types.js";

export interface RelationshipView {
  source: string;
  target: string;
  relation: string;
}

/**
 * Extracts the graph's highest-confidence relationships and resolves
 * endpoint IDs to human-readable labels.
 *
 * Single Responsibility: filter by confidence, resolve labels, cap count.
 * "EXTRACTED" is the tag the graphify CLI applies to relationships it
 * confidently derived from source code (as opposed to heuristics).
 */
export class RelationshipExtractor {
  static readonly DEFAULT_LIMIT = 20;
  static readonly EXTRACTED = "EXTRACTED";

  extract(
    graph: Graph,
    limit = RelationshipExtractor.DEFAULT_LIMIT,
  ): RelationshipView[] {
    const nodeById = new Map<string, GraphNode>(
      graph.nodes.map((n) => [n.id, n]),
    );

    return graph.links
      .filter((l) => l.confidence === RelationshipExtractor.EXTRACTED)
      .slice(0, limit)
      .map((link) => this.toView(link, nodeById));
  }

  private toView(
    link: GraphLink,
    nodeById: Map<string, GraphNode>,
  ): RelationshipView {
    return {
      source: nodeById.get(link.source)?.label ?? link.source,
      target: nodeById.get(link.target)?.label ?? link.target,
      relation: link.relation ?? "related",
    };
  }
}
