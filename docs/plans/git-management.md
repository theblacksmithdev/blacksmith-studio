# Git Management — Beginner-Friendly Version Control

## Context

Users (including non-technical founders) need to save, track, and sync their project changes without understanding git's complexity. The goal: make version control as easy as saving a document, with friendly language and AI assistance.

## Friendly Language

| Git Concept | Blacksmith Language | Where Shown |
|---|---|---|
| commit | **Checkpoint** | Everywhere |
| branch | **Version** | Everywhere |
| main/master | **Production** | Version switcher |
| push + pull | **Sync** | Sync button |
| staging area | **Selected files** | Save panel |
| merge | **Apply changes** | Version actions |
| conflict | **Overlapping changes** | Conflict resolver |
| diff | **What changed** | Change viewer |
| remote | **Cloud backup** | Sync status |

## Library: `simple-git`

Wraps the system `git` binary. Full feature support, typed API, works with `fix-path` (already called at startup).

## Architecture

### Backend: `GitManager` (`server/services/git.ts`)

```
class GitManager {
  // Status
  getStatus()          → branch, changed file count, sync status
  getChangedFiles()    → file list with status (modified/new/deleted)
  getDiff(path)        → diff content for visual viewer

  // Checkpoints (commits)
  createCheckpoint(message, files?)  → commit selected or all changes
  generateMessage()    → auto-generate from changes
  getHistory(limit)    → past checkpoints timeline

  // Versions (branches)
  listVersions()       → all branches
  createVersion(name)  → new branch
  switchVersion(name)  → checkout
  applyVersion(src, target)  → merge

  // Sync (push/pull)
  sync()               → pull then push
  getSyncStatus()      → ahead/behind/diverged

  // Conflicts
  getConflicts()       → conflicting files
  resolveConflict(path, resolution)  → accept ours/theirs/manual

  // File watching
  onStatusChange(cb)   → push events when files change
}
```

### IPC: 15 invoke channels + 1 subscribe

```
git:status, git:changedFiles, git:diff,
git:createCheckpoint, git:generateMessage, git:history,
git:listVersions, git:createVersion, git:switchVersion, git:applyVersion,
git:sync, git:syncStatus,
git:conflicts, git:resolveConflict,
git:init

git:onStatusChange (subscribe)
```

### Client: Zustand store + React Query + hooks

- `git-store.ts` — reactive state (branch, changed count, sync status) pushed from main process
- `use-git-listener.ts` — mounted in ProjectLayout, syncs store via IPC subscription
- `use-git.ts` — actions (createCheckpoint, switchVersion, sync, etc.)

## UI Components

### 1. Status indicator (title bar)
Always visible: current version name + changed file count badge + sync icon

```
┌── ☰ ‹ › ── MyApp / Chat ── [Production ● 3] [↑↓ Synced] ── ☀ ●──┐
```

### 2. Checkpoints page (`/:projectId/checkpoints`)

New sidebar nav item between Code and Dev Servers.

```
┌──────────────────────────────────────────────────────────────┐
│ WHAT CHANGED                          [Save Checkpoint]      │
│                                                              │
│ ┌─ M  src/components/Header.tsx                              │
│ ├─ A  src/pages/About.tsx          (new file)                │
│ ├─ M  src/App.tsx                                            │
│ └─ D  src/old-component.tsx        (deleted)                 │
│                                                              │
│ ── Click a file to see what changed ──                       │
│                                                              │
│ ┌────────────────────────────────────────────────────┐       │
│ │  Monaco Diff Editor (inline view)                  │       │
│ │  + Added 12 lines, - Removed 3 lines               │       │
│ └────────────────────────────────────────────────────┘       │
├──────────────────────────────────────────────────────────────┤
│ HISTORY                                                      │
│                                                              │
│ ● Today                                                      │
│ │ ○ Add user authentication          2 hours ago  (4 files)  │
│ │ ○ Fix login page styling           3 hours ago  (2 files)  │
│ │                                                            │
│ ● Yesterday                                                  │
│ │ ○ Create dashboard page            yesterday    (6 files)  │
│ │ ○ Initial project setup            yesterday    (12 files) │
└──────────────────────────────────────────────────────────────┘
```

### 3. Save checkpoint dialog

```
┌─────────────────────────────────────┐
│ Save Checkpoint                     │
│                                     │
│ What did you change?                │
│ ┌─────────────────────────────────┐ │
│ │ Add user login and registration │ │  ← auto-generated, editable
│ └─────────────────────────────────┘ │
│ [✨ Generate with Claude]           │
│                                     │
│ Include:                            │
│ ☑ src/components/Header.tsx         │
│ ☑ src/pages/About.tsx               │
│ ☑ src/App.tsx                       │
│ ☐ src/old-component.tsx             │
│                                     │
│         [Cancel]  [Save Checkpoint] │
└─────────────────────────────────────┘
```

### 4. Version switcher (branch management)

```
┌─────────────────────────────┐
│ Versions                    │
│                             │
│ ● Production (main)    ← current
│ ○ new-feature          2 ahead
│ ○ experiment           5 checkpoints
│                             │
│ [+ Try something new]       │
│                             │
│ ── Apply changes ──         │
│ Move "new-feature" changes  │
│ into Production?            │
│ [Preview]  [Apply]          │
└─────────────────────────────┘
```

### 5. Sync button

```
[↑↓ Sync]  →  [⟳ Syncing...]  →  [✓ Synced]
```

If conflicts: "Overlapping changes found" → Claude-assisted resolver

### 6. File browser enhancement

Add git status indicators to file tree nodes:
- **M** (orange) — modified since last checkpoint
- **A** (green) — new file
- **D** (red) — deleted
- **?** (gray) — not tracked

## Safety

- **No destructive operations**: no force push, hard reset, rebase
- **"Go back"** creates a new checkpoint that reverts (never rewrites history)
- **Pre-sync preview**: "3 checkpoints to upload, 2 to download"
- **Conflict help**: Claude explains what happened and suggests resolution
- **Branch delete** requires confirmation with explanation

## Implementation Phases

### Phase 1: Foundation
1. `npm install simple-git`
2. `server/services/git.ts` — GitManager
3. `electron/ipc/git.ts` — handlers
4. Channels + wiring in main.ts

### Phase 2: Client plumbing
5. `api/modules/git.ts`
6. `stores/git-store.ts`
7. `hooks/use-git.ts`

### Phase 3: Status + nav
8. Branch indicator in title bar
9. "Checkpoints" in sidebar nav
10. Mount git listener in ProjectLayout

### Phase 4: Checkpoints page
11. Changed files list with status badges
12. Visual diff with Monaco DiffEditor
13. Save checkpoint dialog with auto-generate
14. History timeline

### Phase 5: Versions + sync
15. Version switcher
16. Create/switch/apply versions
17. Sync button with status
18. Conflict resolution with Claude

### Phase 6: Integration
19. File browser git status indicators
20. Git context in Claude prompts
21. "No git? Enable project history" prompt

## Critical files
- `server/services/git.ts` (new)
- `electron/ipc/git.ts` (new)
- `client/src/stores/git-store.ts` (new)
- `client/src/hooks/use-git.ts` (new)
- `client/src/pages/checkpoints/index.tsx` (new)
- `client/src/components/checkpoints/` (new directory)
- `client/src/components/layout/sidebar/nav-config.ts` (add nav item)
- `client/src/components/files/file-tree-node.tsx` (add git indicators)
