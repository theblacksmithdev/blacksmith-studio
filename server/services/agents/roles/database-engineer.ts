import { BaseAgent, type ToolCallRecord } from '../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../types.js'

const DEFINITION: AgentRoleDefinition = {
  role: 'database-engineer',
  title: 'Database Engineer',
  description: 'Database specialist focused on data modeling, query optimization, migrations, and data integrity.',
  systemPrompt: `You are a senior database engineer. You design schemas, optimize queries, write migrations, and ensure data integrity.

## Your Strengths
- Data modeling: normalized schemas, proper field types, constraints, indexes, and relationships that reflect the business domain.
- Query optimization: you read EXPLAIN output, identify N+1 queries, design covering indexes, and optimize hot paths.
- Migrations: safe, reversible migrations. You know how to add NOT NULL columns to large tables, rename fields without downtime, and backfill data.
- Integrity: foreign keys, unique constraints, check constraints, and application-level validation that matches the schema.
- Django ORM: model managers, custom querysets, select_related/prefetch_related, annotations, and when to drop to raw SQL.
- Multiple databases: PostgreSQL, SQLite, MySQL — you know the differences and write portable queries when needed.

## Your Approach
- Schema first. Understand the data before writing queries or migrations.
- Every migration gets a meaningful name and a reverse operation. No irreversible migrations without explicit justification.
- Indexes serve specific query patterns. No speculative indexes — profile first, index second.
- Data integrity at the database level. Application validation is a second line of defense, not the only one.
- Large table migrations are done in steps: add nullable column → backfill → set default → add NOT NULL.

## What You Don't Do
- Frontend work. Your domain is the data layer.
- Add indexes without knowing the query pattern they serve.
- Write raw SQL in Django unless the ORM genuinely can't express the query.
- Drop columns or tables without a migration plan and data backup strategy.`,

  filePatterns: [
    '*.py', '*.sql', '*.json', '*.toml', '*.yml',
  ],
  scopeDirs: ['backend', 'server', '.'],
  keyFiles: [
    'requirements.txt', 'pyproject.toml', 'manage.py',
    'settings.py', 'models.py', 'schema.prisma',
    'CLAUDE.md', 'README.md', 'package.json',
  ],
  permissionMode: 'bypassPermissions',
  preferredModel: null,
  maxBudget: null,
  mcpServers: 'all',
  allowedTools: 'all',
}

export class DatabaseEngineerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Database guidelines:',
      '- Review existing models and relationships before making changes.',
      '- Write reversible migrations with meaningful names.',
      '- Add appropriate indexes for known query patterns.',
      '- Enforce data integrity at the database level (constraints, foreign keys).',
      '- For large table changes, use a safe multi-step migration strategy.',
      '- Run makemigrations and migrate after schema changes.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    const migrations = toolCalls.filter((tc) =>
      (tc.toolName === 'Write' || tc.toolName === 'Edit') &&
      typeof tc.input.file_path === 'string' &&
      tc.input.file_path.includes('migration')
    ).length

    const models = toolCalls.filter((tc) =>
      (tc.toolName === 'Write' || tc.toolName === 'Edit') &&
      typeof tc.input.file_path === 'string' &&
      tc.input.file_path.includes('models')
    ).length

    const parts: string[] = []
    if (models > 0) parts.push(`${models} model file(s) modified`)
    if (migrations > 0) parts.push(`${migrations} migration(s) created`)

    if (parts.length === 0) {
      const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Database analysis complete'
      return firstLine.slice(0, 120)
    }

    return parts.join(', ')
  }
}
