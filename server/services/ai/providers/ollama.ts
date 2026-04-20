import { AiModelTier } from "../types.js";
import type {
  AiCompletionOptions,
  AiStreamOptions,
  AiStreamHandle,
  AiProviderStatus,
  AiModelOption,
} from "../types.js";
import type { OllamaManager } from "../../ollama/index.js";
import { AiProvider, type ModelSelector } from "./provider.js";

/**
 * Tier → model for Ollama. Users can override per-message by passing a
 * concrete model id (anything other than the three tier values). Picks
 * are commonly-available code-oriented models; if the user hasn't
 * pulled them, `resolveModel` still returns the name verbatim and
 * Ollama responds with a clear "model not found" error.
 */
const MODEL_MAP: Record<AiModelTier, string> = {
  [AiModelTier.Fast]: "qwen2.5-coder:7b",
  [AiModelTier.Balanced]: "qwen2.5-coder:latest",
  [AiModelTier.Powerful]: "qwen2.5-coder:32b",
};

/**
 * Ollama provider — translates our generic AI interface into Ollama's
 * HTTP API and hands daemon/install/model lifecycle to `OllamaManager`.
 *
 * Division of labour:
 *   - `OllamaManager` owns the binary, the daemon process, and the
 *     `/api/tags` + `/api/pull` endpoints.
 *   - This class turns `stream()` / `complete()` / `checkStatus()` /
 *     `listModels()` calls into the right HTTP requests and maps
 *     responses into the chunk shape every other consumer expects.
 *
 * MVP scope (chat-only): no tool use, no session resume. Options
 * honoured by Claude CLI only (`mcpConfigPath`, `permissionMode`,
 * `allowedTools`, `maxBudget`, `resume`, `nodePath`, `tolerantExit`)
 * are silently ignored — interface-segregation: providers honour what
 * they can.
 */
export class OllamaProvider extends AiProvider {
  readonly name = "Ollama";

  constructor(private readonly manager: OllamaManager) {
    super();
  }

  resolveModel(selector: ModelSelector): string {
    return (MODEL_MAP as Record<string, string>)[selector] ?? selector;
  }

  async checkStatus(): Promise<AiProviderStatus> {
    try {
      const res = await fetch(`${this.manager.endpoint()}/api/version`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return { available: false, name: this.name };
      const body = (await res.json()) as { version?: string };
      return { available: true, version: body.version, name: this.name };
    } catch {
      return { available: false, name: this.name };
    }
  }

  async listModels(): Promise<AiModelOption[]> {
    try {
      const models = await this.manager.listModels();
      return models.map((m) => ({
        value: m.name,
        label: m.name.split(":")[0] ?? m.name,
        description: m.parameterSize
          ? `${m.parameterSize} parameters`
          : "Local model",
      }));
    } catch {
      return [];
    }
  }

  async complete(options: AiCompletionOptions): Promise<string | null> {
    await this.manager.ensureRunning();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout ?? 30_000);
    try {
      const res = await fetch(`${this.manager.endpoint()}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.resolveModel(options.model ?? AiModelTier.Balanced),
          messages: buildMessages({
            prompt: options.prompt,
            systemPrompt: options.systemPrompt,
          }),
          stream: false,
        }),
      });
      if (!res.ok) return null;
      const body = (await res.json()) as { message?: { content?: string } };
      return body.message?.content?.trim() || null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  stream(options: AiStreamOptions): AiStreamHandle {
    const controller = new AbortController();
    const model = this.resolveModel(options.model ?? AiModelTier.Balanced);
    const systemPrompt = composeSystemPrompt(options);
    const userPrompt = composeUserPrompt(options);
    const startedAt = Date.now();

    const promise = this.runStream({
      model,
      messages: buildMessages({ prompt: userPrompt, systemPrompt }),
      signal: controller.signal,
      onChunk: options.onChunk,
      startedAt,
    });

    return {
      promise,
      cancel: () => controller.abort(),
    };
  }

  private async runStream(opts: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    signal: AbortSignal;
    onChunk: (chunk: any) => void;
    startedAt: number;
  }): Promise<void> {
    // Auto-start the daemon on first request. Silent no-op if already
    // running (ours or a system Ollama.app).
    await this.manager.ensureRunning();

    const endpoint = this.manager.endpoint();
    let res: Response;
    try {
      res = await fetch(`${endpoint}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: opts.signal,
        body: JSON.stringify({
          model: opts.model,
          messages: opts.messages,
          stream: true,
        }),
      });
    } catch (err) {
      throw new Error(unreachableMessage(endpoint, err));
    }

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      const body = text.slice(0, 300) || res.statusText;
      if (res.status === 404 && /not found/i.test(body)) {
        throw new Error(
          `Ollama model "${opts.model}" is not installed. Install it from Settings → AI → Models, or pick an installed model.`,
        );
      }
      throw new Error(`Ollama request failed (${res.status}): ${body}`);
    }

    let fullText = "";
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = parseNdjsonLine(line);
        if (!event) continue;
        const delta = event.message?.content ?? "";
        if (delta) fullText += delta;
      }
    }
    if (buffer.trim()) {
      const event = parseNdjsonLine(buffer);
      const delta = event?.message?.content ?? "";
      if (delta) fullText += delta;
    }

    // Matches the chunk shape the existing consumers (single-agent.ts
    // and agents/base/stream.ts) already handle for Claude.
    opts.onChunk({
      type: "assistant",
      message: {
        role: "assistant",
        content: [{ type: "text", text: fullText }],
      },
      stop_reason: "end_turn",
    });
    opts.onChunk({
      type: "result",
      cost_usd: 0,
      duration_ms: Date.now() - opts.startedAt,
    });
  }
}

function parseNdjsonLine(line: string): any | null {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function buildMessages(opts: {
  prompt: string;
  systemPrompt?: string;
}): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = [];
  if (opts.systemPrompt) {
    messages.push({ role: "system", content: opts.systemPrompt });
  }
  messages.push({ role: "user", content: opts.prompt });
  return messages;
}

function composeSystemPrompt(options: AiStreamOptions): string | undefined {
  const parts: string[] = [];
  if (options.systemPrompt) parts.push(options.systemPrompt);
  if (options.customInstructions) {
    parts.push(`## User's Custom Instructions\n\n${options.customInstructions}`);
  }
  return parts.length > 0 ? parts.join("\n\n") : undefined;
}

function composeUserPrompt(options: AiStreamOptions): string {
  if (!options.resume && options.projectContext) {
    return `Here is the current project context for reference:\n\n${options.projectContext}\n\n---\n\nUser request: ${options.prompt}`;
  }
  return options.prompt;
}

/**
 * Turn Node `fetch`'s terse `TypeError: fetch failed` into something
 * users can act on — which daemon isn't up, which URL is wrong.
 */
function unreachableMessage(endpoint: string, err: unknown): string {
  const cause = (err as { cause?: { code?: string; message?: string } })?.cause;
  const code = cause?.code;
  if (code === "ECONNREFUSED") {
    return `Can't reach Ollama at ${endpoint}. The daemon isn't responding — open Settings → AI to start it.`;
  }
  if (code === "ENOTFOUND") {
    return `Ollama endpoint ${endpoint} didn't resolve. Check the URL in Settings → AI.`;
  }
  if (code === "UND_ERR_CONNECT_TIMEOUT") {
    return `Connection to Ollama at ${endpoint} timed out.`;
  }
  const detail =
    cause?.message || (err instanceof Error ? err.message : String(err));
  return `Can't reach Ollama at ${endpoint}: ${detail}`;
}
