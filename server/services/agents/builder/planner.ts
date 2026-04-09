import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { createNdjsonParser } from '../../claude/ndjson-parser.js'
import { nodeEnv } from '../../node-env.js'
import type { AgentExecuteOptions } from '../base-agent.js'
import type { AgentRole } from '../types.js'
import type { BuildPlan, BuildPhase, BuildTask } from './types.js'

const PLANNING_SYSTEM_PROMPT = `You are a technical project planner. Given product requirements, you produce a structured JSON build plan that a team of AI agents will execute to build the application.

## Available Agent Roles
- product-manager: Requirements analysis, user stories, acceptance criteria
- architect: System design, module boundaries, data flow, technical decisions
- database-engineer: Data models, migrations, schema design, indexes
- backend-engineer: Django views, serializers, services, API endpoints
- frontend-engineer: React components, hooks, pages, state management
- fullstack-engineer: End-to-end features spanning both stacks
- ui-designer: Visual design, component styling, design system, accessibility
- qa-engineer: Test suites, integration tests, E2E tests
- security-engineer: Security audit, hardening, vulnerability fixes
- devops-engineer: Docker, CI/CD, deployment configuration
- technical-writer: Documentation, README, API docs
- code-reviewer: Final code review

## Rules
1. Break the project into sequential PHASES. Each phase builds on the previous.
2. Within a phase, tasks can run in PARALLEL if they don't depend on each other.
3. Early phases handle foundation (models, schema, project setup). Later phases handle features, then testing, then polish.
4. Every task prompt MUST be highly specific: name exact files to create, exact models/fields, exact endpoints, exact component names. Vague prompts produce vague code.
5. Task prompts should explicitly reference files/modules created in earlier phases so agents import and build on existing work — not duplicate it.
6. Set "verify": true on phases where correctness matters (after schema, after API, after frontend integration). Verification runs the test suite and type checker.
7. Testing and review should come after implementation phases.
8. Keep phases to 3-5 tasks max for manageability. Split large features across multiple phases.
9. For the FIRST phase, include project scaffolding if the directory is empty.

## Output Format
Respond with ONLY a JSON object (no markdown, no explanation) matching this exact structure:

{
  "name": "Project name",
  "summary": "One paragraph describing what will be built",
  "phases": [
    {
      "name": "Phase name",
      "description": "What this phase accomplishes",
      "verify": false,
      "tasks": [
        {
          "id": "unique-task-id",
          "title": "Short task title",
          "description": "What this task delivers",
          "role": "agent-role-id",
          "prompt": "Highly specific instructions. Name exact files, models, endpoints, components. Reference files from previous phases by path.",
          "dependsOn": []
        }
      ]
    }
  ]
}`

const VALID_ROLES = new Set<string>([
  'frontend-engineer', 'backend-engineer', 'fullstack-engineer',
  'devops-engineer', 'qa-engineer', 'security-engineer',
  'database-engineer', 'ui-designer', 'technical-writer',
  'code-reviewer', 'architect', 'product-manager',
])

/**
 * Generate a structured build plan from requirements by spawning Claude.
 */
export async function generatePlan(
  requirements: string,
  baseOptions: Omit<AgentExecuteOptions, 'prompt'>,
): Promise<BuildPlan> {
  const existingContext = scanProjectState(baseOptions.projectRoot)

  const prompt = [
    'Generate a build plan for the following project requirements.',
    'Respond with ONLY the JSON plan object — no markdown fences, no explanation.',
    '',
    existingContext ? `## Existing Project State\n${existingContext}\n` : '',
    '## Requirements',
    '',
    requirements,
  ].filter(Boolean).join('\n')

  const claudeBin = baseOptions.claudeBin ?? 'claude'
  const args = [
    '-p', prompt,
    '--output-format', 'stream-json',
    '--verbose',
    '--permission-mode', 'default',
    '--append-system-prompt', PLANNING_SYSTEM_PROMPT,
  ]

  const fullText = await new Promise<string>((resolve, reject) => {
    const proc = spawn(claudeBin, args, {
      cwd: baseOptions.projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: nodeEnv(baseOptions.nodePath),
    })

    let text = ''
    let stderr = ''

    const parser = createNdjsonParser((chunk: any) => {
      if (chunk.type === 'assistant') {
        for (const b of (chunk.message?.content || [])) {
          if (b.type === 'text') text += b.text
        }
      }
    })

    proc.stdout!.on('data', (d: Buffer) => parser.write(d.toString()))
    proc.stderr!.on('data', (d: Buffer) => { stderr += d.toString() })

    proc.on('close', (code, signal) => {
      parser.flush()

      if (signal) {
        if (text.trim()) {
          console.warn(`[planner] Process killed by ${signal}, using partial response`)
          resolve(text)
        } else {
          reject(new Error(`Planning killed by ${signal} before producing output`))
        }
        return
      }

      if (code !== 0 && code !== null) {
        if (text.trim()) {
          console.warn(`[planner] Exit code ${code} but has output, attempting to parse`)
          resolve(text)
        } else {
          reject(new Error(stderr.trim() || `Planning process exited with code ${code}`))
        }
      } else {
        resolve(text)
      }
    })

    proc.on('error', (err) => reject(new Error(`Planning spawn failed: ${err.message}`)))
  })

  return parsePlan(fullText)
}

/** Quick scan of what already exists in the project directory. */
function scanProjectState(projectRoot: string): string {
  const lines: string[] = []

  try {
    const entries = fs.readdirSync(projectRoot).filter((e) => !e.startsWith('.'))
    if (entries.length === 0) {
      lines.push('The project directory is empty. Plan should include scaffolding.')
      return lines.join('\n')
    }

    lines.push('Project directory already contains:')
    for (const entry of entries.slice(0, 30)) {
      const stat = fs.statSync(path.join(projectRoot, entry))
      lines.push(`  ${stat.isDirectory() ? entry + '/' : entry}`)
    }
  } catch { /* empty */ }

  for (const f of ['package.json', 'requirements.txt', 'manage.py', 'blacksmith.config.json']) {
    const filePath = path.join(projectRoot, f)
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        if (content.length < 4096) {
          lines.push(`\n### ${f}\n\`\`\`\n${content.trim()}\n\`\`\``)
        }
      } catch { /* skip */ }
    }
  }

  return lines.join('\n')
}

/** Parse and validate a raw Claude response into a BuildPlan. */
function parsePlan(raw: string): BuildPlan {
  const braceStart = raw.indexOf('{')
  const braceEnd = raw.lastIndexOf('}')

  if (braceStart === -1 || braceEnd <= braceStart) {
    throw new Error('No JSON object found in planner response')
  }

  let parsed: any
  try {
    parsed = JSON.parse(raw.slice(braceStart, braceEnd + 1))
  } catch {
    throw new Error('Failed to parse build plan JSON from planner response')
  }

  if (!parsed.phases || !Array.isArray(parsed.phases)) {
    throw new Error('Plan missing "phases" array')
  }

  let totalTasks = 0
  const allTaskIds = new Set<string>()

  const phases: BuildPhase[] = parsed.phases.map((phase: any, pi: number) => {
    if (!phase.tasks || !Array.isArray(phase.tasks)) {
      throw new Error(`Phase ${pi} missing "tasks" array`)
    }

    const tasks: BuildTask[] = phase.tasks.map((task: any, ti: number) => {
      if (!task.role || !VALID_ROLES.has(task.role)) {
        throw new Error(`Phase ${pi}, task ${ti}: invalid role "${task.role}"`)
      }
      if (!task.prompt) {
        throw new Error(`Phase ${pi}, task ${ti}: missing "prompt"`)
      }

      const id = task.id ?? `p${pi}-t${ti}`
      if (allTaskIds.has(id)) {
        throw new Error(`Duplicate task ID: "${id}"`)
      }
      allTaskIds.add(id)
      totalTasks++

      return {
        id,
        title: task.title ?? `Task ${ti + 1}`,
        description: task.description ?? '',
        role: task.role as AgentRole,
        prompt: task.prompt,
        dependsOn: Array.isArray(task.dependsOn) ? task.dependsOn : [],
      }
    })

    return {
      id: phase.id ?? `phase-${pi}`,
      name: phase.name ?? `Phase ${pi + 1}`,
      description: phase.description ?? '',
      verify: phase.verify === true,
      tasks,
    }
  })

  // Validate dependency references
  for (const phase of phases) {
    for (const task of phase.tasks) {
      task.dependsOn = task.dependsOn.filter((dep) => {
        if (!allTaskIds.has(dep)) {
          console.warn(`[planner] Task "${task.id}" references unknown dependency "${dep}", removing`)
          return false
        }
        return true
      })
    }
  }

  return {
    id: crypto.randomUUID(),
    name: parsed.name ?? 'Untitled Project',
    summary: parsed.summary ?? '',
    phases,
    totalTasks,
  }
}
