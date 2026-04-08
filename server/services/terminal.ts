import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

export interface TerminalSession {
  id: string
  process: ChildProcessWithoutNullStreams
  cwd: string
}

export class TerminalManager {
  private sessions = new Map<string, TerminalSession>()
  private outputCallbacks: Array<(id: string, data: string) => void> = []
  private exitCallbacks: Array<(id: string, code: number) => void> = []
  private idCounter = 0

  onOutput(cb: (id: string, data: string) => void) {
    this.outputCallbacks.push(cb)
  }

  onExit(cb: (id: string, code: number) => void) {
    this.exitCallbacks.push(cb)
  }

  private resolveShell(): string {
    if (process.env.SHELL && fs.existsSync(process.env.SHELL)) return process.env.SHELL
    if (os.platform() === 'win32') return 'powershell.exe'
    for (const sh of ['/bin/zsh', '/bin/bash', '/bin/sh']) {
      if (fs.existsSync(sh)) return sh
    }
    return '/bin/sh'
  }

  async spawn(cwd: string, _cols?: number, _rows?: number, nodePath?: string): Promise<string> {
    const id = `term-${++this.idCounter}`
    const shell = this.resolveShell()

    // Build clean env with configured Node on PATH
    const env: Record<string, string> = {}
    for (const [k, v] of Object.entries(process.env)) {
      if (v !== undefined) env[k] = v
    }
    if (nodePath) {
      const nodeDir = path.dirname(nodePath)
      env.PATH = `${nodeDir}${path.delimiter}${env.PATH ?? ''}`
    }
    env.TERM = 'dumb'
    env.PS1 = '\\w $ '

    const proc = spawn(shell, [], {
      cwd,
      env,
      stdio: 'pipe',
      shell: false,
    })

    // Send initial prompt
    const emitOutput = (data: string) => {
      for (const cb of this.outputCallbacks) cb(id, data)
    }

    proc.stdout.on('data', (chunk: Buffer) => emitOutput(chunk.toString()))
    proc.stderr.on('data', (chunk: Buffer) => emitOutput(chunk.toString()))

    proc.on('exit', (code) => {
      this.sessions.delete(id)
      for (const cb of this.exitCallbacks) cb(id, code ?? 0)
    })

    proc.on('error', (err) => {
      emitOutput(`\r\nError: ${err.message}\r\n`)
      this.sessions.delete(id)
      for (const cb of this.exitCallbacks) cb(id, 1)
    })

    this.sessions.set(id, { id, process: proc, cwd })
    return id
  }

  write(id: string, data: string) {
    this.sessions.get(id)?.process.stdin.write(data)
  }

  resize(_id: string, _cols: number, _rows: number) {
    // No-op without PTY
  }

  kill(id: string) {
    const session = this.sessions.get(id)
    if (session) {
      session.process.kill('SIGTERM')
      this.sessions.delete(id)
    }
  }

  killAll() {
    for (const [, session] of this.sessions) {
      session.process.kill('SIGTERM')
    }
    this.sessions.clear()
  }
}
