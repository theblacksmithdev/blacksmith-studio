import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { nodeEnv } from '../../node-env.js'
import { buildAgentContext } from '../context.js'
import type {
  AgentRole,
  AgentRoleDefinition,
  AgentStatus,
  AgentExecution,
  AgentProcess,
  AgentEvent,
  AgentEventCallback,
  AgentEventData,
} from '../types.js'
import type { AgentExecuteOptions, ToolCallRecord, HandoffDescriptor, ValidationResult } from './types.js'
import { buildSystemPrompt, buildCliArgs } from './prompt-builder.js'
import { streamExecution } from './stream.js'

/**
 * Abstract base class for all AI agents.
 *
 * Each subclass represents a real tech role and must implement:
 * - definition: the role's static metadata
 * - transformPrompt: role-specific prompt framing
 * - processResult: extract summary from completed execution
 *
 * The base class handles the full lifecycle:
 * context → prompt → spawn → stream → result → handoff
 */
export abstract class BaseAgent {
  private _activeProcess: AgentProcess | null = null
  private _listeners: AgentEventCallback[] = []
  private _settled = false

  /* ── Abstract ── */

  abstract get definition(): AgentRoleDefinition
  protected abstract transformPrompt(prompt: string): string
  protected abstract processResult(execution: AgentExecution, fullResponse: string, toolCalls: ToolCallRecord[]): string | Promise<string>

  protected evaluateHandoff(_fullResponse: string, _toolCalls: ToolCallRecord[]): HandoffDescriptor | null { return null }
  protected buildExecutionContext(_options: AgentExecuteOptions): string { return '' }
  protected validatePrompt(_prompt: string): ValidationResult { return { valid: true } }

  /* ── Public API ── */

  get role(): AgentRole { return this.definition.role }
  get title(): string { return this.definition.title }
  get isRunning(): boolean { return this._activeProcess !== null }
  get activeExecution(): AgentExecution | null { return this._activeProcess?.execution ?? null }

  onEvent(callback: AgentEventCallback): () => void {
    this._listeners.push(callback)
    return () => { this._listeners = this._listeners.filter((cb) => cb !== callback) }
  }

  async execute(options: AgentExecuteOptions): Promise<AgentExecution> {
    if (this._activeProcess) throw new Error(`Agent "${this.title}" is already executing. Cancel first.`)

    const validation = this.validatePrompt(options.prompt)
    if (!validation.valid) throw new Error(`Prompt rejected by ${this.title}: ${validation.reason}`)

    const executionId = crypto.randomUUID()
    const sessionId = options.sessionId ?? crypto.randomUUID()
    const isResume = !!(options.resume && options.sessionId)
    const now = new Date().toISOString()

    const execution: AgentExecution = {
      id: executionId, agentId: this.role, sessionId,
      status: 'thinking', prompt: options.prompt,
      startedAt: now, completedAt: null,
      costUsd: 0, durationMs: 0, error: null, responseText: '',
    }

    this._settled = false
    this.emit({ type: 'status', status: 'thinking', message: `${this.title} is analyzing the request...` }, execution)

    // Context
    let fullContext = ''
    if (!isResume) {
      const roleContext = buildAgentContext(options.projectRoot, this.definition)
      const execContext = this.buildExecutionContext(options)
      fullContext = [roleContext, execContext].filter(Boolean).join('\n\n')
    }

    // Prompt
    const transformedPrompt = this.transformPrompt(options.prompt)
    const cliPrompt = fullContext
      ? `${fullContext}\n\n---\n\nTask: ${transformedPrompt}`
      : transformedPrompt

    // Args
    const systemPrompt = buildSystemPrompt(this.definition, options)
    const args = buildCliArgs({ sessionId, isResume, prompt: cliPrompt, systemPrompt, definition: this.definition, options })

    // Spawn
    this.setStatus(execution, 'executing')
    const claudeBin = options.claudeBin ?? 'claude'
    const proc = spawn(claudeBin, args, {
      cwd: options.projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: nodeEnv(options.nodePath),
      timeout: 3_600_000,
    })

    this._activeProcess = { execution, process: proc }

    // Stream
    const result = await streamExecution({
      proc,
      execution,
      emit: (data, exec) => this.emit(data, exec),
      processResult: (exec, resp, tools) => this.processResult(exec, resp, tools),
      evaluateHandoff: (resp, tools) => this.evaluateHandoff(resp, tools),
      getSettled: () => this._settled,
      setSettled: (v) => { this._settled = v },
    })

    this._activeProcess = null
    return result
  }

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

  /* ── Internal ── */

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
