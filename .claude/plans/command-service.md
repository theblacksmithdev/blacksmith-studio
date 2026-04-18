# CommandService — Unified command execution

Approved 2026-04-18.

## Goal

One boundary for running processes. The whole app (UI, agents, runner, MCP servers, internal tooling) goes through it. Adding support for a new language/runtime tomorrow means writing **one new file**, not touching a dozen places.

## North-star principle: toolchain plug-ins

The core abstraction is a **Toolchain** — a self-contained module that knows everything about one runtime ecosystem (Python, Node, Java, Ruby, Rust, Go, …). Today we ship Python + Node. Adding Java = drop `java-toolchain.ts` into `toolchains/`, register it, done.

```ts
interface Toolchain {
  id: string;                                // 'python' | 'node' | 'java' | ...
  displayName: string;
  binaries: readonly string[];               // ['python', 'pip', 'uv']
  presetOwnership: readonly PresetName[];    // ['python', 'pip', 'pytest']

  detectStudioEnv(ctx: StudioCtx): ToolchainEnv | null;
  detectProjectEnv(ctx: ProjectCtx): ToolchainEnv | null;

  resolveBinary(binary: string, env: ToolchainEnv): { command: string; args: string[] };
  checkAvailable(env: ToolchainEnv): Promise<{ ok: boolean; version?: string; error?: string }>;
  createProjectEnv?(ctx: ProjectCtx, options: unknown): Promise<ToolchainEnv>;
}

interface ToolchainEnv {
  scope: 'studio' | 'project';
  toolchainId: string;
  displayName: string;       // ".venv (Python 3.12.0)" | "Poetry" | ".nvmrc → v20.11.0"
  root: string;              // absolute path to env root
  bin: string;               // absolute path to bin/Scripts dir
  envVars: Record<string, string>;   // VIRTUAL_ENV, JAVA_HOME, …
  invoker?: { command: string; args: string[] };  // ['poetry','run'] for wrapper-style envs
}
```

Extensibility wins come from strict interface boundaries: the `CommandService` never does a `switch (toolchainId)`. It delegates.

## Decisions

- Both **presets** (`python`, `pip`, `npm`) AND **raw** (`command + args`) are supported. Raw still runs through the runner so auditing + env consistency hold.
- **Every** run is audited. Lightweight row in a new `command_runs` table (full args, exit code, durations). A compact `command_executed` entry in `conversation_events` for Timeline display. Output body stored in the row, not the event, to keep the event log slim.
- **Scope is explicit**: `scope: 'studio' | 'project'` is required on every call. `studio` = Blacksmith-internal venv/env. `project` = the user's project env chain. Agents can only use `project` via MCP (we don't expose `studio` to them).
- **No implicit fallbacks to the user's system** for project-scoped Python when no venv is detected. Fail fast with `NO_PROJECT_VENV` + a suggestion. User/agent can then call `create_project_env` explicitly.
- **Legacy helpers (`pythonEnv`, `nodeEnv`, `detectPythonInstallations`, …) stay** as thin shims that delegate into the new service. No public API breaks in flight.
- **Keep Claude CLI's `Bash` tool** alongside our `run_command` MCP tool for now. Observe for a sprint, then decide per-role whether to disable `Bash` in favour of the audited path.

## Directory layout

```
server/services/commands/
  types.ts                         — CommandSpec, CommandResult, CommandRunHandle, events
  command-service.ts               — facade: run / stream / cancel / checkAvailable / resolveEnv
  command-runner.ts                — single spawn wrapper; streams stdout/stderr; timeout; cancel
  command-resolver.ts              — CommandSpec → { toolchain, env, invoker, command, args }
  command-env.ts                   — buildCommandEnv({ base, toolchainEnv, extra })
  presets.ts                       — preset → toolchain binary mapping (declarative)

  toolchains/
    types.ts                       — Toolchain, ToolchainEnv, StudioCtx, ProjectCtx
    registry.ts                    — ToolchainRegistry { register, getByPreset, getById, all }
    python-toolchain.ts            — detection + env chain for Python (.venv, Poetry, Pipenv, conda, pyenv)
    node-toolchain.ts              — detection + env chain for Node (.nvmrc, engines, nvm, fnm)
    raw-toolchain.ts               — passthrough for `command: 'make'` style raw invocations

  detectors/
    binary-detector.ts             — generic `detectBinary(name, paths) -> AbsPath | null`
    python-venv-detector.ts        — ordered chain returning the first match
    node-version-detector.ts       — ordered chain returning the first match

  repositories/
    command-run-repository.ts      — Drizzle CRUD on `command_runs`

  events.ts                        — append command_executed into conversation_events
  index.ts
```

Adding a new toolchain = one file in `toolchains/` + one `registry.register(...)` line. The `CommandResolver` finds it via `binaries` + `presetOwnership`. Everything downstream (IPC, MCP, UI) inherits support automatically.

## Schema

**New `command_runs` table** — the full execution record.
```
id TEXT PK
project_id TEXT FK projects(id) ON DELETE CASCADE
conversation_id TEXT
task_id TEXT
agent_role TEXT                 -- null when user-initiated
toolchain_id TEXT               -- 'python' | 'node' | 'raw' | ...
preset TEXT                     -- 'pip' | 'npm' | null for raw
scope TEXT NOT NULL             -- 'studio' | 'project'
command TEXT NOT NULL           -- resolved absolute binary
args TEXT NOT NULL              -- JSON array
cwd TEXT NOT NULL
resolved_env_display TEXT       -- ".venv (3.12.0)" for UI
exit_code INTEGER
stdout TEXT                     -- truncated to N KB, full artefact on disk if larger
stderr TEXT                     -- same truncation policy
started_at TEXT NOT NULL
finished_at TEXT
duration_ms INTEGER
status TEXT NOT NULL            -- 'running' | 'done' | 'error' | 'cancelled' | 'timeout'
INDEX (project_id, started_at)
INDEX (conversation_id)
INDEX (task_id)
```

**New event type** `command_executed` in `conversation_events.eventType`. Payload: `{ runId, toolchainId, preset?, command, args, scope, exitCode, durationMs, resolvedEnvDisplay }`.

## IPC surface

```
COMMANDS_RUN                   invoke    — blocking: resolve + spawn + wait for exit
COMMANDS_STREAM_START          invoke    — spawn, return runId immediately; output via push
COMMANDS_CANCEL                invoke    — { runId }
COMMANDS_CHECK_AVAILABLE       invoke    — { preset | command, scope, projectId }
COMMANDS_RESOLVE_ENV           invoke    — { toolchainId, scope, projectId } → ToolchainEnv (for "which python?" debugging)
COMMANDS_LIST_TOOLCHAINS       invoke    — registry introspection
COMMANDS_LIST_RUNS             invoke    — { projectId, conversationId?, limit? }
COMMANDS_GET_RUN               invoke    — { runId }

COMMANDS_ON_OUTPUT             subscribe — { runId, stream: 'stdout'|'stderr', chunk }
COMMANDS_ON_STATUS             subscribe — { runId, status, exitCode?, durationMs? }
```

## Agent MCP tool (extend context-mcp)

```
run_command({
  preset?: string,
  command?: string,
  args?: string[],
  cwd?: string,
  timeoutMs?: number,
  description?: string          // one-line rationale for the audit trail
}) → {
  runId, exitCode, stdout, stderr, durationMs,
  resolvedEnvDisplay, toolchainId
}

check_command_available({ preset | command }) → { available, version?, error? }

list_toolchains() → [{ id, displayName, presetOwnership, envDisplay }]

create_project_env({ toolchainId, options? }) → ToolchainEnv
  // Optional. First implementation: toolchainId='python' → create .venv via uv.
```

Agents get a uniform tool; **scope is fixed to 'project'** for MCP calls. Every agent run is stamped with conversationId/taskId/agentRole automatically.

## Frontend

`client/src/api/modules/commands.ts` + `api/hooks/commands/`:
- `useRunCommand` (mutation, blocking)
- `useStreamCommand` (returns `{ runId, output, status, cancel }`)
- `useCommandAvailability({ preset })`
- `useResolvedEnvQuery({ toolchainId, scope })`
- `useToolchainsQuery()`
- `useCommandRunsQuery({ conversationId? })`
- `useCommandRunQuery(runId)`
- `useCommandsSubscription()` — merges output + status into query cache

No UI surface in this rollout beyond the hooks. Timeline gains a `command_executed` row renderer (Phase 4). A dedicated Commands console page can come later.

## Phased rollout

1. **Schema + toolchain abstraction.** `command_runs` table + migrations. `Toolchain` interface, `ToolchainRegistry`, `PythonToolchain`, `NodeToolchain`, `RawToolchain`. No behaviour change yet.
2. **CommandService + Runner + Resolver + events.** Build the service; emit `command_executed` events; persist to `command_runs`. Unit-testable in isolation.
3. **IPC + api module + hooks.** Invoke + streaming channels; all hooks. Timeline renderer for `command_executed`.
4. **Agent MCP tools.** `run_command`, `check_command_available`, `list_toolchains`, `create_project_env`. Add tool names to narrow-list roles.
5. **Incremental migration.** Delegate `pythonEnv`/`nodeEnv`/`detectPythonInstallations`/`detectNodeInstallations` internals to the new toolchains (public signatures unchanged). Migrate `spawnRunner`, `mcp.testStdio`, `PackageManager.spawn` to `commandRunner.run/stream`.
6. **Polish.** Optional: a `/projects/:id/commands` console page for browsing run history + a "resolve env" inspector.

Each phase ends with `npx tsc --noEmit` clean on server/electron.

## Future toolchains (sanity check on the design)

To prove the abstraction holds, sketch what adding each new toolchain looks like:

- **Java**: one new `java-toolchain.ts`. Detection: `.java-version` (jenv), `JAVA_HOME`, sdkman, system. Binaries: `java`, `javac`, `mvn`, `gradle`. Project env: detect Gradle/Maven wrappers (`./gradlew`, `./mvnw`). Invoker for Gradle: `['./gradlew']`.
- **Ruby**: `.ruby-version` (rbenv, asdf), Bundler detection (`Gemfile` → `bundle exec`).
- **Rust**: `rust-toolchain.toml`, cargo workspaces.
- **Go**: `go.mod`, GOPATH handling, module-aware binary resolution.

Each is a self-contained file. No edits elsewhere. That's the test the design has to pass — if it doesn't, the abstraction is wrong.
