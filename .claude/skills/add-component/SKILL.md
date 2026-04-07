---
name: add-component
description: Create a new modular UI component with proper folder structure
---

# Add Component

Create a new component: $ARGUMENTS

## Steps

1. **Create folder** — `client/src/components/{feature}/{name}/`

2. **Create files**:
   - `{name}.tsx` — Main component (Emotion styled, no Chakra css prop)
   - `index.ts` — Barrel export
   - Additional sub-components as needed

3. **Styling conventions**:
   - Use `styled` from `@emotion/styled`
   - Colors: `var(--studio-bg-main)`, `var(--studio-text-primary)`, etc.
   - Transitions: `transition: all 0.12s ease`
   - Border radius: 8-12px for cards, 6-8px for buttons
   - Font: `font-family: inherit` on buttons

4. **State management**:
   - Server state: React Query via `client/src/hooks/use-{feature}.ts`
   - Client state: Zustand via `client/src/stores/{feature}-store.ts`
   - UI state: `client/src/stores/ui-store.ts`

5. **Portal pattern** — For modals/popovers, use `createPortal(content, document.body)`:
   - Prevents clipping from parent `overflow: hidden`
   - Position with `getBoundingClientRect()` for anchored elements

6. **Verify** — Run `npx tsc --noEmit`
