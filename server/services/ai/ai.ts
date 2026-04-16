import type { ChildProcess } from "node:child_process";
import type {
  AiCompletionOptions,
  AiStreamOptions,
  AiStreamHandle,
  AiProviderStatus,
} from "./types.js";
import type { AiProvider } from "./providers/provider.js";
import { ClaudeCliProvider } from "./providers/claude-cli.js";
import { extractTextFromEvent } from "./parser.js";

/** Options for streamText — same as stream, minus the required onChunk. */
export interface AiStreamTextOptions extends Omit<AiStreamOptions, "onChunk"> {
  /** Optional chunk tap — still fires for every NDJSON event */
  onChunk?: (parsed: any) => void;
  /** Called for every assistant text delta as it arrives */
  onText?: (delta: string, isFinal: boolean) => void;
}

export interface AiStreamTextResult {
  text: string;
}

/**
 * Ai — the unified AI interface.
 *
 * Routes `complete()` and `stream()` calls to the active provider.
 * Manages active streaming sessions for cancellation.
 * Defaults to Claude CLI. Switch providers at runtime via `setProvider()`.
 */
export class Ai {
  private provider: AiProvider;
  private sessions = new Map<string, ChildProcess>();

  constructor(provider?: AiProvider) {
    this.provider = provider ?? new ClaudeCliProvider();
  }

  /** Switch the active provider at runtime. */
  setProvider(provider: AiProvider) {
    this.provider = provider;
  }

  /** Get the active provider's name. */
  get providerName(): string {
    return this.provider.name;
  }

  /** Check if the active provider is available. */
  checkStatus(): Promise<AiProviderStatus> {
    return this.provider.checkStatus();
  }

  /** One-shot completion — send a prompt, get text back. Returns null on failure. */
  complete(options: AiCompletionOptions): Promise<string | null> {
    return this.provider.complete(options);
  }

  /** Streaming session — send a prompt, get chunks via callback. Tracks session for cancellation. */
  stream(options: AiStreamOptions): AiStreamHandle {
    const handle = this.provider.stream(options);

    if (options.sessionId) {
      this.sessions.set(options.sessionId, handle.process);
      handle.promise.finally(() => {
        this.sessions.delete(options.sessionId!);
      });
    }

    return handle;
  }

  /**
   * Stream + collect. Wraps `stream()` and returns the accumulated assistant
   * text after the provider completes. Consumers can still tap every chunk
   * via `onChunk` and every text delta via `onText`.
   *
   * Intended for one-shot calls that need the full text to parse (e.g. the
   * PM planner) but also want to stream partial output to the UI.
   */
  async streamText(options: AiStreamTextOptions): Promise<AiStreamTextResult> {
    let text = "";
    const handle = this.stream({
      ...options,
      onChunk: (event) => {
        const delta = extractTextFromEvent(event);
        if (delta) {
          text += delta;
          options.onText?.(delta, !!event.stop_reason);
        }
        options.onChunk?.(event);
      },
    });
    await handle.promise;
    return { text };
  }

  /** Cancel an active streaming session. */
  cancel(sessionId: string): void {
    const proc = this.sessions.get(sessionId);
    if (proc) {
      proc.kill("SIGTERM");
      this.sessions.delete(sessionId);
    }
  }

  /** Check if a session is currently active. */
  isActive(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}
