import { execSync } from 'node:child_process'
import { BaseAgent, type AgentExecuteOptions, type ToolCallRecord } from '../../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../../types.js'
import { DEFINITION } from './definition.js'

export class QaEngineerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected buildExecutionContext(options: AgentExecuteOptions): string {
    const parts: string[] = []

    // Check for existing test results
    for (const cmd of ['npx vitest run --reporter=verbose 2>&1 | tail -30', 'python -m pytest --tb=short -q 2>&1 | tail -30']) {
      try {
        const output = execSync(cmd, {
          cwd: options.projectRoot,
          encoding: 'utf-8',
          timeout: 30000,
        }).trim()
        if (output) {
          parts.push(`## Latest Test Results\n\`\`\`\n${output}\n\`\`\``)
          break
        }
      } catch { /* test runner not available */ }
    }

    return parts.join('\n\n')
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Testing guidelines:',
      '- Use the project\'s existing test framework and patterns.',
      '- Test behavior, not implementation. Tests should survive refactoring.',
      '- Cover the happy path first, then edge cases, then error conditions.',
      '- Use descriptive test names that explain the scenario being tested.',
      '- Include proper setup/teardown. No test interdependence.',
      '- Run the tests after writing them to confirm they pass.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    const testFiles = toolCalls.filter((tc) =>
      (tc.toolName === 'Write' || tc.toolName === 'Edit') &&
      typeof tc.input.file_path === 'string' &&
      (tc.input.file_path.includes('test') || tc.input.file_path.includes('spec'))
    ).length

    const bashRuns = toolCalls.filter((tc) => tc.toolName === 'Bash').length

    const parts: string[] = []
    if (testFiles > 0) parts.push(`${testFiles} test file(s) written`)
    if (bashRuns > 0) parts.push(`${bashRuns} command(s) run`)

    if (parts.length === 0) {
      const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Test analysis complete'
      return firstLine.slice(0, 120)
    }

    return parts.join(', ')
  }
}
