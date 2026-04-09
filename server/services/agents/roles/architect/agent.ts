import { BaseAgent, type ToolCallRecord } from '../../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../../types.js'
import { DEFINITION } from './definition.js'

export class ArchitectAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Architecture guidelines:',
      '- Analyze the existing codebase structure, dependencies, and patterns before proposing changes.',
      '- Provide concrete module boundaries, file structures, and interface contracts.',
      '- Include trade-off analysis: what alternatives exist and why this approach wins.',
      '- Consider operational concerns: deployment, monitoring, migration path.',
      '- If implementation is requested, provide a step-by-step plan with dependency ordering.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    _toolCalls: ToolCallRecord[],
  ): string {
    // Try to extract the problem statement or first heading
    const headingMatch = fullResponse.match(/^#+\s+(.+)/m)
    if (headingMatch) {
      return headingMatch[1].trim().slice(0, 120)
    }

    const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Architecture analysis complete'
    return firstLine.slice(0, 120)
  }
}
