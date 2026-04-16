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

/** All three principles combined for convenience */
export const ENGINEERING_PRINCIPLES = `${MODULARIZATION_PRINCIPLE}
${FP_PRINCIPLES}
${SOLID_PRINCIPLES}`;
