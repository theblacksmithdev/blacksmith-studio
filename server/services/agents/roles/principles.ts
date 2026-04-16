/**
 * Shared engineering principles appended to developer role system prompts.
 * These are framework-agnostic — each role adds its own framework-specific
 * examples and context around these core principles.
 */

export const MODULARIZATION_PRINCIPLE = `
## Code Modularization — STRICT

This follows the **"Replace Module with Package"** pattern (also known as "exploded modules" or "modular packages") — a direct application of the Single Responsibility Principle at the file level. Instead of one file accumulating multiple unrelated definitions, you split it into a folder where each file owns one definition, with a barrel (index/\`__init__.py\`/\`index.ts\`) preserving the original public API. This applies recursively — if a sub-module grows, split it further. The pattern is framework-agnostic and applies to any language or stack.

**The principle:** One definition per file. A folder with an index/barrel replaces the monolithic file. The folder's public API stays identical to what the single file exported.`;

export const FP_PRINCIPLES = `
## Functional Programming Principles

Prefer a functional style wherever the language and framework allow it. This produces code that is easier to test, reason about, and compose.

**Pure functions by default.** A function should take inputs, return outputs, and cause no side effects. Given the same inputs it must always return the same output. Push side effects (database writes, API calls, file I/O, DOM mutations) to the boundaries — not deep inside business logic or helpers.

**Immutability.** Do not mutate data structures in place. Build new values instead of modifying existing ones. Use spread operators, frozen/readonly types, and immutable patterns native to your language. State updates must always produce new references.

**Composition over inheritance.** Build behaviour by composing small, focused functions rather than deep class hierarchies. Pipelines of transformations (\`input → validate → transform → persist\`) are clearer than inheritance chains. Use higher-order functions, decorators, middleware, and composable logic units to add cross-cutting concerns.

**Declarative over imperative.** Prefer \`map\`, \`filter\`, \`reduce\`, list comprehensions, and generator expressions over manual \`for\` loops with accumulator variables. Describe *what* the result should be, not *how* to build it step by step.

**Small, focused functions.** Each function does one thing. If a function is hard to name, it probably does too much — split it. Functions should be short enough to understand without scrolling.

**When to break these rules:** ORM models, framework base classes, lifecycle methods, and config objects are inherently stateful — don't fight the framework. Apply FP principles to your business logic, data transformations, and service/utility layers, not to framework plumbing.`;

export const SOLID_PRINCIPLES = `
## SOLID Principles

Apply SOLID as a design compass. These principles are language-agnostic — whether the project uses classes, modules, or plain functions, the underlying ideas apply.

**S — Single Responsibility.** Every module, class, or function should have one reason to change. If you find yourself writing "and" to describe what something does, split it.

**O — Open/Closed.** Code should be open for extension, closed for modification. Use strategy patterns, plugin registries, middleware chains, composition, or dependency injection so new behaviour can be added without editing existing code. Configuration-driven behaviour over hardcoded conditionals.

**L — Liskov Substitution.** Any subclass, implementation, or duck-typed object must be usable wherever its parent/interface is expected without breaking behaviour. Every implementation of a contract must honour the same inputs, return shape, and error semantics. Violations usually surface as \`instanceof\` checks or type-switching in consumer code — if you see those, the abstraction is leaking.

**I — Interface Segregation.** Don't force consumers to depend on methods or props they don't use. Prefer small, focused interfaces over large ones. A class with 15 methods or a component with 20 props should probably be split into focused units.

**D — Dependency Inversion.** High-level business logic should not depend on low-level implementation details. Both should depend on abstractions. Inject dependencies rather than importing and instantiating concrete implementations inside business logic. This makes code testable (swap real services for mocks) and flexible (swap implementations without touching consumers).

**Practical application:** You don't need to create an interface for every function. Apply SOLID at the seams — where modules interact, where services call other services, where external systems are integrated. Internal implementation details can be simple and direct.`;

/** All three engineering principles combined */
export const ENGINEERING_PRINCIPLES = `${MODULARIZATION_PRINCIPLE}
${FP_PRINCIPLES}
${SOLID_PRINCIPLES}`;

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

/** All principles combined — engineering + design */
export const ALL_PRINCIPLES = `${ENGINEERING_PRINCIPLES}
${DESIGN_PRINCIPLES}`;
