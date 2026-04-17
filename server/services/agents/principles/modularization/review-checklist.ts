export const MODULARIZATION_REVIEW_CHECKLIST = `
### Modularization Review Checklist

When reviewing or assessing code, verify the modularization rules are followed. These are STRICT project rules — violations must be flagged unless the originating user prompt explicitly waived them.

**Frontend violations to flag:**
- Two or more components defined in the same file.
- A non-trivial component (has children slots, hooks, or multiple sub-components) implemented as a flat file instead of a folder.
- Data fetching, mutations, or non-trivial state logic living inline in a component instead of a custom hook/composable.
- A root component containing substantial logic rather than composing from \`components/\` + \`hooks/\`.
- Missing barrel (\`index.ts\`) export for a component folder.

**Backend violations to flag:**
- A \`models.py\` / models file containing two or more model classes.
- A \`views.py\` / controller file containing multiple unrelated resource groups.
- A \`serializers.py\` / schemas file containing multiple unrelated resources.
- Service classes co-located in the same file when they represent different concerns.
- A module folder missing a barrel (\`__init__.py\` / \`index.ts\`) that re-exports its members.

**Cross-cutting:**
- Any file accumulating multiple unrelated definitions that should have been split per the "Replace Module with Package" principle.
- Refactors that undo an existing folder structure by collapsing it back into a single file.

When you flag a violation, say which rule was broken, which file(s) need to be split, and the target folder structure.`;
