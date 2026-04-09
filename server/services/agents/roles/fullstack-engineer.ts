import { BaseAgent, type ToolCallRecord } from '../base-agent.js'
import type { AgentRoleDefinition, AgentExecution } from '../types.js'

const DEFINITION: AgentRoleDefinition = {
  role: 'fullstack-engineer',
  title: 'Fullstack Engineer',
  description: 'Senior fullstack engineer who works across the entire Django + React stack, coordinating frontend and backend changes together.',
  systemPrompt: `You are a senior fullstack engineer equally proficient in Django/Python and React/TypeScript.

## Your Strengths
- End-to-end feature delivery: you implement the API, the data layer, and the UI in one coherent pass.
- API contract design: you define the contract from both sides — what the backend exposes and what the frontend consumes.
- Data flow: you understand the full path from database → serializer → API → fetch → state → render.
- Consistency: when you add a backend field, you update the serializer, the API response type, and the frontend type in one go.
- Integration: you wire up React Query hooks to Django endpoints with proper loading/error/empty states.

## Your Approach
- Start from the data model and work outward: model → serializer → view → API client → hook → component.
- Match existing patterns on both sides of the stack. Don't introduce new patterns without justification.
- Keep the boundary clean: Django serves JSON, React renders UI. No template rendering, no frontend business logic.
- TypeScript types on the frontend must mirror the serializer output. If one changes, both change.
- Write the migration, the API, and the UI integration in one task — not as separate disconnected pieces.

## What You Don't Do
- Introduce new frameworks or libraries on either side without strong justification.
- Build the backend and frontend in isolation. They're one feature, implemented together.
- Skip error handling on either side. Backend returns proper status codes, frontend handles them.`,

  filePatterns: [
    '*.ts', '*.tsx', '*.js', '*.jsx', '*.py', '*.css', '*.scss',
    '*.json', '*.html', '*.sql', '*.yml',
  ],
  scopeDirs: ['frontend', 'backend', 'client', 'server', 'src', 'api', '.'],
  keyFiles: [
    'package.json', 'tsconfig.json', 'vite.config.ts',
    'requirements.txt', 'pyproject.toml', 'manage.py',
    'settings.py', 'urls.py',
    'CLAUDE.md', 'README.md',
  ],
  permissionMode: 'bypassPermissions',
  preferredModel: null,
  maxBudget: null,
  mcpServers: 'all',
  allowedTools: 'all',
}

export class FullstackEngineerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Guidelines for this task:',
      '- Implement both backend and frontend changes together as one cohesive feature.',
      '- Start from the data model, then API, then frontend integration.',
      '- Ensure TypeScript types match Django serializer output exactly.',
      '- Include loading, error, and empty states on the frontend.',
      '- Add or update tests on the backend for any new logic.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    const filesCreated = toolCalls.filter((tc) => tc.toolName === 'Write').length
    const filesEdited = toolCalls.filter((tc) => tc.toolName === 'Edit').length

    // Categorize by likely stack side
    const pyFiles = toolCalls.filter((tc) =>
      (tc.toolName === 'Write' || tc.toolName === 'Edit') &&
      typeof tc.input.file_path === 'string' && tc.input.file_path.endsWith('.py')
    ).length
    const tsFiles = toolCalls.filter((tc) =>
      (tc.toolName === 'Write' || tc.toolName === 'Edit') &&
      typeof tc.input.file_path === 'string' && (tc.input.file_path.endsWith('.ts') || tc.input.file_path.endsWith('.tsx'))
    ).length

    const parts: string[] = []
    if (filesCreated + filesEdited > 0) {
      parts.push(`${filesCreated + filesEdited} file(s) touched`)
      if (pyFiles > 0 && tsFiles > 0) parts.push(`(${pyFiles} backend, ${tsFiles} frontend)`)
    }

    if (parts.length === 0) {
      const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Analysis complete'
      return firstLine.slice(0, 120)
    }

    return parts.join(' ')
  }
}
