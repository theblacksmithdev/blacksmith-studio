import { ipcMain, type BrowserWindow } from 'electron'
import type { ProjectManager } from '../../server/services/projects.js'
import type { SettingsManager } from '../../server/services/settings.js'
import type { ClaudeManager } from '../../server/services/claude/index.js'
import type { McpManager } from '../../server/services/mcp.js'
import { AgentManager, ProjectBuilder } from '../../server/services/agents/index.js'
import { AgentSessionManager } from '../../server/services/agent-sessions.js'
import type { SessionManager } from '../../server/services/sessions.js'
import type { AgentRole } from '../../server/services/agents/types.js'
import type { AgentExecuteOptions } from '../../server/services/agents/base/index.js'
import {
  AGENTS_LIST, AGENTS_ROUTE, AGENTS_DISPATCH, AGENTS_EXECUTE, AGENTS_CANCEL, AGENTS_CANCEL_ALL,
  AGENTS_HISTORY, AGENTS_LIST_PIPELINES, AGENTS_RUN_PIPELINE, AGENTS_RUN_WORKFLOW,
  AGENTS_BUILD, AGENTS_BUILD_RESUME, AGENTS_BUILD_CANCEL, AGENTS_BUILD_PROGRESS,
  AGENTS_RESPOND, AGENTS_SET_AUTO_APPROVE,
  AGENTS_LIST_DISPATCHES, AGENTS_GET_DISPATCH, AGENTS_LIST_CHAT, AGENTS_CLEAR_CHAT,
  AGENTS_CREATE_CONVERSATION, AGENTS_LIST_CONVERSATIONS, AGENTS_DELETE_CONVERSATION,
  AGENTS_GET_ARTIFACTS,
  AGENTS_ON_EVENT, AGENTS_ON_WORKFLOW_EVENT, AGENTS_ON_BUILD_EVENT, AGENTS_ON_INPUT_REQUEST,
} from './channels.js'

function resolveBaseOptions(
  projectManager: ProjectManager,
  settingsManager: SettingsManager,
  claudeManager: ClaudeManager,
  mcpManager: McpManager,
): Omit<AgentExecuteOptions, 'prompt'> {
  const project = projectManager.getActive()
  if (!project) throw new Error('No active project')

  const allSettings = settingsManager.getAll(project.id)

  return {
    projectRoot: project.path,
    claudeBin: claudeManager.getClaudeBin(),
    nodePath: settingsManager.resolve(project.id, 'runner.nodePath') || undefined,
    mcpConfigPath: mcpManager.getEnabledConfigPath(
      project.path,
      Array.isArray(allSettings['mcp.disabledServers']) ? allSettings['mcp.disabledServers'] : [],
    ),
    projectInstructions: allSettings['ai.customInstructions'] || undefined,
  }
}

export function setupAgentsIPC(
  getWindow: () => BrowserWindow | null,
  projectManager: ProjectManager,
  settingsManager: SettingsManager,
  claudeManager: ClaudeManager,
  mcpManager: McpManager,
  chatSessionManager: SessionManager,
) {
  const agentManager = new AgentManager()
  const projectBuilder = new ProjectBuilder(agentManager)
  const sessionManager = new AgentSessionManager()

  // ── Forward agent events to renderer ──
  agentManager.onAgentEvent((event) => {
    getWindow()?.webContents.send(AGENTS_ON_EVENT, event)

    // Persist task status changes
    if (event.data.type === 'task_status') {
      const { taskId, status } = event.data as any
      sessionManager.updateTaskStatus(taskId, status)
    }
  })

  agentManager.onWorkflowEvent((event) => {
    getWindow()?.webContents.send(AGENTS_ON_WORKFLOW_EVENT, event)
  })

  projectBuilder.onEvent((event) => {
    getWindow()?.webContents.send(AGENTS_ON_BUILD_EVENT, event)
  })

  projectBuilder.humanInput.onRequest((request) => {
    getWindow()?.webContents.send(AGENTS_ON_INPUT_REQUEST, request)
  })

  // ── Agent Registry ──

  ipcMain.handle(AGENTS_LIST, () => {
    return agentManager.listAgents()
  })

  ipcMain.handle(AGENTS_ROUTE, (_e, data: { prompt: string }) => {
    return agentManager.route(data.prompt)
  })

  // ── PM-First Dispatch ──

  ipcMain.handle(AGENTS_DISPATCH, async (_e, data: { prompt: string; conversationId?: string }) => {
    const project = projectManager.getActive()
    if (!project) throw new Error('No active project')

    const baseOptions = resolveBaseOptions(projectManager, settingsManager, claudeManager, mcpManager)

    // Persist user message
    sessionManager.addChatMessage(project.id, 'user', data.prompt, undefined, undefined, data.conversationId)

    // Inject recent dispatch history so the PM knows what was done before
    const history = sessionManager.getRecentDispatchContext(project.id)
    const promptWithHistory = history
      ? `${history}\n\n---\n\nNew request:\n${data.prompt}`
      : data.prompt

    // Load persisted sessions so agents can resume Claude conversations
    const savedSessions = new Map<string, string>()
    for (const agent of agentManager.listAgents()) {
      const sid = sessionManager.getLatestSessionForRole(project.id, agent.role)
      if (sid) savedSessions.set(agent.role, sid)
    }
    agentManager.loadSessions(savedSessions)

    const result = await agentManager.dispatch({ ...baseOptions, prompt: promptWithHistory })

    // Persist the dispatch and its tasks
    if (result.plan.mode !== 'clarification' && result.plan.tasks.length > 0) {
      const dispatchId = sessionManager.createDispatch(
        project.id,
        data.prompt,
        result.plan.mode,
        result.plan.summary,
        result.plan.tasks.map((t) => ({ id: t.id, title: t.title, description: t.description, role: t.role, prompt: t.prompt })),
        data.conversationId,
      )

      for (const exec of result.executions) {
        const matchingTask = result.plan.tasks.find((t) => t.role === exec.agentId)
        if (matchingTask) {
          sessionManager.updateTaskStatus(matchingTask.id, exec.status === 'done' ? 'done' : 'error', {
            executionId: exec.id,
            sessionId: exec.sessionId || undefined,
            responseText: exec.responseText,
            error: exec.error ?? undefined,
            costUsd: exec.costUsd,
            durationMs: exec.durationMs,
          })
        }
      }

      const totalCost = result.executions.reduce((sum, e) => sum + e.costUsd, 0)
      const totalDuration = result.executions.reduce((sum, e) => sum + e.durationMs, 0)
      const anyFailed = result.executions.some((e) => e.status === 'error')
      sessionManager.updateDispatchStatus(dispatchId, anyFailed ? 'failed' : 'completed', totalCost, totalDuration)

      sessionManager.addChatMessage(
        project.id,
        'system',
        anyFailed ? 'Dispatch completed with errors' : `All tasks finished — $${totalCost.toFixed(4)}`,
        undefined,
        dispatchId,
        data.conversationId,
      )
    } else if (result.plan.mode === 'clarification') {
      sessionManager.addChatMessage(project.id, 'agent', result.plan.summary, 'product-manager', undefined, data.conversationId)
    }

    // Update conversation title from the first prompt if it exists
    if (data.conversationId) {
      sessionManager.touchConversation(data.conversationId)
    }

    return result
  })

  // ── Direct Single Agent Execution ──

  ipcMain.handle(AGENTS_EXECUTE, async (_e, data: { prompt: string; role?: AgentRole }) => {
    const baseOptions = resolveBaseOptions(projectManager, settingsManager, claudeManager, mcpManager)
    return agentManager.execute({ ...baseOptions, prompt: data.prompt, role: data.role })
  })

  ipcMain.handle(AGENTS_CANCEL, (_e, data: { role: AgentRole }) => {
    agentManager.cancel(data.role)
  })

  ipcMain.handle(AGENTS_CANCEL_ALL, () => {
    agentManager.cancelAll()
  })

  ipcMain.handle(AGENTS_HISTORY, (_e, data?: { limit?: number }) => {
    return agentManager.getExecutionHistory(data?.limit)
  })

  // ── Pipelines & Workflows ──

  ipcMain.handle(AGENTS_LIST_PIPELINES, () => {
    return agentManager.listPipelines()
  })

  ipcMain.handle(AGENTS_RUN_PIPELINE, async (_e, data: { pipelineId: string; prompt: string; maxBudgetUsd?: number }) => {
    const baseOptions = resolveBaseOptions(projectManager, settingsManager, claudeManager, mcpManager)
    return agentManager.runPipeline(data.pipelineId, data.prompt, baseOptions, data.maxBudgetUsd)
  })

  ipcMain.handle(AGENTS_RUN_WORKFLOW, async (_e, data: {
    name: string
    steps: { role: AgentRole; prompt: string; dependsOn?: number }[]
    maxBudgetUsd?: number
  }) => {
    const baseOptions = resolveBaseOptions(projectManager, settingsManager, claudeManager, mcpManager)
    return agentManager.runWorkflow(data.name, data.steps, baseOptions, data.maxBudgetUsd)
  })

  // ── Project Builder ──

  ipcMain.handle(AGENTS_BUILD, async (_e, data: { requirements: string; maxBudgetUsd?: number }) => {
    const baseOptions = resolveBaseOptions(projectManager, settingsManager, claudeManager, mcpManager)
    return projectBuilder.build(data.requirements, baseOptions, data.maxBudgetUsd)
  })

  ipcMain.handle(AGENTS_BUILD_RESUME, async (_e, data?: { maxBudgetUsd?: number }) => {
    const baseOptions = resolveBaseOptions(projectManager, settingsManager, claudeManager, mcpManager)
    return projectBuilder.resume(baseOptions, data?.maxBudgetUsd)
  })

  ipcMain.handle(AGENTS_BUILD_CANCEL, () => {
    projectBuilder.cancel()
  })

  ipcMain.handle(AGENTS_BUILD_PROGRESS, () => {
    return projectBuilder.progress
  })

  // ── Human Input ──

  ipcMain.handle(AGENTS_RESPOND, (_e, data: { requestId: string; value: string }) => {
    return projectBuilder.humanInput.respond(data.requestId, data.value)
  })

  ipcMain.handle(AGENTS_SET_AUTO_APPROVE, (_e, data: { enabled: boolean }) => {
    projectBuilder.humanInput.autoApprove = data.enabled
  })

  // ── Persistence ──

  ipcMain.handle(AGENTS_LIST_DISPATCHES, (_e, data?: { limit?: number }) => {
    const project = projectManager.getActive()
    if (!project) throw new Error('No active project')
    return sessionManager.listDispatches(project.id, data?.limit)
  })

  ipcMain.handle(AGENTS_GET_DISPATCH, (_e, data: { dispatchId: string }) => {
    return sessionManager.getDispatch(data.dispatchId)
  })

  ipcMain.handle(AGENTS_LIST_CHAT, (_e, data?: { conversationId?: string }) => {
    const project = projectManager.getActive()
    if (!project) throw new Error('No active project')
    return sessionManager.listChatMessages(project.id, data?.conversationId)
  })

  ipcMain.handle(AGENTS_CLEAR_CHAT, () => {
    const project = projectManager.getActive()
    if (!project) throw new Error('No active project')
    sessionManager.clearChatMessages(project.id)
  })

  // ── Conversations ──

  ipcMain.handle(AGENTS_CREATE_CONVERSATION, (_e, data?: { title?: string }) => {
    const project = projectManager.getActive()
    if (!project) throw new Error('No active project')
    return sessionManager.createConversation(project.id, data?.title)
  })

  ipcMain.handle(AGENTS_LIST_CONVERSATIONS, () => {
    const project = projectManager.getActive()
    if (!project) throw new Error('No active project')
    return sessionManager.listConversations(project.id)
  })

  ipcMain.handle(AGENTS_DELETE_CONVERSATION, (_e, data: { conversationId: string }) => {
    sessionManager.deleteConversation(data.conversationId)
  })

  ipcMain.handle(AGENTS_GET_ARTIFACTS, (_e, data: { conversationId: string }) => {
    return chatSessionManager.getConversationArtifacts(data.conversationId)
  })
}
