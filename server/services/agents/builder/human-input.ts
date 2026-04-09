import crypto from 'node:crypto'

/* ── Types ── */

export type InputType =
  | 'approve'        // Yes/No decision (plan approval, phase gate)
  | 'choose'         // Pick from options (retry/skip/abort on failure)
  | 'text'           // Free-form text (clarification, custom instructions)

export interface InputRequest {
  id: string
  type: InputType
  question: string
  /** Context shown alongside the question (e.g. the plan summary, error details) */
  context?: string
  /** Available choices for 'choose' type */
  options?: { value: string; label: string }[]
  /** Default value if the user doesn't respond (for auto-mode or timeout) */
  defaultValue: string
  /** Where in the build this question arose */
  source: {
    buildId: string
    phaseIndex?: number
    taskId?: string
  }
  timestamp: string
}

export type InputRequestCallback = (request: InputRequest) => void

/** Sentinel value used when cancel resolves pending requests */
const CANCEL_SENTINEL = '__cancelled__'

/**
 * HumanInputGate — manages the pause/resume cycle for human-in-the-loop.
 *
 * When the builder needs a decision, it calls `request()` which:
 * 1. Emits the question to the UI via a callback
 * 2. Returns a Promise that blocks execution
 * 3. The Promise resolves when `respond()` is called with the answer
 *
 * Supports:
 * - **Auto-approve mode**: all questions resolve immediately with defaults.
 * - **Timeout**: pending requests resolve with defaults after a configurable duration.
 * - **Cancel-safe**: `rejectAll()` resolves with the cancel sentinel, not with
 *   approval defaults, so cancellation never accidentally approves.
 */
export class HumanInputGate {
  private pending = new Map<string, {
    request: InputRequest
    resolve: (value: string) => void
    timer: ReturnType<typeof setTimeout> | null
  }>()
  private requestCallbacks: InputRequestCallback[] = []
  private _autoApprove = false
  private _cancelled = false

  /** When true, all questions resolve immediately with default values */
  get autoApprove(): boolean { return this._autoApprove }
  set autoApprove(value: boolean) { this._autoApprove = value }

  /** Timeout in ms for pending requests. 0 = no timeout (default). */
  timeoutMs = 0

  /** Subscribe to input requests. The UI uses this to show prompts. */
  onRequest(cb: InputRequestCallback): () => void {
    this.requestCallbacks.push(cb)
    return () => { this.requestCallbacks = this.requestCallbacks.filter((c) => c !== cb) }
  }

  /** Check if there's a pending question waiting for an answer */
  get hasPending(): boolean {
    return this.pending.size > 0
  }

  /** Get all pending requests */
  getPending(): InputRequest[] {
    return Array.from(this.pending.values()).map((p) => p.request)
  }

  /** Reset cancelled state. Called at the start of a new build. */
  reset(): void {
    this._cancelled = false
  }

  /**
   * Ask the human a question. Blocks until `respond()` is called.
   * In auto-approve mode, resolves immediately with the default value.
   */
  async request(
    type: InputType,
    question: string,
    source: InputRequest['source'],
    opts?: {
      context?: string
      choices?: { value: string; label: string }[]
      defaultValue?: string
    },
  ): Promise<string> {
    // If already cancelled, resolve immediately
    if (this._cancelled) return opts?.defaultValue ?? ''

    const req: InputRequest = {
      id: crypto.randomUUID(),
      type,
      question,
      context: opts?.context,
      options: opts?.choices,
      defaultValue: opts?.defaultValue ?? '',
      source,
      timestamp: new Date().toISOString(),
    }

    // Auto-approve mode: resolve immediately with default
    if (this._autoApprove) {
      return req.defaultValue
    }

    // Emit to UI
    for (const cb of this.requestCallbacks) {
      try { cb(req) } catch (err) {
        console.error('[human-input] Request callback error:', err)
      }
    }

    // Block until response arrives or timeout
    return new Promise<string>((resolve) => {
      let timer: ReturnType<typeof setTimeout> | null = null

      if (this.timeoutMs > 0) {
        timer = setTimeout(() => {
          if (this.pending.has(req.id)) {
            this.pending.delete(req.id)
            console.warn(`[human-input] Request "${req.id}" timed out after ${this.timeoutMs}ms, using default`)
            resolve(req.defaultValue)
          }
        }, this.timeoutMs)
      }

      this.pending.set(req.id, { request: req, resolve, timer })
    })
  }

  /**
   * Provide an answer to a pending question. Unblocks the builder.
   * For 'choose' type, validates the response against available options.
   */
  respond(requestId: string, value: string): boolean {
    const entry = this.pending.get(requestId)
    if (!entry) return false

    // Validate 'choose' responses
    if (entry.request.type === 'choose' && entry.request.options) {
      const validValues = entry.request.options.map((o) => o.value)
      if (!validValues.includes(value)) {
        console.warn(`[human-input] Invalid choice "${value}" for request "${requestId}", valid: ${validValues.join(', ')}. Using default.`)
        value = entry.request.defaultValue
      }
    }

    if (entry.timer) clearTimeout(entry.timer)
    this.pending.delete(requestId)
    entry.resolve(value)
    return true
  }

  /**
   * Cancel all pending requests. Resolves with the cancel sentinel so
   * callers can distinguish cancellation from approval.
   */
  rejectAll(): void {
    this._cancelled = true
    for (const [, entry] of this.pending) {
      if (entry.timer) clearTimeout(entry.timer)
      entry.resolve(CANCEL_SENTINEL)
    }
    this.pending.clear()
  }

  /* ── Convenience methods for common question patterns ── */

  /** Ask for plan approval. Returns true if approved. */
  async approvePlan(buildId: string, planSummary: string): Promise<boolean> {
    const answer = await this.request('approve', 'Review the build plan and approve to proceed.', { buildId }, {
      context: planSummary,
      defaultValue: 'yes',
    })
    if (answer === CANCEL_SENTINEL) return false
    return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y'
  }

  /** Ask for phase gate approval. Returns true if approved. */
  async approvePhase(buildId: string, phaseIndex: number, phaseSummary: string): Promise<boolean> {
    const answer = await this.request('approve', `Phase ${phaseIndex + 1} complete. Continue to next phase?`, { buildId, phaseIndex }, {
      context: phaseSummary,
      defaultValue: 'yes',
    })
    if (answer === CANCEL_SENTINEL) return false
    return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y'
  }

  /** Ask what to do about a failed task after retries. Returns 'retry', 'skip', or 'abort'. */
  async handleFailure(
    buildId: string,
    taskId: string,
    taskTitle: string,
    error: string,
  ): Promise<'retry' | 'skip' | 'abort'> {
    const answer = await this.request('choose', `Task "${taskTitle}" failed after all retries. What should we do?`, { buildId, taskId }, {
      context: `Error: ${error}`,
      choices: [
        { value: 'retry', label: 'Retry with different instructions' },
        { value: 'skip', label: 'Skip this task and continue' },
        { value: 'abort', label: 'Abort the entire build' },
      ],
      defaultValue: 'skip',
    })
    if (answer === CANCEL_SENTINEL) return 'abort'
    if (answer === 'retry' || answer === 'skip' || answer === 'abort') return answer
    return 'skip'
  }

  /**
   * Ask how to handle a verification failure.
   * Returns 'continue', 'abort', or a custom instruction string.
   */
  async handleVerificationFailure(
    buildId: string,
    phaseIndex: number,
    issues: string,
  ): Promise<'continue' | 'abort' | string> {
    const answer = await this.request('choose', 'Verification found issues after this phase. How to proceed?', { buildId, phaseIndex }, {
      context: issues,
      choices: [
        { value: 'continue', label: 'Continue anyway — agents will see these errors as context' },
        { value: 'abort', label: 'Abort the build' },
        { value: 'custom', label: 'Provide custom instructions for the next phase' },
      ],
      defaultValue: 'continue',
    })

    if (answer === CANCEL_SENTINEL) return 'abort'
    if (answer !== 'custom') return answer

    // Second request — check cancelled state first (set by rejectAll between requests)
    if (this._cancelled) return 'abort'

    const guidance = await this.request('text', 'What instructions should be given to the agents in the next phase?', { buildId, phaseIndex }, {
      context: issues,
      defaultValue: '',
    })

    if (guidance === CANCEL_SENTINEL || guidance === '') return 'continue'
    return guidance
  }

  /** Ask a free-form clarification question. */
  async askClarification(
    buildId: string,
    question: string,
    context?: string,
  ): Promise<string> {
    const answer = await this.request('text', question, { buildId }, { context, defaultValue: '' })
    if (answer === CANCEL_SENTINEL) return ''
    return answer
  }
}
