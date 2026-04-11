import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { createNdjsonParser } from '../../claude/ndjson-parser.js'
import { nodeEnv } from '../../node-env.js'
import type { AgentExecuteOptions } from '../base/index.js'
import type { AgentRole, AgentEvent } from '../types.js'

/* ── Task Plan Types ── */

export type TaskModel = 'fast' | 'balanced' | 'premium'

export interface DispatchTask {
  id: string
  title: string
  /** Brief description of what this task delivers */
  description: string
  role: AgentRole
  prompt: string
  /** IDs of tasks this depends on (must complete first) */
  dependsOn: string[]
  /** AI model selected by PM based on task complexity */
  model: TaskModel
}

export interface DispatchPlan {
  /** 'single' = one agent, 'multi' = ordered tasks, 'clarification' = PM needs more info */
  mode: 'single' | 'multi' | 'clarification'
  /** For single mode: the one task to execute */
  task?: DispatchTask
  /** For multi mode: ordered task list */
  tasks: DispatchTask[]
  /** Brief explanation of the plan, or the PM's question for clarification mode */
  summary: string
}

/* ── System Prompt ── */

const PM_SYSTEM_PROMPT = `You are the lead project manager for a software team. Analyze the user's request and produce an intelligent task plan. You do NOT have access to the filesystem — do NOT try to read files or run commands. Work only from the information given to you.

## Available Team (organized by department)

### Product & Strategy
The decision-maker and requirement owner. Drives priorities.
- product-manager: Requirements analysis, task breakdown, acceptance criteria, prioritization.

### Architecture & Infrastructure
Owns the technical foundation — system design, data layer, and deployment pipeline. Works first, before any code is written.
- architect: System design, module boundaries, technical decisions, ADRs.
- database-engineer: Data models, migrations, schema design, indexes, query optimization.
- devops-engineer: Docker, CI/CD, deployment, infrastructure.

### Engineering
The core builders. UI/UX feeds into Frontend, while Backend and Fullstack bridge both worlds.
- backend-engineer: Django, Python, API endpoints, serializers, views, services, middleware.
- frontend-engineer: React, TypeScript, components, hooks, pages, state management, styling. IMPLEMENTS code from UI/UX specs.
- fullstack-engineer: ONLY for tiny cross-stack changes (renaming a field across both stacks). Never for feature work.
- ui-designer: Writes DETAILED UI/UX SPECIFICATIONS only. Does NOT write code. Produces design specs that the frontend-engineer implements.

### Quality & Assurance
Acts as a gate before anything ships. Reviews correctness, security vulnerabilities, and test coverage.
- qa-engineer: Tests (unit, integration, E2E), test strategy, coverage.
- code-reviewer: Code review, quality audit.
- security-engineer: Security audit, vulnerability fixes, auth hardening, OWASP.

### Documentation
Maintains technical documentation and developer guides.
- technical-writer: Documentation, README, API docs, code comments.

## How to Think About Task Sizing

Your goal is to give each agent a task they can do EXCELLENTLY — not a task so big they rush through it, and not so small it's trivial overhead.

Ask yourself for each task: "Can the agent produce complete, production-quality code for this in one focused pass?" If the answer is "they'd have to cut corners," the task is too big — split it further.

IMPORTANT: Agents will execute your tasks exactly as given. They will NOT break tasks down further. If you give a task that's too big, the agent will produce rushed, incomplete code. YOU are solely responsible for proper task sizing.

**One task = one logical unit of work.** A model and its migration is one unit. One API endpoint with its serializer and URL wiring is one unit. One page component is one unit. One test file covering one feature is one unit.

**Adapt to complexity.** A simple "add a field to the User model" is a single task. "Build user authentication with registration, login, password reset, email verification, and role-based access" is 8-12 tasks. Don't apply the same split to both.

**The frontend always follows a UI spec.** If a feature has UI, the ui-designer writes the spec first (component inventory, states, layout, tokens, accessibility). The frontend-engineer then implements from that spec. Never skip this step.

## Artifact Handoff System

When agents complete their work, their output is automatically saved as an artifact file at .blacksmith/artifacts/{role}/{taskId}-{slug}.md. The next agent in the chain receives the file path and is instructed to READ it before starting.

**This means:**
- The ui-designer's full design specification is persisted as an artifact file.
- The frontend-engineer's prompt MUST instruct them to read the artifact: "Read the design specification artifact at the path provided by the previous task before implementing."
- The architect's design decisions are similarly persisted for downstream engineers.
- Each agent has access to the FULL, untruncated output of previous agents through these files.

**In your task prompts, explicitly tell agents to read the artifact:**
- For frontend tasks after design: "Read the design specification from the UI/UX designer's artifact. Implement the UI exactly as specified — components, states, layout, spacing, and interactions."
- For backend tasks after architecture: "Read the architecture artifact to understand the system design before implementing."
- For QA tasks: "Read the previous artifacts to understand what was built and write tests accordingly."

## Critical Rules
1. Simple requests (one role, one deliverable) → mode: "single", one task.
2. Multi-concern requests → mode: "multi", STRICT SERIAL ORDER. Every task depends on the previous.
3. Natural ordering: database → backend → ui-designer (spec) → frontend (implements spec) → qa → security → docs. Only include the layers the request actually needs.
4. Task prompts must be SPECIFIC. Name exact files, fields, endpoints, components. Reference what previous tasks created by file path.
5. The frontend-engineer's prompt MUST say "Read the design specification artifact from the previous task and implement it exactly as specified."
6. Never assign feature work to fullstack-engineer.
7. Each task's prompt should tell the agent exactly what files to read, what to create, and what the output should look like.
8. Only include QA, security, or docs tasks when the request warrants them. A simple model change doesn't need a security audit.

## Model Selection

Each task must include a "model" field. Choose the tier based on the complexity and stakes of that specific task:

- **"premium"** — For tasks that require deep reasoning, complex architecture decisions, security-critical code, or intricate multi-file changes. Use for: architect (system design), security-engineer (audits), complex backend logic, database schema design with tricky constraints.
- **"balanced"** — The default. For standard implementation work: building features, writing components, API endpoints, tests, documentation. Good balance of quality and speed.
- **"fast"** — For simple, mechanical tasks: renaming, small config changes, straightforward documentation updates, adding a single field, writing simple test cases.

**Default to "balanced"** when unsure. Only upgrade to "premium" for genuinely complex reasoning. Only downgrade to "fast" for genuinely trivial work.

## Output Format
Respond with ONLY a JSON object. No markdown fences, no explanation.

{
  "mode": "single" | "multi",
  "task": { "id": "t1", "title": "...", "description": "...", "role": "...", "prompt": "...", "dependsOn": [], "model": "balanced" },
  "tasks": [
    { "id": "t1", "title": "...", "description": "...", "role": "...", "prompt": "...", "dependsOn": [], "model": "balanced" },
    { "id": "t2", "title": "...", "description": "...", "role": "...", "prompt": "...", "dependsOn": ["t1"], "model": "fast" }
  ],
  "summary": "Brief description of the plan"
}

For "single" mode, populate "task" and set "tasks" to [].
For "multi" mode, populate "tasks" with each task depending on the previous (strict serial).`

const VALID_ROLES = new Set<string>([
  'frontend-engineer', 'backend-engineer', 'fullstack-engineer',
  'devops-engineer', 'qa-engineer', 'security-engineer',
  'database-engineer', 'ui-designer', 'technical-writer',
  'code-reviewer', 'architect', 'product-manager',
])

type EmitFn = (event: AgentEvent) => void

/**
 * Use the PM agent (via Claude) to decompose a prompt into a task plan.
 * Streams activity/message events in real-time via the emit callback.
 */
export async function dispatchWithPM(
  prompt: string,
  baseOptions: Omit<AgentExecuteOptions, 'prompt'>,
  emit?: EmitFn,
): Promise<DispatchPlan> {
  const claudeBin = baseOptions.claudeBin ?? 'claude'

  const args = [
    '-p', `Analyze this request and produce a task plan:\n\n${prompt}`,
    '--output-format', 'stream-json',
    '--verbose',
    '--tools', '',
    '--append-system-prompt', PM_SYSTEM_PROMPT,
  ]

  const fullText = await new Promise<string>((resolve, reject) => {
    const proc = spawn(claudeBin, args, {
      cwd: baseOptions.projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: nodeEnv(baseOptions.nodePath),
    })

    let text = ''
    let stderr = ''
    let firstChunkEmitted = false

    const emitPM = (type: AgentEvent['data']['type'], data: Record<string, any>) => {
      if (!emit) return
      emit({
        type: type as AgentEvent['type'],
        agentId: 'product-manager',
        executionId: '',
        timestamp: new Date().toISOString(),
        data: { type, ...data } as AgentEvent['data'],
      })
    }

    const parser = createNdjsonParser((chunk: any) => {
      if (chunk.type === 'assistant') {
        for (const b of (chunk.message?.content || [])) {
          if (b.type === 'text') {
            text += b.text

            // Emit status on first chunk
            if (!firstChunkEmitted) {
              firstChunkEmitted = true
              emitPM('status', { status: 'executing', message: 'PM is planning tasks...' })
            }

            // Stream partial text as message events
            emitPM('message', { content: b.text, isPartial: !chunk.stop_reason })
          }
        }
      } else if (chunk.type === 'result') {
        emitPM('activity', { description: `Plan complete — parsing ${text.length} chars` })
      }
    })

    proc.stdout!.on('data', (d: Buffer) => parser.write(d.toString()))
    proc.stderr!.on('data', (d: Buffer) => {
      const chunk = d.toString()
      stderr += chunk
      if (chunk.trim()) console.log(`[pm-dispatcher] stderr: ${chunk.trim()}`)
    })

    proc.on('close', (code, signal) => {
      parser.flush()

      // If killed by signal (e.g. SIGTERM), try to use whatever text we collected
      if (signal) {
        if (text.trim()) {
          console.warn(`[pm-dispatcher] Process killed by ${signal}, using partial response`)
          resolve(text)
        } else {
          reject(new Error(`PM dispatch killed by ${signal} before producing output`))
        }
        return
      }

      if (code !== 0 && code !== null) {
        // Non-zero exit but we have text — try to use it (Claude sometimes exits 1 with valid output)
        if (text.trim()) {
          console.warn(`[pm-dispatcher] Exit code ${code} but has output, attempting to parse`)
          resolve(text)
        } else {
          reject(new Error(stderr.trim() || `PM dispatch exited with code ${code}`))
        }
      } else {
        resolve(text)
      }
    })

    proc.on('error', (err) => reject(new Error(`PM dispatch spawn failed: ${err.message}`)))
  })

  if (!fullText.trim()) {
    throw new Error('PM returned empty response — Claude CLI may not have produced output')
  }

  console.log(`[pm-dispatcher] Raw response (${fullText.length} chars): ${fullText.slice(0, 500)}...`)
  return parsePlan(fullText)
}

function parsePlan(raw: string): DispatchPlan {
  const braceStart = raw.indexOf('{')
  const braceEnd = raw.lastIndexOf('}')

  // No JSON found — the PM is asking a clarification question or responding conversationally
  if (braceStart === -1 || braceEnd <= braceStart) {
    console.log(`[pm-dispatcher] No JSON in response — treating as clarification`)
    return {
      mode: 'clarification',
      tasks: [],
      summary: raw.trim(),
    }
  }

  const candidate = raw.slice(braceStart, braceEnd + 1)

  let parsed: any
  try {
    parsed = JSON.parse(candidate)
  } catch {
    // JSON-like braces found but invalid JSON — also treat as clarification
    console.log(`[pm-dispatcher] JSON parse failed — treating as clarification`)
    return {
      mode: 'clarification',
      tasks: [],
      summary: raw.trim(),
    }
  }

  const mode = parsed.mode === 'single' ? 'single' : 'multi'
  const summary = parsed.summary ?? ''

  // Generate a dispatch prefix so task IDs are globally unique across dispatches
  const prefix = crypto.randomUUID().slice(0, 8)
  const idMap = new Map<string, string>() // original PM id → globally unique id

  function validateTask(task: any, index: number): DispatchTask {
    if (!task.role || !VALID_ROLES.has(task.role)) {
      throw new Error(`Task ${index}: invalid role "${task.role}"`)
    }
    if (!task.prompt) {
      throw new Error(`Task ${index}: missing prompt`)
    }
    const originalId = task.id ?? `t${index}`
    const uniqueId = `${prefix}-${originalId}`
    idMap.set(originalId, uniqueId)

    const VALID_MODELS = new Set<TaskModel>(['fast', 'balanced', 'premium'])
    const model = VALID_MODELS.has(task.model) ? task.model : 'balanced'

    return {
      id: uniqueId,
      title: task.title ?? `Task ${index + 1}`,
      description: task.description ?? '',
      role: task.role as AgentRole,
      prompt: task.prompt,
      dependsOn: Array.isArray(task.dependsOn) ? task.dependsOn : [],
      model,
    }
  }

  if (mode === 'single' && parsed.task) {
    const task = validateTask(parsed.task, 0)
    return { mode: 'single', task, tasks: [task], summary }
  }

  const tasks = (parsed.tasks || []).map((t: any, i: number) => validateTask(t, i))

  // Remap dependency references from PM's original IDs to our globally unique IDs
  for (const task of tasks) {
    task.dependsOn = task.dependsOn
      .map((dep: string) => {
        const mapped = idMap.get(dep)
        if (!mapped) {
          console.warn(`[pm-dispatcher] Task "${task.id}" references unknown dep "${dep}", removing`)
          return null
        }
        return mapped
      })
      .filter(Boolean) as string[]
  }

  if (tasks.length === 0) {
    throw new Error('PM produced an empty task plan')
  }

  if (tasks.length === 1) {
    return { mode: 'single', task: tasks[0], tasks, summary }
  }

  return { mode: 'multi', tasks, summary }
}
