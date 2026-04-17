import type { Graph, GraphNode } from "../types.js";

export interface Hub {
  id: string;
  node: GraphNode | undefined;
  connections: number;
}

/**
 * Find the most-connected nodes in the graph — the "core abstractions"
 * a developer would want to know about first.
 *
 * Single Responsibility: degree-based ranking. Doesn't know or care how
 * the ranking is rendered.
 */
export class HubDetector {
  static readonly DEFAULT_LIMIT = 10;

  findTop(graph: Graph, limit = HubDetector.DEFAULT_LIMIT): Hub[] {
    const degree = new Map<string, number>();
    for (const link of graph.links) {
      degree.set(link.source, (degree.get(link.source) ?? 0) + 1);
      degree.set(link.target, (degree.get(link.target) ?? 0) + 1);
    }

    const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

    return [...degree.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, connections]) => ({
        id,
        node: nodeById.get(id),
        connections,
      }));
  }
}
