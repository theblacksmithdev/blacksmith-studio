import crypto from 'node:crypto'
import type { AgentExecution } from '../types.js'
import type { AgentExecuteOptions } from './types.js'
import { BaseAgent } from './base-agent.js'
import { assessComplexity, type SubTask } from './decomposer/index.js'

/** Max recursion depth to prevent infinite splitting */
const MAX_DECOMPOSE_DEPTH = 3

/**
 * Extends BaseAgent with recursive self-decomposition.
 *
 * Before executing, assesses whether the task is too complex for one pass.
 * If so, breaks it into sub-tasks. Each sub-task is ALSO assessed — if it's
 * still too complex, it gets split again. This recurses until every leaf
 * task is genuinely simple enough for one excellent pass.
 *
 * All sub-tasks execute serially within the same Claude session for context continuity.
 */
export abstract class DecomposableAgent extends BaseAgent {

  async execute(options: AgentExecuteOptions): Promise<AgentExecution> {
    if (this.isRunning) throw new Error(`Agent "${this.title}" is already executing. Cancel first.`)

    const validation = this.validatePrompt(options.prompt)
    if (!validation.valid) throw new Error(`Prompt rejected by ${this.title}: ${validation.reason}`)

    if (this.definition.selfDecompose) {
      // Recursively flatten complex tasks into simple leaf tasks
      const leafTasks = await this.flattenToLeafTasks(options.prompt, options, 0)

      if (leafTasks.length > 1) {
        this.emitStandalone({
          type: 'activity',
          description: `Decomposed into ${leafTasks.length} focused tasks`,
        })
        return this.executeSubTasks(leafTasks, options)
      }
    }

    return this.executeSingle(options)
  }

  /**
   * Recursively decompose a prompt into leaf tasks that are each simple enough
   * for one excellent pass. If a sub-task is still complex, it gets split again.
   */
  private async flattenToLeafTasks(
    prompt: string,
    options: AgentExecuteOptions,
    depth: number,
  ): Promise<SubTask[]> {
    // Safety: stop recursing after MAX_DECOMPOSE_DEPTH
    if (depth >= MAX_DECOMPOSE_DEPTH) {
      return [{ id: `leaf-${crypto.randomUUID().slice(0, 8)}`, title: prompt.slice(0, 60), prompt }]
    }

    this.emitStandalone({
      type: 'activity',
      description: depth === 0
        ? `${this.title} assessing task complexity...`
        : `Re-assessing sub-task complexity (depth ${depth})...`,
    })

    const assessment = await assessComplexity(prompt, this.definition, options)

    // Simple enough — return as a leaf
    if (assessment.simple || assessment.subtasks.length === 0) {
      return [{ id: `leaf-${crypto.randomUUID().slice(0, 8)}`, title: prompt.slice(0, 60), prompt }]
    }

    // Complex — recursively assess each sub-task
    const allLeaves: SubTask[] = []

    for (const sub of assessment.subtasks) {
      const childLeaves = await this.flattenToLeafTasks(sub.prompt, options, depth + 1)
      allLeaves.push(...childLeaves)
    }

    return allLeaves
  }

  /**
   * Execute leaf sub-tasks serially within the same Claude session.
   * Emits subtask_status events for the UI task drawer.
   */
  private async executeSubTasks(
    subtasks: SubTask[],
    options: AgentExecuteOptions,
  ): Promise<AgentExecution> {
    const sessionId = options.sessionId ?? crypto.randomUUID()
    const parentTaskId = options.prompt.slice(0, 60)
    let lastExecution: AgentExecution | null = null
    let totalCost = 0
    let totalDuration = 0
    let combinedResponse = ''
    const startedAt = new Date().toISOString()

    // Emit all as pending
    for (let i = 0; i < subtasks.length; i++) {
      this.emitStandalone({
        type: 'subtask_status',
        parentTaskId,
        subtaskId: subtasks[i].id,
        status: 'pending',
        title: subtasks[i].title,
        index: i,
        total: subtasks.length,
      })
    }

    for (let i = 0; i < subtasks.length; i++) {
      const sub = subtasks[i]

      this.emitStandalone({
        type: 'subtask_status',
        parentTaskId,
        subtaskId: sub.id,
        status: 'running',
        title: sub.title,
        index: i,
        total: subtasks.length,
      })

      this.emitStandalone({
        type: 'activity',
        description: `[${i + 1}/${subtasks.length}] ${sub.title}`,
      })

      const execution = await this.executeSingle({
        ...options,
        prompt: sub.prompt,
        sessionId,
        resume: i > 0,
      })

      lastExecution = execution
      totalCost += execution.costUsd
      totalDuration += execution.durationMs
      combinedResponse += execution.responseText + '\n\n'

      if (execution.status === 'error') {
        this.emitStandalone({
          type: 'subtask_status',
          parentTaskId,
          subtaskId: sub.id,
          status: 'error',
          title: sub.title,
          index: i,
          total: subtasks.length,
        })
        this.emitStandalone({ type: 'activity', description: `Sub-task "${sub.title}" failed — stopping` })
        execution.costUsd = totalCost
        execution.durationMs = totalDuration
        execution.responseText = combinedResponse
        return execution
      }

      this.emitStandalone({
        type: 'subtask_status',
        parentTaskId,
        subtaskId: sub.id,
        status: 'done',
        title: sub.title,
        index: i,
        total: subtasks.length,
      })
    }

    if (!lastExecution) throw new Error('No sub-tasks executed')

    this.emitStandalone({ type: 'activity', description: `All ${subtasks.length} sub-tasks completed` })

    lastExecution.costUsd = totalCost
    lastExecution.durationMs = totalDuration
    lastExecution.responseText = combinedResponse
    lastExecution.startedAt = startedAt
    return lastExecution
  }
}
