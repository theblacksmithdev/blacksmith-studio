# Artifact Management

Approved 2026-04-18.

## Goal

1. Let users **manage** artifacts inside an agent conversation (open, edit, rename, tag, delete).
2. Provide a project-wide **artifact library** (all markdown artifacts from `.blacksmith/artifacts/`, across conversations).
3. Give agents an **MCP tool surface** to list, read, write, update, tag, and delete artifacts.

## Decisions

- Delete is **hard delete** (file + DB row removed together).
- Edits overwrite in place — **no version history**.
- Library shows **markdown artifacts only** (not touched-files from `ArtifactTracer`).
- Tags are free-form strings, **per-project**.
- Backfill from disk → DB runs only when the user clicks a **Re-index** button.

## Schema

```
artifacts
  id TEXT PK
  project_id TEXT NOT NULL FK projects(id) ON DELETE CASCADE
  conversation_id TEXT                      -- nullable; artifacts from direct executes have no conversation
  dispatch_id TEXT
  task_id TEXT
  role TEXT NOT NULL
  slug TEXT NOT NULL
  title TEXT NOT NULL
  rel_path TEXT NOT NULL                    -- project-relative, e.g. ".blacksmith/artifacts/architect/abcd1234-auth-design.md"
  size_bytes INTEGER NOT NULL
  tags TEXT NOT NULL DEFAULT '[]'           -- JSON array of strings
  created_at TEXT NOT NULL
  updated_at TEXT NOT NULL
  INDEX (project_id)
  INDEX (conversation_id)
  INDEX (role)
  UNIQUE (project_id, rel_path)
```

No `artifact_versions` table — overwrite semantics only.
No `archived` flag — hard delete only.

## Backend layering

```
server/services/artifacts/
  artifact-repository.ts    — Drizzle CRUD on `artifacts`
  artifact-service.ts       — business logic: list / get / readContent /
                              writeContent / rename / delete / tag /
                              upsertFromWrite / backfill
  events.ts                 — pub/sub so IPC forwards mutations to the renderer
  types.ts                  — ArtifactRecord, ArtifactListInput, ListFilters
```

`ArtifactManager` (existing filesystem writer) stays — `ArtifactService` composes
it, so task-plan-executor's call path doesn't change but now also upserts DB
metadata.

## IPC

```
ARTIFACTS_LIST            invoke — { projectId, conversationId?, role?, tag?, search? }
ARTIFACTS_GET             invoke — { id }
ARTIFACTS_READ_CONTENT    invoke — { id }
ARTIFACTS_WRITE_CONTENT   invoke — { id, content }
ARTIFACTS_RENAME          invoke — { id, title }
ARTIFACTS_DELETE          invoke — { id }
ARTIFACTS_SET_TAGS        invoke — { id, tags }
ARTIFACTS_BACKFILL        invoke — { projectId } — scans disk → upserts
ARTIFACTS_ON_CHANGED      subscribe — push { kind: 'upsert'|'delete', artifact | id }
```

## Frontend

**1. Conversation panel (`agent-artifacts.tsx`)** — upgraded from touched-files
to a dual tab: *Files touched* (existing tracer) + *Artifacts* (new). Each
artifact row has a kebab menu: open → markdown preview drawer, rename, add
tag, reveal in editor, copy path, delete.

**2. New project library page** `/projects/:id/artifacts`:
- Left: filter rail (role chips, tag chips, free-text search, per-conversation grouping toggle).
- Middle: artifact list with title, role badge, timestamp, tag chips.
- Right: preview/edit drawer (markdown render + edit toggle → textarea; Save overwrites).
- Toolbar: "Re-index" button (calls `ARTIFACTS_BACKFILL`).

Hooks under `client/src/api/hooks/artifacts/`:
- `useArtifactsQuery({projectId, filters})`
- `useArtifactQuery(id)`
- `useArtifactContentQuery(id)`
- `useArtifactsSubscription(projectId)`
- `useWriteArtifactContent`, `useRenameArtifact`, `useDeleteArtifact`, `useSetArtifactTags`, `useBackfillArtifacts`

Query keys: `projectArtifacts`, `projectArtifact(id)`, `projectArtifactContent(id)`.

## Agent MCP tools (extend context-mcp)

```
list_artifacts     { projectId, conversationId?, role?, tag?, limit? }
read_artifact      { id }
write_artifact     { projectId, role, title, content, conversationId?, taskId?, tags? }
update_artifact    { id, content }
tag_artifact       { id, tags }
delete_artifact    { id }
```

Allowed for all roles (roles with `allowedTools: "all"` already inherit;
the five narrow-list roles get the tools appended).

## Phased rollout

1. Schema + repo (data layer only).
2. ArtifactService + backfill + filesystem hook-in; existing writeArtifact auto-indexes.
3. IPC + api modules + hooks.
4. Upgraded conversation panel + new library page.
5. Artifact MCP tools + allowedTools updates.

Each phase ends with `npx tsc --noEmit` passing on server/electron.
