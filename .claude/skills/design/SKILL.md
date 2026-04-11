---
name: design
description: Design and build UI following Blacksmith Studio's Chakra UI design system
---

# Design System Guide

Blacksmith Studio uses **Chakra UI v3** as its primary design system. Always use Chakra components first. Fall back to Emotion `styled` only when Chakra doesn't offer the component or when you need deeply custom interactive states.

**MCP**: The `chakra-ui-docs` MCP server is configured — use it to look up Chakra UI component APIs, props, and patterns before building.

## Core Principle: Chakra First

```tsx
// GOOD — use Chakra components
import { Box, Flex, Text, Button, Input, VStack, HStack } from '@chakra-ui/react'

<VStack gap={4} align="stretch">
  <Text fontSize="15px" fontWeight={600} color="var(--studio-text-primary)">Title</Text>
  <Input placeholder="Enter value..." />
  <Button>Save</Button>
</VStack>

// ONLY when Chakra doesn't cover it — use Emotion styled
import styled from '@emotion/styled'

const CustomToggle = styled.button<{ active: boolean }>`
  /* complex variant logic that Chakra can't express cleanly */
`
```

## When to use what

| Need | Use | Why |
|------|-----|-----|
| Layout (flex, grid, spacing) | Chakra `Box`, `Flex`, `HStack`, `VStack`, `Grid` | Built-in responsive + gap props |
| Typography | Chakra `Text`, `Heading` | Consistent font sizing |
| Form inputs | Chakra `Input`, `Textarea`, `Field`, `NativeSelect` | Accessible, styled |
| Buttons | Chakra `Button` or shared `PrimaryButton`/`SecondaryButton` | Consistent variants |
| Dialogs/Modals | Shared `Modal` from `@/components/shared/modal` | Portal, backdrop, header/footer pattern |
| Confirmations | Shared `ConfirmDialog` from `@/components/shared/confirm-dialog` | Consistent destructive action UX |
| Tooltips | Shared `Tooltip` from `@/components/shared/tooltip` | Styled to match theme |
| Resizable panels | Chakra `Splitter` | Built-in drag + keyboard support |
| Toggles | Shared `Toggle` from `@/components/shared/form-controls` | iOS-style switch |
| Form fields | Shared `FormField`, `FormLabel`, `FormInput`, etc. from `@/components/shared/form-controls` | Consistent form layout |
| Badges | Shared `Badge` from `@/components/shared/form-controls` | Status tags with variants |
| Custom interactive components | Emotion `styled` | Complex hover/active/variant states |

## Shared Components Library

Always check `client/src/components/shared/` before building new UI:

```
shared/
  modal.tsx          — Modal, PrimaryButton, SecondaryButton, GhostButton, DangerButton, FooterSpacer
  confirm-dialog.tsx — ConfirmDialog (destructive action confirmation)
  form-controls.tsx  — FormField, FormLabel, FormInput, FormTextarea, SegmentedControl,
                       Toggle, KvRow, KvInput, CodeBlock, Badge
  tooltip.tsx        — Tooltip (Chakra-based, themed)
  empty-state.tsx    — EmptyState (icon + title + description)
  page-container.tsx — PageContainer (centered max-width wrapper)
  preview-panel.tsx  — PreviewPanel (iframe preview with header)
```

### Using the shared Modal

```tsx
import { Modal, PrimaryButton, GhostButton, FooterSpacer } from '@/components/shared/modal'

<Modal
  title="Add Server"
  onClose={handleClose}
  width="560px"
  footer={
    <>
      <FooterSpacer />
      <GhostButton onClick={handleClose}>Cancel</GhostButton>
      <PrimaryButton onClick={handleSave} disabled={!isValid}>Save</PrimaryButton>
    </>
  }
>
  {/* body content */}
</Modal>
```

### Using the shared ConfirmDialog

```tsx
import { ConfirmDialog } from '@/components/shared/confirm-dialog'

{showConfirm && (
  <ConfirmDialog
    message="Delete this server?"
    description="This action cannot be undone."
    confirmLabel="Delete"
    onConfirm={handleDelete}
    onCancel={() => setShowConfirm(false)}
  />
)}
```

### Using shared form controls

```tsx
import { FormField, FormLabel, FormInput, FormHint, Toggle, Badge } from '@/components/shared/form-controls'

<FormField>
  <FormLabel>Server Name</FormLabel>
  <FormInput value={name} onChange={e => setName(e.target.value)} placeholder="e.g. github" />
  <FormHint>Alphanumeric and hyphens only</FormHint>
</FormField>
```

## Chakra UI Component Usage

### Layout

```tsx
// Vertical stack with gap
<VStack gap={4} align="stretch">...</VStack>

// Horizontal stack
<HStack gap={3}>...</HStack>

// Flex with justify
<Flex justify="space-between" align="center">...</Flex>

// Grid
<Grid templateColumns="repeat(2, 1fr)" gap={3}>...</Grid>

// Box as semantic wrapper
<Box as="nav" css={{ width: '56px', borderRight: '1px solid var(--studio-border)' }}>
```

### Chakra Splitter (resizable panels)

```tsx
import { Splitter } from '@chakra-ui/react'

<Splitter.Root
  panels={[{ id: 'main', minSize: 30 }, { id: 'side', minSize: 20 }]}
  defaultSize={[60, 40]}
  orientation="horizontal"
  onResizeEnd={(details) => saveSplit(details.size)}
>
  <Splitter.Panel id="main">{mainContent}</Splitter.Panel>
  <Splitter.ResizeTrigger id="main:side" css={resizeTriggerCss} />
  <Splitter.Panel id="side">{sideContent}</Splitter.Panel>
</Splitter.Root>
```

### Chakra Dialog

```tsx
import { Dialog } from '@chakra-ui/react'

// Prefer shared Modal component over raw Dialog for consistency
// Use Dialog directly only for Chakra-specific features (animations, focus trapping)
```

## Color System

All colors use CSS custom properties. Never hardcode hex values.

```
Backgrounds:
  --studio-bg-main          Main content background
  --studio-bg-sidebar       Sidebar/panel background
  --studio-bg-surface       Elevated surface (cards, inputs)
  --studio-bg-hover         Hover state
  --studio-bg-hover-strong  Active/pressed state
  --studio-bg-inset         Inset/recessed areas (log panels)

Text:
  --studio-text-primary     Main text
  --studio-text-secondary   Secondary text
  --studio-text-tertiary    Labels, descriptions
  --studio-text-muted       Placeholder, disabled text

Borders:
  --studio-border           Default border
  --studio-border-hover     Hover/focus border

Accent:
  --studio-accent           Primary accent (black in light, white in dark)
  --studio-accent-fg        Text on accent background

Semantic:
  --studio-error            Error red (#ef4444)
  --studio-warning          Warning amber (#f59e0b)
  --studio-link             Link blue
  --studio-green            Brand green accent (#10a37f)

Utilities:
  --studio-shadow           Box shadow
  --studio-scrollbar        Scrollbar color
```

**Monochrome design language:**
- Status indicators use `--studio-accent` (not green)
- Active states use background changes, not color changes
- `--studio-green` is the brand accent — used for AI/agent indicators and highlights

## Typography

```
Font family:  -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif (native system font)
Mono font:    'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace

Sizes:
  22px  — Page titles (font-weight: 600, letter-spacing: -0.02em)
  15px  — Section titles (font-weight: 600)
  14px  — Body text, inputs
  13px  — Labels, buttons, nav items (font-weight: 500)
  12px  — Secondary text, descriptions
  11px  — Section labels (uppercase, letter-spacing: 0.06-0.08em)
  10px  — Badges, line counts
```

## Spacing & Sizing

```
Border radius:
  16px  — Large cards, modals
  12px  — Cards, containers
  10px  — Buttons, inputs, rows
  8px   — Small buttons, tags
  6px   — Tiny elements
  50%   — Circles (avatars, dots)

Padding:       20 / 16 / 14 / 12 / 10 / 8px
Gap:           24 / 16 / 12 / 8 / 6 / 4px
```

## Interactive States

```css
transition: all 0.12s ease;                             /* standard */
transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1);  /* spring */
animation: fadeIn 0.15s ease;                            /* entrance */

/* Hover */     background: var(--studio-bg-hover);
/* Disabled */  opacity: 0.5; cursor: default;
/* Focus */     border-color: var(--studio-border-hover);
```

## Icons

Use **Lucide React** (`lucide-react`). Sizes: 12-13px (inline), 14-15px (buttons), 16-18px (cards), 20-22px (empty states). Always `flexShrink: 0` in flex containers.

## File Organization

```
component/
  index.ts           — barrel export
  component.tsx      — main component
  sub-component.tsx  — extracted sub-components
```

Extract sub-components when a file exceeds ~200 lines. Use modular folder structure for major features.

## Checklist Before Building UI

1. Check Chakra UI docs (via MCP) for existing components that solve the need
2. Check `client/src/components/shared/` for reusable components
3. Use CSS custom properties for all colors
4. Use shared `Modal` for dialogs, `ConfirmDialog` for destructive actions
5. Use shared form controls for form fields
6. Use `createPortal` for anything that overlays (modals, tooltips, popovers)
7. Never close modals on backdrop click
8. Add `font-family: inherit` on all buttons and inputs
9. Run `npx tsc --noEmit` to verify

## Do NOT

- Build custom modals from scratch — use shared `Modal`
- Build custom form inputs from scratch — use shared `FormInput`
- Use hardcoded colors — use CSS variables
- Use Tailwind or inline `style={{}}` — use Chakra or Emotion styled
- Create green/blue status indicators — use monochrome `--studio-accent`
- Close modals on backdrop click — only via explicit close button
- Skip checking Chakra UI docs via MCP before building custom components
- Duplicate components that already exist in `shared/`

$ARGUMENTS
