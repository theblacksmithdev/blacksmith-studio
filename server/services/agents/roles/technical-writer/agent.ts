import { BaseAgent, type ToolCallRecord } from '../../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../../types.js'
import { DEFINITION } from './definition.js'

export class TechnicalWriterAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Documentation guidelines:',
      '- Read the actual code before documenting. Document what is true, not what you assume.',
      '- Include working examples for every API endpoint or public function.',
      '- Test setup instructions mentally — every step must be explicit and in order.',
      '- Use consistent formatting: headings, code blocks with language tags, and clear structure.',
      '- Write for the reader\'s context. New developer setup ≠ API consumer reference.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    const docsWritten = toolCalls.filter((tc) =>
      (tc.toolName === 'Write' || tc.toolName === 'Edit') &&
      typeof tc.input.file_path === 'string' &&
      (tc.input.file_path.endsWith('.md') || tc.input.file_path.endsWith('.mdx') || tc.input.file_path.endsWith('.rst'))
    ).length

    const codeDocumented = toolCalls.filter((tc) =>
      (tc.toolName === 'Edit') &&
      typeof tc.input.file_path === 'string' &&
      !tc.input.file_path.endsWith('.md')
    ).length

    const parts: string[] = []
    if (docsWritten > 0) parts.push(`${docsWritten} doc(s) written`)
    if (codeDocumented > 0) parts.push(`${codeDocumented} file(s) documented`)

    if (parts.length === 0) {
      const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Documentation complete'
      return firstLine.slice(0, 120)
    }

    return parts.join(', ')
  }
}
