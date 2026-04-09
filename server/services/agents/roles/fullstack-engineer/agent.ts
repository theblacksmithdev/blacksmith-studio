import { DecomposableAgent, type ToolCallRecord } from '../../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../../types.js'
import { DEFINITION } from './definition.js'

export class FullstackEngineerAgent extends DecomposableAgent {
  get definition(): AgentRoleDefinition { return DEFINITION }

  protected transformPrompt(prompt: string): string {
    return [
      prompt, '',
      'Guidelines for this task:',
      '- Implement both backend and frontend changes together as one cohesive feature.',
      '- Start from the data model, then API, then frontend integration.',
      '- Ensure TypeScript types match Django serializer output exactly.',
      '- Include loading, error, and empty states on the frontend.',
      '- Add or update tests on the backend for any new logic.',
    ].join('\n')
  }

  protected processResult(_execution: AgentExecution, fullResponse: string, toolCalls: ToolCallRecord[]): string {
    const filesCreated = toolCalls.filter((tc) => tc.toolName === 'Write').length
    const filesEdited = toolCalls.filter((tc) => tc.toolName === 'Edit').length
    const pyFiles = toolCalls.filter((tc) => (tc.toolName === 'Write' || tc.toolName === 'Edit') && typeof tc.input.file_path === 'string' && tc.input.file_path.endsWith('.py')).length
    const tsFiles = toolCalls.filter((tc) => (tc.toolName === 'Write' || tc.toolName === 'Edit') && typeof tc.input.file_path === 'string' && (tc.input.file_path.endsWith('.ts') || tc.input.file_path.endsWith('.tsx'))).length
    const parts: string[] = []
    if (filesCreated + filesEdited > 0) {
      parts.push(`${filesCreated + filesEdited} file(s) touched`)
      if (pyFiles > 0 && tsFiles > 0) parts.push(`(${pyFiles} backend, ${tsFiles} frontend)`)
    }
    if (parts.length === 0) return (fullResponse.split('\n').find((l) => l.trim()) ?? 'Analysis complete').slice(0, 120)
    return parts.join(' ')
  }
}
