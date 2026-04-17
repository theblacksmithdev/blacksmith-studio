import fs from "node:fs";
import { SECTION_END, SECTION_START } from "./constants.js";
import type { GraphifyPaths } from "./paths.js";

/**
 * Manages a sentinel-bounded section inside the project's CLAUDE.md.
 *
 * Single Responsibility: upsert and remove a section marked by the two
 * sentinel comments. Never touches user content outside the sentinels.
 *
 * The body text is supplied by the caller so this class stays ignorant of
 * what goes inside the section — it only owns the sentinel protocol.
 */
export class ClaudeMdSection {
  constructor(private readonly paths: GraphifyPaths) {}

  /**
   * Insert or replace the managed section. If sentinels exist, the
   * existing section is replaced in place. Otherwise the section is
   * appended to the end with a blank line gap.
   */
  upsert(body: string): void {
    const section = [SECTION_START, body, SECTION_END].join("\n");
    const filePath = this.paths.claudeMd();
    const existing = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, "utf-8")
      : "";

    const startIdx = existing.indexOf(SECTION_START);
    const endIdx = existing.indexOf(SECTION_END);

    let next: string;
    if (startIdx !== -1 && endIdx !== -1) {
      next =
        existing.slice(0, startIdx) +
        section +
        existing.slice(endIdx + SECTION_END.length);
    } else {
      next = existing.trimEnd() + "\n\n" + section + "\n";
    }

    fs.writeFileSync(filePath, next.trimStart());
  }

  /**
   * Remove the managed section if present. Leaves the rest of CLAUDE.md
   * intact; if removing the section leaves the file empty we still keep
   * the file because the user may have other plans for it.
   */
  remove(): void {
    const filePath = this.paths.claudeMd();
    if (!fs.existsSync(filePath)) return;

    const existing = fs.readFileSync(filePath, "utf-8");
    const startIdx = existing.indexOf(SECTION_START);
    const endIdx = existing.indexOf(SECTION_END);
    if (startIdx === -1 || endIdx === -1) return;

    const next = (
      existing.slice(0, startIdx) + existing.slice(endIdx + SECTION_END.length)
    )
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (next) fs.writeFileSync(filePath, next + "\n");
  }
}

/**
 * Builds the body text for the Graphify section of CLAUDE.md.
 *
 * Kept separate from the section manager so the protocol (sentinels,
 * upsert, remove) and the content (what instructions the section carries)
 * evolve independently.
 */
export class GraphifySectionBuilder {
  build(stats: { nodes: number; edges: number }): string {
    const date = new Date().toISOString().split("T")[0];
    return [
      "## Knowledge Graph (Graphify)",
      "",
      "This project has a pre-built knowledge graph at `.blacksmith/graphify/`.",
      "",
      "Rules:",
      "- Before exploring the codebase with Glob/Grep/Read, read `.blacksmith/graphify/GRAPH_REPORT.md`",
      "  for the structural overview — god nodes, communities, and file relationships.",
      "- Use the graph to navigate directly to relevant files instead of scanning broadly.",
      "- Only Read files you need to modify or understand in detail — the graph already maps the structure.",
      "",
      `Stats: ${stats.nodes} nodes · ${stats.edges} edges · Built ${date}`,
    ].join("\n");
  }
}
