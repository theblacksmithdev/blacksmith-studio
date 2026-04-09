import crypto from 'node:crypto'
import type { AgentExecution } from '../types.js'
import type { AgentExecuteOptions } from './types.js'
import { BaseAgent } from './base-agent.js'
import { assessComplexity } from './decomposer/index.js'

/**
 * Extends BaseAgent with self-decomposition capability.
 *
 * Before executing, assesses whether the task is too complex for one pass.
 * If so, breaks it into sub-tasks and executes them serially within the
 * same Claude session — so each sub-task has full context of previous work.
 *
 * Emits `subtask_status` events so the client can track sub-task progress
 * in the task drawer alongside the parent PM-dispatched tasks.
 */
export abstract class DecomposableAgent extends BaseAgent {

  async execute(options: AgentExecuteOptions): Promise<AgentExecution> {
    if (this.isRunning) throw new Error(`Agent "${this.title}" is already executing. Cancel first.`)

    const validation = this.validatePrompt(options.prompt)
    if (!validation.valid) throw new Error(`Prompt rejected by ${this.title}: ${validation.reason}`)

    if (this.definition.selfDecompose) {
      this.emitStandalone({ type: 'activity', description: `${this.title} assessing task complexity...` })

      const assessment = await assessComplexity(options.prompt, this.definition, options)

      if (!assessment.simple && assessment.subtasks.length > 0) {
        this.emitStandalone({
          type: 'activity',
          description: `Splitting into ${assessment.subtasks.length} sub-tasks for better quality`,
        })
        return this.executeSubTasks(assessment.subtasks, options)
      }
    }

    return this.executeSingle(options)
  }

  /**
   * Execute sub-tasks serially within the same Claude session.
   * Emits subtask_status events for each sub-task so the UI can track them.
   */
  private async executeSubTasks(
    subtasks: { id: string; title: string; prompt: string }[],
    options: AgentExecuteOptions,
  ): Promise<AgentExecution> {
    const sessionId = options.sessionId ?? crypto.randomUUID()
    // Use the parent task's prompt as an identifier for linking sub-tasks
    // The PM's task_status event has the taskId — we use the execution's prompt to find it
    const parentTaskId = options.prompt.slice(0, 60)
    let lastExecution: AgentExecution | null = null
    let totalCost = 0
    let totalDuration = 0
    let combinedResponse = ''
    const startedAt = new Date().toISOString()

    // Emit all sub-tasks as pending first
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

      // Mark running
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
        // Mark this one as error
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

      // Mark done
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
