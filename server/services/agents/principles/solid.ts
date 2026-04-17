export const SOLID_PRINCIPLES = `
## SOLID Principles

Apply SOLID as a design compass. These principles are language-agnostic — whether the project uses classes, modules, or plain functions, the underlying ideas apply.

**S — Single Responsibility.** Every module, class, or function should have one reason to change. If you find yourself writing "and" to describe what something does, split it.

**O — Open/Closed.** Code should be open for extension, closed for modification. Use strategy patterns, plugin registries, middleware chains, composition, or dependency injection so new behaviour can be added without editing existing code. Configuration-driven behaviour over hardcoded conditionals.

**L — Liskov Substitution.** Any subclass, implementation, or duck-typed object must be usable wherever its parent/interface is expected without breaking behaviour. Every implementation of a contract must honour the same inputs, return shape, and error semantics. Violations usually surface as \`instanceof\` checks or type-switching in consumer code — if you see those, the abstraction is leaking.

**I — Interface Segregation.** Don't force consumers to depend on methods or props they don't use. Prefer small, focused interfaces over large ones. A class with 15 methods or a component with 20 props should probably be split into focused units.

**D — Dependency Inversion.** High-level business logic should not depend on low-level implementation details. Both should depend on abstractions. Inject dependencies rather than importing and instantiating concrete implementations inside business logic. This makes code testable (swap real services for mocks) and flexible (swap implementations without touching consumers).

**Practical application:** You don't need to create an interface for every function. Apply SOLID at the seams — where modules interact, where services call other services, where external systems are integrated. Internal implementation details can be simple and direct.`;
