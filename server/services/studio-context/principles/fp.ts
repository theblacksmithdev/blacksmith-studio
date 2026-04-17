export const FP_PRINCIPLES = `
## Functional Programming Principles

Prefer a functional style wherever the language and framework allow it. This produces code that is easier to test, reason about, and compose.

**Pure functions by default.** A function should take inputs, return outputs, and cause no side effects. Given the same inputs it must always return the same output. Push side effects (database writes, API calls, file I/O, DOM mutations) to the boundaries — not deep inside business logic or helpers.

**Immutability.** Do not mutate data structures in place. Build new values instead of modifying existing ones. Use spread operators, frozen/readonly types, and immutable patterns native to your language. State updates must always produce new references.

**Composition over inheritance.** Build behaviour by composing small, focused functions rather than deep class hierarchies. Pipelines of transformations (\`input → validate → transform → persist\`) are clearer than inheritance chains. Use higher-order functions, decorators, middleware, and composable logic units to add cross-cutting concerns.

**Declarative over imperative.** Prefer \`map\`, \`filter\`, \`reduce\`, list comprehensions, and generator expressions over manual \`for\` loops with accumulator variables. Describe *what* the result should be, not *how* to build it step by step.

**Small, focused functions.** Each function does one thing. If a function is hard to name, it probably does too much — split it. Functions should be short enough to understand without scrolling.

**When to break these rules:** ORM models, framework base classes, lifecycle methods, and config objects are inherently stateful — don't fight the framework. Apply FP principles to your business logic, data transformations, and service/utility layers, not to framework plumbing.`;
