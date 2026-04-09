import { BaseAgent, type ToolCallRecord } from '../../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../../types.js'
import { DEFINITION } from './definition.js'

export class UiDesignerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Design specification guidelines:',
      '- Read the existing UI code and theme files to understand the design system.',
      '- Produce a detailed written specification, NOT code.',
      '- Reference exact design tokens (CSS variables) from the project theme.',
      '- Specify every component state: default, hover, active, focus, disabled, loading, error.',
      '- Include layout structure, spacing, typography, and interaction details.',
      '- The frontend engineer will implement from your spec — make it unambiguous.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    const specsWritten = toolCalls.filter((tc) => tc.toolName === 'Write').length

    if (specsWritten > 0) return `${specsWritten} design spec(s) written`

    const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Design spec complete'
    return firstLine.slice(0, 120)
  }
}
