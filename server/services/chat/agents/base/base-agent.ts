import crypto from "node:crypto";
import { buildAgentContext } from "../utils/context.js";
import type {
  AgentRole,
  AgentRoleDefinition,
  AgentStatus,
  AgentExecution,
  AgentProcess,
  AgentEvent,
  AgentEventCallback,
  AgentEventData,
} from "../types.js";
import type {
  AgentExecuteOptions,
  ToolCallRecord,
  HandoffDescriptor,
  ValidationResult,
} from "./types.js";
import { buildSystemPrompt } from "./prompt-builder.js";
import { createChunkHandler, finalizeStream, type ChunkState } from "./stream.js";

/**
 * Abstract base class for all AI agents.
 *
 * Handles the core lifecycle: validate → context → prompt → spawn → stream → result.
 * No decomposition logic — that lives in DecomposableAgent for roles that need it.
 */
export abstract class BaseAgent {
  private _activeProcess: AgentProcess | null = null;
  private _activeState: ChunkState | null = null;
  private _listeners: AgentEventCallback[] = [];
  protected _settled = false;

  /* ── Abstract ── */

  abstract get definition(): AgentRoleDefinition;
  protected abstract transformPrompt(prompt: string): string;
  protected abstract processResult(
    execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string | Promise<string>;

  protected evaluateHandoff(
    _fullResponse: string,
    _toolCalls: ToolCallRecord[],
  ): HandoffDescriptor | null {
    return null;
  }
  protected buildExecutionContext(_options: AgentExecuteOptions): string {
    return "";
  }
  protected validatePrompt(_prompt: string): ValidationResult {
    return { valid: true };
  }

  /* ── Public API ── */

  get role(): AgentRole {
    return this.definition.role;
  }
  get title(): string {
    return this.definition.title;
  }
  get isRunning(): boolean {
    return this._activeProcess !== null;
  }
  get activeExecution(): AgentExecution | null {
    return this._activeProcess?.execution ?? null;
  }

  onEvent(callback: AgentEventCallback): () => void {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter((cb) => cb !== callback);
    };
  }

  async execute(options: AgentExecuteOptions): Promise<AgentExecution> {
    if (this._activeProcess)
      throw new Error(
        `Agent "${this.title}" is already executing. Cancel first.`,
      );

    const validation = this.validatePrompt(options.prompt);
    if (!validation.valid)
      throw new Error(`Prompt rejected by ${this.title}: ${validation.reason}`);

    return this.executeSingle(options);
  }

  cancel(): void {
    if (!this._activeProcess || this._settled) return;
    const { execution, process } = this._activeProcess;
    this._settled = true;
    // Mark the chunk state as settled too, so when ai.stream's promise
    // rejects from the kill, finalizeStream won't re-emit an error.
    if (this._activeState) this._activeState.settled = true;

    console.log(`[agent:${this.role}] Cancelling execution ${execution.id}`);
    process.kill("SIGTERM");

    execution.status = "error";
    execution.error = "Cancelled by user";
    execution.completedAt = new Date().toISOString();
    execution.durationMs = Date.now() - new Date(execution.startedAt).getTime();

    this.emit(
      { type: "error", error: "Cancelled by user", recoverable: false },
      execution,
    );
    this._activeProcess = null;
    this._activeState = null;
  }

  /* ── Single-pass execution (also used by DecomposableAgent for sub-tasks) ── */

  protected async executeSingle(
    options: AgentExecuteOptions,
  ): Promise<AgentExecution> {
    const executionId = crypto.randomUUID();
    const sessionId = options.sessionId ?? crypto.randomUUID();
    const isResume = !!(options.resume && options.sessionId);
    const now = new Date().toISOString();

    const execution: AgentExecution = {
      id: executionId,
      agentId: this.role,
      sessionId,
      status: "thinking",
      prompt: options.prompt,
      startedAt: now,
      completedAt: null,
      costUsd: 0,
      durationMs: 0,
      error: null,
      responseText: "",
    };

    this._settled = false;
    this.emit(
      {
        type: "status",
        status: "thinking",
        message: `${this.title} is analyzing the request...`,
      },
      execution,
    );

    // Context (skip on resume — already in session)
    let fullContext = "";
    if (!isResume) {
      const roleContext = buildAgentContext(
        options.projectRoot,
        this.definition,
      );
      const execContext = this.buildExecutionContext(options);
      fullContext = [roleContext, execContext].filter(Boolean).join("\n\n");
    }

    // Prompt
    const transformedPrompt = this.transformPrompt(options.prompt);
    const cliPrompt = fullContext
      ? `${fullContext}\n\n---\n\nTask: ${transformedPrompt}`
      : transformedPrompt;

    if (!options.ai) {
      throw new Error(
        "BaseAgent requires options.ai — the Ai router was not wired in.",
      );
    }

    const systemPrompt = buildSystemPrompt(this.definition, options);
    const config = options.agentConfig;
    const model = config?.model ?? this.definition.preferredModel;
    const budget = config?.maxBudget ?? this.definition.maxBudget;

    // Stream via the Ai router
    this.setStatus(execution, "executing");

    const { onChunk, state } = createChunkHandler(
      execution,
      (data, exec) => this.emit(data, exec),
      (resp, tools) => this.evaluateHandoff(resp, tools),
    );

    const handle = options.ai.stream({
      prompt: cliPrompt,
      systemPrompt,
      sessionId,
      resume: isResume,
      model: model ?? undefined,
      maxBudget: budget != null && budget > 0 ? budget : null,
      mcpConfigPath: options.mcpConfigPath,
      permissionMode: options.permissionMode ?? this.definition.permissionMode,
      allowedTools:
        Array.isArray(this.definition.allowedTools) &&
        this.definition.allowedTools.length > 0
          ? this.definition.allowedTools
          : undefined,
      cwd: options.projectRoot,
      nodePath: options.nodePath,
      onChunk,
    });

    this._activeProcess = { execution, process: handle.process };
    this._activeState = state;

    const result = await finalizeStream({
      handle,
      state,
      execution,
      emit: (data, exec) => this.emit(data, exec),
      processResult: (exec, resp, tools) =>
        this.processResult(exec, resp, tools),
    });

    // Keep _settled in sync for callers outside this function (cancel path)
    this._settled = state.settled;
    this._activeProcess = null;
    this._activeState = null;
    return result;
  }

  /* ── Event emission ── */

  protected emit(data: AgentEventData, execution: AgentExecution): void {
    const event: AgentEvent = {
      type: data.type,
      agentId: this.role,
      executionId: execution.id,
      timestamp: new Date().toISOString(),
      data,
    };
    for (const cb of this._listeners) {
      try {
        cb(event);
      } catch (err) {
        console.error(`[agent:${this.role}] Event listener error:`, err);
      }
    }
  }

  protected emitStandalone(data: AgentEventData): void {
    const event: AgentEvent = {
      type: data.type,
      agentId: this.role,
      executionId: "",
      timestamp: new Date().toISOString(),
      data,
    };
    for (const cb of this._listeners) {
      try {
        cb(event);
      } catch (err) {
        console.error(`[agent:${this.role}] Event listener error:`, err);
      }
    }
  }

  protected setStatus(
    execution: AgentExecution,
    status: AgentStatus,
    message?: string,
  ): void {
    execution.status = status;
    this.emit({ type: "status", status, message }, execution);
  }
}
