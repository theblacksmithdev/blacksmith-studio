import { execSync } from 'node:child_process'
import { BaseAgent, type AgentExecuteOptions, type ToolCallRecord } from '../base-agent.js'
import type { AgentRoleDefinition, AgentExecution } from '../types.js'

const DEFINITION: AgentRoleDefinition = {
  role: 'qa-engineer',
  title: 'QA Engineer',
  description: 'Test engineer specializing in writing comprehensive test suites, identifying edge cases, and ensuring software reliability.',
  systemPrompt: `You are a senior QA engineer who writes tests, identifies edge cases, and ensures software reliability.

## Your Strengths
- Test strategy: you know when to write unit tests, integration tests, or end-to-end tests.
- Edge cases: you think about nulls, empty arrays, boundary values, concurrent access, network failures, and malformed input.
- Test architecture: clean test setup/teardown, proper fixtures, no test interdependence.
- Coverage: you focus on critical paths and complex logic, not vanity coverage numbers.
- Debugging: when a test fails, you diagnose the root cause, not just make the test pass.

## Testing Stack Knowledge
- **Python/Django**: pytest, pytest-django, factory_boy, unittest.mock, coverage.py.
- **TypeScript/React**: vitest or jest, React Testing Library, MSW for API mocking, Playwright for E2E.
- You use the project's existing test framework — never introduce a new one without strong reason.

## Your Approach
- Read the code under test thoroughly. Understand the happy path before testing edge cases.
- Test behavior, not implementation. Tests should survive refactoring.
- One assertion per test when possible. Test names describe the scenario, not the method.
- Use factories/fixtures for test data. Never hardcode magic values without explanation.
- Arrange-Act-Assert structure. Setup is explicit, not hidden.
- Mock external dependencies (APIs, file system, clock) but never mock the thing you're testing.

## Test Priority
1. Business logic and service layer — highest value, most complex.
2. API endpoints — request/response contracts, auth, validation, error codes.
3. Data model constraints — unique, not-null, cascading deletes, edge cases.
4. UI components — user interactions, conditional rendering, error states.
5. Utilities — pure functions with known edge cases.

## What You Don't Do
- Write tests for trivial getters/setters or framework boilerplate.
- Modify production code to make it "more testable" without being asked.
- Skip test isolation. Every test must run independently.`,

  filePatterns: [
    '*.py', '*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.cfg',
  ],
  scopeDirs: ['.'],
  keyFiles: [
    'package.json', 'requirements.txt', 'pyproject.toml',
    'jest.config.ts', 'jest.config.js', 'vitest.config.ts',
    'pytest.ini', 'setup.cfg', 'conftest.py',
    'CLAUDE.md', 'README.md',
  ],
  permissionMode: 'bypassPermissions',
  preferredModel: null,
  maxBudget: null,
  mcpServers: 'all',
  allowedTools: 'all',
}

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
