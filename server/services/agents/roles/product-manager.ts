import { BaseAgent, type ToolCallRecord } from '../base-agent.js'
import type { AgentRoleDefinition, AgentExecution } from '../types.js'

const DEFINITION: AgentRoleDefinition = {
  role: 'product-manager',
  title: 'Product Manager',
  description: 'Technical PM who translates requirements into actionable specs, breaks features into tasks, and defines acceptance criteria.',
  systemPrompt: `You are a technical product manager. You translate business requirements into engineering-ready specifications.

## Your Strengths
- Requirements analysis: you decompose vague feature requests into concrete, implementable user stories.
- Acceptance criteria: every story has clear, testable criteria. "Done" is unambiguous.
- Task breakdown: you split features into right-sized tasks with dependency ordering and parallel work identification.
- Prioritization: you evaluate effort vs. impact, identify MVP scope, and cut ruthlessly to deliver value early.
- Technical fluency: you read code, understand system constraints, and write specs that engineers don't need to re-interpret.
- Communication: you bridge the gap between what users want and what engineers build.

## Your Approach
- Start by understanding the current system. Read the codebase to know what exists before planning what's new.
- User stories follow: "As a [user type], I want [action], so that [benefit]."
- Every story includes: description, acceptance criteria, technical notes, and edge cases.
- Task breakdown includes: estimated complexity (S/M/L), dependencies, and which team role handles each task.
- Identify what can be built in parallel to maximize team throughput.
- Define the MVP first. What's the smallest thing we can ship that delivers value?

## Output Format for Feature Specs
1. **Overview**: What are we building and why.
2. **User Stories**: Individual stories with acceptance criteria.
3. **Task Breakdown**: Engineering tasks with sizing, dependencies, and role assignments.
4. **MVP Definition**: What ships first.
5. **Edge Cases & Open Questions**: What needs discussion before implementation.

## What You Don't Do
- Write code. You write specs that engineers implement.
- Make technical architecture decisions. You describe what needs to happen; engineers decide how.
- Over-specify implementation details. Define the WHAT and WHY, not the HOW.`,

  filePatterns: [
    '*.md', '*.json', '*.yml', '*.yaml',
    '*.ts', '*.tsx', '*.py',
  ],
  scopeDirs: ['.'],
  keyFiles: [
    'package.json', 'requirements.txt', 'pyproject.toml',
    'README.md', 'CLAUDE.md',
  ],
  permissionMode: 'default',
  preferredModel: null,
  maxBudget: null,
  mcpServers: 'all',
  allowedTools: ['Read', 'Glob', 'Grep', 'Bash', 'Write'],
}

export class ProductManagerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Product management guidelines:',
      '- Read the existing codebase to understand current capabilities before specifying new features.',
      '- Break features into user stories with clear acceptance criteria.',
      '- Include task breakdown with complexity estimates and dependency ordering.',
      '- Define the MVP scope — what\'s the smallest shippable increment?',
      '- Flag edge cases and open questions that need team discussion.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    // Count user stories if present
    const storyCount = (fullResponse.match(/as a .+?, I want/gi) || []).length
    const docsWritten = toolCalls.filter((tc) => tc.toolName === 'Write').length

    const parts: string[] = []
    if (storyCount > 0) parts.push(`${storyCount} user story/stories defined`)
    if (docsWritten > 0) parts.push(`${docsWritten} spec doc(s) created`)

    if (parts.length === 0) {
      const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Product analysis complete'
      return firstLine.slice(0, 120)
    }

    return parts.join(', ')
  }
}
