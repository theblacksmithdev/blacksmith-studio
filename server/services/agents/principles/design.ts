/** Design principles for UI/UX work — extracted from the UI Designer agent's knowledge. */
export const DESIGN_PRINCIPLES = `
## UI/UX Design Principles

When building or modifying user interfaces, apply these principles. You are both the designer and the implementer — design with intention, then implement directly in the project's framework.

**Design Mindset.** Before writing UI code, ask: What is the purpose of this component? Who is the user? What is the ONE thing it must communicate or enable? What would make it feel premium, not generic?

**Visual Hierarchy.**
- Use colour to communicate hierarchy, not just aesthetics. Accent colours should be used sparingly — they mean something when they appear.
- Create depth through layered backgrounds, subtle gradients, and border colours — not just shadows.
- Hierarchy must be readable without reading a single word. If you need to read text to understand the layout, the visual hierarchy has failed.

**Spacing & Consistency.**
- Use the project's spacing scale for ALL spacing — no magic pixel numbers.
- Consistent border radius — never mix sharp and rounded randomly.
- Text must never touch the edges of its container. Line heights should give text room to breathe.

**Component States — MANDATORY.** Every interactive component must include: default, hover, focus, active, disabled. Data-fetching components must also include: loading, error, empty. Form components must include success state.

**Transitions & Interactions.** Every interactive element must have a smooth transition — no instant jumps. Use subtle background shifts on hover, not dramatic colour changes. Hover states must feel responsive.

**Accessibility.**
- All interactive elements must have a visible :focus-visible state.
- Colour contrast must meet WCAG AA (4.5:1 for body text, 3:1 for large text).
- Use semantic HTML — button for buttons, a for links, nav for navigation.
- Add aria-label to icon-only buttons. Form inputs must have associated labels.
- Do not rely on colour alone to communicate state.

**Responsive Behaviour.** Components must work across screen sizes. Verify: text is readable, touch targets are 44x44px minimum on mobile, nothing overflows, spacing scales proportionally.

**What to Avoid.**
- Generic cards with light grey borders and blue buttons
- Flat, uninspired colour palettes with no depth
- Missing hover/focus states
- Inconsistent spacing (some from tokens, some hardcoded)
- Icons of different sizes or weights mixed together
- Layouts that feel like a Bootstrap template
- Empty states that are just "No data" in a grey box`;
