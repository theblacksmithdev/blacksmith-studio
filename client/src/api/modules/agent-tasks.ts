import { api as raw } from "../client";
import type { AgentTask, TaskDependency, TaskNote } from "../types";

export const agentTasks = {
  list: (dispatchId: string) =>
    raw.invoke<AgentTask[]>("agentTasks:list", { dispatchId }),

  get: (taskId: string) =>
    raw.invoke<AgentTask | null>("agentTasks:get", { taskId }),

  listNotes: (taskId: string) =>
    raw.invoke<TaskNote[]>("agentTasks:listNotes", { taskId }),

  addNote: (taskId: string, authorRole: string, content: string) =>
    raw.invoke<TaskNote>("agentTasks:addNote", {
      taskId,
      authorRole,
      content,
    }),

  listDependencies: (dispatchId: string) =>
    raw.invoke<TaskDependency[]>("agentTasks:listDependencies", {
      dispatchId,
    }),
} as const;
