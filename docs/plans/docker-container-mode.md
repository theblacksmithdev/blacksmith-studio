# Docker Container Mode (Optional per Project)

## Context

Projects need isolated environments (specific Node/Python versions, dependencies, databases) that work cross-platform. Docker is the only practical solution that works on macOS, Windows, and Linux. This is an optional per-project feature — projects without Docker work exactly as today.

## Architecture

```
Host (macOS/Windows/Linux)
├── Blacksmith Studio (Electron)
│   ├── Claude Code CLI         ← stays on host
│   ├── File editing             ← reads/writes host files
│   └── DockerManager            ← manages containers
│
└── Docker Container (per project)
    ├── Python 3.12 + Django     ← dev server runs here
    ├── Node 20 + Vite           ← dev server runs here
    ├── /workspace               ← bind mount of project folder
    └── Optional: Postgres, Redis (via compose)
```

**What runs in Docker**: dev servers, package installs, tests, builds
**What stays on host**: Claude Code, Blacksmith UI, MCP servers, file editing

## Key Design Decisions

1. **CommandExecutor interface** — abstracts `spawn()` so spawn-backend/spawn-frontend work with both `HostExecutor` and `DockerExecutor` without if/else
2. **Single container** — Django + Vite in one container (not separate). Databases via docker-compose
3. **Volume mount** — bind mount for real-time file sync. `node_modules` kept in container via named volume overlay
4. **Per-project Dockerfile** — auto-generated at `.blacksmith-studio/Dockerfile`, extending a base image, user-editable

## Implementation Phases

### Phase 1: Docker service layer

1. `server/services/docker/types.ts` — DockerConfig, ContainerState types
2. `server/services/docker/check-installed.ts` — detect Docker + daemon status
3. `server/services/docker/generate-dockerfile.ts` — generate Dockerfile + compose
4. `server/services/docker/index.ts` — DockerManager (build, start, stop, exec, getState)

### Phase 2: CommandExecutor abstraction

5. `server/services/runner/executor.ts` — interface + HostExecutor + DockerExecutor
6. Modify `spawn-backend.ts` — accept executor parameter
7. Modify `spawn-frontend.ts` — accept executor parameter
8. Modify `runner/index.ts` — select executor based on Docker state

### Phase 3: Config + IPC

9. Extend `runner/config.ts` — read `docker` section from blacksmith.config.json
10. `electron/ipc/docker.ts` — IPC handlers (checkInstalled, start, stop, rebuild, getState)
11. Add channels to `channels.ts` + allowlist
12. Wire into `main.ts` — instantiate DockerManager, detect at startup

### Phase 4: Client API + UI

13. `api/modules/docker.ts` — typed API module
14. `hooks/use-docker.ts` — React Query hook
15. Settings section — "Docker" under Project group (toggle, base image, services, rebuild)
16. Runner status bar — Docker badge when container active
17. Setup wizard — detect Docker alongside Node/Claude

### Phase 5: Claude integration

18. Update system prompt — conditional Docker instructions
19. Instruct Claude to use `docker exec {containerName}` for runtime commands

## Config format

`blacksmith.config.json`:

```json
{
  "backend": { "port": 8000 },
  "frontend": { "port": 5173 },
  "docker": {
    "enabled": false,
    "baseImage": "node:20-slim",
    "services": ["postgres"],
    "envVars": { "DATABASE_URL": "..." }
  }
}
```

## Generated files

`.blacksmith-studio/Dockerfile`:

```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y python3 python3-venv python3-pip
WORKDIR /workspace
COPY backend/requirements.txt /tmp/req.txt
RUN pip3 install -r /tmp/req.txt
COPY frontend/package.json frontend/package-lock.json /tmp/frontend/
RUN cd /tmp/frontend && npm ci
```

`.blacksmith-studio/docker-compose.yml` (when services configured):

```yaml
services:
  app:
    build: .
    volumes: ["../:/workspace"]
    ports: ["8000:8000", "5173:5173"]
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: app
      POSTGRES_PASSWORD: dev
```

## Critical files to create/modify

### New files

- `server/services/docker/types.ts` — DockerConfig, ContainerState types
- `server/services/docker/check-installed.ts` — detect Docker + daemon
- `server/services/docker/generate-dockerfile.ts` — Dockerfile + compose generator
- `server/services/docker/index.ts` — DockerManager class
- `server/services/runner/executor.ts` — CommandExecutor interface + HostExecutor + DockerExecutor
- `electron/ipc/docker.ts` — IPC handlers
- `client/src/api/modules/docker.ts` — typed API
- `client/src/hooks/use-docker.ts` — React Query hook
- `client/src/components/settings/sections/docker-settings.tsx` — settings UI

### Modified files

- `server/services/runner/spawn-backend.ts` — accept executor param
- `server/services/runner/spawn-frontend.ts` — accept executor param
- `server/services/runner/index.ts` — container lifecycle, executor selection
- `server/services/runner/config.ts` — read docker config
- `electron/ipc/channels.ts` — add docker channels
- `electron/ipc/index.ts` — wire docker IPC
- `electron/main.ts` — instantiate DockerManager
- `server/services/claude/system-prompt.ts` — conditional Docker instructions

## Verification checklist

1. Docker not installed → toggle disabled with install message
2. Enable Docker → Dockerfile generated, container built, services start inside container
3. Disable Docker → falls back to host mode seamlessly
4. Preview iframe works (ports forwarded from container to host)
5. Claude can read/write files (volume mount)
6. Rebuild container works after dependency changes
7. Projects without Docker enabled work unchanged
8. Works on macOS, Windows (WSL2), Linux

## macOS performance note

Volume mounts on macOS can be slow with large `node_modules`. Mitigation: use a named volume overlay for `node_modules` inside the container so it's not synced back to host. The `frontend/node_modules` directory in the container is a separate Docker volume, not part of the bind mount.

## Orphan container cleanup

On app startup, check for running containers named `blacksmith-*` and offer to stop orphans from crashed sessions.
