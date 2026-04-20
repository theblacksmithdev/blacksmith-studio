/** Model tier — provider-agnostic. Each provider maps these to its own model names. */
export enum AiModelTier {
  Fast = "fast",
  Balanced = "balanced",
  Powerful = "powerful",
}

/** Supported AI providers */
export enum AiProviderType {
  ClaudeCli = "claude-cli",
  AnthropicApi = "anthropic-api",
  OpenAi = "openai",
  Ollama = "ollama",
}

/** Options for one-shot text completions */
export interface AiCompletionOptions {
  prompt: string;
  systemPrompt?: string;
  /**
   * Model selector. Either a provider-agnostic tier (mapped by the provider
   * to its own model name) or a specific model ID (e.g. "claude-sonnet-4-6")
   * that the provider passes through unchanged.
   */
  model?: AiModelTier | string;
  cwd?: string;
  timeout?: number;
  /** Disable tools (pass '--tools ""' to CLI) */
  disableTools?: boolean;
  /** Restrict the provider to a specific tool set (e.g. ["Read","Glob","Grep"]) */
  allowedTools?: string[];
  /**
   * Override the active provider for this call. When omitted, the `Ai`
   * router uses the registry's default. Read per-call so a settings
   * change takes effect on the next request without restart.
   */
  providerId?: string;
}

/** One prior turn in a conversation — `prompt` is the current turn, not history. */
export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

/** Options for streaming interactive sessions */
export interface AiStreamOptions extends AiCompletionOptions {
  onChunk: (parsed: any) => void;
  sessionId?: string;
  resume?: boolean;
  permissionMode?: string;
  mcpConfigPath?: string;
  maxBudget?: number | null;
  nodePath?: string;
  /** Custom user instructions — appended to system prompt */
  customInstructions?: string;
  /** Project context — prepended to prompt on first message */
  projectContext?: string;
  /**
   * Prior turns for providers that need history in-band (Ollama,
   * OpenAI). Providers with server-side session state (Claude CLI via
   * `--resume`) ignore this. Excludes the current `prompt`.
   */
  history?: ChatHistoryMessage[];
  /**
   * When true, resolve the stream promise with whatever was produced even
   * on non-zero exit or signal termination — as long as some output was
   * collected. Used by one-shot callers (e.g. the PM planner) where the
   * CLI occasionally exits 1 with valid output.
   */
  tolerantExit?: boolean;
}

/** Result handle from a streaming session. */
export interface AiStreamHandle {
  promise: Promise<void>;
  /** Abort the in-flight stream. Providers must implement this. */
  cancel(): void;
}

/** Provider status check result */
export interface AiProviderStatus {
  available: boolean;
  version?: string;
  name: string;
}

/**
 * One model offered by a provider. `value` is what the UI writes back
 * to the `ai.model` setting and is passed to `resolveModel()` when the
 * stream is built. `label` and `description` are for rendering.
 */
export interface AiModelOption {
  value: string;
  label: string;
  description: string;
}
