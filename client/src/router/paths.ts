// ─── Global routes (no project) ───
export const Path = {
  Home: "/",
  Projects: "/projects",
  AddProject: "/projects/add",

  // ─── Project-scoped routes ───
  Project: "/:projectId",
  NewChat: "/:projectId/chat/new",
  Chat: "/:projectId/chat/:sessionId",
  Code: "/:projectId/code",
  Run: "/:projectId/run",
  RunService: "/:projectId/run/:configId",
  Templates: "/:projectId/templates",
  Activity: "/:projectId/activity",
  Settings: "/:projectId/settings",
  SkillsBrowser: "/:projectId/skills",
  McpBrowser: "/:projectId/mcp",
  Checkpoints: "/:projectId/source-control",
  Agents: "/:projectId/agents",
  AgentsNew: "/:projectId/agents/new",
  AgentsConversation: "/:projectId/agents/:conversationId",
} as const;

// ─── Path builders ───

export function projectHome(projectId: string) {
  return `/${projectId}`;
}

export function newChatPath(projectId: string) {
  return `/${projectId}/chat/new`;
}

export function chatPath(projectId: string, sessionId: string) {
  return `/${projectId}/chat/${sessionId}`;
}

export function codePath(projectId: string) {
  return `/${projectId}/code`;
}

export function runPath(projectId: string) {
  return `/${projectId}/run`;
}

export function runServicePath(projectId: string, configId: string) {
  return `/${projectId}/run/${configId}`;
}

export function templatesPath(projectId: string) {
  return `/${projectId}/templates`;
}

export function activityPath(projectId: string) {
  return `/${projectId}/activity`;
}

export function settingsPath(projectId: string) {
  return `/${projectId}/settings`;
}

export function skillsBrowserPath(projectId: string) {
  return `/${projectId}/skills`;
}

export function mcpBrowserPath(projectId: string) {
  return `/${projectId}/mcp`;
}

export function sourceControlPath(projectId: string) {
  return `/${projectId}/source-control`;
}

/** @deprecated Use sourceControlPath instead */
export const checkpointsPath = sourceControlPath;

export function agentsPath(projectId: string) {
  return `/${projectId}/agents`;
}

export function agentsNewPath(projectId: string) {
  return `/${projectId}/agents/new`;
}

export function agentsConversationPath(
  projectId: string,
  conversationId: string,
) {
  return `/${projectId}/agents/${conversationId}`;
}

export function settingsGraphifyPath(projectId: string) {
  return `/${projectId}/settings/graphify`;
}
