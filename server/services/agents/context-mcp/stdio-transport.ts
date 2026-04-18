import type { ContextMcpServer } from "./context-mcp-server.js";

/**
 * Framing for the JSON-RPC messages MCP sends over stdio.
 *
 * MCP uses newline-delimited JSON on stdio (one message per line).
 * We buffer bytes until we see a `\n`, parse each complete line as a
 * JSON-RPC request, hand it to the server, and write any non-null
 * response back terminated by `\n`.
 */
export function attachStdioTransport(server: ContextMcpServer): void {
  let buffer = "";

  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk: string) => {
    buffer += chunk;
    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      try {
        const message = JSON.parse(line);
        const response = server.handle(message);
        if (response) {
          process.stdout.write(`${JSON.stringify(response)}\n`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        process.stderr.write(`[context-mcp] parse error: ${msg}\n`);
      }
    }
  });

  process.stdin.on("end", () => {
    process.exit(0);
  });

  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
}
