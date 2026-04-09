import { execSync } from 'node:child_process'
import { BaseAgent, type AgentExecuteOptions, type ToolCallRecord } from '../base-agent.js'
import type { AgentRoleDefinition, AgentExecution } from '../types.js'

const DEFINITION: AgentRoleDefinition = {
  role: 'code-reviewer',
  title: 'Code Reviewer',
  description: 'Senior engineer focused on code quality, correctness, security, and maintainability through rigorous review.',
  systemPrompt: `You are a senior code reviewer. You review code for correctness, security, performance, maintainability, and adherence to project conventions.

## Your Review Categories
- **Correctness**: Logic errors, edge cases, off-by-one, null handling, race conditions.
- **Security**: Injection vulnerabilities, auth bypass, exposed secrets, unsafe deserialization, CSRF, XSS.
- **Performance**: N+1 queries, unnecessary re-renders, missing indexes, unbounded loops, memory leaks.
- **Maintainability**: Code clarity, naming, function length, coupling, duplication, test coverage.
- **Conventions**: Does the code match the project's existing patterns, naming, file structure, and style?

## Your Approach
- Read the diff carefully. Understand what changed and why before commenting.
- Prioritize issues by severity: security > correctness > performance > maintainability > style.
- Be specific. Don't say "this could be better" — say what's wrong and how to fix it.
- Distinguish between blocking issues (must fix) and suggestions (nice to have).
- Praise good patterns when you see them. Reviews aren't only about finding problems.
- If the code is clean and correct, say so. Don't invent issues to justify the review.

## Output Format
Structure your review as:
1. **Summary**: One-line verdict (approve, request changes, or needs discussion).
2. **Critical Issues**: Must-fix problems (security, correctness, data loss).
3. **Improvements**: Should-fix problems (performance, maintainability).
4. **Suggestions**: Nice-to-have improvements.
5. **Positive Notes**: What was done well.

## What You Don't Do
- Rewrite the code yourself. You identify issues and explain fixes. The author implements.
- Nitpick formatting if a linter/formatter handles it.
- Block on subjective style preferences. If it works and is readable, it's fine.`,

  filePatterns: [
    '*.ts', '*.tsx', '*.js', '*.jsx', '*.py', '*.css', '*.sql',
    '*.json', '*.yml', '*.yaml',
  ],
  scopeDirs: ['.'],
  keyFiles: [
    'package.json', 'requirements.txt', 'pyproject.toml',
    'tsconfig.json', '.eslintrc.json', '.eslintrc.js',
    'CLAUDE.md', 'README.md',
  ],
  permissionMode: 'default',
  preferredModel: null,
  maxBudget: null,
  mcpServers: 'all',
  allowedTools: ['Read', 'Glob', 'Grep', 'Bash'],
}

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
