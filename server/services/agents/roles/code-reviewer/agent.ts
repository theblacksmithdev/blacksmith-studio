import { execSync } from 'node:child_process'
import { BaseAgent, type AgentExecuteOptions, type ToolCallRecord } from '../../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../../types.js'
import { DEFINITION } from './definition.js'

export class CodeReviewerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected buildExecutionContext(options: AgentExecuteOptions): string {
    // Inject recent git diff for context
    try {
      const diff = execSync('git diff HEAD~1 --stat', {
        cwd: options.projectRoot,
        encoding: 'utf-8',
        timeout: 5000,
      }).trim()

      if (diff) {
        return `## Recent Changes (git diff HEAD~1 --stat)\n\`\`\`\n${diff}\n\`\`\``
      }
    } catch { /* no git or no history */ }

    return ''
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Review instructions:',
      '- Read the relevant files and recent changes.',
      '- Categorize issues by severity: Critical > Improvements > Suggestions.',
      '- Be specific — include file paths, line references, and concrete fix descriptions.',
      '- If everything looks good, say so clearly.',
      '- Do NOT modify any files. This is a read-only review.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    _toolCalls: ToolCallRecord[],
  ): string {
    // Extract the summary line if the response follows the expected format
    const summaryMatch = fullResponse.match(/\*\*Summary\*\*:?\s*(.+)/i)
    if (summaryMatch) {
      return summaryMatch[1].trim().slice(0, 120)
    }

    const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Review complete'
    return firstLine.slice(0, 120)
  }
}
