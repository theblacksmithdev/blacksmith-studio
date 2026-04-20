import type { SettingsManager } from "../../settings.js";
import { AiModelTier } from "../types.js";
import type {
  AiCompletionOptions,
  AiStreamOptions,
  AiStreamHandle,
  AiProviderStatus,
  AiModelOption,
} from "../types.js";
import { AiProvider, type ModelSelector } from "./provider.js";

const DEFAULT_ENDPOINT = "http://localhost:11434";

/**
 * Tier → model for Ollama. Users can override per-message by passing a
 * concrete model id (anything other than the three tier values).
 * Picks are commonly-available code-oriented models; if the user hasn't
 * pulled them, `resolveModel` still returns the name and Ollama will
 * error clearly ("model not found").
 */
const MODEL_MAP: Record<AiModelTier, string> = {
  [AiModelTier.Fast]: "qwen2.5-coder:7b",
  [AiModelTier.Balanced]: "qwen2.5-coder:latest",
  [AiModelTier.Powerful]: "qwen2.5-coder:32b",
};

/**
 * Ollama provider — talks to a local Ollama daemon over HTTP.
 *
 * MVP scope (chat-only):
 *   - Streaming chat via `POST /api/chat` with NDJSON responses.
 *   - Model list pulled live from `GET /api/tags` (installed models).
 *   - System prompt, custom instructions, and project context collapse
 *     into a single `role: system` message.
 *   - No tool calls, no session resume, no download UX. Multi-turn
 *     conversations rely on callers passing prior context in the prompt.
 *
 * Options the provider silently ignores (honoured by Claude CLI only):
 *   `mcpConfigPath`, `permissionMode`, `allowedTools`, `disableTools`,
 *   `maxBudget`, `resume`, `nodePath`, `tolerantExit`.
 *
 * Endpoint comes from `ai.ollamaEndpoint` (resolved project → global →
 * default). Cancellation is wired through an `AbortController`.
 */
export class OllamaProvider extends AiProvider {
  readonly name = "Ollama";

  constructor(private readonly settingsManager: SettingsManager) {
    super();
  }

  private endpoint(): string {
    const raw = this.settingsManager.getGlobal("ai.ollamaEndpoint");
    return (typeof raw === "string" && raw.trim()) || DEFAULT_ENDPOINT;
  }

  resolveModel(selector: ModelSelector): string {
    return (MODEL_MAP as Record<string, string>)[selector] ?? selector;
  }

  async checkStatus(): Promise<AiProviderStatus> {
    try {
      const res = await fetch(`${this.endpoint()}/api/version`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return { available: false, name: this.name };
      const body = (await res.json()) as { version?: string };
      return {
        available: true,
        version: body.version,
        name: this.name,
      };
    } catch {
      return { available: false, name: this.name };
    }
  }

  async listModels(): Promise<AiModelOption[]> {
    try {
      const res = await fetch(`${this.endpoint()}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return [];
      const body = (await res.json()) as {
        models?: Array<{ name: string; details?: { parameter_size?: string } }>;
      };
      return (body.models ?? []).map((m) => ({
        value: m.name,
        label: m.name.split(":")[0] ?? m.name,
        description: m.details?.parameter_size
          ? `${m.details.parameter_size} parameters`
          : "Local model",
      }));
    } catch {
      return [];
    }
  }

  async complete(options: AiCompletionOptions): Promise<string | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout ?? 30_000);
    try {
      const res = await fetch(`${this.endpoint()}/api/chat`, {
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
    const endpoint = this.endpoint();
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
      // Ollama returns 404 with `model "xxx" not found` when the user
      // picks a tier (fast/balanced/powerful) they haven't pulled.
      if (res.status === 404 && /not found/i.test(body)) {
        throw new Error(
          `Ollama model "${opts.model}" is not installed. Run \`ollama pull ${opts.model}\` or pick an installed model in Settings → AI.`,
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

    // Emit a single assistant snapshot + a result event. Matches the
    // shape the existing chunk handlers (single-agent.ts + agents/
    // base/stream.ts) already consume for Claude.
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

/**
 * Build a user-facing error message for an unreachable Ollama daemon.
 * Node's `fetch` throws a terse `TypeError: fetch failed` with the
 * real cause on `.cause` — unwrap it so the user sees something
 * actionable instead of "fetch failed".
 */
function unreachableMessage(endpoint: string, err: unknown): string {
  const cause = (err as { cause?: { code?: string; message?: string } })?.cause;
  const code = cause?.code;
  if (code === "ECONNREFUSED") {
    return `Can't reach Ollama at ${endpoint}. Start the daemon (\`ollama serve\`) or check the endpoint in Settings → AI.`;
  }
  if (code === "ENOTFOUND") {
    return `Ollama endpoint ${endpoint} didn't resolve. Check the URL in Settings → AI.`;
  }
  if (code === "UND_ERR_CONNECT_TIMEOUT") {
    return `Connection to Ollama at ${endpoint} timed out.`;
  }
  const detail = cause?.message || (err instanceof Error ? err.message : String(err));
  return `Can't reach Ollama at ${endpoint}: ${detail}`;
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
