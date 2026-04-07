import { execSync } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import { checkClaudeInstalled } from './check-installed.js'
import { spawnClaudePrompt } from './spawn-prompt.js'
import type { ClaudeInstallStatus, ChunkCallback } from './types.js'

export type { ClaudeInstallStatus, ChunkCallback } from './types.js'

export interface SendPromptOptions {
  sessionId: string
  prompt: string
  isResume?: boolean
  projectContext?: string
  projectRoot: string
  model?: string
  maxBudget?: number | null
  permissionMode?: string
  customInstructions?: string
}

export class ClaudeManager {
  private processes = new Map<string, ChildProcess>()
  private claudePath: string | null = null

  /** Resolve and cache the absolute path to the claude binary. */
  private resolveClaudePath(): string {
    if (this.claudePath) return this.claudePath

    try {
      // Use shell to resolve, picking up nvm/PATH correctly
      this.claudePath = execSync('bash -ilc "which claude"', {
        encoding: 'utf-8', timeout: 5000,
      }).trim()
    } catch {
      this.claudePath = 'claude' // fallback to PATH lookup
    }

    return this.claudePath
  }

  async checkInstalled(cwd?: string): Promise<ClaudeInstallStatus> {
    return checkClaudeInstalled(cwd || process.cwd())
  }

  async sendPrompt(
    options: SendPromptOptions,
    onChunk: ChunkCallback,
  ): Promise<void> {
    const claudeBin = this.resolveClaudePath()
    const { promise, process } = spawnClaudePrompt(
      options,
      onChunk,
      claudeBin,
    )

    this.processes.set(options.sessionId, process)

    try {
      await promise
    } finally {
      this.processes.delete(options.sessionId)
    }
  }

  cancelPrompt(sessionId: string): void {
    const proc = this.processes.get(sessionId)
    if (proc) {
      console.log(`[claude] Killing process for session ${sessionId}`)
      proc.kill('SIGTERM')
      this.processes.delete(sessionId)
    }
  }
}
