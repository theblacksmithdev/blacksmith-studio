import { getDatabase } from "../../../db/index.js";
import { SessionManager } from "../../chat/single-agent/index.js";
import { AgentSessionManager } from "../../chat/multi-agents/index.js";
import { ContextMcpServer } from "./context-mcp-server.js";
import { ContextQueryService } from "./context-query-service.js";
import { ContextWriteService } from "./context-write-service.js";
import { attachStdioTransport } from "./stdio-transport.js";

/**
 * Stdio entry point: wires the DB → repos/services → MCP server and
 * begins listening on stdio. Spawned by Claude CLI (via `.mcp.json`)
 * whenever an agent process starts, terminated on stdin EOF.
 *
 * Each spawn opens its own SQLite connection through `getDatabase()`.
 * WAL mode (enabled in connection.ts) permits concurrent reads/writes
 * with the main Electron process, which holds the primary handle.
 */
function main() {
  const db = getDatabase();
  const sessionManager = new SessionManager(db);
  const agentSessionManager = new AgentSessionManager(db);

  const queryService = new ContextQueryService(
    db,
    sessionManager,
    agentSessionManager,
  );
  const writeService = new ContextWriteService(agentSessionManager);

  const server = new ContextMcpServer(queryService, writeService);
  attachStdioTransport(server);

  process.stderr.write(
    "[context-mcp] ready; listening on stdio\n",
  );
}

main();
