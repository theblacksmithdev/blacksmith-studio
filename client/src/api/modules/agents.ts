import { api as raw } from '../client'
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
} from '../types'

export const agents = {
  // ── Registry ──
  list: () => raw.invoke<AgentInfo[]>('agents:list'),
  route: (prompt: string) => raw.invoke<AgentRouteResult>('agents:route', { prompt }),

  // ── PM-First Dispatch (main entry point) ──
  dispatch: (projectId: string, prompt: string, conversationId?: string) =>
    raw.invoke<DispatchResult>('agents:dispatch', { projectId, prompt, conversationId }),

  // ── Direct Single Execution ──
  execute: (projectId: string, data: { prompt: string; role?: AgentRole }) =>
    raw.invoke<AgentExecution>('agents:execute', { projectId, ...data }),
  cancel: (role: AgentRole) => raw.invoke<void>('agents:cancel', { role }),
  cancelAll: () => raw.invoke<void>('agents:cancelAll'),
  history: (limit?: number) => raw.invoke<AgentExecution[]>('agents:history', { limit }),

  // ── Pipelines & Workflows ──
  listPipelines: () => raw.invoke<PipelineTemplate[]>('agents:listPipelines'),
  runPipeline: (projectId: string, data: { pipelineId: string; prompt: string; maxBudgetUsd?: number }) =>
    raw.invoke<any>('agents:runPipeline', { projectId, ...data }),
  runWorkflow: (projectId: string, data: {
    name: string
    steps: { role: AgentRole; prompt: string; dependsOn?: number }[]
    maxBudgetUsd?: number
  }) => raw.invoke<any>('agents:runWorkflow', { projectId, ...data }),

  // ── Project Builder ──
  build: (projectId: string, data: { requirements: string; maxBudgetUsd?: number }) =>
    raw.invoke<any>('agents:build', { projectId, ...data }),
  buildResume: (projectId: string, maxBudgetUsd?: number) =>
    raw.invoke<any>('agents:buildResume', { projectId, maxBudgetUsd }),
  buildCancel: () => raw.invoke<void>('agents:buildCancel'),
  buildProgress: () => raw.invoke<any>('agents:buildProgress'),

  // ── Human Input ──
  respond: (requestId: string, value: string) =>
    raw.invoke<boolean>('agents:respond', { requestId, value }),
  setAutoApprove: (enabled: boolean) =>
    raw.invoke<void>('agents:setAutoApprove', { enabled }),

  // ── Persistence ──
  listDispatches: (projectId: string, limit?: number) => raw.invoke<any[]>('agents:listDispatches', { projectId, limit }),
  getDispatch: (dispatchId: string) => raw.invoke<any>('agents:getDispatch', { dispatchId }),
  listChat: (projectId: string, conversationId?: string) => raw.invoke<any[]>('agents:listChat', { projectId, conversationId }),
  clearChat: (projectId: string) => raw.invoke<void>('agents:clearChat', { projectId }),

  // ── Conversations ──
  createConversation: (projectId: string, title?: string) => raw.invoke<any>('agents:createConversation', { projectId, title }),
  listConversations: (projectId: string) => raw.invoke<any[]>('agents:listConversations', { projectId }),
  deleteConversation: (conversationId: string) => raw.invoke<void>('agents:deleteConversation', { conversationId }),
  getArtifacts: (conversationId: string) => raw.invoke<{ path: string; tool: string; role: string; timestamp: string }[]>('agents:getArtifacts', { conversationId }),

  // ── Subscriptions (push events from main process) ──
  onEvent: (cb: (event: AgentEvent) => void) =>
    raw.subscribe('agents:onEvent', cb),
  onWorkflowEvent: (cb: (event: WorkflowEvent) => void) =>
    raw.subscribe('agents:onWorkflowEvent', cb),
  onBuildEvent: (cb: (event: BuildEvent) => void) =>
    raw.subscribe('agents:onBuildEvent', cb),
  onInputRequest: (cb: (request: InputRequest) => void) =>
    raw.subscribe('agents:onInputRequest', cb),
} as const
