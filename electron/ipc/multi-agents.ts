import { ipcMain, type BrowserWindow } from "electron";
import type { ProjectManager } from "../../server/services/projects.js";
import type { SettingsManager } from "../../server/services/settings.js";
import type { McpManager } from "../../server/services/mcp.js";
import type { Ai } from "../../server/services/ai/ai.js";
import { resolveAiInvocationSettings } from "../../server/services/studio-context/index.js";
import {
  AgentManager,
  ProjectBuilder,
} from "../../server/services/chat/agents/index.js";
import { appendAttachmentInstruction } from "../../server/services/attachments/index.js";
import {
  ConversationContext,
  type ConversationMessage,
} from "../../server/services/chat/agents/manager/conversation-context.js";
import type { AgentSessionManager } from "../../server/services/chat/multi-agents/index.js";
import type { AgentRole } from "../../server/services/chat/agents/types.js";
import type { ConversationEventService } from "../../server/services/events/index.js";
import type { ArtifactService } from "../../server/services/artifacts/index.js";
import type { AgentExecuteOptions } from "../../server/services/chat/agents/base/index.js";
import {
  MULTI_AGENTS_LIST,
  MULTI_AGENTS_ROUTE,
  MULTI_AGENTS_DISPATCH,
  MULTI_AGENTS_EXECUTE,
  MULTI_AGENTS_CANCEL,
  MULTI_AGENTS_CANCEL_ALL,
  MULTI_AGENTS_HISTORY,
  MULTI_AGENTS_LIST_PIPELINES,
  MULTI_AGENTS_RUN_PIPELINE,
  MULTI_AGENTS_RUN_WORKFLOW,
  MULTI_AGENTS_BUILD,
  MULTI_AGENTS_BUILD_RESUME,
  MULTI_AGENTS_BUILD_CANCEL,
  MULTI_AGENTS_BUILD_PROGRESS,
  MULTI_AGENTS_RESPOND,
  MULTI_AGENTS_SET_AUTO_APPROVE,
  MULTI_AGENTS_LIST_DISPATCHES,
  MULTI_AGENTS_GET_DISPATCH,
  MULTI_AGENTS_LIST_CHAT,
  MULTI_AGENTS_CLEAR_CHAT,
  MULTI_AGENTS_CREATE_CONVERSATION,
  MULTI_AGENTS_LIST_CONVERSATIONS,
  MULTI_AGENTS_DELETE_CONVERSATION,
  MULTI_AGENTS_GET_ARTIFACTS,
  MULTI_AGENTS_ON_EVENT,
  MULTI_AGENTS_ON_WORKFLOW_EVENT,
  MULTI_AGENTS_ON_BUILD_EVENT,
  MULTI_AGENTS_ON_INPUT_REQUEST,
} from "./channels.js";

/**
 * Load prior conversation state (transcript + PM session id + last plan)
 * and wrap it in a ConversationContext so the dispatcher, PM, and every
 * downstream worker share one view of the user's intent.
 *
 * When `conversationId` is absent (one-off dispatch, no thread), returns
 * a minimal context carrying just the current user prompt — the PM will
 * start fresh and no session id will be persisted.
 */
function buildConversationContext(
  sessionManager: AgentSessionManager,
  projectId: string,
  userPrompt: string,
  conversationId: string | undefined,
): ConversationContext {
  if (!conversationId) {
    return new ConversationContext({ originalUserPrompt: userPrompt });
  }

  const conversation = sessionManager.getConversation(conversationId);
  const messages = sessionManager.listChatMessages(projectId, conversationId);

  // The latest message is the one we just wrote in the handler. Strip it
  // so the history block represents "what came before this turn".
  const prior = messages.slice(0, -1);
  const history: ConversationMessage[] = prior.map((m) => ({
    role: asMessageRole(m.role),
    agentRole: m.agentRole ?? undefined,
    content: m.content,
    timestamp: m.timestamp,
  }));

  return new ConversationContext({
    originalUserPrompt: userPrompt,
    conversationId,
    history,
    pmSessionId: conversation?.pmSessionId ?? undefined,
    latestPlanSummary: conversation?.lastPlanSummary ?? undefined,
  });
}

function asMessageRole(role: string): ConversationMessage["role"] {
  return role === "user" || role === "system" || role === "agent"
    ? role
    : "system";
}

function resolveBaseOptions(
  projectManager: ProjectManager,
  settingsManager: SettingsManager,
  mcpManager: McpManager,
  ai: Ai,
  projectId: string,
): Omit<AgentExecuteOptions, "prompt"> {
  const project = projectManager.get(projectId);
  if (!project) throw new Error("Project not found");

  const settings = resolveAiInvocationSettings(
    project,
    settingsManager,
    mcpManager,
  );

  return {
    ai,
    projectRoot: settings.projectRoot,
    nodePath: settings.nodePath,
    mcpConfigPath: settings.mcpConfigPath,
    projectInstructions: settings.customInstructions,
    permissionMode: settings.permissionMode,
    providerId: settings.providerId,
  };
}

export function setupMultiAgentsIPC(
  getWindow: () => BrowserWindow | null,
  projectManager: ProjectManager,
  settingsManager: SettingsManager,
  mcpManager: McpManager,
  ai: Ai,
  sessionManager: AgentSessionManager,
  eventService: ConversationEventService,
  artifactService: ArtifactService,
) {
  const agentManager = new AgentManager();
  const projectBuilder = new ProjectBuilder(agentManager);

  /**
   * Runtime index so streaming agent events (which carry `executionId`
   * and sometimes `taskId`) can be resolved back to their dispatch and
   * conversation. Populated on the first `task_status` event for an
   * executionId; read by the event-log fan-out that follows.
   */
  const executionToTask = new Map<string, string>();

  function persistAgentEvent(event: {
    type: string;
    agentId: string;
    executionId: string;
    data: Record<string, unknown> & { type: string };
  }): void {
    // Filter out streaming deltas — only the terminal payload for each
    // logical event is worth persisting. `message` with isPartial=true
    // fires many times per token/chunk; the final one has isPartial=false.
    if (
      event.data.type === "message" &&
      (event.data as { isPartial?: boolean }).isPartial === true
    ) {
      return;
    }

    const taskId =
      (event.data as { taskId?: string }).taskId ??
      executionToTask.get(event.executionId);
    if (!taskId) return;
    const ctx = sessionManager.resolveTaskContext(taskId);
    if (!ctx || !ctx.conversationId) return;

    const eventTypeMap: Record<string, string> = {
      task_status: "task_status_change",
      subtask_status: "task_status_change",
      tool_use: "tool_use",
      tool_result: "tool_result",
      thinking: "thinking_block",
      activity: "agent_activity",
      error: "error",
      status: "agent_activity",
      done: "task_result",
      message: "assistant_message",
    };
    const mapped = eventTypeMap[event.data.type];
    if (!mapped) return;

    eventService.append({
      projectId: ctx.projectId,
      scope: "agent_chat",
      conversationId: ctx.conversationId,
      dispatchId: ctx.dispatchId,
      taskId,
      agentRole: event.agentId,
      eventType: mapped as never,
      payload: event.data,
    });
  }

  // ── Forward agent events to renderer ──
  agentManager.onAgentEvent((event) => {
    getWindow()?.webContents.send(MULTI_AGENTS_ON_EVENT, event);

    // Persist task status changes
    if (event.data.type === "task_status") {
      const { taskId, status } = event.data as {
        taskId: string;
        status: string;
      };
      executionToTask.set(event.executionId, taskId);
      sessionManager.updateTaskStatus(taskId, status);
    }

    // Stamp the unified event log for reload fidelity + forever trail.
    persistAgentEvent(event as never);
  });

  agentManager.onWorkflowEvent((event) => {
    getWindow()?.webContents.send(MULTI_AGENTS_ON_WORKFLOW_EVENT, event);
  });

  projectBuilder.onEvent((event) => {
    getWindow()?.webContents.send(MULTI_AGENTS_ON_BUILD_EVENT, event);
  });

  projectBuilder.humanInput.onRequest((request) => {
    getWindow()?.webContents.send(MULTI_AGENTS_ON_INPUT_REQUEST, request);
  });

  // ── Agent Registry ──

  ipcMain.handle(MULTI_AGENTS_LIST, () => {
    return agentManager.listAgents();
  });

  ipcMain.handle(MULTI_AGENTS_ROUTE, (_e, data: { prompt: string }) => {
    return agentManager.route(data.prompt);
  });

  // ── PM-First Dispatch ──

  ipcMain.handle(
    MULTI_AGENTS_DISPATCH,
    async (
      _e,
      data: {
        projectId: string;
        prompt: string;
        conversationId?: string;
        attachments?: Array<{
          id: string;
          name: string;
          kind: "image" | "text" | "code" | "pdf" | "file";
          mime: string;
          size: number;
          absPath: string;
          relPath: string;
        }>;
      },
    ) => {
      const project = projectManager.get(data.projectId);
      if (!project) throw new Error("Project not found");

      const baseOptions: ReturnType<typeof resolveBaseOptions> & {
        onArtifactWritten?: (info: {
          role: string;
          taskId: string;
          title: string;
          relPath: string;
        }) => void;
      } = resolveBaseOptions(
        projectManager,
        settingsManager,
        mcpManager,
        ai,
        data.projectId,
      );
      baseOptions.onArtifactWritten = (info) => {
        try {
          artifactService.indexFromTaskWrite({
            projectId: project.id,
            conversationId: data.conversationId ?? null,
            role: info.role,
            taskId: info.taskId,
            title: info.title,
            relPath: info.relPath,
          });
        } catch (err) {
          console.warn("[artifacts] index-on-write failed:", err);
        }
      };

      // Persist user message
      const userChatRecord = sessionManager.addChatMessage(
        project.id,
        "user",
        data.prompt,
        undefined,
        undefined,
        data.conversationId,
        data.attachments,
      );
      if (data.conversationId) {
        eventService.append({
          projectId: project.id,
          scope: "agent_chat",
          conversationId: data.conversationId,
          messageId: userChatRecord.id,
          eventType: "user_message",
          payload: {
            content: data.prompt,
            attachments:
              data.attachments && data.attachments.length > 0
                ? data.attachments
                : undefined,
          },
        });
      }

      // Build the conversation context that travels with the dispatch so
      // the PM resumes its Claude session across messages and every
      // downstream worker sees the original user request + PM plan.
      const conversationContext = buildConversationContext(
        sessionManager,
        project.id,
        data.prompt,
        data.conversationId,
      );

      // Load persisted sessions so every agent that previously worked in
      // THIS conversation resumes its Claude session on the next turn.
      // Scoped by conversationId — sessions from other chats must not leak in.
      const savedSessions = new Map<string, string>();
      if (data.conversationId) {
        for (const agent of agentManager.listAgents()) {
          const sid = sessionManager.getLatestSessionForRoleInConversation(
            data.conversationId,
            agent.role,
          );
          if (sid) savedSessions.set(agent.role, sid);
        }
      }
      agentManager.loadSessions(savedSessions);

      const result = await agentManager.dispatch({
        ...baseOptions,
        prompt: appendAttachmentInstruction(data.prompt, data.attachments),
        conversationContext,
      });

      // Persist the PM's Claude session id on first dispatch so the next
      // user message resumes the same session instead of starting fresh.
      if (
        data.conversationId &&
        result.plan.pmSessionId &&
        !conversationContext.pmSessionId
      ) {
        sessionManager.setConversationPMSession(
          data.conversationId,
          result.plan.pmSessionId,
        );
      }
      // Cache the latest plan summary on the conversation for quick context.
      if (
        data.conversationId &&
        result.plan.mode !== "clarification" &&
        result.plan.summary
      ) {
        sessionManager.setConversationPlanSummary(
          data.conversationId,
          result.plan.summary,
        );
      }

      // Persist the dispatch and its tasks
      if (
        result.plan.mode !== "clarification" &&
        result.plan.tasks.length > 0
      ) {
        const dispatchId = sessionManager.createDispatch(
          project.id,
          data.prompt,
          result.plan.mode,
          result.plan.summary,
          result.plan.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            role: t.role,
            prompt: t.prompt,
          })),
          data.conversationId,
        );

        // Persist the plan's declared dependencies into the join table.
        for (const t of result.plan.tasks) {
          if (t.dependsOn && t.dependsOn.length > 0) {
            sessionManager.addTaskDependencies(t.id, t.dependsOn);
          }
        }

        if (data.conversationId) {
          eventService.append({
            projectId: project.id,
            scope: "agent_chat",
            conversationId: data.conversationId,
            dispatchId,
            eventType: "dispatch_created",
            payload: {
              prompt: data.prompt,
              planMode: result.plan.mode,
              planSummary: result.plan.summary,
            },
          });
          eventService.append({
            projectId: project.id,
            scope: "agent_chat",
            conversationId: data.conversationId,
            dispatchId,
            eventType: "dispatch_plan",
            payload: { plan: result.plan },
          });
          for (const t of result.plan.tasks) {
            eventService.append({
              projectId: project.id,
              scope: "agent_chat",
              conversationId: data.conversationId,
              dispatchId,
              taskId: t.id,
              agentRole: t.role,
              eventType: "task_created",
              payload: {
                id: t.id,
                title: t.title,
                description: t.description,
                role: t.role,
                dependsOn: t.dependsOn,
              },
            });
          }
        }

        for (const exec of result.executions) {
          const matchingTask = exec.taskId
            ? result.plan.tasks.find((t) => t.id === exec.taskId)
            : result.plan.tasks.find((t) => t.role === exec.agentId);
          if (matchingTask) {
            const terminalStatus: "done" | "error" =
              exec.status === "done" ? "done" : "error";
            sessionManager.updateTaskStatus(matchingTask.id, terminalStatus, {
              executionId: exec.id,
              sessionId: exec.sessionId || undefined,
              responseText: exec.responseText,
              error: exec.error ?? undefined,
              costUsd: exec.costUsd,
              durationMs: exec.durationMs,
            });

            if (data.conversationId) {
              eventService.append({
                projectId: project.id,
                scope: "agent_chat",
                conversationId: data.conversationId,
                dispatchId,
                taskId: matchingTask.id,
                agentRole: matchingTask.role,
                eventType: "task_result",
                payload: {
                  status: terminalStatus,
                  executionId: exec.id,
                  responseText: exec.responseText,
                  error: exec.error,
                  costUsd: exec.costUsd,
                  durationMs: exec.durationMs,
                },
              });
            }
          }
        }

        const totalCost = result.executions.reduce(
          (sum, e) => sum + e.costUsd,
          0,
        );
        const totalDuration = result.executions.reduce(
          (sum, e) => sum + e.durationMs,
          0,
        );
        const anyFailed = result.executions.some((e) => e.status === "error");
        sessionManager.updateDispatchStatus(
          dispatchId,
          anyFailed ? "failed" : "completed",
          totalCost,
          totalDuration,
        );

        const systemContent = anyFailed
          ? "Dispatch completed with errors"
          : `All tasks finished — $${totalCost.toFixed(4)}`;
        const systemRecord = sessionManager.addChatMessage(
          project.id,
          "system",
          systemContent,
          undefined,
          dispatchId,
          data.conversationId,
        );
        if (data.conversationId) {
          eventService.append({
            projectId: project.id,
            scope: "agent_chat",
            conversationId: data.conversationId,
            dispatchId,
            messageId: systemRecord.id,
            eventType: "dispatch_status",
            payload: {
              status: anyFailed ? "failed" : "completed",
              totalCostUsd: totalCost,
              totalDurationMs: totalDuration,
              summary: systemContent,
            },
          });
        }
      } else if (result.plan.mode === "clarification") {
        const clarificationRecord = sessionManager.addChatMessage(
          project.id,
          "agent",
          result.plan.summary,
          "product-manager",
          undefined,
          data.conversationId,
        );
        if (data.conversationId) {
          eventService.append({
            projectId: project.id,
            scope: "agent_chat",
            conversationId: data.conversationId,
            messageId: clarificationRecord.id,
            agentRole: "product-manager",
            eventType: "assistant_message",
            payload: {
              content: result.plan.summary,
              agentRole: "product-manager",
              mode: "clarification",
            },
          });
        }
      }

      // Update conversation title from the first prompt if it exists
      if (data.conversationId) {
        sessionManager.touchConversation(data.conversationId);
      }

      return result;
    },
  );

  // ── Direct Single Agent Execution ──

  ipcMain.handle(
    MULTI_AGENTS_EXECUTE,
    async (
      _e,
      data: { projectId: string; prompt: string; role?: AgentRole },
    ) => {
      const baseOptions = resolveBaseOptions(
        projectManager,
        settingsManager,
        mcpManager,
        ai,
        data.projectId,
      );
      return agentManager.execute({
        ...baseOptions,
        prompt: data.prompt,
        role: data.role,
      });
    },
  );

  ipcMain.handle(MULTI_AGENTS_CANCEL, (_e, data: { role: AgentRole }) => {
    agentManager.cancel(data.role);
  });

  ipcMain.handle(MULTI_AGENTS_CANCEL_ALL, () => {
    agentManager.cancelAll();
  });

  ipcMain.handle(MULTI_AGENTS_HISTORY, (_e, data?: { limit?: number }) => {
    return agentManager.getExecutionHistory(data?.limit);
  });

  // ── Pipelines & Workflows ──

  ipcMain.handle(MULTI_AGENTS_LIST_PIPELINES, () => {
    return agentManager.listPipelines();
  });

  ipcMain.handle(
    MULTI_AGENTS_RUN_PIPELINE,
    async (
      _e,
      data: {
        projectId: string;
        pipelineId: string;
        prompt: string;
        maxBudgetUsd?: number;
      },
    ) => {
      const baseOptions = resolveBaseOptions(
        projectManager,
        settingsManager,
        mcpManager,
        ai,
        data.projectId,
      );
      return agentManager.runPipeline(
        data.pipelineId,
        data.prompt,
        baseOptions,
        data.maxBudgetUsd,
      );
    },
  );

  ipcMain.handle(
    MULTI_AGENTS_RUN_WORKFLOW,
    async (
      _e,
      data: {
        projectId: string;
        name: string;
        steps: { role: AgentRole; prompt: string; dependsOn?: number }[];
        maxBudgetUsd?: number;
      },
    ) => {
      const baseOptions = resolveBaseOptions(
        projectManager,
        settingsManager,
        mcpManager,
        ai,
        data.projectId,
      );
      return agentManager.runWorkflow(
        data.name,
        data.steps,
        baseOptions,
        data.maxBudgetUsd,
      );
    },
  );

  // ── Project Builder ──

  ipcMain.handle(
    MULTI_AGENTS_BUILD,
    async (
      _e,
      data: { projectId: string; requirements: string; maxBudgetUsd?: number },
    ) => {
      const baseOptions = resolveBaseOptions(
        projectManager,
        settingsManager,
        mcpManager,
        ai,
        data.projectId,
      );
      return projectBuilder.build(
        data.requirements,
        baseOptions,
        data.maxBudgetUsd,
      );
    },
  );

  ipcMain.handle(
    MULTI_AGENTS_BUILD_RESUME,
    async (_e, data: { projectId: string; maxBudgetUsd?: number }) => {
      const baseOptions = resolveBaseOptions(
        projectManager,
        settingsManager,
        mcpManager,
        ai,
        data.projectId,
      );
      return projectBuilder.resume(baseOptions, data.maxBudgetUsd);
    },
  );

  ipcMain.handle(MULTI_AGENTS_BUILD_CANCEL, () => {
    projectBuilder.cancel();
  });

  ipcMain.handle(MULTI_AGENTS_BUILD_PROGRESS, () => {
    return projectBuilder.progress;
  });

  // ── Human Input ──

  ipcMain.handle(
    MULTI_AGENTS_RESPOND,
    (_e, data: { requestId: string; value: string }) => {
      return projectBuilder.humanInput.respond(data.requestId, data.value);
    },
  );

  ipcMain.handle(
    MULTI_AGENTS_SET_AUTO_APPROVE,
    (_e, data: { enabled: boolean }) => {
      projectBuilder.humanInput.autoApprove = data.enabled;
    },
  );

  // ── Persistence ──

  ipcMain.handle(
    MULTI_AGENTS_LIST_DISPATCHES,
    (_e, data: { projectId: string; limit?: number }) => {
      const project = projectManager.get(data.projectId);
      if (!project) throw new Error("Project not found");
      return sessionManager.listDispatches(project.id, data.limit);
    },
  );

  ipcMain.handle(
    MULTI_AGENTS_GET_DISPATCH,
    (_e, data: { dispatchId: string }) => {
      return sessionManager.getDispatch(data.dispatchId);
    },
  );

  ipcMain.handle(
    MULTI_AGENTS_LIST_CHAT,
    (_e, data: { projectId: string; conversationId?: string }) => {
      const project = projectManager.get(data.projectId);
      if (!project) throw new Error("Project not found");
      return sessionManager.listChatMessages(project.id, data.conversationId);
    },
  );

  ipcMain.handle(MULTI_AGENTS_CLEAR_CHAT, (_e, data: { projectId: string }) => {
    const project = projectManager.get(data.projectId);
    if (!project) throw new Error("Project not found");
    sessionManager.clearChatMessages(project.id);
  });

  // ── Conversations ──

  ipcMain.handle(
    MULTI_AGENTS_CREATE_CONVERSATION,
    (_e, data: { projectId: string; title?: string }) => {
      const project = projectManager.get(data.projectId);
      if (!project) throw new Error("Project not found");
      return sessionManager.createConversation(project.id, data.title);
    },
  );

  ipcMain.handle(
    MULTI_AGENTS_LIST_CONVERSATIONS,
    (_e, data: { projectId: string }) => {
      const project = projectManager.get(data.projectId);
      if (!project) throw new Error("Project not found");
      return sessionManager.listConversations(project.id);
    },
  );

  ipcMain.handle(
    MULTI_AGENTS_DELETE_CONVERSATION,
    (_e, data: { conversationId: string }) => {
      sessionManager.deleteConversation(data.conversationId);
    },
  );

  ipcMain.handle(
    MULTI_AGENTS_GET_ARTIFACTS,
    (_e, data: { conversationId: string }) => {
      return sessionManager.getConversationArtifacts(data.conversationId);
    },
  );
}
