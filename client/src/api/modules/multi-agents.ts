import { api as raw } from "../client";
import type {
  AgentRole,
  AgentInfo,
  AgentRouteResult,
  AgentExecution,
  AgentEvent,
  DispatchResult,
  PipelineTemplate,
  WorkflowEvent,
  BuildEvent,
  InputRequest,
} from "../types";

export const multiAgents = {
  // ── Registry ──
  list: () => raw.invoke<AgentInfo[]>("multiAgents:list"),
  route: (prompt: string) =>
    raw.invoke<AgentRouteResult>("multiAgents:route", { prompt }),

  // ── PM-First Dispatch (main entry point) ──
  dispatch: (
    projectId: string,
    prompt: string,
    conversationId?: string,
    attachments?: Array<{
      id: string;
      name: string;
      kind: "image" | "text" | "code" | "pdf" | "file";
      mime: string;
      size: number;
      absPath: string;
      relPath: string;
    }>,
  ) =>
    raw.invoke<DispatchResult>("multiAgents:dispatch", {
      projectId,
      prompt,
      conversationId,
      attachments,
    }),

  // ── Direct Single Execution ──
  execute: (projectId: string, data: { prompt: string; role?: AgentRole }) =>
    raw.invoke<AgentExecution>("multiAgents:execute", { projectId, ...data }),
  cancel: (role: AgentRole) => raw.invoke<void>("multiAgents:cancel", { role }),
  cancelAll: () => raw.invoke<void>("multiAgents:cancelAll"),
  history: (limit?: number) =>
    raw.invoke<AgentExecution[]>("multiAgents:history", { limit }),

  // ── Pipelines & Workflows ──
  listPipelines: () =>
    raw.invoke<PipelineTemplate[]>("multiAgents:listPipelines"),
  runPipeline: (
    projectId: string,
    data: { pipelineId: string; prompt: string; maxBudgetUsd?: number },
  ) => raw.invoke<any>("multiAgents:runPipeline", { projectId, ...data }),
  runWorkflow: (
    projectId: string,
    data: {
      name: string;
      steps: { role: AgentRole; prompt: string; dependsOn?: number }[];
      maxBudgetUsd?: number;
    },
  ) => raw.invoke<any>("multiAgents:runWorkflow", { projectId, ...data }),

  // ── Project Builder ──
  build: (
    projectId: string,
    data: { requirements: string; maxBudgetUsd?: number },
  ) => raw.invoke<any>("multiAgents:build", { projectId, ...data }),
  buildResume: (projectId: string, maxBudgetUsd?: number) =>
    raw.invoke<any>("multiAgents:buildResume", { projectId, maxBudgetUsd }),
  buildCancel: () => raw.invoke<void>("multiAgents:buildCancel"),
  buildProgress: () => raw.invoke<any>("multiAgents:buildProgress"),

  // ── Human Input ──
  respond: (requestId: string, value: string) =>
    raw.invoke<boolean>("multiAgents:respond", { requestId, value }),
  setAutoApprove: (enabled: boolean) =>
    raw.invoke<void>("multiAgents:setAutoApprove", { enabled }),

  // ── Persistence ──
  listDispatches: (projectId: string, limit?: number) =>
    raw.invoke<any[]>("multiAgents:listDispatches", { projectId, limit }),
  getDispatch: (dispatchId: string) =>
    raw.invoke<any>("multiAgents:getDispatch", { dispatchId }),
  listChat: (projectId: string, conversationId?: string) =>
    raw.invoke<any[]>("multiAgents:listChat", { projectId, conversationId }),
  clearChat: (projectId: string) =>
    raw.invoke<void>("multiAgents:clearChat", { projectId }),

  // ── Conversations ──
  createConversation: (projectId: string, title?: string) =>
    raw.invoke<any>("multiAgents:createConversation", { projectId, title }),
  listConversations: (projectId: string) =>
    raw.invoke<any[]>("multiAgents:listConversations", { projectId }),
  deleteConversation: (conversationId: string) =>
    raw.invoke<void>("multiAgents:deleteConversation", { conversationId }),
  getArtifacts: (conversationId: string) =>
    raw.invoke<
      { path: string; tool: string; role: string; timestamp: string }[]
    >("multiAgents:getArtifacts", { conversationId }),

  // ── Subscriptions (push events from main process) ──
  onEvent: (cb: (event: AgentEvent) => void) =>
    raw.subscribe("multiAgents:onEvent", cb),
  onWorkflowEvent: (cb: (event: WorkflowEvent) => void) =>
    raw.subscribe("multiAgents:onWorkflowEvent", cb),
  onBuildEvent: (cb: (event: BuildEvent) => void) =>
    raw.subscribe("multiAgents:onBuildEvent", cb),
  onInputRequest: (cb: (request: InputRequest) => void) =>
    raw.subscribe("multiAgents:onInputRequest", cb),
} as const;
