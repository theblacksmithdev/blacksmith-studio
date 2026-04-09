import { DecomposableAgent, type ToolCallRecord } from '../../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../../types.js'
import { DEFINITION } from './definition.js'

export class DevOpsEngineerAgent extends DecomposableAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'DevOps guidelines:',
      '- Review the existing deployment and infrastructure setup before making changes.',
      '- Secrets must never appear in code, Dockerfiles, or CI configs.',
      '- Dockerfiles should use multi-stage builds, pinned base images, and non-root users.',
      '- CI pipelines should be fast: use caching, parallelism, and fast-fail ordering.',
      '- Include health checks for any deployed service.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    const filesCreated = toolCalls.filter((tc) => tc.toolName === 'Write').length
    const filesEdited = toolCalls.filter((tc) => tc.toolName === 'Edit').length

    const parts: string[] = []
    if (filesCreated > 0) parts.push(`${filesCreated} file(s) created`)
    if (filesEdited > 0) parts.push(`${filesEdited} file(s) modified`)

    if (parts.length === 0) {
      const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Infrastructure analysis complete'
      return firstLine.slice(0, 120)
    }

    return parts.join(', ')
  }
}
