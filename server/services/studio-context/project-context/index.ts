import { ProjectContextBuilder } from "./project-context-builder.js";
import { ProjectContextCache } from "./context-cache.js";

export { ProjectContextBuilder } from "./project-context-builder.js";
export { ProjectContextCache } from "./context-cache.js";
export { scanTree } from "./tree-scanner.js";
export { readKeyFiles, type KeyFile } from "./key-files-reader.js";
export * from "./constants.js";

/**
 * Default per-process builder + cache. Keeping a shared instance here
 * preserves the original one-function public API (`getProjectContext`)
 * and guarantees cache hits across call sites for the same project root.
 */
const defaultBuilder = new ProjectContextBuilder();
const defaultCache = new ProjectContextCache();

/**
 * Generate the project context block for a given project root.
 *
 * Shape preserved verbatim from the pre-refactor `getProjectContext` —
 * consumers (single-chat IPC, PM runner, agent base) don't need to change.
 * Under the hood: TTL cache → ProjectContextBuilder → (TreeScanner +
 * KeyFilesReader + Graphify + KnowledgeManager).
 */
export function getProjectContext(projectRoot: string): string {
  const cached = defaultCache.get(projectRoot);
  if (cached !== null) return cached;

  const built = defaultBuilder.build(projectRoot);
  defaultCache.set(projectRoot, built);
  return built;
}

/**
 * For tests or callers that want an isolated instance — build a fresh
 * builder + cache without touching the default singletons.
 */
export function createProjectContextProvider(
  builder: ProjectContextBuilder = new ProjectContextBuilder(),
  cache: ProjectContextCache = new ProjectContextCache(),
) {
  return (projectRoot: string): string => {
    const cached = cache.get(projectRoot);
    if (cached !== null) return cached;
    const built = builder.build(projectRoot);
    cache.set(projectRoot, built);
    return built;
  };
}
