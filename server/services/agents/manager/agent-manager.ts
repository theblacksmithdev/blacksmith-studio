import crypto from 'node:crypto'
import type { BaseAgent, AgentExecuteOptions } from '../base-agent.js'
import type {
  AgentRole,
  AgentExecution,
  AgentEvent,
  AgentEventCallback,
  Workflow,
  WorkflowStep,
  WorkflowEvent,
  WorkflowEventCallback,
} from '../types.js'
import { createAgentRegistry } from '../roles/index.js'
import { routePrompt, type RouteResult } from './router.js'
import { dispatchWithPM, type DispatchPlan, type DispatchTask } from './pm-dispatcher.js'
import { needsQualityGate, runQualityGate } from './quality-gate.js'
import { PIPELINE_TEMPLATES, type PipelineTemplate } from './pipelines.js'
import { executeWorkflowSteps } from './workflow-engine.js'
import { processHandoffs } from './handoff.js'

/**
 * AgentManager — the orchestration layer above individual agents.
 *
 * The PM-first dispatch model:
 * 1. Every prompt goes through `dispatch()` which routes it.
 * 2. High-confidence single-role prompts go directly to that agent (fast path).
 * 3. Ambiguous or multi-scope prompts go through PM dispatch — Claude decomposes
 *    them into ordered tasks with role assignments, then executes serially.
 * 4. `execute()` remains for direct single-agent calls when the caller knows the role.
 */
export class AgentManager {
  private registry: Map<AgentRole, BaseAgent>
  private agentListeners: AgentEventCallback[] = []
  private workflowListeners: WorkflowEventCallback[] = []
  private activeWorkflows = new Map<string, Workflow>()
  private executionHistory: AgentExecution[] = []
  private lastHandoffEvent: AgentEvent | null = null
  /** Tracks Claude session IDs per role for session continuity across dispatches */
  private roleSessions = new Map<AgentRole, string>()

  constructor() {
    this.registry = createAgentRegistry()
  }

  /** Load persisted session IDs from the database for session resumption */
  loadSessions(sessions: Map<string, string>): void {
    for (const [role, sid] of sessions) {
      this.roleSessions.set(role as AgentRole, sid)
    }
  }

  /* ── Registry ── */

  listAgents(): { role: AgentRole; title: string; description: string; isRunning: boolean }[] {
    return Array.from(this.registry.values()).map((agent) => ({
      role: agent.role,
      title: agent.title,
      description: agent.definition.description,
      isRunning: agent.isRunning,
    }))
  }

  getAgent(role: AgentRole): BaseAgent | undefined {
    return this.registry.get(role)
  }

  /* ── Routing ── */

  route(prompt: string): RouteResult {
    return routePrompt(prompt, this.registry)
  }

  /* ── PM-First Dispatch (the main entry point) ── */

  /**
   * Dispatch a prompt through the PM-first model.
   *
   * 1. Fast path: if the router is confident about a single role, execute directly.
   * 2. PM path: if ambiguous or multi-scope, PM decomposes into tasks and we
   *    execute them serially with dependencies.
   *
   * Returns the executions and the dispatch plan for the UI.
   */
  async dispatch(
    options: AgentExecuteOptions,
  ): Promise<{ plan: DispatchPlan; executions: AgentExecution[] }> {
    // Only bypass PM if the user explicitly targets a role with @role or "as a ..."
    const routeResult = this.route(options.prompt)
    if (routeResult.confidence === 'high' && routeResult.role) {
      // Check if it was an explicit mention (@ or "as a"), not just keyword match
      const lower = options.prompt.toLowerCase()
      const agent = this.registry.get(routeResult.role)
      const isExplicit = agent && (
        lower.includes(`@${routeResult.role}`) ||
        lower.includes(`as a ${agent.title.toLowerCase()}`)
      )

      if (isExplicit) {
        const execution = await this.execute({ ...options, role: routeResult.role })
        const plan: DispatchPlan = {
          mode: 'single',
          task: { id: 't0', title: execution.prompt.slice(0, 60), role: routeResult.role, prompt: options.prompt, dependsOn: [] },
          tasks: [{ id: 't0', title: execution.prompt.slice(0, 60), role: routeResult.role, prompt: options.prompt, dependsOn: [] }],
          summary: `Direct to ${agent.title} (requested by user)`,
        }
        return { plan, executions: [execution] }
      }
    }

    // Everything else goes through the PM
    this.emitAgentEvent({
      type: 'activity',
      agentId: 'product-manager',
      executionId: '',
      timestamp: new Date().toISOString(),
      data: { type: 'activity', description: 'Analyzing request and assigning tasks...' },
    })

    const plan = await dispatchWithPM(options.prompt, options, (event) => this.emitAgentEvent(event))

    // PM needs clarification — return the question, no tasks to execute
    if (plan.mode === 'clarification') {
      this.emitPM(plan.summary)
      return { plan, executions: [] }
    }

    this.emitPM(`Plan: ${plan.summary}`)

    // Emit the full plan so the client can show the task tray immediately
    this.emitAgentEvent({
      type: 'dispatch_plan',
      agentId: 'product-manager',
      executionId: '',
      timestamp: new Date().toISOString(),
      data: {
        type: 'dispatch_plan',
        plan: {
          mode: plan.mode,
          summary: plan.summary,
          tasks: plan.tasks.map((t) => ({ id: t.id, title: t.title, role: t.role, dependsOn: t.dependsOn })),
        },
      },
    })

    // Single task from PM — just run it
    if (plan.mode === 'single' && plan.task) {
      const execution = await this.execute({
        ...options,
        prompt: plan.task.prompt,
        role: plan.task.role,
      })
      const executions = [execution]

      // Quality gate after single task (if it produced code)
      if (execution.status === 'done' && needsQualityGate(plan.task.role)) {
        const gateExecs = await this.runFinalQualityGate(plan.task, options)
        executions.push(...gateExecs)
      }

      return { plan, executions }
    }

    // Multi-task: execute all tasks in dependency order, then quality gate once at the end
    const executions = await this.executeTaskPlan(plan.tasks, options)

    // Run quality gate once after all tasks complete
    const anyCodeProduced = plan.tasks.some((t) => needsQualityGate(t.role))
    const allSucceeded = executions.every((e) => e.status === 'done')
    if (anyCodeProduced && allSucceeded) {
      const gateExecs = await this.runFinalQualityGate(
        { role: 'code-reviewer' as AgentRole, prompt: plan.summary, title: plan.summary },
        options,
      )
      executions.push(...gateExecs)
    }

    return { plan, executions }
  }

  /**
   * Run the quality gate once at the end of a dispatch.
   * Code reviewer reviews all changes, QA writes tests for the full feature.
   */
  private async runFinalQualityGate(
    context: { role: AgentRole; prompt: string; title: string },
    options: AgentExecuteOptions,
  ): Promise<AgentExecution[]> {
    this.emitAgentEvent({
      type: 'activity',
      agentId: 'product-manager',
      executionId: '',
      timestamp: new Date().toISOString(),
      data: { type: 'activity', description: 'Running final quality gate — review & tests...' },
    })

    const gateResult = await runQualityGate(
      context,
      options,
      (opts) => this.execute(opts),
      (event) => this.emitAgentEvent(event),
    )

    this.emitAgentEvent({
      type: 'activity',
      agentId: 'product-manager',
      executionId: '',
      timestamp: new Date().toISOString(),
      data: {
        type: 'activity',
        description: gateResult.passed
          ? `Quality gate passed (${gateResult.reviewCycles} review, ${gateResult.testCycles} test cycles)`
          : 'Quality gate completed with issues',
      },
    })

    return gateResult.executions
  }

  /* ── Direct Single Agent Execution ── */

  /**
   * Execute a prompt with a specific agent role.
   * Use `dispatch()` for the smart PM-first routing.
   * Use this when you already know the exact role.
   */
  async execute(
    options: AgentExecuteOptions & { role?: AgentRole },
  ): Promise<AgentExecution> {
    const role = options.role ?? this.route(options.prompt).role
    if (!role) throw new Error('Cannot determine agent role. Use dispatch() for ambiguous prompts.')

    const agent = this.registry.get(role)
    if (!agent) throw new Error(`Unknown agent role: ${role}`)
    if (agent.isRunning) throw new Error(`Agent "${agent.title}" is already busy`)

    const unsub = agent.onEvent((event) => this.forwardAgentEvent(event))

    try {
      const execution = await agent.execute(options)
      this.executionHistory.push(execution)

      if (execution.status === 'done') {
        await processHandoffs(
          agent,
          execution,
          options,
          this.lastHandoffEvent,
          (opts) => this.execute(opts),
          (r) => this.registry.get(r),
          () => this.lastHandoffEvent,
          () => { this.lastHandoffEvent = null },
        )
        this.lastHandoffEvent = null
      }

      return execution
    } finally {
      unsub()
    }
  }

  cancel(role: AgentRole): void {
    this.registry.get(role)?.cancel()
  }

  cancelAll(): void {
    for (const agent of this.registry.values()) {
      if (agent.isRunning) agent.cancel()
    }
    for (const [id, workflow] of this.activeWorkflows) {
      if (workflow.status === 'running') {
        workflow.status = 'cancelled'
        workflow.completedAt = new Date().toISOString()
        this.emitWorkflow({
          type: 'workflow:cancelled',
          workflowId: id,
          stepIndex: null,
          timestamp: workflow.completedAt,
          data: { status: 'cancelled', message: 'Cancelled by user' },
        })
      }
    }
    this.activeWorkflows.clear()
  }

  /* ── PM Task Plan Execution ── */

  /**
   * Execute PM-dispatched tasks strictly one after another.
   * Each task receives the previous task's response as context so
   * agents build on each other's actual output.
   */
  private async executeTaskPlan(
    tasks: DispatchTask[],
    baseOptions: AgentExecuteOptions,
  ): Promise<AgentExecution[]> {
    const executions: AgentExecution[] = []
    const completed = new Map<string, AgentExecution>()

    for (const task of tasks) {
      // Check all dependencies are satisfied
      const unmetDeps = task.dependsOn.filter((dep) => !completed.has(dep))
      if (unmetDeps.length > 0) {
        // Check if any dep failed — if so, skip this task
        const depFailed = task.dependsOn.some((dep) => {
          const depExec = completed.get(dep)
          return depExec && depExec.status === 'error'
        })

        if (depFailed || unmetDeps.length > 0) {
          this.emitAgentEvent({
            type: 'error',
            agentId: task.role,
            executionId: '',
            timestamp: new Date().toISOString(),
            data: { type: 'error', error: `Skipped "${task.title}": dependency not met`, recoverable: false },
          })
          const skippedExec: AgentExecution = {
            id: crypto.randomUUID(), agentId: task.role, sessionId: '', status: 'error',
            prompt: task.prompt, startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
            costUsd: 0, durationMs: 0, error: 'Dependency not met', responseText: '',
          }
          completed.set(task.id, skippedExec)
          executions.push(skippedExec)
          continue
        }
      }

      // PM assigns task
      const taskIndex = tasks.indexOf(task)
      this.emitPM(`Assigning task ${taskIndex + 1}/${tasks.length}: "${task.title}" → ${task.role}`)
      this.emitTaskStatus(task.id, 'running', task.title, task.role)

      try {
        const execution = await this.executeDispatchedTask(task, baseOptions, completed)
        executions.push(execution)
        completed.set(task.id, execution)

        if (execution.status === 'done') {
          // Agent reports back to PM — PM marks done and announces next
          this.emitTaskStatus(task.id, 'done', task.title, task.role)
          const cost = execution.costUsd > 0 ? ` ($${execution.costUsd.toFixed(4)})` : ''
          this.emitPM(`${task.role} completed "${task.title}"${cost} — marking done`)

          const nextTask = tasks[taskIndex + 1]
          if (nextTask) {
            this.emitPM(`Moving to next task: "${nextTask.title}" → ${nextTask.role}`)
          } else {
            this.emitPM('All tasks completed — running final quality gate')
          }
        } else {
          // Agent reports failure to PM
          this.emitTaskStatus(task.id, 'error', task.title, task.role)
          this.emitPM(`${task.role} failed "${task.title}": ${execution.error ?? 'unknown error'}`)
          this.emitPM('Stopping remaining tasks due to failure')

          for (const remaining of tasks) {
            if (!completed.has(remaining.id)) {
              this.emitTaskStatus(remaining.id, 'skipped', remaining.title, remaining.role)
              const skippedExec: AgentExecution = {
                id: crypto.randomUUID(), agentId: remaining.role, sessionId: '', status: 'error',
                prompt: remaining.prompt, startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
                costUsd: 0, durationMs: 0, error: `Skipped: "${task.title}" failed`, responseText: '',
              }
              completed.set(remaining.id, skippedExec)
              executions.push(skippedExec)
            }
          }
          break
        }
      } catch (err: any) {
        this.emitTaskStatus(task.id, 'error', task.title, task.role)
        this.emitPM(`${task.role} crashed on "${task.title}": ${err.message}`)

        const failedExec: AgentExecution = {
          id: crypto.randomUUID(), agentId: task.role, sessionId: '', status: 'error',
          prompt: task.prompt, startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
          costUsd: 0, durationMs: 0, error: err.message, responseText: '',
        }
        completed.set(task.id, failedExec)
        executions.push(failedExec)
        break
      }
    }

    return executions
  }

  /**
   * Execute a single dispatched task.
   * Passes previous task output as context so agents build on each other.
   */
  private async executeDispatchedTask(
    task: DispatchTask,
    baseOptions: AgentExecuteOptions,
    completed: Map<string, AgentExecution>,
  ): Promise<AgentExecution> {
    // Build context from dependency outputs — pass actual response text
    const contextParts: string[] = []

    for (const depId of task.dependsOn) {
      const depExec = completed.get(depId)
      if (!depExec || depExec.status !== 'done') continue

      const responsePreview = depExec.responseText.length > 4000
        ? depExec.responseText.slice(0, 4000) + '\n\n... (truncated)'
        : depExec.responseText

      if (responsePreview.trim()) {
        contextParts.push(`## Output from previous task: ${depId} (${depExec.agentId})\n\n${responsePreview}`)
      }
    }

    const contextPrefix = contextParts.length > 0
      ? contextParts.join('\n\n---\n\n') + '\n\n---\n\nNow execute your task. Build on the work above.\n\n'
      : ''

    // Resume Claude session if this role has one from a previous dispatch
    const existingSession = this.roleSessions.get(task.role)
    const isResume = !!existingSession

    const execution = await this.execute({
      ...baseOptions,
      prompt: contextPrefix + task.prompt,
      role: task.role,
      sessionId: existingSession,
      resume: isResume,
    })

    // Store session for future use by this role
    if (execution.sessionId) {
      this.roleSessions.set(task.role, execution.sessionId)
    }

    return execution
  }

  /* ── Pipelines & Workflows ── */

  listPipelines(): PipelineTemplate[] {
    return PIPELINE_TEMPLATES
  }

  async runPipeline(
    pipelineId: string,
    prompt: string,
    baseOptions: Omit<AgentExecuteOptions, 'prompt'>,
    maxBudgetUsd?: number,
  ): Promise<Workflow> {
    const template = PIPELINE_TEMPLATES.find((t) => t.id === pipelineId)
    if (!template) throw new Error(`Unknown pipeline: ${pipelineId}`)

    const steps: WorkflowStep[] = template.steps.map((s) => ({
      role: s.role,
      prompt: s.promptTemplate.replace(/\{prompt\}/g, prompt),
      dependsOn: s.dependsOn,
      status: 'pending',
      executionId: null,
      result: null,
      error: null,
    }))

    return this.runWorkflowInternal(template.name, steps, baseOptions, maxBudgetUsd)
  }

  async runWorkflow(
    name: string,
    steps: { role: AgentRole; prompt: string; dependsOn?: number }[],
    baseOptions: Omit<AgentExecuteOptions, 'prompt'>,
    maxBudgetUsd?: number,
  ): Promise<Workflow> {
    const workflowSteps: WorkflowStep[] = steps.map((s) => ({
      role: s.role,
      prompt: s.prompt,
      dependsOn: s.dependsOn ?? null,
      status: 'pending',
      executionId: null,
      result: null,
      error: null,
    }))

    return this.runWorkflowInternal(name, workflowSteps, baseOptions, maxBudgetUsd)
  }

  private async runWorkflowInternal(
    name: string,
    steps: WorkflowStep[],
    baseOptions: Omit<AgentExecuteOptions, 'prompt'>,
    maxBudgetUsd?: number,
  ): Promise<Workflow> {
    const workflowId = crypto.randomUUID()
    const now = new Date().toISOString()

    const workflow: Workflow = {
      id: workflowId,
      name,
      status: 'running',
      steps,
      totalCostUsd: 0,
      totalDurationMs: 0,
      startedAt: now,
      completedAt: null,
      maxBudgetUsd: maxBudgetUsd ?? null,
    }

    this.activeWorkflows.set(workflowId, workflow)
    this.emitWorkflow({
      type: 'workflow:started',
      workflowId,
      stepIndex: null,
      timestamp: now,
      data: { status: 'running', message: `Starting ${name}` },
    })

    try {
      await executeWorkflowSteps(
        workflow,
        baseOptions,
        (opts) => this.execute(opts),
        (event) => this.emitWorkflow(event),
      )

      const allDone = workflow.steps.every((s) => s.status === 'completed')
      workflow.status = allDone ? 'completed' : 'failed'
      workflow.completedAt = new Date().toISOString()

      this.emitWorkflow({
        type: allDone ? 'workflow:completed' : 'workflow:failed',
        workflowId,
        stepIndex: null,
        timestamp: workflow.completedAt,
        data: {
          status: workflow.status,
          costUsd: workflow.totalCostUsd,
          durationMs: workflow.totalDurationMs,
          message: allDone ? `${name} completed (${steps.length} steps)` : `${name} failed`,
        },
      })
    } catch (err: any) {
      workflow.status = 'failed'
      workflow.completedAt = new Date().toISOString()
      this.emitWorkflow({
        type: 'workflow:failed',
        workflowId,
        stepIndex: null,
        timestamp: workflow.completedAt,
        data: { status: 'failed', message: err.message },
      })
    } finally {
      this.activeWorkflows.delete(workflowId)
    }

    return workflow
  }

  /* ── Events ── */

  onAgentEvent(cb: AgentEventCallback): () => void {
    this.agentListeners.push(cb)
    return () => { this.agentListeners = this.agentListeners.filter((l) => l !== cb) }
  }

  onWorkflowEvent(cb: WorkflowEventCallback): () => void {
    this.workflowListeners.push(cb)
    return () => { this.workflowListeners = this.workflowListeners.filter((l) => l !== cb) }
  }

  /* ── History & State ── */

  getExecutionHistory(limit = 50): AgentExecution[] {
    return this.executionHistory.slice(-limit)
  }

  getActiveWorkflows(): Workflow[] {
    return Array.from(this.activeWorkflows.values())
  }

  /* ── Internal ── */

  private forwardAgentEvent(event: AgentEvent): void {
    if (event.type === 'handoff') this.lastHandoffEvent = event
    this.emitAgentEvent(event)
  }

  private emitAgentEvent(event: AgentEvent): void {
    for (const cb of this.agentListeners) {
      try { cb(event) } catch (err) {
        console.error('[agent-manager] Agent event listener error:', err)
      }
    }
  }

  private emitWorkflow(event: WorkflowEvent): void {
    for (const cb of this.workflowListeners) {
      try { cb(event) } catch (err) {
        console.error('[agent-manager] Workflow event listener error:', err)
      }
    }
  }

  /** Emit a PM activity event */
  private emitPM(description: string): void {
    this.emitAgentEvent({
      type: 'activity',
      agentId: 'product-manager',
      executionId: '',
      timestamp: new Date().toISOString(),
      data: { type: 'activity', description },
    })
  }

  /** Emit a task status change event for the task tray */
  private emitTaskStatus(taskId: string, status: 'pending' | 'running' | 'done' | 'error' | 'skipped', title: string, role: AgentRole): void {
    this.emitAgentEvent({
      type: 'task_status',
      agentId: 'product-manager',
      executionId: '',
      timestamp: new Date().toISOString(),
      data: { type: 'task_status', taskId, status, title, role },
    })
  }
}
