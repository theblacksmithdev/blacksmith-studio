import type {
  AiCompletionOptions,
  AiStreamOptions,
  AiStreamHandle,
  AiProviderStatus,
  AiModelOption,
} from "./types.js";
import type { ProviderRegistry } from "./providers/registry.js";
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
 * Routes `complete()` and `stream()` calls to the provider selected
 * either by `options.providerId` (per-call override) or by the
 * registry's default. Active streaming sessions are tracked by
 * `sessionId` so we can cancel them.
 */
export class Ai {
  private sessions = new Map<string, AiStreamHandle>();

  constructor(private readonly registry: ProviderRegistry) {}

  /** Check availability of the default provider. */
  checkStatus(): Promise<AiProviderStatus> {
    return this.registry.resolve().checkStatus();
  }

  /** Models offered by a provider. Defaults to the registry's default provider. */
  listModels(providerId?: string): AiModelOption[] {
    return this.registry.resolve(providerId).listModels();
  }

  /** One-shot completion. Returns null on failure. */
  complete(options: AiCompletionOptions): Promise<string | null> {
    return this.registry.resolve(options.providerId).complete(options);
  }

  /** Streaming session — send a prompt, get chunks via callback. */
  stream(options: AiStreamOptions): AiStreamHandle {
    const handle = this.registry.resolve(options.providerId).stream(options);

    if (options.sessionId) {
      this.sessions.set(options.sessionId, handle);
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
    const handle = this.sessions.get(sessionId);
    if (handle) {
      handle.cancel();
      this.sessions.delete(sessionId);
    }
  }

  /** Check if a session is currently active. */
  isActive(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}
