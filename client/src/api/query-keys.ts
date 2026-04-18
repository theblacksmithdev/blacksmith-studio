/** Keys for global (non-project-scoped) queries */
const global = {
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  browse: (path?: string) => ["browse", path ?? "~"] as const,
  projectValidation: (path: string) =>
    ["projects", "validation", path] as const,
  health: ["health"] as const,
  nodeInstallations: ["runner", "nodeInstallations"] as const,
};

/** Keys for project-scoped queries — all include the project ID so switching projects gets a fresh cache */
function projectKeys(projectId: string) {
  const p = ["project", projectId] as const;
  return {
    sessions: [...p, "sessions"] as const,
    session: (id: string) => [...p, "sessions", id] as const,
    files: [...p, "files"] as const,
    fileContent: (path: string) => [...p, "files", "content", path] as const,
    templates: [...p, "templates"] as const,
    settings: [...p, "settings"] as const,
    mcp: [...p, "mcp"] as const,
    skills: [...p, "skills"] as const,
    knowledge: [...p, "knowledge"] as const,
    gitStatus: [...p, "git", "status"] as const,
    gitChangedFiles: [...p, "git", "changedFiles"] as const,
    gitHistory: [...p, "git", "history"] as const,
    gitBranches: [...p, "git", "versions"] as const,
    gitSyncStatus: [...p, "git", "syncStatus"] as const,
    gitConflicts: [...p, "git", "conflicts"] as const,
    gitCommitDetail: (hash: string) =>
      [...p, "git", "commitDetail", hash] as const,
    gitDiff: (path: string) => [...p, "git", "diff", path] as const,
    agents: [...p, "agents"] as const,
    agentConversations: [...p, "agents", "conversations"] as const,
    agentChat: (conversationId: string) =>
      [...p, "agents", "conversations", conversationId, "chat"] as const,
    agentHistory: [...p, "agents", "history"] as const,
    agentPipelines: [...p, "agents", "pipelines"] as const,
    agentBuildProgress: [...p, "agents", "buildProgress"] as const,
    conversationEvents: (scope: "single_chat" | "agent_chat", id: string) =>
      [...p, "conversationEvents", scope, id] as const,
    agentTasks: (dispatchId: string) =>
      [...p, "agents", "tasks", dispatchId] as const,
    agentTask: (taskId: string) => [...p, "agents", "task", taskId] as const,
    taskNotes: (taskId: string) =>
      [...p, "agents", "task", taskId, "notes"] as const,
    taskDependencies: (dispatchId: string) =>
      [...p, "agents", "tasks", dispatchId, "dependencies"] as const,
    runnerConfigs: [...p, "runner", "configs"] as const,
    pythonInstallations: ["python", "detect"] as const,
    pythonCheck: ["python", "check"] as const,
    graphifyStatus: [...p, "graphify", "status"] as const,
    graphifyVisualization: [...p, "graphify", "visualization"] as const,
    graphifyCheck: ["graphify", "check"] as const,
    attachmentContent: (absPath: string) =>
      [...p, "attachments", "content", absPath] as const,
  };
}

/**
 * Backward-compatible export.
 *
 * All project-scoped keys now require a project ID. Hooks that need them
 * should call `queryKeys.forProject(id)` to get scoped keys.
 *
 * Global keys are accessed directly: `queryKeys.projects`, `queryKeys.health`, etc.
 */
export const queryKeys = {
  // Global
  ...global,

  // Project-scoped factory
  forProject: projectKeys,

  // ── DEPRECATED: unscoped keys kept temporarily for migration ──
  // These resolve to empty-project scope. Consumers should migrate to forProject().
  ...projectKeys(""),
};
