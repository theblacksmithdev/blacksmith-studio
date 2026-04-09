import crypto from 'node:crypto'
import { spawn, type ChildProcess } from 'node:child_process'
import { createNdjsonParser } from '../claude/ndjson-parser.js'
import { STUDIO_SYSTEM_PROMPT } from '../claude/system-prompt.js'
import { nodeEnv } from '../node-env.js'
import { buildAgentContext } from './context.js'
import { describeToolUse, describeMessageStart } from './activity.js'
import type {
  AgentRole,
  AgentRoleDefinition,
  AgentStatus,
  AgentExecution,
  AgentProcess,
  AgentEvent,
  AgentEventCallback,
  AgentEventData,
  AgentConfig,
} from './types.js'

/* ── Options passed to execute() ── */

export interface AgentExecuteOptions {
  prompt: string
  projectRoot: string
  /** Supply an existing session ID to resume a multi-turn conversation */
  sessionId?: string
  /** If true and sessionId is provided, resume the session instead of creating a new one */
  resume?: boolean
  /** Claude CLI binary path (resolved by ClaudeManager) */
  claudeBin?: string
  /** Node binary path for correct PATH resolution */
  nodePath?: string
  /** MCP config file path */
  mcpConfigPath?: string
  /** Per-project custom instructions from settings */
  projectInstructions?: string
  /** Per-agent config overrides from settings */
  agentConfig?: AgentConfig
}

/**
 * Abstract base class for all AI agents.
 *
 * Each subclass represents a real tech role (Frontend Engineer, QA Engineer, etc.)
 * and must define its role definition, how it transforms prompts, and how it
 * processes results. The base class handles the full lifecycle:
 *
 *   1. Context building (scoped to the agent's file patterns and directories)
 *   2. Prompt assembly (role system prompt + project context + user prompt)
 *   3. Claude CLI spawning with correct model/permissions/MCP config
 *   4. Streaming response parsing and event emission
 *   5. Execution tracking, cancellation, and error recovery
 *   6. Agent-to-agent handoff signaling
 */
export abstract class BaseAgent {
  private _activeProcess: AgentProcess | null = null
  private _listeners: AgentEventCallback[] = []
  /** Guards against cancel() racing with close handler */
  private _settled = false

  /* ── Abstract: subclasses must implement ── */

  /** The static role definition for this agent type */
  abstract get definition(): AgentRoleDefinition

  /**
   * Transform the raw user prompt before sending to Claude.
   * Agents can add role-specific framing, constraints, or decomposition.
   *
   * NOTE: Project context is injected separately by the base class.
   * The prompt returned here should NOT include raw context — only the
   * role-specific framing of the user's request.
   */
  protected abstract transformPrompt(prompt: string): string

  /**
   * Process a completed execution result. Subclasses can extract structured
   * output, validate deliverables, trigger follow-up actions, or prepare
   * handoff context for another agent.
   *
   * Return a summary string for the `done` event.
   */
  protected abstract processResult(
    execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string | Promise<string>

  /**
   * Determine if this agent should hand off to another agent based on
   * the accumulated response so far. Return null to continue, or a handoff
   * descriptor to delegate.
   *
   * Called after each complete assistant message (when stop_reason is set).
   * Enables multi-agent orchestration where a code reviewer might hand off
   * to a QA engineer, or an architect might delegate to a frontend engineer.
   */
  protected evaluateHandoff(
    _fullResponse: string,
    _toolCalls: ToolCallRecord[],
  ): HandoffDescriptor | null {
    return null
  }

  /**
   * Build additional context specific to this execution.
   * Override to inject runtime context (e.g., test results for QA,
   * recent git diff for code reviewer, deployment status for DevOps).
   */
  protected buildExecutionContext(_options: AgentExecuteOptions): string {
    return ''
  }

  /**
   * Validate whether this agent can handle the given prompt.
   * Override to add role-specific validation (e.g., a DB engineer
   * rejecting a frontend styling request).
   */
  protected validatePrompt(_prompt: string): ValidationResult {
    return { valid: true }
  }

  /* ── Public API ── */

  get role(): AgentRole {
    return this.definition.role
  }

  get title(): string {
    return this.definition.title
  }

  get isRunning(): boolean {
    return this._activeProcess !== null
  }

  get activeExecution(): AgentExecution | null {
    return this._activeProcess?.execution ?? null
  }

  /** Subscribe to agent events. Returns unsubscribe function. */
  onEvent(callback: AgentEventCallback): () => void {
    this._listeners.push(callback)
    return () => {
      this._listeners = this._listeners.filter((cb) => cb !== callback)
    }
  }

  /**
   * Execute a prompt with this agent.
   * Full lifecycle: validate → context → prompt → spawn → stream → result.
   */
  async execute(options: AgentExecuteOptions): Promise<AgentExecution> {
    if (this._activeProcess) {
      throw new Error(`Agent "${this.title}" is already executing. Cancel first.`)
    }

    // ── 1. Validate ──
    const validation = this.validatePrompt(options.prompt)
    if (!validation.valid) {
      throw new Error(`Prompt rejected by ${this.title}: ${validation.reason}`)
    }

    // ── 2. Build execution record ──
    const executionId = crypto.randomUUID()
    const sessionId = options.sessionId ?? crypto.randomUUID()
    const isResume = !!(options.resume && options.sessionId)
    const now = new Date().toISOString()

    const execution: AgentExecution = {
      id: executionId,
      agentId: this.role,
      sessionId,
      status: 'thinking',
      prompt: options.prompt,
      startedAt: now,
      completedAt: null,
      costUsd: 0,
      durationMs: 0,
      error: null,
      responseText: '',
    }

    this._settled = false
    this._firstMessageEmitted = false
    this.emit({ type: 'status', status: 'thinking', message: `${this.title} is analyzing the request...` }, execution)

    // ── 3. Build context (skip on resume — context was sent on first message) ──
    let fullContext = ''
    if (!isResume) {
      const roleContext = buildAgentContext(options.projectRoot, this.definition)
      const executionContext = this.buildExecutionContext(options)
      fullContext = [roleContext, executionContext].filter(Boolean).join('\n\n')
    }

    // ── 4. Transform prompt ──
    const transformedPrompt = this.transformPrompt(options.prompt)

    // ── 5. Assemble the final prompt sent to -p ──
    const cliPrompt = fullContext
      ? `${fullContext}\n\n---\n\nTask: ${transformedPrompt}`
      : transformedPrompt

    // ── 6. Build system prompt ──
    const systemPrompt = this.buildSystemPrompt(options)

    // ── 7. Build CLI args ──
    const args = this.buildCliArgs({ sessionId, isResume, prompt: cliPrompt, systemPrompt, options })

    // ── 8. Spawn ──
    this.setStatus(execution, 'executing')
    const claudeBin = options.claudeBin ?? 'claude'

    const proc = spawn(claudeBin, args, {
      cwd: options.projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: nodeEnv(options.nodePath),
      timeout: 3_600_000, // 1 hour max per execution
    })

    this._activeProcess = { execution, process: proc }

    // ── 9. Stream & Parse ──
    // streamExecution handles all event emission internally.
    // On error it resolves with the error-state execution (no double throw).
    const result = await this.streamExecution(proc, execution)
    this._activeProcess = null
    return result
  }

  /** Cancel the active execution */
  cancel(): void {
    if (!this._activeProcess || this._settled) return

    const { execution, process } = this._activeProcess
    this._settled = true

    console.log(`[agent:${this.role}] Cancelling execution ${execution.id}`)
    process.kill('SIGTERM')

    execution.status = 'error'
    execution.error = 'Cancelled by user'
    execution.completedAt = new Date().toISOString()
    execution.durationMs = Date.now() - new Date(execution.startedAt).getTime()

    this.emit({ type: 'error', error: 'Cancelled by user', recoverable: false }, execution)
    this._activeProcess = null
  }

  /* ── Internal: streaming and parsing ── */

  /**
   * Streams the Claude CLI process, parses NDJSON, emits events, and
   * returns the final execution record. Never throws — errors are
   * captured in execution.error so callers don't need try/catch.
   */
  private streamExecution(
    proc: ChildProcess,
    execution: AgentExecution,
  ): Promise<AgentExecution> {
    return new Promise((resolve) => {
      let fullResponse = ''
      const toolCalls: ToolCallRecord[] = []
      let stderrBuffer = ''

      const finish = (status: AgentStatus, error?: string) => {
        if (this._settled) { resolve(execution); return }
        this._settled = true

        execution.status = status
        execution.error = error ?? null
        execution.responseText = fullResponse
        execution.completedAt = new Date().toISOString()
        execution.durationMs = Date.now() - new Date(execution.startedAt).getTime()
      }

      const parser = createNdjsonParser((chunk: any) => {
        if (this._settled) return
        this.handleChunk(chunk, execution, fullResponse, toolCalls, (text) => { fullResponse += text })
      })

      proc.stdout!.on('data', (data: Buffer) => parser.write(data.toString()))
      proc.stderr!.on('data', (data: Buffer) => { stderrBuffer += data.toString() })

      proc.on('error', (err) => {
        finish('error', `Spawn failed: ${err.message}`)
        this.emit({ type: 'error', error: execution.error!, recoverable: false }, execution)
        resolve(execution)
      })

      proc.on('close', async (code) => {
        parser.flush()

        // Already settled (e.g. cancel() fired during close)
        if (this._settled) { resolve(execution); return }

        // Non-zero exit = error
        if (code !== 0 && code !== null) {
          const error = stderrBuffer.trim() || `Process exited with code ${code}`
          finish('error', error)
          this.emit({ type: 'error', error, recoverable: false }, execution)
          resolve(execution)
          return
        }

        // Let subclass process the result
        try {
          const summary = await this.processResult(execution, fullResponse, toolCalls)
          finish('done')
          this.emit({
            type: 'done',
            costUsd: execution.costUsd,
            durationMs: execution.durationMs,
            summary,
          }, execution)
        } catch (err: any) {
          finish('error', `Result processing failed: ${err.message}`)
          this.emit({ type: 'error', error: execution.error!, recoverable: false }, execution)
        }

        resolve(execution)
      })
    })
  }

  /** Tracks whether the first message activity has been emitted for this execution */
  private _firstMessageEmitted = false

  private handleChunk(
    chunk: any,
    execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
    appendResponse: (text: string) => void,
  ): void {
    if (chunk.type === 'assistant') {
      const contentBlocks = chunk.message?.content || []

      for (const block of contentBlocks) {
        if (block.type === 'text') {
          appendResponse(block.text)
          this.emit({
            type: 'message',
            content: block.text,
            isPartial: !chunk.stop_reason,
          }, execution)

          // Emit an activity description from the first meaningful text
          if (!this._firstMessageEmitted) {
            const description = describeMessageStart(block.text)
            if (description) {
              this._firstMessageEmitted = true
              this.emit({ type: 'activity', description }, execution)
            }
          }
        } else if (block.type === 'tool_use') {
          const record: ToolCallRecord = {
            toolId: block.id,
            toolName: block.name,
            input: block.input,
          }
          toolCalls.push(record)
          this.emit({
            type: 'tool_use',
            toolId: block.id,
            toolName: block.name,
            input: block.input,
          }, execution)

          // Emit a human-readable activity description for the tool call
          const description = describeToolUse(block.name, block.input)
          this.emit({ type: 'activity', description }, execution)
        }
      }

      // Evaluate handoff after each complete assistant turn
      if (chunk.stop_reason) {
        // fullResponse here is the value BEFORE this chunk's text was appended
        // (appendResponse already ran above), so the accumulated text is up to date
        // via the closure in streamExecution. Pass the concatenated result.
        const accumulatedResponse = fullResponse
        const handoff = this.evaluateHandoff(accumulatedResponse, toolCalls)
        if (handoff) {
          this.emit({
            type: 'handoff',
            targetRole: handoff.targetRole,
            reason: handoff.reason,
            context: handoff.context,
          }, execution)
        }
      }
    } else if (chunk.type === 'result') {
      execution.costUsd = chunk.cost_usd ?? 0
      execution.durationMs = chunk.duration_ms ?? 0
    }
  }

  /* ── Internal: prompt and args assembly ── */

  private buildSystemPrompt(options: AgentExecuteOptions): string {
    const parts = [
      STUDIO_SYSTEM_PROMPT,
      `\n\n## Agent Role: ${this.title}\n\n${this.definition.systemPrompt}`,
    ]

    if (options.projectInstructions) {
      parts.push(`\n\n## Project Instructions\n\n${options.projectInstructions}`)
    }

    if (options.agentConfig?.customInstructions) {
      parts.push(`\n\n## Additional Agent Instructions\n\n${options.agentConfig.customInstructions}`)
    }

    return parts.join('')
  }

  private buildCliArgs(params: {
    sessionId: string
    isResume: boolean
    prompt: string
    systemPrompt: string
    options: AgentExecuteOptions
  }): string[] {
    const { sessionId, isResume, prompt, systemPrompt, options } = params
    const def = this.definition
    const config = options.agentConfig

    const args = [
      '-p', prompt,
      '--output-format', 'stream-json',
      '--verbose',
      '--permission-mode', def.permissionMode,
      '--include-partial-messages',
      '--append-system-prompt', systemPrompt,
    ]

    // Session: create new or resume existing
    if (isResume) {
      args.push('--resume', sessionId)
    } else {
      args.push('--session-id', sessionId)
    }

    // Model: agent config > role default > (omit = project default)
    const model = config?.model ?? def.preferredModel
    if (model) {
      args.push('--model', model)
    }

    // Budget: agent config > role default
    const budget = config?.maxBudget ?? def.maxBudget
    if (budget != null && budget > 0) {
      args.push('--max-budget-usd', String(budget))
    }

    if (options.mcpConfigPath) {
      args.push('--mcp-config', options.mcpConfigPath)
    }

    return args
  }

  /* ── Internal: event emission ── */

  private emit(data: AgentEventData, execution: AgentExecution): void {
    const event: AgentEvent = {
      type: data.type,
      agentId: this.role,
      executionId: execution.id,
      timestamp: new Date().toISOString(),
      data,
    }
    for (const cb of this._listeners) {
      try { cb(event) } catch (err) {
        console.error(`[agent:${this.role}] Event listener error:`, err)
      }
    }
  }

  private setStatus(execution: AgentExecution, status: AgentStatus, message?: string): void {
    execution.status = status
    this.emit({ type: 'status', status, message }, execution)
  }
}

/* ── Supporting types ── */

export interface ToolCallRecord {
  toolId: string
  toolName: string
  input: Record<string, unknown>
  output?: string
}

export interface HandoffDescriptor {
  targetRole: AgentRole
  reason: string
  context: string
}

export interface ValidationResult {
  valid: boolean
  reason?: string
}
