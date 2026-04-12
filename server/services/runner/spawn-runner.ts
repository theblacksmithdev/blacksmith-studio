import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'
import { findAvailablePort } from './port-utils.js'
import { nodeEnv } from '../node-env.js'
import type { RunnerConfig } from './runner-config.js'

export interface SpawnResult {
  process: ChildProcess
  port: number | null
  resolvedPreviewUrl: string | null
}

export type OutputCallback = (configId: string, line: string) => void
export type StatusCallback = (configId: string, status: 'starting' | 'running' | 'stopped', port: number | null) => void

/**
 * Generic runner spawner — works with any RunnerConfig.
 * Resolves port, substitutes {port} in command/args/previewUrl, spawns the process.
 */
export async function spawnRunner(
  config: RunnerConfig,
  projectRoot: string,
  onOutput: OutputCallback,
  onStatus: StatusCallback,
  nodePath?: string,
): Promise<SpawnResult> {
  // Resolve port
  let port: number | null = null
  if (config.port) {
    port = await findAvailablePort(config.port)
  }

  // Substitute {port} in command
  const sub = (str: string) => port != null ? str.replace(/\{port\}/g, String(port)) : str

  const fullCommand = sub(config.command)
  const cwd = path.resolve(projectRoot, config.cwd ?? '.')

  // Build env
  const envOverrides: Record<string, string> = { ...config.env }
  const env = nodeEnv(nodePath, envOverrides)

  // Parse command into executable + args (shell mode)
  const proc = spawn(fullCommand, {
    cwd,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
  } as any)

  // Ready pattern detection
  const readyRegex = config.readyPattern ? new RegExp(config.readyPattern, 'i') : null
  let isReady = false

  const handleLine = (line: string) => {
    if (!line.trim()) return
    onOutput(config.id, line)

    if (!isReady) {
      if (readyRegex ? readyRegex.test(line) : true) {
        isReady = true
        onStatus(config.id, 'running', port)
      }
    }
  }

  // Stream stdout/stderr
  let stdoutBuf = ''
  proc.stdout?.on('data', (chunk: Buffer) => {
    stdoutBuf += chunk.toString()
    const lines = stdoutBuf.split('\n')
    stdoutBuf = lines.pop() ?? ''
    lines.forEach(handleLine)
  })

  let stderrBuf = ''
  proc.stderr?.on('data', (chunk: Buffer) => {
    stderrBuf += chunk.toString()
    const lines = stderrBuf.split('\n')
    stderrBuf = lines.pop() ?? ''
    lines.forEach(handleLine)
  })

  proc.on('close', (code) => {
    // Flush remaining buffers
    if (stdoutBuf.trim()) handleLine(stdoutBuf)
    if (stderrBuf.trim()) handleLine(stderrBuf)
    onOutput(config.id, `[studio] Process exited (code ${code ?? 'null'})`)
    onStatus(config.id, 'stopped', null)
  })

  proc.on('error', (err) => {
    onOutput(config.id, `[studio] Failed to start: ${err.message}`)
    onStatus(config.id, 'stopped', null)
  })

  // Emit starting status
  onStatus(config.id, 'starting', port)
  onOutput(config.id, `[studio] Starting ${config.name}${port ? ` on port ${port}` : ''}...`)

  // Resolve preview URL
  const resolvedPreviewUrl = config.previewUrl ? sub(config.previewUrl) : null

  return { process: proc, port, resolvedPreviewUrl }
}
