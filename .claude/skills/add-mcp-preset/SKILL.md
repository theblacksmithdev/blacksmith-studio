---
name: add-mcp-preset
description: Add a new MCP server preset to the library
---

# Add MCP Preset

Add a new MCP server preset: $ARGUMENTS

## Steps

1. **Add preset** — Add to `client/src/components/settings/mcp-library/presets.ts` → `PRESETS` array:
   ```ts
   {
     name: 'server-name',
     label: 'Display Name',
     description: 'What this server does',
     icon: IconFromLucide,
     category: 'development' | 'design' | 'data' | 'productivity',
     config: {
       command: 'npx',
       args: ['-y', '@scope/package-name'],
       env: { API_KEY: '' },  // if auth required
     },
     envHint: 'Where to get the API key',  // optional
   }
   ```

2. **Add default server** (optional) — Add to `server/services/mcp.ts` → `DEFAULT_SERVERS` if it should be pre-configured for new projects

3. **Verify** — Run `npx tsc --noEmit`

## Categories
- `development` — Code tools, CLIs, docs
- `design` — Figma, design systems
- `data` — Databases, storage, memory
- `productivity` — Slack, email, calendar
