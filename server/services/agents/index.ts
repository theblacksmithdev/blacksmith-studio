export { BaseAgent, DecomposableAgent } from './base/index.js'
export type {
  AgentExecuteOptions,
  ToolCallRecord,
  HandoffDescriptor,
  ValidationResult,
} from './base/index.js'
export { buildSystemPrompt, buildCliArgs, streamExecution } from './base/index.js'

export type {
  AgentRole,
  AgentRoleDefinition,
  AgentStatus,
  AgentExecution,
  AgentProcess,
  AgentEvent,
  AgentEventType,
  AgentEventData,
  AgentEventCallback,
  AgentConfig,
  Workflow,
  WorkflowStep,
  WorkflowStatus,
  WorkflowEvent,
  WorkflowEventType,
  WorkflowEventCallback,
} from './types.js'

export { buildAgentContext, describeToolUse, describeMessageStart } from './utils/index.js'

export {
  AgentManager,
  routePrompt, type RouteResult,
  dispatchWithPM, type DispatchPlan, type DispatchTask,
  PIPELINE_TEMPLATES, type PipelineTemplate,
  executeWorkflowSteps,
  processHandoffs,
} from './manager/index.js'

export {
  ProjectBuilder,
  generatePlan,
  runVerification,
  type VerificationResult,
  saveCheckpoint,
  loadCheckpoint,
  deleteCheckpoint,
  capturePhaseSnapshot,
  HumanInputGate,
  type InputType,
  type InputRequest,
  type InputRequestCallback,
  type BuildPlan,
  type BuildPhase,
  type BuildTask,
  type BuildProgress,
  type BuildStatus,
  type BuildTaskResult,
  type BuildEvent,
  type BuildEventType,
  type BuildEventCallback,
  type BuildCheckpoint,
} from './builder/index.js'

export {
  FrontendEngineerAgent,
  BackendEngineerAgent,
  FullstackEngineerAgent,
  UiDesignerAgent,
  CodeReviewerAgent,
  QaEngineerAgent,
  ArchitectAgent,
  DatabaseEngineerAgent,
  DevOpsEngineerAgent,
  SecurityEngineerAgent,
  TechnicalWriterAgent,
  ProductManagerAgent,
  createAgentRegistry,
} from './roles/index.js'
