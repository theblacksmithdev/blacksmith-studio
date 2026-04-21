import crypto from "node:crypto";
import { mapDispatch } from "../mappers.js";
import type {
  DispatchRepository,
  TaskRepository,
  DispatchUpdate,
  TaskUpdate,
} from "../repositories/index.js";
import type {
  AgentDispatchRecord,
  SubTaskInput,
  TaskInput,
  TaskStatusUpdate,
} from "../types.js";

const TERMINAL_DISPATCH_STATUSES = new Set([
  "completed",
  "failed",
  "cancelled",
]);

/**
 * High-level operations on dispatches and their tasks.
 *
 * Single Responsibility: dispatch + task write orchestration + reads that
 * hydrate a dispatch with its tasks. Composes DispatchRepository and
 * TaskRepository — the services layer is where multi-repo operations live.
 */
export class DispatchService {
  constructor(
    private readonly dispatches: DispatchRepository,
    private readonly tasks: TaskRepository,
  ) {}

  /** Create a dispatch row along with its initial task list. */
  create(
    projectId: string,
    prompt: string,
    planMode: string,
    planSummary: string,
    tasks: TaskInput[],
    conversationId?: string,
  ): string {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.dispatches.insert({
      id,
      projectId,
      conversationId: conversationId ?? null,
      prompt,
      planMode,
      planSummary,
      status: "executing",
      totalCostUsd: "0",
      totalDurationMs: 0,
      createdAt: now,
    });

    tasks.forEach((task, i) => {
      this.tasks.insert({
        id: task.id,
        dispatchId: id,
        title: task.title,
        description: task.description ?? null,
        role: task.role,
        prompt: task.prompt,
        status: "pending",
        taskType: "main",
        orderIndex: i,
      });
    });

    return id;
  }

  /** Persist decomposed sub-tasks linked to a parent task. */
  addSubTasks(
    dispatchId: string,
    parentTaskId: string,
    subtasks: SubTaskInput[],
  ): void {
    subtasks.forEach((sub, i) => {
      this.tasks.insert({
        id: sub.id,
        dispatchId,
        title: sub.title,
        description: sub.description ?? null,
        role: sub.role,
        prompt: sub.prompt,
        status: "pending",
        taskType: "subtask",
        parentTaskId,
        orderIndex: i,
      });
    });
  }

  updateDispatchStatus(
    dispatchId: string,
    status: string,
    totalCostUsd?: number,
    totalDurationMs?: number,
  ): void {
    const patch: DispatchUpdate = { status };
    if (totalCostUsd != null) patch.totalCostUsd = String(totalCostUsd);
    if (totalDurationMs != null) patch.totalDurationMs = totalDurationMs;
    if (TERMINAL_DISPATCH_STATUSES.has(status)) {
      patch.completedAt = new Date().toISOString();
    }
    this.dispatches.update(dispatchId, patch);
  }

  updateTaskStatus(
    taskId: string,
    status: string,
    data?: TaskStatusUpdate,
  ): void {
    const patch: TaskUpdate = { status };
    if (data?.executionId) patch.executionId = data.executionId;
    if (data?.sessionId) patch.sessionId = data.sessionId;
    if (data?.responseText) patch.responseText = data.responseText;
    if (data?.error) patch.error = data.error;
    if (data?.costUsd != null) patch.costUsd = String(data.costUsd);
    if (data?.durationMs != null) patch.durationMs = data.durationMs;
    if (data?.tokensInput != null) patch.tokensInput = data.tokensInput;
    if (data?.tokensOutput != null) patch.tokensOutput = data.tokensOutput;
    if (data?.tokensCacheRead != null)
      patch.tokensCacheRead = data.tokensCacheRead;
    if (data?.tokensCacheCreation != null)
      patch.tokensCacheCreation = data.tokensCacheCreation;
    if (data?.model != null) patch.model = data.model;
    this.tasks.update(taskId, patch);
  }

  getById(dispatchId: string): AgentDispatchRecord | null {
    const row = this.dispatches.findById(dispatchId);
    if (!row) return null;
    const taskRows = this.tasks.listByDispatch(dispatchId);
    return mapDispatch(row, taskRows);
  }

  list(projectId: string, limit = 50): AgentDispatchRecord[] {
    return this.dispatches.listByProject(projectId, limit).map((row) => {
      const taskRows = this.tasks.listByDispatch(row.id);
      return mapDispatch(row, taskRows);
    });
  }

  latestSessionForRoleInConversation(
    conversationId: string,
    role: string,
  ): string | null {
    return this.tasks.findLatestSessionForRoleInConversation(
      conversationId,
      role,
    );
  }
}
