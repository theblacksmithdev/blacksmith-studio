import { create } from "zustand";
import type {
  AgentRole,
  AgentEvent,
  AgentInfo,
  BuildEvent,
  InputRequest,
  DispatchTask,
  DispatchPlan,
} from "@/api/types";

interface ActivityEntry {
  id: string;
  text: string;
  status: "thinking" | "executing" | "done" | "error";
  timestamp: string;
}

/** A single logged event for the agent inner view */
export interface AgentLogEntry {
  id: string;
  type:
    | "thinking"
    | "message"
    | "tool_use"
    | "tool_result"
    | "activity"
    | "error"
    | "done";
  content: string;
  timestamp: string;
  /** Tool name for tool_use/tool_result entries */
  toolName?: string;
  /** Tool input for tool_use entries */
  toolInput?: Record<string, unknown>;
  /** Whether a message is still streaming */
  isPartial?: boolean;
}

interface AgentActivity {
  role: AgentRole;
  status: "idle" | "thinking" | "executing" | "done" | "error";
  activity: string | null;
  lastEvent: AgentEvent | null;
  history: ActivityEntry[];
  /** Full event stream for the inner view */
  eventLog: AgentLogEntry[];
}

interface ChatAttachment {
  id: string;
  name: string;
  kind: "image" | "text" | "code" | "pdf" | "file";
  mime: string;
  size: number;
  absPath: string;
  relPath: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "agent" | "system";
  agentRole?: AgentRole;
  content: string;
  attachments?: ChatAttachment[];
  timestamp: string;
}

interface AgentState {
  agents: AgentInfo[];
  activities: Map<AgentRole, AgentActivity>;
  /**
   * Optimistic in-flight messages for the active conversation: user prompts
   * and system/cost messages added during dispatch. Cleared once React Query
   * refetches `useAgentChatQuery` with the latest persisted data.
   */
  liveMessages: ChatMessage[];
  selectedAgent: AgentRole | null;
  buildActive: boolean;
  buildEvents: BuildEvent[];
  pendingInputs: InputRequest[];

  /** Current dispatch plan from PM */
  dispatchPlan: DispatchPlan | null;
  /** Tasks with live status tracking */
  dispatchTasks: DispatchTask[];
  /** Sub-tasks created by agent self-decomposition, keyed by parent agent role */
  subtasks: Map<
    string,
    {
      id: string;
      title: string;
      status: string;
      index: number;
      total: number;
    }[]
  >;
  /** Whether the task tray is visible */
  taskTrayOpen: boolean;

  // Actions
  setAgents: (agents: AgentInfo[]) => void;
  handleAgentEvent: (event: AgentEvent) => void;
  handleBuildEvent: (event: BuildEvent) => void;
  addInputRequest: (request: InputRequest) => void;
  removeInputRequest: (requestId: string) => void;
  addLiveMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearLiveMessages: () => void;
  selectAgent: (role: AgentRole | null) => void;
  setDispatchPlan: (plan: DispatchPlan) => void;
  updateTaskStatus: (taskId: string, status: DispatchTask["status"]) => void;
  clearDispatch: () => void;
  toggleTaskTray: () => void;
  setTaskTrayOpen: (open: boolean) => void;
  clearAll: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  activities: new Map(),
  liveMessages: [],
  selectedAgent: null,
  buildActive: false,
  buildEvents: [],
  pendingInputs: [],
  dispatchPlan: null,
  dispatchTasks: [],
  subtasks: new Map(),
  taskTrayOpen: false,

  setAgents: (agents) => set({ agents }),

  handleAgentEvent: (event) =>
    set((state) => {
      // Handle dispatch_plan events — open the task tray immediately when PM produces a plan.
      // On re-plan (mid-pipeline), merge: preserve completed/running statuses, add new pending tasks.
      if (event.data.type === "dispatch_plan") {
        const planData = (event.data as any).plan;
        if (planData?.tasks) {
          const existingStatuses = new Map(
            state.dispatchTasks.map((t) => [t.id, t.status]),
          );
          return {
            dispatchPlan: planData,
            dispatchTasks: planData.tasks.map((t: any) => ({
              ...t,
              status: existingStatuses.get(t.id) ?? ("pending" as const),
            })),
            taskTrayOpen: true,
          };
        }
        return {};
      }

      // Handle task_status events — direct task tray updates
      if (event.data.type === "task_status") {
        const { taskId, status } = event.data as {
          taskId: string;
          status: DispatchTask["status"];
        };

        return {
          dispatchTasks: state.dispatchTasks.map((t) =>
            t.id === taskId ? { ...t, status } : t,
          ),
        };
      }

      // Handle subtask_status events — track sub-tasks from agent self-decomposition
      if (event.data.type === "subtask_status") {
        const { subtaskId, status, title, index, total } = event.data as any;
        const agentId = event.agentId;
        const subtasks = new Map(state.subtasks);
        const existing = subtasks.get(agentId) ?? [];

        const idx = existing.findIndex((s) => s.id === subtaskId);
        if (idx >= 0) {
          existing[idx] = { ...existing[idx], status };
        } else {
          existing.push({ id: subtaskId, title, status, index, total });
        }

        subtasks.set(agentId, [...existing]);
        return { subtasks };
      }

      const activities = new Map(state.activities);
      const agentId = event.agentId as AgentRole;

      const current = activities.get(agentId) ?? {
        role: agentId,
        status: "idle" as const,
        activity: null,
        lastEvent: null,
        history: [],
        eventLog: [],
      };

      const updated = {
        ...current,
        lastEvent: event,
        history: [...current.history],
        eventLog: [...current.eventLog],
      };
      const ts = event.timestamp ?? new Date().toISOString();

      if (event.data.type === "status") {
        updated.status = event.data.status;
        if (event.data.message) {
          updated.activity = event.data.message;
          updated.history.push({
            id: crypto.randomUUID(),
            text: event.data.message,
            status: event.data.status,
            timestamp: ts,
          });
        }
      } else if (event.data.type === "thinking") {
        updated.eventLog.push({
          id: crypto.randomUUID(),
          type: "thinking",
          content: event.data.content,
          timestamp: ts,
        });
      } else if (event.data.type === "message") {
        // For partial messages, update the last message entry if it exists
        if (event.data.isPartial && updated.eventLog.length > 0) {
          const last = updated.eventLog[updated.eventLog.length - 1];
          if (last.type === "message" && last.isPartial) {
            updated.eventLog[updated.eventLog.length - 1] = {
              ...last,
              content: last.content + event.data.content,
            };
            activities.set(agentId, updated);
            return { activities };
          }
        }
        updated.eventLog.push({
          id: crypto.randomUUID(),
          type: "message",
          content: event.data.content,
          timestamp: ts,
          isPartial: event.data.isPartial,
        });
      } else if (event.data.type === "tool_use") {
        updated.eventLog.push({
          id: crypto.randomUUID(),
          type: "tool_use",
          content: event.data.toolName,
          toolName: event.data.toolName,
          toolInput: event.data.input,
          timestamp: ts,
        });
      } else if (event.data.type === "tool_result") {
        updated.eventLog.push({
          id: crypto.randomUUID(),
          type: "tool_result",
          content: event.data.output,
          timestamp: ts,
        });
      } else if (event.data.type === "activity") {
        updated.activity = event.data.description;
        updated.history.push({
          id: crypto.randomUUID(),
          text: event.data.description,
          status: (updated.status as any) ?? "executing",
          timestamp: ts,
        });
        updated.eventLog.push({
          id: crypto.randomUUID(),
          type: "activity",
          content: event.data.description,
          timestamp: ts,
        });
      } else if (event.data.type === "done") {
        updated.status = "done";
        updated.activity = event.data.summary ?? "Done";
        updated.history.push({
          id: crypto.randomUUID(),
          text: event.data.summary ?? "Completed",
          status: "done",
          timestamp: ts,
        });
        updated.eventLog.push({
          id: crypto.randomUUID(),
          type: "done",
          content: event.data.summary ?? "Completed",
          timestamp: ts,
        });
      } else if (event.data.type === "error") {
        updated.status = "error";
        updated.activity = event.data.error;
        updated.history.push({
          id: crypto.randomUUID(),
          text: event.data.error,
          status: "error",
          timestamp: ts,
        });
        updated.eventLog.push({
          id: crypto.randomUUID(),
          type: "error",
          content: event.data.error,
          timestamp: ts,
        });
      }

      activities.set(agentId, updated);

      const agents = state.agents.map((a) =>
        a.role === agentId
          ? {
              ...a,
              isRunning:
                updated.status === "thinking" || updated.status === "executing",
            }
          : a,
      );

      return { activities, agents };
    }),

  handleBuildEvent: (event) =>
    set((state) => {
      const buildActive =
        !event.type.includes("completed") &&
        !event.type.includes("failed") &&
        !event.type.includes("cancelled");

      return {
        buildEvents: [...state.buildEvents, event],
        buildActive,
      };
    }),

  addInputRequest: (request) =>
    set((state) => ({
      pendingInputs: [...state.pendingInputs, request],
    })),

  removeInputRequest: (requestId) =>
    set((state) => ({
      pendingInputs: state.pendingInputs.filter((r) => r.id !== requestId),
    })),

  addLiveMessage: (msg) =>
    set((state) => ({
      liveMessages: [
        ...state.liveMessages,
        {
          ...msg,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  clearLiveMessages: () => set({ liveMessages: [], buildEvents: [] }),

  selectAgent: (role) => set({ selectedAgent: role }),

  setDispatchPlan: (plan) =>
    set({
      dispatchPlan: plan,
      dispatchTasks: plan.tasks.map((t) => ({
        ...t,
        status: "pending" as const,
      })),
      taskTrayOpen: true,
    }),

  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      dispatchTasks: state.dispatchTasks.map((t) =>
        t.id === taskId ? { ...t, status } : t,
      ),
    })),

  clearDispatch: () =>
    set({ dispatchPlan: null, dispatchTasks: [], taskTrayOpen: false }),

  toggleTaskTray: () => set((state) => ({ taskTrayOpen: !state.taskTrayOpen })),

  setTaskTrayOpen: (open) => set({ taskTrayOpen: open }),

  clearAll: () =>
    set({
      agents: [],
      activities: new Map(),
      liveMessages: [],
      selectedAgent: null,
      buildActive: false,
      buildEvents: [],
      pendingInputs: [],
      dispatchPlan: null,
      dispatchTasks: [],
      subtasks: new Map(),
      taskTrayOpen: false,
    }),
}));
