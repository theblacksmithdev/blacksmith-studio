import type { Graph } from "../types.js";

export interface FileMapEntry {
  file: string;
  symbols: string[];
}

/**
 * Group graph nodes by their source file.
 *
 * Single Responsibility: file → symbols aggregation. The resulting list
 * is sorted by symbol count descending — callers get the most informative
 * files first and can slice as needed.
 */
export class FileMapper {
  /** Cap on how many entries downstream formatters should render by default. */
  static readonly DEFAULT_LIMIT = 40;

  build(graph: Graph): FileMapEntry[] {
    const map = new Map<string, string[]>();

    for (const node of graph.nodes) {
      const file = node.source_file;
      if (!file || file === node.label) continue;
      const symbols = map.get(file) ?? [];
      symbols.push(node.label);
      map.set(file, symbols);
    }

    return [...map.entries()]
      .map(([file, symbols]) => ({ file, symbols }))
      .sort((a, b) => b.symbols.length - a.symbols.length);
  }
}
