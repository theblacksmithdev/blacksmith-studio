---
name: backend
description: Backend architecture patterns for Electron main process and server services
---

# Backend Architecture Guide

When building backend code for Blacksmith Studio, follow these OOP patterns and conventions.

## Architecture Overview

```
electron/
  main.ts              — App lifecycle, window management, service instantiation
  preload.ts           — Context bridge (renderer ↔ main IPC)
  ipc/
    channels.ts        — Channel constants + allowlists
    index.ts           — IPC setup registry (wires handlers to services)
    {domain}.ts        — IPC handlers per domain

server/
  services/
    {domain}.ts        — Service class (business logic)
    {domain}/
      index.ts         — Service class (complex domains)
      types.ts         — Domain types
      {concern}.ts     — Sub-concerns (spawn, config, etc.)
  db/
    index.ts           — Database connection (singleton)
    schema.ts          — Drizzle ORM schema
```

## Service Class Pattern

Every domain has a **service class** that owns all business logic. Services are stateless singletons instantiated once in `main.ts` and passed to IPC handlers via dependency injection.

```typescript
// server/services/example.ts
import fs from 'node:fs'
import path from 'node:path'

export class ExampleManager {
  // Private state (in-memory caches, process maps, etc.)
  private cache = new Map<string, Data>()

  // Constructor — minimal, no async work
  constructor() {}

  // Public read methods — synchronous when possible
  getAll(projectRoot: string): Item[] {
    return this.readFromDisk(projectRoot)
  }

  get(projectRoot: string, id: string): Item | null {
    return this.getAll(projectRoot).find(i => i.id === id) ?? null
  }

  // Public write methods — validate first, then persist
  add(projectRoot: string, name: string, data: ItemData): void {
    this.validate(name, data)
    const items = this.readFromDisk(projectRoot)
    if (items.find(i => i.name === name)) {
      throw new Error(`Item "${name}" already exists`)
    }
    items.push({ name, ...data })
    this.writeToDisk(projectRoot, items)
  }

  update(projectRoot: string, name: string, data: ItemData): void {
    const items = this.readFromDisk(projectRoot)
    const index = items.findIndex(i => i.name === name)
    if (index === -1) throw new Error(`Item "${name}" not found`)
    items[index] = { ...items[index], ...data }
    this.writeToDisk(projectRoot, items)
  }

  remove(projectRoot: string, name: string): void {
    const items = this.readFromDisk(projectRoot)
    const filtered = items.filter(i => i.name !== name)
    this.writeToDisk(projectRoot, filtered)
  }

  // Async methods for I/O-heavy operations
  async test(projectRoot: string, name: string): Promise<TestResult> {
    // Spawn subprocess, fetch URL, etc.
  }

  // Private helpers — file I/O, validation, parsing
  private readFromDisk(projectRoot: string): Item[] { ... }
  private writeToDisk(projectRoot: string, items: Item[]): void { ... }
  private validate(name: string, data: ItemData): void { ... }
}
```

### Key principles:

- **Constructor does no work** — no async, no I/O, no validation
- **Methods take `projectRoot`** — services are project-agnostic, the active project is resolved by IPC handlers
- **Throw errors for validation** — IPC handlers catch and forward to renderer
- **Sync I/O for simple reads/writes** — `fs.readFileSync`/`writeFileSync` (Electron main process is single-user, no concurrency concerns)
- **Async for subprocess/network** — `spawn`, `fetch`, anything that blocks

## Existing Service Classes

| Class | File | Responsibility |
|-------|------|----------------|
| `ProjectManager` | `server/services/projects.ts` | CRUD projects, SQLite persistence |
| `SessionManager` | `server/services/sessions.ts` | Chat sessions, message persistence |
| `SettingsManager` | `server/services/settings.ts` | Key-value settings per project |
| `ClaudeManager` | `server/services/claude/index.ts` | Spawn Claude CLI, stream responses |
| `RunnerManager` | `server/services/runner/index.ts` | Spawn dev servers, manage processes |
| `McpManager` | `server/services/mcp.ts` | Read/write .mcp.json, test connections |

## IPC Handler Pattern

IPC handlers are thin wrappers that:
1. Validate the request
2. Resolve the active project
3. Delegate to the service class
4. Return the result (or stream events)

```typescript
// electron/ipc/example.ts
import { ipcMain } from 'electron'
import type { ExampleManager } from '../../server/services/example.js'
import type { ProjectManager } from '../../server/services/projects.js'
import { EXAMPLE_LIST, EXAMPLE_ADD, EXAMPLE_REMOVE } from './channels.js'

// Helper: fail fast if no active project
function requireProject(pm: ProjectManager): { id: string; path: string } {
  const project = pm.getActive()
  if (!project) throw new Error('No active project')
  return { id: project.id, path: project.path }
}

export function setupExampleIPC(
  exampleManager: ExampleManager,
  projectManager: ProjectManager,
) {
  // Simple query — synchronous service call
  ipcMain.handle(EXAMPLE_LIST, () => {
    const { path } = requireProject(projectManager)
    return exampleManager.getAll(path)
  })

  // Mutation — validate input, delegate to service
  ipcMain.handle(EXAMPLE_ADD, (_e, data: { name: string; value: string }) => {
    const { path } = requireProject(projectManager)
    exampleManager.add(path, data.name, { value: data.value })
  })

  // Async operation — await the result
  ipcMain.handle(EXAMPLE_TEST, async (_e, data: { name: string }) => {
    const { path } = requireProject(projectManager)
    return exampleManager.test(path, data.name)
  })
}
```

### Rules:

- **One setup function per domain** — `setupExampleIPC()`
- **Handlers never contain business logic** — only routing and project resolution
- **Services are injected** — never imported directly in handlers (enables testing)
- **Error handling is automatic** — `ipcMain.handle` catches thrown errors and rejects the promise on the renderer side

## Streaming / Push Events Pattern

For long-running operations (project creation, Claude prompts, server logs):

```typescript
// Fire-and-forget: return immediately, stream events
ipcMain.handle(LONG_OPERATION, (_e, data) => {
  const win = getWindow()

  const proc = spawn('command', args, { stdio: ['pipe', 'pipe', 'pipe'] })

  proc.stdout.on('data', (chunk: Buffer) => {
    win?.webContents.send(ON_OUTPUT, { line: chunk.toString() })
  })

  proc.on('close', (code) => {
    if (code === 0) {
      win?.webContents.send(ON_DONE, { result })
    } else {
      win?.webContents.send(ON_ERROR, { error: `Exit code ${code}` })
    }
  })

  return { started: true }  // Return immediately
})
```

### Rules:

- **Capture stderr** — accumulate lines, include last 10 in error message
- **Use `shell: true`** for commands that need PATH resolution (npm, npx, claude)
- **Set `FORCE_COLOR: '0'`** in env to disable ANSI colors in captured output
- **Set `CI: '1'`** in env to disable interactive prompts
- **Kill on close** — clean up spawned processes in `app.on('before-quit')`

## Process Management Pattern

For services that manage long-running child processes (runner, Claude):

```typescript
export class ProcessManager {
  private processes = new Map<string, ChildProcess>()
  private outputListeners: ((source: string, line: string) => void)[] = []
  private statusListeners: (() => void)[] = []

  // Start a process
  async start(name: string, command: string, args: string[]): Promise<void> {
    if (this.processes.has(name)) return  // Already running

    const proc = spawn(command, args, { ... })
    this.processes.set(name, proc)
    this.emitStatus()

    proc.stdout.on('data', (chunk) => {
      this.emitOutput(name, chunk.toString())
    })

    proc.on('close', () => {
      this.processes.delete(name)
      this.emitStatus()
    })
  }

  // Stop a process gracefully
  stop(name: string): void {
    const proc = this.processes.get(name)
    if (proc) {
      proc.kill('SIGTERM')
      // processes.delete happens in 'close' handler
    }
  }

  // Stop all
  stopAll(): void {
    for (const name of this.processes.keys()) {
      this.stop(name)
    }
  }

  // Event registration
  onOutput(cb: (source: string, line: string) => void): void {
    this.outputListeners.push(cb)
  }

  onStatusChange(cb: () => void): void {
    this.statusListeners.push(cb)
  }

  // Status query
  getStatus(): Record<string, ProcessStatus> { ... }

  private emitOutput(source: string, text: string): void {
    for (const line of text.split('\n').filter(Boolean)) {
      this.outputListeners.forEach(cb => cb(source, line))
    }
  }

  private emitStatus(): void {
    this.statusListeners.forEach(cb => cb())
  }
}
```

## Database Pattern

Uses Drizzle ORM with better-sqlite3 (synchronous).

```typescript
// Schema definition
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  name: text('name').notNull(),
  value: text('value').notNull(),
  createdAt: text('created_at').notNull(),
})

// Usage in service
import { eq, and } from 'drizzle-orm'
import { getDatabase } from '../db/index.js'

class ItemManager {
  private get db() { return getDatabase() }

  getAll(projectId: string) {
    return this.db.select().from(items)
      .where(eq(items.projectId, projectId))
      .all()
  }
}
```

## File-based Config Pattern

For config files like `.mcp.json`, `blacksmith.config.json`:

```typescript
class ConfigManager {
  private configPath(root: string): string {
    return path.join(root, '.config-file.json')
  }

  private read(root: string): ConfigSchema {
    const filePath = this.configPath(root)
    if (!fs.existsSync(filePath)) {
      // Seed defaults on first access
      const defaults = { ...DEFAULT_CONFIG }
      this.write(root, defaults)
      return defaults
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {
      return { ...DEFAULT_CONFIG }
    }
  }

  private write(root: string, data: ConfigSchema): void {
    fs.writeFileSync(
      this.configPath(root),
      JSON.stringify(data, null, 2) + '\n',
      'utf-8'
    )
  }
}
```

## Dependency Injection Flow

```
main.ts
  ├─ new ProjectManager()
  ├─ new SessionManager()
  ├─ new ClaudeManager()
  ├─ new SettingsManager()
  ├─ new RunnerManager()
  ├─ new McpManager()
  └─ setupAllIPC(getWindow, project, session, claude, settings, runner, mcp)
       ├─ setupProjectsIPC(getWindow, project)
       ├─ setupSessionsIPC(session, project)
       ├─ setupClaudeIPC(getWindow, claude, session, project, settings, mcp)
       ├─ setupRunnerIPC(getWindow, runner, project)
       ├─ setupMcpIPC(mcp, project, settings)
       └─ ...
```

- Services never import other services — they receive dependencies via method parameters
- IPC handlers receive services via `setupXIPC()` function parameters
- `getWindow()` is a getter function, not a direct reference (window may be null)

## Module System

- **ESM** throughout (`"type": "module"` in package.json)
- Use `.js` extensions in imports from `electron/` and `server/` (TypeScript compiles to JS)
- Preload script compiles to **CJS** (required by Electron's context bridge)
- Bundled with **tsup** (`tsup.electron.config.ts`)

## Error Handling

```typescript
// In services: throw descriptive errors
throw new Error(`MCP server "${name}" already exists`)
throw new Error('No active project. Select or create a project first.')

// In IPC handlers: errors auto-propagate to renderer
// ipcMain.handle rejects the promise, client sees the error

// For async operations: catch and send error events
proc.on('error', (err) => {
  win?.webContents.send(ON_ERROR, { error: err.message })
})
```

## Environment & PATH

- `fix-path` called at startup in `main.ts` — fixes PATH for GUI apps on macOS/Linux
- All `spawn` calls work without `shell: true` after fix-path
- Use `shell: true` only when running shell-specific commands (pipes, globs)
- Set `STUDIO_EMBED=1` when spawning Django (signals middleware to allow iframe)

## Do NOT

- Put business logic in IPC handlers — delegate to services
- Import services directly in handlers — inject via function parameters
- Use `require()` — use ESM `import`
- Use `process.execPath` to run Node scripts — it's the Electron binary in production
- Store secrets in config files — use environment variables
- Block the main process with heavy sync operations — use `spawn` for CPU-intensive work
- Forget to clean up spawned processes — register cleanup in `app.on('before-quit')`

$ARGUMENTS
