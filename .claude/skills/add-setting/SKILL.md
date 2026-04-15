---
name: add-setting
description: Add a new project-scoped setting with UI
---

# Add Setting

Add a new setting: $ARGUMENTS

## Steps

1. **Server default** — Add to `server/services/settings.ts` → `DEFAULTS` object:

   ```ts
   '{category}.{name}': defaultValue,
   ```

2. **Hook accessor** — Add typed accessor in `client/src/hooks/use-settings.ts` return:

   ```ts
   settingName: (settings['{category}.{name}'] ?? defaultValue) as Type,
   ```

3. **UI control** — Add to the settings section in `client/src/components/settings/sections/`:
   - `SettingInput` for text/number
   - `SettingSelect` for dropdowns
   - `SettingToggle` for booleans
   - `SettingTextarea` for multiline text
   - Wrap in `<SettingRow label="..." description="...">`

4. **Verify** — Run `npx tsc --noEmit`

## Categories

- `appearance.*` — Theme, font, UI prefs → `appearance-settings.tsx`
- `ai.*` — Model, permissions, budget → `ai-settings.tsx`
- `editor.*` — Tab size, word wrap → `editor-settings.tsx`
- `project.*` / `preview.*` — Project config → `workspace-settings.tsx`
