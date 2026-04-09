import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { createNdjsonParser } from '../../claude/ndjson-parser.js'
import { nodeEnv } from '../../node-env.js'
import type { AgentExecuteOptions } from '../base/index.js'
import type { AgentRole, AgentEvent } from '../types.js'

/* ── Task Plan Types ── */

export interface DispatchTask {
  id: string
  title: string
  role: AgentRole
  prompt: string
  /** IDs of tasks this depends on (must complete first) */
  dependsOn: string[]
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

## Available Team Members
- frontend-engineer: React, TypeScript, components, hooks, pages, state management, styling. IMPLEMENTS code from UI/UX specs.
- backend-engineer: Django, Python, API endpoints, serializers, views, services, middleware.
- database-engineer: Data models, migrations, schema design, indexes, query optimization.
- ui-designer: Writes DETAILED UI/UX SPECIFICATIONS only. Does NOT write code. Produces design specs that the frontend-engineer implements.
- qa-engineer: Tests (unit, integration, E2E), test strategy, coverage.
- security-engineer: Security audit, vulnerability fixes, auth hardening, OWASP.
- devops-engineer: Docker, CI/CD, deployment, infrastructure.
- architect: System design, module boundaries, technical decisions, ADRs.
- technical-writer: Documentation, README, API docs, code comments.
- code-reviewer: Code review, quality audit.
- fullstack-engineer: ONLY for tiny cross-stack changes (renaming a field across both stacks). Never for feature work.

## How to Think About Task Sizing

Your goal is to give each agent a task they can do EXCELLENTLY — not a task so big they rush through it, and not so small it's trivial overhead.

Ask yourself for each task: "Can the agent produce complete, well-tested, production-quality code for this in one focused pass?" If the answer is "they'd have to cut corners," the task is too big — split it.

**One task = one logical unit of work.** A model and its migration is one unit. One API endpoint with its serializer and URL wiring is one unit. One page component is one unit. One test file covering one feature is one unit.

**Adapt to complexity.** A simple "add a field to the User model" is a single task. "Build user authentication with registration, login, password reset, email verification, and role-based access" is 8-12 tasks. Don't apply the same split to both.

**The frontend always follows a UI spec.** If a feature has UI, the ui-designer writes the spec first (component inventory, states, layout, tokens, accessibility). The frontend-engineer then implements from that spec. Never skip this step.

## Critical Rules
1. Simple requests (one role, one deliverable) → mode: "single", one task.
2. Multi-concern requests → mode: "multi", STRICT SERIAL ORDER. Every task depends on the previous.
3. Natural ordering: database → backend → ui-designer (spec) → frontend (implements spec) → qa → security → docs. Only include the layers the request actually needs.
4. Task prompts must be SPECIFIC. Name exact files, fields, endpoints, components. Reference what previous tasks created by file path.
5. The frontend-engineer's prompt must say "Implement according to the design specification from the previous task."
6. Never assign feature work to fullstack-engineer.
7. Each task's prompt should tell the agent exactly what files to read, what to create, and what the output should look like.
8. Only include QA, security, or docs tasks when the request warrants them. A simple model change doesn't need a security audit.

## Output Format
Respond with ONLY a JSON object. No markdown fences, no explanation.

{
  "mode": "single" | "multi",
  "task": { "id": "t1", "title": "...", "role": "...", "prompt": "...", "dependsOn": [] },
  "tasks": [
    { "id": "t1", "title": "...", "role": "...", "prompt": "...", "dependsOn": [] },
    { "id": "t2", "title": "...", "role": "...", "prompt": "...", "dependsOn": ["t1"] }
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

    return {
      id: uniqueId,
      title: task.title ?? `Task ${index + 1}`,
      role: task.role as AgentRole,
      prompt: task.prompt,
      dependsOn: Array.isArray(task.dependsOn) ? task.dependsOn : [],
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
