---
name: add-ipc-channel
description: Add a new IPC channel between Electron main and React renderer
---

# Add IPC Channel

Create a new typed IPC channel for the domain: $ARGUMENTS

## Steps

1. **Channel constant** — Add to `electron/ipc/channels.ts`:
   - Define `export const {DOMAIN}_{ACTION} = '{domain}:{action}'`
   - Add to `INVOKE_CHANNELS` (for request/response) or `SUBSCRIBE_CHANNELS` (for push events)

2. **IPC handler** — Create or update `electron/ipc/{domain}.ts`:
   - Use `ipcMain.handle(CHANNEL, async (_e, data) => { ... })` for invoke
   - Use `win.webContents.send(CHANNEL, data)` for subscriptions
   - Follow existing patterns in `electron/ipc/sessions.ts` or `electron/ipc/runner.ts`

3. **Wire handler** — Register in `electron/ipc/index.ts` if it's a new domain file

4. **API types** — Add input/output types to `client/src/api/types.ts`

5. **API module** — Add typed method in `client/src/api/modules/{domain}.ts`:
   - Invoke: `methodName: (input: InputType) => raw.invoke<OutputType>('{domain}:{action}', input)`
   - Subscribe: `onEvent: (cb: (data: EventType) => void) => raw.subscribe('{domain}:onEvent', cb)`

6. **Barrel export** — Add module to `client/src/api/index.ts` if new

7. **Verify** — Run `npx tsc --noEmit`

## Naming conventions

- Invoke channels: `{domain}:{action}` (e.g., `projects:list`, `mcp:add`)
- Subscribe channels: `{domain}:on{Event}` (e.g., `runner:onStatus`, `claude:onMessage`)
