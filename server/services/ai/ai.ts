import type { ChildProcess } from 'node:child_process'
import type {
  AiCompletionOptions,
  AiStreamOptions,
  AiStreamHandle,
  AiProviderStatus,
} from './types.js'
import type { AiProvider } from './providers/provider.js'
import { ClaudeCliProvider } from './providers/claude-cli.js'

/**
 * Ai — the unified AI interface.
 *
 * Routes `complete()` and `stream()` calls to the active provider.
 * Manages active streaming sessions for cancellation.
 * Defaults to Claude CLI. Switch providers at runtime via `setProvider()`.
 */
export class Ai {
  private provider: AiProvider
  private sessions = new Map<string, ChildProcess>()

  constructor(provider?: AiProvider) {
    this.provider = provider ?? new ClaudeCliProvider()
  }

  /** Switch the active provider at runtime. */
  setProvider(provider: AiProvider) {
    this.provider = provider
  }

  /** Get the active provider's name. */
  get providerName(): string {
    return this.provider.name
  }

  /** Check if the active provider is available. */
  checkStatus(): Promise<AiProviderStatus> {
    return this.provider.checkStatus()
  }

  /** One-shot completion — send a prompt, get text back. Returns null on failure. */
  complete(options: AiCompletionOptions): Promise<string | null> {
    return this.provider.complete(options)
  }

  /** Streaming session — send a prompt, get chunks via callback. Tracks session for cancellation. */
  stream(options: AiStreamOptions): AiStreamHandle {
    const handle = this.provider.stream(options)

    if (options.sessionId) {
      this.sessions.set(options.sessionId, handle.process)
      handle.promise.finally(() => {
        this.sessions.delete(options.sessionId!)
      })
    }

    return handle
  }

  /** Cancel an active streaming session. */
  cancel(sessionId: string): void {
    const proc = this.sessions.get(sessionId)
    if (proc) {
      proc.kill('SIGTERM')
      this.sessions.delete(sessionId)
    }
  }

  /** Check if a session is currently active. */
  isActive(sessionId: string): boolean {
    return this.sessions.has(sessionId)
  }
}
