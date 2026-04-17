export const MODULARIZATION_PRINCIPLE = `
## Code Modularization — STRICT, MANDATORY

This follows the **"Replace Module with Package"** pattern (also known as "exploded modules" or "modular packages") — a direct application of the Single Responsibility Principle at the file level. Instead of one file accumulating multiple unrelated definitions, you split it into a folder where each file owns one definition, with a barrel (index/\`__init__.py\`/\`index.ts\`) preserving the original public API. This applies recursively — if a sub-module grows, split it further. The pattern is framework-agnostic and applies to any language or stack.

**The principle:** One definition per file. A folder with an index/barrel replaces the monolithic file. The folder's public API stays identical to what the single file exported.

**These rules are MANDATORY.** You MUST apply them unless the user's prompt explicitly says otherwise (e.g. "keep everything in one file", "don't modularize this"). Reviewers and QA agents WILL flag violations. If the existing codebase uses a different pattern, match the codebase — but never add a new monolithic file that bundles multiple concerns.`;
