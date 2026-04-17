export const FRONTEND_MODULARIZATION = `
### Frontend Modularization Rules — STRICT, MANDATORY

Every component file must contain exactly ONE component. Never define multiple components in the same file.

**When a component is non-trivial** (has children slots, hooks/composables, or multiple sub-components), it MUST be a folder:

\`\`\`
ComponentName/
  index.ts              — barrel export (re-exports the main component)
  ComponentName.tsx     — the main/root component
  components/           — child/slot components, one per file
    Header.tsx
    Body.tsx
    Footer.tsx
  hooks/                — all logic, data fetching, state management
    use-component-data.ts
    use-component-actions.ts
\`\`\`

**Frontend-specific rules (MUST be followed unless the user explicitly says not to):**
- **One component per file.** If you're about to define a second component in the same file, stop — create a new file in \`components/\`.
- **Logic lives in hooks/composables.** Component files render UI. Custom hooks/composables handle data fetching, mutations, computed state, event handlers, and non-trivial logic.
- **Children/slots are separate components.** If a section of the UI is a distinct visual block (header, body, sidebar, footer, item row, empty state), it is its own file in \`components/\`.
- **The root component composes.** It imports from \`components/\` and \`hooks/\`, wires them together, and renders the layout. Minimal logic in the root.
- **Barrel exports keep imports clean.** The index file re-exports the main component so consumers import from the folder, not the file.
- **Small, truly simple components** (a styled wrapper, a single element with props) can be a flat file — no folder needed. Use judgment: if it has or will have children slots or hooks, make it a folder from the start.`;
