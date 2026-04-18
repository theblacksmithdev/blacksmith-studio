import { buildToolRegistry, type ToolHandler } from "./tool-registry.js";
import type { ContextQueryService } from "./context-query-service.js";
import type { ContextWriteService } from "./context-write-service.js";
import type { ArtifactService } from "../../artifacts/index.js";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_NAME = "blacksmith_context";
const SERVER_VERSION = "0.1.0";

/**
 * Minimal MCP stdio server — JSON-RPC 2.0 over line-delimited stdio.
 *
 * Single Responsibility: transport framing + method routing. All tool
 * behaviour lives in `ContextQueryService` / `ContextWriteService`
 * through the registry. We intentionally avoid pulling in a third-party
 * MCP SDK: the wire protocol is small, native-code rebuilds are
 * already a postinstall pain point in this repo, and the registry
 * pattern is easy to extend without an SDK upgrade path.
 */
export class ContextMcpServer {
  private readonly tools: Record<string, ToolHandler>;

  constructor(
    query: ContextQueryService,
    write: ContextWriteService,
    artifacts: ArtifactService,
  ) {
    this.tools = buildToolRegistry(query, write, artifacts);
  }

  /** Dispatches a single JSON-RPC message and returns the response (or null for notifications). */
  handle(message: JsonRpcRequest): JsonRpcResponse | null {
    const id = message.id ?? null;
    try {
      switch (message.method) {
        case "initialize":
          return this.ok(id, {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: {} },
            serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
          });
        case "notifications/initialized":
        case "notifications/cancelled":
        case "notifications/progress":
          return null;
        case "tools/list":
          return this.ok(id, {
            tools: Object.values(this.tools).map((t) => t.definition),
          });
        case "tools/call":
          return this.callTool(id, message.params ?? {});
        case "ping":
          return this.ok(id, {});
        default:
          return this.err(id, -32601, `Method not found: ${message.method}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.err(id, -32603, msg);
    }
  }

  private callTool(
    id: string | number | null,
    params: Record<string, unknown>,
  ): JsonRpcResponse {
    const name = typeof params.name === "string" ? params.name : "";
    const args =
      (params.arguments as Record<string, unknown> | undefined) ?? {};
    const handler = this.tools[name];
    if (!handler) {
      return this.err(id, -32602, `Unknown tool: ${name}`);
    }
    try {
      const result = handler.execute(args);
      return this.ok(id, {
        content: [{ type: "text", text: JSON.stringify(result) }],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.ok(id, {
        content: [{ type: "text", text: JSON.stringify({ error: msg }) }],
        isError: true,
      });
    }
  }

  private ok(id: string | number | null, result: unknown): JsonRpcResponse {
    return { jsonrpc: "2.0", id, result };
  }

  private err(
    id: string | number | null,
    code: number,
    message: string,
  ): JsonRpcResponse {
    return { jsonrpc: "2.0", id, error: { code, message } };
  }
}
