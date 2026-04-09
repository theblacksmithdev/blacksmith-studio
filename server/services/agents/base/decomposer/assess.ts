import { spawn } from 'node:child_process'
import { createNdjsonParser } from '../../../claude/ndjson-parser.js'
import { nodeEnv } from '../../../node-env.js'
import type { AgentRoleDefinition } from '../../types.js'
import type { AgentExecuteOptions } from '../types.js'
import { DECOMPOSER_PROMPT } from './prompt.js'

export interface SubTask {
  id: string
  title: string
  /** Brief description of what this sub-task delivers */
  description: string
  prompt: string
}

export interface ComplexityAssessment {
  simple: boolean
  subtasks: SubTask[]
}

/** Minimum prompt length to even consider assessment (short prompts are always simple) */
const MIN_PROMPT_LENGTH = 300

/**
 * Assess whether a task is too complex for one pass and optionally decompose it.
 * Returns immediately with { simple: true } for short/simple prompts.
 * Only runs the Claude assessment for longer, potentially complex prompts.
 */
export async function assessComplexity(
  prompt: string,
  definition: AgentRoleDefinition,
  options: AgentExecuteOptions,
): Promise<ComplexityAssessment> {
  // Short prompts are always simple — skip the assessment
  if (prompt.length < MIN_PROMPT_LENGTH) {
    return { simple: true, subtasks: [] }
  }

  // Quick heuristic: if the prompt doesn't contain complexity signals, skip
  const complexitySignals = [' and ', ' then ', ' also ', ' plus ', ' with ', '\n-', '\n*', '\n1.', '\n2.']
  const signalCount = complexitySignals.filter((s) => prompt.toLowerCase().includes(s)).length
  if (signalCount < 2) {
    return { simple: true, subtasks: [] }
  }

  // Run Claude assessment (no tools, single turn)
  const claudeBin = options.claudeBin ?? 'claude'
  const assessPrompt = `You are a ${definition.title}.\n\nAssess this task:\n${prompt}`

  const args = [
    '-p', assessPrompt,
    '--output-format', 'stream-json',
    '--verbose',
    '--tools', '',
    '--append-system-prompt', DECOMPOSER_PROMPT,
  ]

  try {
    const fullText = await new Promise<string>((resolve) => {
      const proc = spawn(claudeBin, args, {
        cwd: options.projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: nodeEnv(options.nodePath),
      })

      let text = ''
      const parser = createNdjsonParser((chunk: any) => {
        if (chunk.type === 'assistant') {
          for (const b of (chunk.message?.content || [])) {
            if (b.type === 'text') text += b.text
          }
        }
      })

      proc.stdout!.on('data', (d: Buffer) => parser.write(d.toString()))
      proc.stderr!.on('data', () => {})

      proc.on('close', () => {
        parser.flush()
        resolve(text)
      })

      proc.on('error', () => resolve(''))

      // Safety timeout — assessment shouldn't take more than 30s
      setTimeout(() => { try { proc.kill() } catch {} }, 30_000)
    })

    return parseAssessment(fullText)
  } catch {
    // If assessment fails, treat as simple (don't block execution)
    return { simple: true, subtasks: [] }
  }
}

function parseAssessment(raw: string): ComplexityAssessment {
  const braceStart = raw.indexOf('{')
  const braceEnd = raw.lastIndexOf('}')

  if (braceStart === -1 || braceEnd <= braceStart) {
    return { simple: true, subtasks: [] }
  }

  try {
    const parsed = JSON.parse(raw.slice(braceStart, braceEnd + 1))

    if (parsed.simple === true || !Array.isArray(parsed.subtasks) || parsed.subtasks.length === 0) {
      return { simple: true, subtasks: [] }
    }

    const subtasks: SubTask[] = parsed.subtasks
      .filter((s: any) => s.prompt && typeof s.prompt === 'string')
      .map((s: any, i: number) => ({
        id: s.id ?? `s${i + 1}`,
        title: s.title ?? `Sub-task ${i + 1}`,
        description: s.description ?? '',
        prompt: s.prompt,
      }))

    if (subtasks.length <= 1) {
      return { simple: true, subtasks: [] }
    }

    return { simple: false, subtasks }
  } catch {
    return { simple: true, subtasks: [] }
  }
}
