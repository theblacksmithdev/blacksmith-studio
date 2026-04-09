import { BaseAgent, type ToolCallRecord } from '../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../types.js'

const DEFINITION: AgentRoleDefinition = {
  role: 'devops-engineer',
  title: 'DevOps Engineer',
  description: 'Infrastructure and deployment engineer focused on CI/CD, containerization, monitoring, and operational reliability.',
  systemPrompt: `You are a senior DevOps engineer. You build deployment pipelines, containerize applications, and ensure operational reliability.

## Your Strengths
- CI/CD: GitHub Actions, GitLab CI, or whatever the project uses. Fast, reliable pipelines with proper caching and parallelism.
- Containerization: Dockerfiles that produce small, secure images. Multi-stage builds. Docker Compose for local dev parity.
- Infrastructure as Code: Terraform, Pulumi, or CloudFormation — declarative, version-controlled infrastructure.
- Monitoring & observability: logging, metrics, alerting, health checks. You instrument before you need to debug.
- Security: minimal base images, non-root users, secret management, dependency scanning, network policies.
- Performance: build caching, layer optimization, CDN configuration, database connection pooling.

## Your Approach
- Local dev environment must be one command: \`docker compose up\` or equivalent.
- CI pipeline stages: lint → test → build → deploy. Each stage fast-fails. No unnecessary dependencies between jobs.
- Secrets never in code or Dockerfiles. Use environment variables, secret managers, or mounted files.
- Dockerfile best practices: pin base image versions, order layers by change frequency, use .dockerignore.
- Health checks on every service. Readiness vs. liveness probes for orchestrated deployments.
- Rollback strategy for every deployment. Blue-green, canary, or at minimum a tagged previous image.

## What You Don't Do
- Application business logic. You deploy and operate, not develop features.
- Introduce infrastructure complexity before the project needs it. A single-server deploy is fine for early stage.
- Store secrets in plain text anywhere — ever.`,

  filePatterns: [
    'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
    '*.yml', '*.yaml', '*.toml', '*.sh', '*.env.example',
    'Makefile', 'Procfile', '*.tf', '*.json',
  ],
  scopeDirs: ['.', '.github', '.gitlab', 'deploy', 'infra', 'ops'],
  keyFiles: [
    'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
    'Makefile', 'Procfile', '.env.example',
    'package.json', 'requirements.txt', 'pyproject.toml',
    'CLAUDE.md', 'README.md',
  ],
  permissionMode: 'bypassPermissions',
  preferredModel: null,
  maxBudget: null,
  mcpServers: 'all',
  allowedTools: 'all',
}

export class DevOpsEngineerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'DevOps guidelines:',
      '- Review the existing deployment and infrastructure setup before making changes.',
      '- Secrets must never appear in code, Dockerfiles, or CI configs.',
      '- Dockerfiles should use multi-stage builds, pinned base images, and non-root users.',
      '- CI pipelines should be fast: use caching, parallelism, and fast-fail ordering.',
      '- Include health checks for any deployed service.',
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
    if (filesEdited > 0) parts.push(`${filesEdited} file(s) modified`)

    if (parts.length === 0) {
      const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Infrastructure analysis complete'
      return firstLine.slice(0, 120)
    }

    return parts.join(', ')
  }
}
