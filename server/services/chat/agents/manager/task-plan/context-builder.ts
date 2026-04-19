import type { AgentExecuteOptions } from "../../base/index.js";
import type { AgentRole, AgentExecution } from "../../types.js";
import type { DispatchTask } from "../pm-dispatcher/index.js";
import type { IAgentExecutor } from "./types.js";

/** Provider-agnostic tier → concrete model ID */
const MODEL_MAP: Record<string, string> = {
  premium: "claude-opus-4-6",
  balanced: "claude-sonnet-4-6",
  fast: "claude-haiku-4-5-20251001",
};

/**
 * Builds the execution context for a dispatched task and runs it.
 *
 * Single Responsibility: prompt context assembly and model mapping.
 *
 * - First run for a role: injects artifact references + task roadmap.
 * - Continuation for a role: lightweight "next task" preamble.
 * - Maps PM-assigned model tiers to concrete model IDs.
 */
export class TaskContextBuilder {
  constructor(private readonly executor: IAgentExecutor) {}

  /**
   * Build context, resolve model/session, and execute the task.
   * Returns the execution and updates pipelineSessions on success.
   */
  async executeWithContext(
    task: DispatchTask,
    baseOptions: AgentExecuteOptions,
    completed: Map<string, AgentExecution>,
    artifactPaths: Map<string, string>,
    pipelineSessions: Map<AgentRole, string>,
    allTasks: DispatchTask[],
    priorRoleSessions: Map<AgentRole, string>,
  ): Promise<AgentExecution> {
    // First-run *in this dispatch* — the role may still have a prior session
    // from an earlier dispatch in the same conversation, but it has not yet
    // seen this dispatch's artifacts or plan, so it still gets the full
    // first-run preamble.
    const isFirstRunForRole = !pipelineSessions.has(task.role);
    const contextPrefix = isFirstRunForRole
      ? this.buildFirstRunContext(
          task,
          completed,
          artifactPaths,
          allTasks,
          baseOptions,
        )
      : this.buildContinuationContext(task, allTasks);

    // Prefer an in-dispatch session (continuation), otherwise resume the
    // role's most recent session from this conversation so agents carry
    // memory across dispatches.
    const existingSession =
      pipelineSessions.get(task.role) ?? priorRoleSessions.get(task.role);
    const isResume = !!existingSession;

    // Map provider-agnostic tier to concrete model ID
    // TODO: make this configurable when multi-provider support lands
    const taskModel = task.model
      ? (MODEL_MAP[task.model] ?? undefined)
      : undefined;

    const execution = await this.executor.execute({
      ...baseOptions,
      prompt: contextPrefix + task.prompt,
      role: task.role,
      sessionId: existingSession,
      resume: isResume,
      agentConfig: taskModel
        ? { ...baseOptions.agentConfig!, model: taskModel }
        : baseOptions.agentConfig,
    });

    // Store session for pipeline-scoped continuity (cross-dispatch is
    // handled by AgentManager.execute() which always updates roleSessions)
    if (execution.sessionId) {
      pipelineSessions.set(task.role, execution.sessionId);
    }

    return execution;
  }

  /** Full context for the first task a role sees: artifacts + roadmap */
  private buildFirstRunContext(
    task: DispatchTask,
    completed: Map<string, AgentExecution>,
    artifactPaths: Map<string, string>,
    allTasks: DispatchTask[],
    baseOptions: AgentExecuteOptions,
  ): string {
    const parts: string[] = [];

    // 0. Original user request + PM plan summary (so every worker sees the
    //    overall intent, not just its isolated task prompt)
    const ctx = baseOptions.conversationContext;
    if (ctx) {
      parts.push(ctx.formatWorkerPreamble(ctx.latestPlanSummary));
    }

    // 1. All artifacts from previous agents
    for (const [prevTaskId, prevExec] of completed) {
      if (prevExec.status !== "done") continue;
      if (prevExec.agentId === task.role) continue;

      const artifactPath = artifactPaths.get(prevTaskId);
      if (artifactPath) {
        const roleName = prevExec.agentId.replace(/-/g, " ");
        parts.push(
          `## Artifact from ${roleName}\n\n` +
            `The ${roleName} has completed their work and produced an artifact.\n` +
            `**Read this file for context:** \`${artifactPath}\`\n` +
            `This contains their full output — specifications, decisions, or a summary of changes made.`,
        );
      } else if (prevExec.responseText.trim()) {
        const preview =
          prevExec.responseText.length > 4000
            ? prevExec.responseText.slice(0, 4000) + "\n\n... (truncated)"
            : prevExec.responseText;
        parts.push(
          `## Output from ${prevExec.agentId.replace(/-/g, " ")}\n\n${preview}`,
        );
      }
    }

    // 2. Roadmap of ALL tasks assigned to this role in the pipeline
    const roleTasks = allTasks.filter((t) => t.role === task.role);
    if (roleTasks.length > 1) {
      const roadmap = roleTasks
        .map(
          (t, idx) =>
            `  ${t.id === task.id ? "→" : " "} ${idx + 1}. ${t.title}`,
        )
        .join("\n");
      parts.push(
        `## Your task roadmap\n\n` +
          `You have ${roleTasks.length} tasks to complete in this session. ` +
          `Work through them one at a time — I will tell you when to move to the next one.\n\n` +
          `${roadmap}\n\n` +
          `Starting with task 1 below.`,
      );
    }

    return parts.length > 0 ? parts.join("\n\n---\n\n") + "\n\n---\n\n" : "";
  }

  /** Lightweight preamble for a role that already has context in session */
  private buildContinuationContext(
    task: DispatchTask,
    allTasks: DispatchTask[],
  ): string {
    const roleTasks = allTasks.filter((t) => t.role === task.role);
    const taskNum = roleTasks.findIndex((t) => t.id === task.id) + 1;
    return (
      `## Next task (${taskNum}/${roleTasks.length}): ${task.title}\n\n` +
      `Proceed to the next task. You already have the full context from the artifacts and previous work in this session.\n\n`
    );
  }
}
