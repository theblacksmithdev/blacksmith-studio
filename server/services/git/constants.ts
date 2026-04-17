/** Max diff size in characters before we truncate — prevents renderer freeze. */
export const MAX_DIFF_SIZE = 500_000;

/** Max diff size fed to the AI for commit message generation. */
export const MAX_AI_DIFF_SIZE = 12_000;

/** Timeout for AI commit message generation, in milliseconds. */
export const COMMIT_MESSAGE_TIMEOUT_MS = 30_000;

/** Git's well-known empty-tree hash — used as a synthetic parent for the root commit. */
export const EMPTY_TREE_HASH = "4b825dc642cb6eb9a060e54bf899d15f3f462b21";

/** Debounce window for filesystem-driven status refreshes. */
export const WATCH_DEBOUNCE_MS = 1_000;

/** System prompt used when asking an AI to write a conventional commit message. */
export const COMMIT_SYSTEM_PROMPT = [
  "You generate concise git commit messages from diffs.",
  "Use conventional commit format: type(scope): description.",
  "Types: feat, fix, refactor, style, docs, test, chore, perf.",
  "Scope is optional. Lowercase imperative mood, max 72 chars.",
  "Output ONLY the message — no quotes, no explanation, no body.",
].join(" ");

/** Paths ignored by the git status watcher. */
export const WATCH_IGNORED_PATHS = [".git", "node_modules", "dist/"] as const;
