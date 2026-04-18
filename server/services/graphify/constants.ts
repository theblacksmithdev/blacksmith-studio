import { projectDataRelPath } from "../project-paths.js";

/* ── Package ── */

export const PKG_NAME = "graphifyy";
export const BIN_NAME = "graphify";

/* ── Output layout ── */

export const OUTPUT_DIR = projectDataRelPath("graphify");
/** Default directory the graphify CLI writes to — we move its content into OUTPUT_DIR. */
export const GRAPHIFY_DEFAULT_DIR = "graphify-out";

export const META_FILE = "meta.json";
export const REPORT_FILE = "GRAPH_REPORT.md";
export const GRAPH_FILE = "graph.json";
export const GRAPH_HTML = "graph.html";
export const CACHE_DIR = "cache";

/* ── CLAUDE.md integration ── */

export const CLAUDE_MD = "CLAUDE.md";
export const SECTION_START = "<!-- blacksmith:graphify:start -->";
export const SECTION_END = "<!-- blacksmith:graphify:end -->";

/* ── Limits ── */

/** Max report size served to callers — protects the renderer from huge files. */
export const MAX_REPORT_SIZE = 32 * 1024;
/** Max raw report size when used as LLM context fallback. */
export const MAX_CONTEXT_REPORT_SIZE = 16_000;

/** Default staleness threshold for a built graph. */
export const DEFAULT_STALE_AFTER_MS = 3_600_000; // 1 hour

/** CLI timeouts. */
export const BUILD_TIMEOUT_MS = 600_000; // 10 min
export const QUERY_TIMEOUT_MS = 30_000;
