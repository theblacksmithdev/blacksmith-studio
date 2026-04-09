import { BaseAgent, type ToolCallRecord } from '../../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../../types.js'
import { DEFINITION } from './definition.js'

export class SecurityEngineerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Security audit guidelines:',
      '- Audit systematically: auth → authorization → input validation → output encoding → secrets → config.',
      '- Classify findings by severity with clear exploitation scenarios.',
      '- Provide concrete fix examples for every finding.',
      '- Check for hardcoded secrets, missing security headers, and exposed debug endpoints.',
      '- Review dependency versions for known vulnerabilities.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    _toolCalls: ToolCallRecord[],
  ): string {
    // Count findings by severity
    const critical = (fullResponse.match(/critical/gi) || []).length
    const high = (fullResponse.match(/\bhigh\b/gi) || []).length

    if (critical > 0 || high > 0) {
      const parts: string[] = []
      if (critical > 0) parts.push(`${critical} critical`)
      if (high > 0) parts.push(`${high} high`)
      return `Found ${parts.join(', ')} severity issue(s)`
    }

    const summaryMatch = fullResponse.match(/\*\*Risk Summary\*\*:?\s*(.+)/i)
    if (summaryMatch) return summaryMatch[1].trim().slice(0, 120)

    const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Security audit complete'
    return firstLine.slice(0, 120)
  }
}
