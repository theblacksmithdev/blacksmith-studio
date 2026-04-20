import crypto from "node:crypto";
import { AiModelTier } from "../types.js";
import type {
  AiCompletionOptions,
  AiStreamOptions,
  AiStreamHandle,
  AiProviderStatus,
  AiModelOption,
} from "../types.js";
import type { OllamaManager } from "../../ollama/index.js";
import {
  LocalToolExecutor,
  TOOL_DEFINITIONS,
  type ToolInputs,
  type ToolName,
} from "../tools/index.js";
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
 *     `listModels()` calls into the right HTTP requests, runs a small
 *     multi-round agent loop when the model asks for tools, and maps
 *     responses into the Anthropic-shape chunks every consumer expects.
 *
 * Tool use: read-only (`read_file`, `grep`, `glob`). Mutating tools
 * (write/edit/shell) need a permission-prompt UX we haven't built yet
 * and are intentionally absent. If the model ignores the tools param
 * and just answers, the loop exits after one round.
 *
 * Options honoured by Claude CLI only (`mcpConfigPath`, `permissionMode`,
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

    // Only advertise tools when we have a project root to scope them
    // to AND the caller hasn't explicitly opted out via `disableTools`.
    // Without a root, `LocalToolExecutor` has nothing safe to resolve
    // paths against.
    const toolsEnabled = !options.disableTools && !!options.cwd;
    const executor = toolsEnabled ? new LocalToolExecutor(options.cwd!) : null;

    const systemPrompt = composeSystemPrompt(options, toolsEnabled);
    const userPrompt = composeUserPrompt(options);
    const startedAt = Date.now();

    const promise = this.runAgent({
      executor,
      model,
      initialMessages: buildMessages({
        prompt: userPrompt,
        systemPrompt,
        history: options.history,
      }),
      signal: controller.signal,
      onChunk: options.onChunk,
      startedAt,
    });

    return {
      promise,
      cancel: () => controller.abort(),
    };
  }

  /**
   * Multi-round agent loop. One round = send messages → read response →
   * if the model asked for tools, run them and append the results →
   * repeat. Exits when the model returns a plain message or we hit the
   * round cap. Non-streaming within a round — Ollama streams tool_calls
   * only in a final chunk, and a streaming-while-tool-calling UX is
   * deliberately out of scope.
   */
  private async runAgent(opts: {
    executor: LocalToolExecutor | null;
    model: string;
    initialMessages: OllamaMessage[];
    signal: AbortSignal;
    onChunk: (chunk: any) => void;
    startedAt: number;
  }): Promise<void> {
    await this.manager.ensureRunning();

    const messages: OllamaMessage[] = [...opts.initialMessages];
    const MAX_ROUNDS = 10;

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const response = await this.chatOnce({
        model: opts.model,
        messages,
        tools: opts.executor ? TOOL_DEFINITIONS : undefined,
        signal: opts.signal,
      });

      const text = response.message?.content ?? "";
      const toolCalls = response.message?.tool_calls ?? [];
      const isFinal = toolCalls.length === 0 || !opts.executor;

      opts.onChunk({
        type: "assistant",
        message: {
          role: "assistant",
          content: buildContentBlocks(text, toolCalls),
        },
        stop_reason: isFinal ? "end_turn" : null,
      });

      if (isFinal) break;

      // Record the assistant's turn so the next round sees the same
      // tool_calls the model just emitted — Ollama matches `role: tool`
      // results to the preceding assistant message's calls positionally.
      messages.push({
        role: "assistant",
        content: text,
        tool_calls: toolCalls,
      });

      for (const tc of toolCalls) {
        const name = tc.function?.name as ToolName | undefined;
        const args = normaliseArgs(tc.function?.arguments);
        const output = name
          ? await opts.executor!.run(name, args as ToolInputs[ToolName])
          : `Unknown tool: ${tc.function?.name}`;
        messages.push({ role: "tool", content: output });
      }
    }

    opts.onChunk({
      type: "result",
      cost_usd: 0,
      duration_ms: Date.now() - opts.startedAt,
    });
  }

  /** One round-trip to `/api/chat`. Non-streaming; returns the full message. */
  private async chatOnce(opts: {
    model: string;
    messages: OllamaMessage[];
    tools?: typeof TOOL_DEFINITIONS;
    signal: AbortSignal;
  }): Promise<OllamaChatResponse> {
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
          tools: opts.tools,
          stream: false,
        }),
      });
    } catch (err) {
      throw new Error(unreachableMessage(endpoint, err));
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const body = text.slice(0, 300) || res.statusText;
      if (res.status === 404 && /not found/i.test(body)) {
        throw new Error(
          `Ollama model "${opts.model}" is not installed. Install it from Settings → AI → Models, or pick an installed model.`,
        );
      }
      throw new Error(`Ollama request failed (${res.status}): ${body}`);
    }
    return (await res.json()) as OllamaChatResponse;
  }
}

// ── Ollama wire types ────────────────────────────────────────────────

interface OllamaToolCall {
  function?: {
    name?: string;
    /**
     * Ollama sometimes sends arguments as a pre-parsed object,
     * sometimes as a JSON string — normalise at the call site.
     */
    arguments?: Record<string, unknown> | string;
  };
}

interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: OllamaToolCall[];
}

interface OllamaChatResponse {
  message?: {
    role?: string;
    content?: string;
    tool_calls?: OllamaToolCall[];
  };
}

/**
 * Translate Ollama's per-round response into the Anthropic-shape
 * `content` array every downstream consumer (single-agent handler,
 * multi-agent chunk handler, stream parser) already understands.
 */
function buildContentBlocks(
  text: string,
  toolCalls: OllamaToolCall[],
): Array<
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: unknown }
> {
  const blocks: Array<
    | { type: "text"; text: string }
    | { type: "tool_use"; id: string; name: string; input: unknown }
  > = [];
  if (text) blocks.push({ type: "text", text });
  for (const tc of toolCalls) {
    if (!tc.function?.name) continue;
    blocks.push({
      type: "tool_use",
      // Ollama doesn't issue tool_call ids; generate one so the UI has
      // a stable key and the `messages` table can store it.
      id: crypto.randomUUID(),
      name: tc.function.name,
      input: normaliseArgs(tc.function.arguments),
    });
  }
  return blocks;
}

/**
 * Ollama variously returns `arguments` as already-parsed objects or as
 * JSON-encoded strings. Collapse to a single shape so tools get what
 * they expect regardless of the model's quirks.
 */
function normaliseArgs(
  raw: Record<string, unknown> | string | undefined,
): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function buildMessages(opts: {
  prompt: string;
  systemPrompt?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}): OllamaMessage[] {
  const messages: OllamaMessage[] = [];
  if (opts.systemPrompt) {
    messages.push({ role: "system", content: opts.systemPrompt });
  }
  if (opts.history) {
    for (const turn of opts.history) {
      messages.push({ role: turn.role, content: turn.content });
    }
  }
  messages.push({ role: "user", content: opts.prompt });
  return messages;
}

const TOOL_USAGE_GUIDANCE = [
  "You have access to three read-only tools for exploring the user's project:",
  "  - `read_file(path)` — read a file's contents",
  "  - `grep(pattern, path?, case_insensitive?)` — search with a regex",
  "  - `glob(pattern)` — list files matching a glob like `**/*.ts`",
  "",
  "Call a tool when you need to see concrete code or files before answering. You cannot write, edit, or run shell commands — if the user asks for those, explain the limitation and suggest switching to the Claude CLI provider.",
].join("\n");

function composeSystemPrompt(
  options: AiStreamOptions,
  toolsEnabled: boolean,
): string | undefined {
  const parts: string[] = [];
  if (options.systemPrompt) parts.push(options.systemPrompt);
  if (toolsEnabled) parts.push(TOOL_USAGE_GUIDANCE);
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
