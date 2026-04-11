# Blacksmith Studio

An AI-native Electron desktop IDE for building any project — supports cloud and local LLMs.

## Architecture

```
electron/          — Electron main process (main.ts, preload.ts)
electron/ipc/      — IPC handlers (one file per domain)
server/            — Backend services (SQLite, Claude CLI, Runner, MCP)
server/services/   — Service classes (projects, sessions, settings, claude, runner, mcp)
server/db/         — Drizzle ORM schema + database
client/            — React frontend (Vite + Chakra UI + Emotion)
client/src/api/    — Typed IPC API layer (modules/, query-keys, query-client)
client/src/hooks/  — React Query hooks
client/src/stores/ — Zustand state stores
client/src/components/ — UI components
client/src/pages/  — Route pages
```

## Key Conventions

### Styling
- Use **Emotion `styled` components** (not Chakra `css` prop)
- All colors use CSS custom properties: `var(--studio-bg-main)`, `var(--studio-text-primary)`, etc.
- Theme defined in `client/src/theme.ts`
- Monochrome design language (black/white accent, no green/blue for status)
- Font: Outfit (geometric sans-serif) for UI, SF Mono for code

### API Layer
- All Electron IPC calls go through typed modules in `client/src/api/modules/`
- Usage: `api.projects.list()`, `api.runner.start({ target })`, `api.claude.onMessage(cb)`
- Never call `window.electronAPI` directly — only `client/src/api/client.ts` does that
- Subscriptions (push events) use `api.module.onEvent(callback)` pattern
- Queries use React Query (`useQuery`), mutations use `useMutation`

### Component Organization
- Modular folder structure: each major feature has its own folder with `index.ts` barrel
- Example: `runner/controls/`, `runner/dock/`, `runner/logs/`, `runner/preview/`
- Shared components in `client/src/components/shared/`
- Settings sections in `client/src/components/settings/sections/`

### State Management
- **React Query** for server state (projects, sessions, settings, files, MCP)
- **Zustand** for client state (UI, chat, runner, file tabs)
- Settings persisted in SQLite via `SettingsManager`
- Runner state synced from main process via IPC subscriptions

### IPC Pattern
- Invoke channels: request/response (e.g., `projects:list`)
- Subscribe channels: push events (e.g., `runner:onOutput`)
- All channels defined in `electron/ipc/channels.ts`
- Handlers in `electron/ipc/{domain}.ts`
- `fix-path` called at startup to resolve PATH for GUI apps

## Commands

```bash
npm run dev          # Start development (client + electron)
npm run build        # Build client + electron
npm run package:mac  # Package for macOS (both x64 + arm64)
npx tsc --noEmit     # Type check
```

## Key Files

- `electron/main.ts` — App entry, window creation, IPC setup
- `client/src/app.tsx` — Root component (setup wizard gate)
- `client/src/router/index.tsx` — Routes (uses `createHashRouter` for file:// compat)
- `client/src/api/index.ts` — Typed API barrel export
- `client/src/stores/runner-store.ts` — Runner state + selectors
- `server/services/mcp.ts` — MCP server manager (.mcp.json read/write)
- `server/services/claude/args.ts` — Claude CLI argument builder
