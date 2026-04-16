import fs from "node:fs";
import path from "node:path";

const GRAPH_JSON_PATH = ".blacksmith/graphify/graph.json";
const REPORT_PATH = ".blacksmith/graphify/GRAPH_REPORT.md";

interface GraphNode {
  id: string;
  label: string;
  file_type?: string;
  source_file?: string;
  community?: number;
}

interface GraphLink {
  source: string;
  target: string;
  relation?: string;
  confidence?: string;
  source_file?: string;
}

interface Graph {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Build a compact, LLM-optimized context from the Graphify knowledge graph.
 * Instead of injecting the raw GRAPH_REPORT.md (which is full of wiki links
 * and empty communities), this extracts actionable structure:
 *
 * - File → exports mapping (what each file defines)
 * - Key relationships (calls, imports, contains)
 * - Hub nodes (most connected — core abstractions)
 *
 * This gives the LLM a navigable map without needing to Glob/Read the codebase.
 */
export function buildGraphContext(projectRoot: string): string | null {
  const graphPath = path.join(projectRoot, GRAPH_JSON_PATH);
  if (!fs.existsSync(graphPath)) return null;

  let graph: Graph;
  try {
    graph = JSON.parse(fs.readFileSync(graphPath, "utf-8"));
  } catch {
    return null;
  }

  if (!graph.nodes?.length) return null;

  const lines: string[] = [];

  // ── File map: group nodes by source file ──
  const fileMap = new Map<string, string[]>();
  for (const node of graph.nodes) {
    const file = node.source_file;
    if (!file || file === node.label) continue;
    const list = fileMap.get(file) ?? [];
    list.push(node.label);
    fileMap.set(file, list);
  }

  if (fileMap.size > 0) {
    lines.push("### File Map");
    // Sort by number of exports (most important files first), cap at 40 files
    const sorted = [...fileMap.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 40);

    for (const [file, symbols] of sorted) {
      lines.push(`- \`${file}\`: ${symbols.join(", ")}`);
    }
    lines.push("");
  }

  // ── Hub nodes: most connected ──
  const edgeCount = new Map<string, number>();
  for (const link of graph.links) {
    edgeCount.set(link.source, (edgeCount.get(link.source) ?? 0) + 1);
    edgeCount.set(link.target, (edgeCount.get(link.target) ?? 0) + 1);
  }

  const hubs = [...edgeCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (hubs.length > 0) {
    lines.push("### Core Abstractions (most connected)");
    const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
    for (const [id, count] of hubs) {
      const node = nodeMap.get(id);
      const file = node?.source_file ? ` (${node.source_file})` : "";
      lines.push(`- \`${node?.label ?? id}\`${file} — ${count} connections`);
    }
    lines.push("");
  }

  // ── Key relationships ──
  const importantLinks = graph.links
    .filter((l) => l.confidence === "EXTRACTED")
    .slice(0, 20);

  if (importantLinks.length > 0) {
    lines.push("### Key Relationships");
    const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
    for (const link of importantLinks) {
      const src = nodeMap.get(link.source)?.label ?? link.source;
      const tgt = nodeMap.get(link.target)?.label ?? link.target;
      lines.push(`- \`${src}\` → \`${tgt}\` (${link.relation ?? "related"})`);
    }
    lines.push("");
  }

  // Stats
  const stats = `${graph.nodes.length} symbols across ${fileMap.size} files, ${graph.links.length} relationships`;

  return `Codebase: ${stats}\n\n${lines.join("\n")}`.trim();
}

/**
 * Fallback: read the raw GRAPH_REPORT.md if graph.json parsing fails.
 */
export function readGraphReport(projectRoot: string): string | null {
  const reportPath = path.join(projectRoot, REPORT_PATH);
  if (!fs.existsSync(reportPath)) return null;
  try {
    const content = fs.readFileSync(reportPath, "utf-8");
    return content.length > 16_000
      ? content.slice(0, 16_000) + "\n\n[... truncated]"
      : content;
  } catch {
    return null;
  }
}

/**
 * Get the best available graph context for LLM injection.
 * Prefers the compact buildGraphContext, falls back to raw report.
 */
export function getGraphContext(projectRoot: string): string | null {
  return buildGraphContext(projectRoot) ?? readGraphReport(projectRoot);
}
