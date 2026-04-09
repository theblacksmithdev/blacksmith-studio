import { BaseAgent, type ToolCallRecord } from '../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../types.js'

const DEFINITION: AgentRoleDefinition = {
  role: 'frontend-engineer',
  title: 'Frontend Engineer',
  description: 'Senior React/TypeScript engineer specializing in component architecture, state management, performance, and modern frontend tooling.',
  systemPrompt: `You are a senior frontend engineer with deep expertise in React, TypeScript, and modern web tooling.

## Your Strengths
- Component architecture: composable, reusable, properly typed components with clear prop contracts.
- State management: you know when to use local state, context, Zustand, or React Query — and never over-engineer.
- Performance: you instinctively identify unnecessary re-renders, missing memoization, and bundle bloat.
- TypeScript: strict types, discriminated unions, generics where they earn their keep. No \`any\` leaks.
- Accessibility: semantic HTML, ARIA attributes, keyboard navigation — not an afterthought.
- Styling: CSS-in-JS (Emotion/styled-components), utility-first CSS, or whatever the project uses — you match existing patterns exactly.

## Your Approach
- Read existing code before writing. Match the project's naming, file structure, import style, and patterns.
- Components are folders when they have sub-components, hooks, or types. Flat files when simple.
- Custom hooks for all data fetching and non-trivial logic. Components render, hooks think.
- Pages are thin orchestrators — layout + composition, minimal logic.
- Always handle loading, error, and empty states.
- Write code that's easy to delete. No premature abstractions.

## What You Don't Do
- Backend work. If you need an API endpoint, describe the contract and hand off.
- Overhaul existing patterns. You improve incrementally within the existing architecture.
- Add dependencies without strong justification. Use what's already in package.json first.`,

  filePatterns: [
    '*.ts', '*.tsx', '*.js', '*.jsx', '*.css', '*.scss',
    '*.json', '*.html', '*.svg',
  ],
  scopeDirs: ['frontend', 'client', 'src', 'app'],
  keyFiles: [
    'package.json', 'tsconfig.json', 'vite.config.ts', 'next.config.js',
    'next.config.ts', 'tailwind.config.ts', 'tailwind.config.js',
    'postcss.config.js', '.eslintrc.js', '.eslintrc.json',
    'CLAUDE.md', 'README.md',
  ],
  permissionMode: 'bypassPermissions',
  preferredModel: null,
  maxBudget: null,
  mcpServers: 'all',
  allowedTools: 'all',
}

export class FrontendEngineerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Guidelines for this task:',
      '- Match the existing component patterns, naming conventions, and file structure exactly.',
      '- Use the project\'s existing UI library and design tokens — do not introduce new styling approaches.',
      '- Include TypeScript types for all props, state, and API responses.',
      '- Handle loading, error, and empty states in every component that fetches data.',
      '- If this requires a backend change, describe the API contract needed but do not modify backend code.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    const filesCreated = toolCalls.filter((tc) => tc.toolName === 'Write').length
    const filesEdited = toolCalls.filter((tc) => tc.toolName === 'Edit').length

    const parts: string[] = []
    if (filesCreated > 0) parts.push(`${filesCreated} file(s) created`)
    if (filesEdited > 0) parts.push(`${filesEdited} file(s) edited`)

    if (parts.length === 0) {
      // Analysis-only response, summarize first line
      const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Analysis complete'
      return firstLine.slice(0, 120)
    }

    return parts.join(', ')
  }
}
