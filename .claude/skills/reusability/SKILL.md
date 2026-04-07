---
name: reusability
description: Code reusability patterns and shared abstractions for client and server
---

# Code Reusability Guide

Before writing any new code, always check if a reusable abstraction already exists. Duplication is the primary source of bugs and maintenance burden in this codebase.

## Pre-Flight Checklist

Before building anything:
1. Search `client/src/components/shared/` for existing UI components
2. Search `client/src/hooks/` for existing data hooks
3. Search `client/src/api/modules/` for existing API methods
4. Search `server/services/` for existing service methods
5. Search `client/src/stores/` for existing state
6. If something similar exists, extend it — don't duplicate it

## Client-Side Reusable Components

### Shared UI (`client/src/components/shared/`)

| Component | File | Use for |
|-----------|------|---------|
| `Modal` | `modal.tsx` | All dialogs — provides Dialog, backdrop, header, body, footer |
| `PrimaryButton` | `modal.tsx` | Accent-colored action buttons |
| `SecondaryButton` | `modal.tsx` | Outlined secondary actions |
| `GhostButton` | `modal.tsx` | Text-only buttons (cancel, dismiss) |
| `DangerButton` | `modal.tsx` | Destructive action buttons (delete, remove) |
| `FooterSpacer` | `modal.tsx` | Push footer buttons to the right |
| `ConfirmDialog` | `confirm-dialog.tsx` | Delete/destructive confirmations |
| `FormField` | `form-controls.tsx` | Field wrapper with label, hint, error |
| `FormInput` | `form-controls.tsx` | Styled text/number input |
| `FormTextarea` | `form-controls.tsx` | Styled multiline input |
| `Toggle` | `form-controls.tsx` | On/off switch |
| `SegmentedControl` | `form-controls.tsx` | Two+ option toggle (tabs-like) |
| `KvEditor` | `form-controls.tsx` | Key-value pair editor (env vars, headers) |
| `CodeBlock` | `form-controls.tsx` | Monospace code display |
| `Badge` | `form-controls.tsx` | Status tags (default/error/warning) |
| `Tooltip` | `tooltip.tsx` | Hover tooltip (Chakra-based) |
| `EmptyState` | `empty-state.tsx` | Icon + title + description for empty lists |
| `PageContainer` | `page-container.tsx` | Centered max-width content wrapper |
| `PreviewPanel` | `preview-panel.tsx` | Iframe preview with close header |

### Runner Primitives (`client/src/components/runner/runner-primitives.tsx`)

| Export | Use for |
|--------|---------|
| `StatusDot` | Status indicator dot (styled by RunnerStatus) |
| `PortLabel` | Monospace port number display |
| `getLineColor` | Log line syntax coloring |
| `MONO_FONT` | Monospace font stack string |

### Sidebar Primitives (`client/src/components/layout/sidebar/`)

| Export | Use for |
|--------|---------|
| `NavButton` | Sidebar navigation button (active/expanded states) |
| `NavLabel` | Animated label that hides when sidebar collapses |
| `SidebarTooltip` | Portal tooltip for collapsed sidebar items |

## Client-Side Hooks

### When to create a hook vs inline logic

| Pattern | Use hook | Use inline |
|---------|----------|------------|
| Data fetching | Always — wrap in `useQuery` | Never |
| Data mutation | Always — wrap in `useMutation` | Never |
| IPC subscription | Always — cleanup in `useEffect` | Never |
| UI toggle state | Use `useUiStore` | Simple `useState` if component-local |
| Computed/derived data | `useMemo` inline | Don't create a hook for one-liners |

### Existing hooks (`client/src/hooks/`)

| Hook | Returns | When to use |
|------|---------|-------------|
| `useProjects()` | projects, activate, register, remove | Project CRUD |
| `useSessions()` | sessions, createSession, loadSession, deleteSession | Chat session management |
| `useSettings()` | get, set, + typed accessors (theme, model, etc.) | Read/write project settings |
| `useFiles()` | tree, fetchFileContent | File browser operations |
| `useRunner()` | start, stop, restart | Runner actions (fire-and-forget) |
| `useRunnerListener()` | — (side effect) | Mount once in ProjectLayout for IPC sync |
| `useClaude()` | sendPrompt, cancelPrompt | Chat with Claude |
| `useMcp()` | servers, add, update, remove, toggle, testConnection | MCP server management |
| `useWindowState()` | isFullscreen | Window state from Electron |
| `useProjectValidation()` | validate, validation, isValidating | Validate a project folder |
| `useCreateProject()` | createProject, isCreating | Create new project |
| `useThemeMode()` | mode, toggle | Dark/light theme |

### Creating a new hook

```tsx
// Pattern: useQuery for reads
export function useMyData() {
  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.myData,
    queryFn: () => api.myDomain.list(),
    enabled: !!activeProject,
  })
  return { data, isLoading }
}

// Pattern: useMutation for writes
export function useMyAction() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (input: MyInput) => api.myDomain.doAction(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myData }),
  })
  return { doAction: mutation.mutateAsync, isPending: mutation.isPending }
}
```

## Client-Side API Layer

### Adding a new domain

1. Types → `client/src/api/types.ts`
2. Module → `client/src/api/modules/{domain}.ts`
3. Barrel → add to `client/src/api/index.ts`
4. Query key → add to `client/src/api/query-keys.ts`
5. Hook → `client/src/hooks/use-{domain}.ts`

### Reusing API methods

```tsx
// GOOD — use the typed API
const data = await api.projects.list()
const unsub = api.runner.onStatus(callback)

// BAD — never call raw IPC
window.electronAPI.invoke('projects:list')  // NEVER
api.invoke('projects:list')                  // NEVER in app code
```

## Client-Side State

### Zustand stores (`client/src/stores/`)

| Store | What it holds | When to add state here |
|-------|---------------|----------------------|
| `ui-store` | sidebarExpanded, previewOpen, historyPanelOpen, runnerPanelOpen, connectionStatus | App-wide UI toggles |
| `project-store` | activeProject | Current project context |
| `chat-store` | messages, isStreaming, partialMessage | Active chat conversation |
| `session-store` | activeSessionId | Current session reference |
| `file-store` | tree, openTabs, activeTab, changedFiles | File browser state |
| `runner-store` | backendStatus, frontendStatus, ports, logs | Dev server state |

### Rules

- **Server state** → React Query (projects, sessions, settings, MCP servers)
- **Client state** → Zustand (UI toggles, active selections, streaming state)
- **Never duplicate** — don't put the same data in both React Query and Zustand
- **Derived selectors** → export from store file (e.g., `selectIsAnyActive`)

## Server-Side Reusable Patterns

### Service class conventions

All services follow the same structure. Reuse these patterns:

```typescript
// File-based config (MCP, Runner config)
class ConfigService {
  private read(root: string): Schema { /* read JSON, seed defaults if missing */ }
  private write(root: string, data: Schema): void { /* JSON.stringify + writeFileSync */ }
  list(root: string): Item[] { return this.read(root).items }
  add(root: string, name: string, data: Data): void { /* validate, read, push, write */ }
  update(root: string, name: string, data: Data): void { /* read, find, merge, write */ }
  remove(root: string, name: string): void { /* read, filter, write */ }
}

// Database-backed (Projects, Sessions, Settings)
class DbService {
  private get db() { return getDatabase() }
  getAll(id: string) { return this.db.select().from(table).where(eq(table.id, id)).all() }
  set(id: string, key: string, value: any) { /* upsert pattern */ }
}

// Process manager (Runner, Claude)
class ProcessService {
  private processes = new Map<string, ChildProcess>()
  private listeners: Callback[] = []
  start(name: string): void { /* spawn, track, emit events */ }
  stop(name: string): void { /* kill, cleanup in close handler */ }
  onOutput(cb: Callback): void { this.listeners.push(cb) }
}
```

### IPC handler pattern

All handlers follow the same thin-wrapper pattern:

```typescript
export function setupDomainIPC(service: DomainService, projectManager: ProjectManager) {
  ipcMain.handle(CHANNEL, (_e, data) => {
    const { path } = requireProject(projectManager)  // validate active project
    return service.method(path, data)                  // delegate to service
  })
}
```

### Shared helpers

| Helper | Location | Use for |
|--------|----------|---------|
| `requireProject()` | Each IPC file (inline) | Validate active project, return id + path |
| `getDatabase()` | `server/db/index.ts` | Singleton database connection |
| `buildClaudeArgs()` | `server/services/claude/args.ts` | Construct Claude CLI arguments |
| `getProjectContext()` | `server/services/claude/project-context.ts` | Generate project context for first message |
| `findAvailablePort()` | `server/services/runner/port-utils.ts` | Find open port for dev servers |
| `loadProjectConfig()` | `server/services/runner/config.ts` | Read blacksmith.config.json |

## Anti-Patterns to Avoid

### Component duplication
```tsx
// BAD — building a modal from scratch
const Overlay = styled.div`position: fixed; ...`
const Card = styled.div`background: ...; border-radius: ...`

// GOOD — use the shared Modal
import { Modal, PrimaryButton } from '@/components/shared/modal'
<Modal title="My Dialog" onClose={close} footer={<PrimaryButton>Save</PrimaryButton>}>
```

### Hook duplication
```tsx
// BAD — manual loading state for API calls
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const fetch = async () => { setLoading(true); const d = await api.x.list(); setData(d); setLoading(false) }

// GOOD — use React Query
const { data, isLoading } = useQuery({ queryKey: keys.x, queryFn: () => api.x.list() })
```

### Service duplication
```typescript
// BAD — reading .mcp.json in the IPC handler
ipcMain.handle('mcp:list', () => {
  const data = JSON.parse(fs.readFileSync('.mcp.json', 'utf-8'))
  return Object.entries(data.mcpServers).map(...)
})

// GOOD — delegate to service
ipcMain.handle('mcp:list', () => {
  const { path } = requireProject(projectManager)
  return mcpManager.list(path, disabledServers)
})
```

### State duplication
```tsx
// BAD — same data in Zustand AND React Query
useProjectStore.setState({ projects: data })  // Zustand
queryClient.setQueryData(keys.projects, data)  // AND React Query

// GOOD — one source of truth
// React Query for server data, Zustand for client-only state
```

## When to Extract vs Inline

| Situation | Action |
|-----------|--------|
| Used in 2+ places | Extract to shared component/hook/service |
| File exceeds 200 lines | Extract sub-components to separate files |
| 3+ similar styled components | Create a parameterized variant |
| Same API call in 2+ components | Create a hook |
| Same validation logic in 2+ places | Create a shared util |
| One-time use, under 20 lines | Keep inline |

$ARGUMENTS
