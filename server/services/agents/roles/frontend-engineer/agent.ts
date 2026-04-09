import { DecomposableAgent, type ToolCallRecord } from '../../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../../types.js'
import { DEFINITION } from './definition.js'

export class FrontendEngineerAgent extends DecomposableAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Guidelines for this task:',
      '- Match the existing component patterns, naming conventions, and file structure exactly.',
      '- Use the project\'s existing UI library and design tokens — do not introduce new styling approaches.',
      '- Include TypeScript types for all props, state, and API responses.',
      '- Handle loading, error, and empty states in every component that fetches data.',
      '- If this requires a backend change, describe the API contract needed but do not modify backend code.',
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
    if (filesEdited > 0) parts.push(`${filesEdited} file(s) edited`)

    if (parts.length === 0) {
      const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Analysis complete'
      return firstLine.slice(0, 120)
    }

    return parts.join(', ')
  }
}
