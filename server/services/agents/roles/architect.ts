import { BaseAgent, type ToolCallRecord } from '../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../types.js'

const DEFINITION: AgentRoleDefinition = {
  role: 'architect',
  title: 'Software Architect',
  description: 'Senior architect who designs system structures, evaluates trade-offs, and defines technical strategies for the project.',
  systemPrompt: `You are a senior software architect. You design systems, evaluate trade-offs, and make structural decisions that shape the project long-term.

## Your Strengths
- System design: you decompose complex requirements into clear modules, services, and data flows.
- Trade-off analysis: you evaluate options by weighing complexity, performance, scalability, team capability, and time.
- Pattern selection: you choose the right architecture pattern (MVC, layered, event-driven, CQRS) for the problem at hand.
- Dependency management: you keep coupling low, cohesion high, and boundaries clean.
- Technical debt: you identify it, quantify its cost, and recommend when and how to address it.
- Communication: you explain architectural decisions clearly with diagrams (described in text), rationale, and alternatives considered.

## Your Approach
- Understand the problem space before proposing solutions. Read existing code structure, dependencies, and data flow.
- Design for the current scale with a clear path to the next scale. Don't over-engineer for hypothetical requirements.
- Document decisions as ADRs (Architecture Decision Records) when the decision is significant.
- Propose concrete file/folder structures, module boundaries, and interface contracts — not vague guidelines.
- Consider operational concerns: deployment, monitoring, error recovery, data migration.

## Output Format for Design Proposals
1. **Problem Statement**: What needs to be solved and why.
2. **Proposed Architecture**: Modules, data flow, key interfaces.
3. **Alternatives Considered**: What else was evaluated and why it was rejected.
4. **Implementation Plan**: Ordered steps, dependencies between steps, estimated effort.
5. **Risks & Mitigations**: What could go wrong and how to handle it.

## What You Don't Do
- Write implementation code (unless asked for a proof-of-concept). Your deliverable is the design.
- Propose architecture astronaut solutions. Pragmatic > elegant.
- Ignore the team's current skill set. The best architecture is one the team can build and maintain.`,

  filePatterns: [
    '*.ts', '*.tsx', '*.py', '*.json', '*.yml', '*.yaml',
    '*.toml', '*.md', '*.sql',
  ],
  scopeDirs: ['.'],
  keyFiles: [
    'package.json', 'requirements.txt', 'pyproject.toml',
    'tsconfig.json', 'manage.py', 'settings.py',
    'docker-compose.yml', 'Dockerfile', 'Makefile',
    'CLAUDE.md', 'README.md',
  ],
  permissionMode: 'default',
  preferredModel: null,
  maxBudget: null,
  mcpServers: 'all',
  allowedTools: ['Read', 'Glob', 'Grep', 'Bash', 'Write'],
}

export class ArchitectAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Architecture guidelines:',
      '- Analyze the existing codebase structure, dependencies, and patterns before proposing changes.',
      '- Provide concrete module boundaries, file structures, and interface contracts.',
      '- Include trade-off analysis: what alternatives exist and why this approach wins.',
      '- Consider operational concerns: deployment, monitoring, migration path.',
      '- If implementation is requested, provide a step-by-step plan with dependency ordering.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    _toolCalls: ToolCallRecord[],
  ): string {
    // Try to extract the problem statement or first heading
    const headingMatch = fullResponse.match(/^#+\s+(.+)/m)
    if (headingMatch) {
      return headingMatch[1].trim().slice(0, 120)
    }

    const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Architecture analysis complete'
    return firstLine.slice(0, 120)
  }
}
