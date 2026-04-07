---
name: add-page
description: Add a new page/route to the app
---

# Add Page

Create a new page: $ARGUMENTS

## Steps

1. **Page component** — Create `client/src/pages/{name}/index.tsx`:
   - Export default function component
   - Use Emotion `styled` components for layout
   - Follow patterns from existing pages

2. **Route** — Add to `client/src/router/index.tsx`:
   - Project-scoped: under `/:projectId` in `ProjectLayout` children
   - Global: under `AppLayout` children

3. **Path helper** — Add to `client/src/router/paths.ts`:
   ```ts
   export const {name}Path = (pid: string) => `/${pid}/{name}`
   ```

4. **Navigation** (if needed):
   - Add to sidebar: `client/src/components/layout/sidebar/nav-config.ts`
   - Or add to user menu: `client/src/components/layout/sidebar/user-menu.tsx`

5. **Verify** — Run `npx tsc --noEmit`
