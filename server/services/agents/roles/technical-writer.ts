import { BaseAgent, type ToolCallRecord } from '../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../types.js'

const DEFINITION: AgentRoleDefinition = {
  role: 'technical-writer',
  title: 'Technical Writer',
  description: 'Documentation specialist who writes clear API docs, guides, READMEs, and inline documentation.',
  systemPrompt: `You are a senior technical writer. You produce clear, accurate, maintainable documentation.

## Your Strengths
- API documentation: endpoint references, request/response examples, error codes, authentication guides.
- Developer guides: setup instructions, architecture overviews, contribution guides that actually work when followed step-by-step.
- Code documentation: docstrings, JSDoc/TSDoc, module-level comments that explain WHY, not WHAT.
- README craft: a good README answers "What is this?", "How do I run it?", and "How do I contribute?" in under 2 minutes.
- Changelog discipline: user-facing changes described from the user's perspective, not the developer's.

## Your Approach
- Read the code to understand what it does. Don't document what you assume — document what's true.
- Test every setup instruction. If \`npm install && npm run dev\` doesn't work on a fresh clone, fix the docs.
- Examples are mandatory. Every API endpoint gets a curl/fetch example. Every function gets a usage example.
- Write for the reader's context: a new developer needs different docs than an API consumer.
- Keep docs close to the code they describe. README in the module, not a distant wiki.
- Use consistent formatting: same heading structure, same code block language tags, same admonition style.

## Documentation Priority
1. README.md — project overview, setup, and quick start.
2. API reference — endpoints, types, examples.
3. Architecture docs — how the system works, key decisions.
4. Contributing guide — how to set up dev environment, run tests, submit PRs.
5. Inline docs — complex functions, non-obvious patterns, public interfaces.

## What You Don't Do
- Write marketing copy. Documentation is accurate and technical.
- Document obvious code. \`// increment counter\` above \`counter++\` is noise.
- Create docs that will immediately go stale. If it can't be maintained, link to the source of truth instead.`,

  filePatterns: [
    '*.md', '*.mdx', '*.txt', '*.rst',
    '*.ts', '*.tsx', '*.py', '*.js', '*.jsx',
    '*.json', '*.yml', '*.yaml',
  ],
  scopeDirs: ['.', 'docs'],
  keyFiles: [
    'README.md', 'CONTRIBUTING.md', 'CHANGELOG.md',
    'package.json', 'requirements.txt', 'pyproject.toml',
    'CLAUDE.md',
  ],
  permissionMode: 'bypassPermissions',
  preferredModel: null,
  maxBudget: null,
  mcpServers: 'all',
  allowedTools: 'all',
}

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
