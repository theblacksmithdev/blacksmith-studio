---
name: design
description: Design and build UI following Blacksmith Studio's Chakra UI design system
---

# Design System Guide

Blacksmith Studio uses **Chakra UI v3** as its primary design system. Always use Chakra components first. Fall back to Emotion `styled` only when Chakra doesn't offer the component or when you need deeply custom interactive states.

**MCP**: The `chakra-ui-docs` MCP server is configured — use it to look up Chakra UI component APIs, props, and patterns before building.

## Core Principle: Design System First

**Always use the design system components** from `@/components/shared/ui` before reaching for raw Chakra or Emotion styled. These components lock down our tokens and ensure visual consistency.

```tsx
// BEST — use design system components
import { Text, Button, Badge, Card, Input, Avatar, StatusDot, Chip, Divider, IconButton } from '@/components/shared/ui'

<Card variant="interactive">
  <Text variant="title">Panel Title</Text>
  <Text variant="body" color="secondary">Description here</Text>
  <Button variant="primary" size="md">Save</Button>
</Card>

// GOOD — use Chakra for layout
import { Box, Flex, VStack, HStack } from '@chakra-ui/react'

<VStack gap={4} align="stretch">
  <Text variant="subtitle">Section</Text>
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
  --studio-shadow-lg        Large elevated shadow
  --studio-scrollbar        Scrollbar color
  --studio-glass            Glass surface background
  --studio-glass-border     Glass surface border
  --studio-backdrop         Overlay backdrop
  --studio-ring-focus       Focus ring shadow
```

## UI Components (`@/components/shared/ui`)

All components use Chakra UI as base. Import from `@/components/shared/ui`.

### Text
`<Text variant="body" color="secondary">...</Text>`
Variants: `display` (32px) | `heading` (24px) | `title` (17px) | `subtitle` (15px) | `body` (14px) | `bodySmall` (13px) | `label` (12px) | `caption` (11px) | `tiny` (10px) | `code` | `codeBlock` | `sectionLabel`
Color: `primary` | `secondary` | `tertiary` | `muted` | `error` | `success` | `inherit`
Props: `truncate`, `as`

### Button
`<Button variant="primary" size="md">Save</Button>`
Variants: `primary` | `secondary` | `ghost` | `danger`
Sizes: `sm` | `md` | `lg`

### IconButton
`<IconButton variant="ghost" size="sm"><X /></IconButton>`
Variants: `default` | `ghost` | `danger`
Sizes: `xs` | `sm` | `md`

### Badge
`<Badge variant="success" size="sm">Active</Badge>`
Variants: `default` | `success` | `error` | `warning` | `info` | `outline`
Sizes: `sm` | `md`

### StatusDot
`<StatusDot status="active" size="sm" />`
Status: `idle` | `active` | `done` | `error`
Sizes: `xs` | `sm` | `md`
Props: `animated` (pulse on active, default true)

### Card
`<Card variant="interactive">...</Card>`
Variants: `default` | `interactive` (hover) | `inset` | `glass` (blur)
Props: `p` (override padding)

### Divider
`<Divider variant="fade" spacing="12px" />`
Variants: `full` | `fade` (gradient) | `short` (centered 40px)
Props: `spacing`

### Input
`<Input size="md" placeholder="Search..." />`
Sizes: `sm` | `md`
Focus ring and border states built in.

### Avatar
`<Avatar size="sm" variant="active" icon={<Server />} />`
Variants: `default` | `active` (green) | `user` (accent)
Sizes: `xs` | `sm` | `md` | `lg`

### Chip
`<Chip variant="default" onClick={fn}>Quick action</Chip>`
Variants: `default` | `active` | `success`

## Design Tokens (`@/components/shared/ui/tokens`)

```tsx
import { spacing, radii, sizes, shadows } from '@/components/shared/ui'

// Spacing — named sizes (4px base unit)
spacing.none   // '0'
spacing['2xs'] // '2px'
spacing.xs     // '4px'
spacing.sm     // '8px'
spacing.md     // '12px'
spacing.lg     // '16px'
spacing.xl     // '20px'
spacing['2xl'] // '24px'
spacing['3xl'] // '32px'
spacing['4xl'] // '40px'

// Border radius
radii.xs   // '4px'   — badges, small elements
radii.sm   // '6px'   — buttons, close buttons
radii.md   // '8px'   — inputs, cards
radii.lg   // '10px'  — panels, dropdowns
radii.xl   // '12px'  — large cards
radii['2xl'] // '14px' — modals
radii['3xl'] // '16px' — hero cards
radii.full // '9999px' — pills, chips

// Component sizes
sizes.icon.{xs|sm|md|lg}       — icon button / avatar
sizes.control.{sm|md|lg}       — input / button heights
sizes.panel.{sm|md|lg}         — panel widths
sizes.content.{narrow|default|wide} — max-widths

// Shadows
shadows.sm    // var(--studio-shadow)
shadows.lg    // var(--studio-shadow-lg)
shadows.focus // var(--studio-ring-focus)
```

**Rule: Use tokens instead of magic numbers.** If you need `padding: '16px'`, write `padding: spacing.lg`. If you need `borderRadius: '10px'`, write `borderRadius: radii.lg`.

**Monochrome design language:**
- Status indicators use `--studio-accent` (not green)
- Active states use background changes, not color changes
- `--studio-green` is the brand accent — used for AI/agent indicators and highlights

## Typography

```
Font family:  'Outfit', -apple-system, BlinkMacSystemFont, sans-serif
Mono font:    'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace
```

**Typography** — use `<Text variant="...">` from `@/components/shared/ui/typography`:

```tsx
import { Text } from '@/components/shared/ui/typography'

<Text variant="display">Hero</Text>           // 32px/700
<Text variant="heading">Page Title</Text>     // 24px/600
<Text variant="title">Panel Header</Text>     // 17px/600
<Text variant="subtitle">Subheading</Text>    // 15px/600
<Text variant="body">Body text</Text>         // 14px/400 (default)
<Text variant="bodySmall">Small text</Text>   // 13px/400
<Text variant="label">Label</Text>            // 12px/500
<Text variant="caption">Timestamp</Text>      // 11px/450
<Text variant="tiny">SECTION</Text>           // 10px/600 uppercase
<Text variant="code">npm install</Text>       // 13px mono inline
<Text variant="codeBlock">code here</Text>    // 13px mono block
<Text variant="sectionLabel">Activity</Text>  // 10px/600 uppercase + margin

// Color prop: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'error' | 'success' | 'inherit'
<Text variant="body" color="secondary">Muted description</Text>

// Truncate prop for ellipsis
<Text variant="label" truncate>Very long text here...</Text>

// Custom element via as prop
<Text variant="title" as="span">Inline title</Text>
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
