---
name: typecheck
description: Run TypeScript type checking and fix any errors
---

# Type Check

Run the TypeScript compiler to check for errors and fix them.

## Steps

1. Run `npx tsc --noEmit`
2. If errors found in files we changed, fix them
3. Ignore pre-existing errors in files we didn't touch (e.g., `theme.ts`, `setting-select.tsx`)
4. Re-run until our files are clean
