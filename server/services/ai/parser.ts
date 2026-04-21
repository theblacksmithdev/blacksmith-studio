import { TokenUsage } from "./token-usage.js";

/**
 * NDJSON stream parser — shared across providers that output line-delimited JSON.
 */
export function createStreamParser(onParsed: (data: any) => void) {
  let buffer = "";

  return {
    write(data: string) {
      buffer += data;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          onParsed(JSON.parse(line));
        } catch {
          /* skip */
        }
      }
    },
    flush() {
      if (buffer.trim()) {
        try {
          onParsed(JSON.parse(buffer));
        } catch {
          /* skip */
        }
        buffer = "";
      }
    },
  };
}

/** Extract plain text from Claude's stream-json events. */
export function extractTextFromEvent(event: any): string | null {
  if (event.type === "assistant" && event.message?.content) {
    return event.message.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");
  }
  if (event.type === "content_block_delta" && event.delta?.text)
    return event.delta.text;
  if (event.type === "result" && typeof event.result === "string")
    return event.result;
  return null;
}

/** Extract token usage from a Claude CLI stream-json `result` event. */
export function extractUsageFromEvent(event: any): TokenUsage | null {
  return TokenUsage.fromResultEvent(event);
}

/** Extract the model id from a Claude CLI stream-json `result` event, if present. */
export function extractModelFromEvent(event: any): string | null {
  if (!event || event.type !== "result") return null;
  const m = event.model ?? event.message?.model;
  return typeof m === "string" ? m : null;
}
