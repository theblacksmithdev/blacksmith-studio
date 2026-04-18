import * as pty from "node-pty";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { platform } from "./platform/index.js";

interface TerminalSession {
  id: string;
  pty: pty.IPty;
  cwd: string;
}

export class TerminalManager {
  private sessions = new Map<string, TerminalSession>();
  private outputCallbacks: Array<(id: string, data: string) => void> = [];
  private exitCallbacks: Array<(id: string, code: number) => void> = [];
  private idCounter = 0;

  onOutput(cb: (id: string, data: string) => void) {
    this.outputCallbacks.push(cb);
  }

  onExit(cb: (id: string, code: number) => void) {
    this.exitCallbacks.push(cb);
  }

  private resolveShell(): string {
    if (process.env.SHELL && fs.existsSync(process.env.SHELL))
      return process.env.SHELL;
    if (platform.isWindows) return "powershell.exe";
    for (const sh of ["/bin/zsh", "/bin/bash", "/bin/sh"]) {
      if (fs.existsSync(sh)) return sh;
    }
    return "/bin/sh";
  }

  async spawn(
    cwd: string,
    cols?: number,
    rows?: number,
    nodePath?: string,
  ): Promise<string> {
    const id = `term-${++this.idCounter}`;
    const shell = this.resolveShell();

    // Build clean env with configured Node on PATH
    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(process.env)) {
      if (v !== undefined) env[k] = v;
    }
    if (nodePath) {
      const nodeDir = path.dirname(nodePath);
      env.PATH = `${nodeDir}${path.delimiter}${env.PATH ?? ""}`;
    }
    env.TERM = "xterm-256color";

    const terminal = pty.spawn(shell, [], {
      name: "xterm-256color",
      cols: cols ?? 80,
      rows: rows ?? 24,
      cwd,
      env,
    });

    terminal.onData((data) => {
      for (const cb of this.outputCallbacks) cb(id, data);
    });

    terminal.onExit(({ exitCode }) => {
      this.sessions.delete(id);
      for (const cb of this.exitCallbacks) cb(id, exitCode);
    });

    this.sessions.set(id, { id, pty: terminal, cwd });
    return id;
  }

  write(id: string, data: string) {
    this.sessions.get(id)?.pty.write(data);
  }

  resize(id: string, cols: number, rows: number) {
    const session = this.sessions.get(id);
    if (session) {
      session.pty.resize(cols, rows);
    }
  }

  kill(id: string) {
    const session = this.sessions.get(id);
    if (session) {
      session.pty.kill();
      this.sessions.delete(id);
    }
  }

  killAll() {
    for (const [, session] of this.sessions) {
      session.pty.kill();
    }
    this.sessions.clear();
  }
}
