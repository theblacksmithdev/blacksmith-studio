import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { McpManager } from "../../mcp.js";

export const BUILTIN_CONTEXT_SERVER_NAME = "blacksmith_context";

/**
 * Resolve the absolute path to the compiled `context-mcp/run.js`
 * subprocess. Dev and packaged builds both emit to
 * `dist/server/context-mcp/run.js`; we walk up from this module's
 * import.meta.url to find the repo `dist` root.
 */
export function resolveContextMcpScriptPath(): string | null {
  let currentDir = path.dirname(fileURLToPath(import.meta.url));
  // Walk up to find the project root (where `dist/` lives). In dev
  // mode this module is imported from `dist/electron/main.js` via
  // bundling; in source mode it's under server/services. Either way,
  // search upward until we find a `dist/server/context-mcp/run.js`.
  for (let i = 0; i < 6; i += 1) {
    const candidate = path.join(
      currentDir,
      "dist",
      "server",
      "context-mcp",
      "run.js",
    );
    if (fs.existsSync(candidate)) return candidate;
    const nextDir = path.dirname(currentDir);
    if (nextDir === currentDir) break;
    currentDir = nextDir;
  }
  return null;
}

/**
 * Register the built-in Context MCP server into the project's
 * `.mcp.json`. No-op if the compiled subprocess script can't be found
 * (happens in unbuilt dev environments) — the Claude CLI will simply
 * never see the server, and agents fall back to their other tools.
 */
export function ensureContextMcpRegistered(
  mcp: McpManager,
  projectRoot: string,
  nodePath?: string,
): void {
  const scriptPath = resolveContextMcpScriptPath();
  if (!scriptPath) return;
  mcp.ensureBuiltinServer(projectRoot, BUILTIN_CONTEXT_SERVER_NAME, {
    command: nodePath && nodePath.trim().length > 0 ? nodePath : "node",
    args: [scriptPath],
  });
}
