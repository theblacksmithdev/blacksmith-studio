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
  dispatch: (prompt: string) =>
    raw.invoke<DispatchResult>('agents:dispatch', { prompt }),

  // ── Direct Single Execution ──
  execute: (data: { prompt: string; role?: AgentRole }) =>
    raw.invoke<AgentExecution>('agents:execute', data),
  cancel: (role: AgentRole) => raw.invoke<void>('agents:cancel', { role }),
  cancelAll: () => raw.invoke<void>('agents:cancelAll'),
  history: (limit?: number) => raw.invoke<AgentExecution[]>('agents:history', { limit }),

  // ── Pipelines & Workflows ──
  listPipelines: () => raw.invoke<PipelineTemplate[]>('agents:listPipelines'),
  runPipeline: (data: { pipelineId: string; prompt: string; maxBudgetUsd?: number }) =>
    raw.invoke<any>('agents:runPipeline', data),
  runWorkflow: (data: {
    name: string
    steps: { role: AgentRole; prompt: string; dependsOn?: number }[]
    maxBudgetUsd?: number
  }) => raw.invoke<any>('agents:runWorkflow', data),

  // ── Project Builder ──
  build: (data: { requirements: string; maxBudgetUsd?: number }) =>
    raw.invoke<any>('agents:build', data),
  buildResume: (maxBudgetUsd?: number) =>
    raw.invoke<any>('agents:buildResume', { maxBudgetUsd }),
  buildCancel: () => raw.invoke<void>('agents:buildCancel'),
  buildProgress: () => raw.invoke<any>('agents:buildProgress'),

  // ── Human Input ──
  respond: (requestId: string, value: string) =>
    raw.invoke<boolean>('agents:respond', { requestId, value }),
  setAutoApprove: (enabled: boolean) =>
    raw.invoke<void>('agents:setAutoApprove', { enabled }),

  // ── Persistence ──
  listDispatches: (limit?: number) => raw.invoke<any[]>('agents:listDispatches', { limit }),
  getDispatch: (dispatchId: string) => raw.invoke<any>('agents:getDispatch', { dispatchId }),
  listChat: () => raw.invoke<any[]>('agents:listChat'),
  clearChat: () => raw.invoke<void>('agents:clearChat'),

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
