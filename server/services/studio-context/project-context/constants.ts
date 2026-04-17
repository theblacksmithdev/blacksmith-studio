/** Directories excluded from the project tree walk. */
export const IGNORED_DIRS: ReadonlySet<string> = new Set([
  "node_modules",
  ".git",
  "__pycache__",
  "venv",
  "dist",
  ".env",
  ".blacksmith-studio",
  ".claude",
  ".vscode",
  ".idea",
  "htmlcov",
  ".pytest_cache",
  ".mypy_cache",
  "build",
  "egg-info",
  "migrations",
  "static",
  "media",
  ".next",
  ".nuxt",
]);

/** Config/context filenames we surface inline in the context block. */
export const KEY_FILES: readonly string[] = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "blacksmith.config.json",
  "CLAUDE.md",
  "README.md",
  "tsconfig.json",
  "vite.config.ts",
  "next.config.js",
  "manage.py",
  "settings.py",
  "urls.py",
];

/** Subdirectories to probe for nested KEY_FILES (e.g. `backend/settings.py`). */
export const NESTED_KEY_FILE_DIRS: readonly string[] = [
  "config",
  "backend",
  "server",
  "src",
];

/** File extensions included in the project-tree listing. */
export const CODE_EXTENSIONS: ReadonlySet<string> = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".css",
  ".html",
  ".json",
  ".yaml",
  ".yml",
]);

/** Skip key files larger than this — their content would blow the prompt. */
export const MAX_KEY_FILE_BYTES = 8_192;

/** Tree depth when a graph report IS available. */
export const TREE_DEPTH_WITH_GRAPH = 2;

/** Tree depth when no graph report is available. */
export const TREE_DEPTH_WITHOUT_GRAPH = 3;

/** Per-project TTL for the generated context. */
export const CONTEXT_CACHE_TTL_MS = 60_000;
