import { create } from 'zustand'
import type { AgentRole, AgentEvent, AgentInfo, BuildEvent, InputRequest, DispatchTask, DispatchPlan } from '@/api/types'

interface AgentActivity {
  role: AgentRole
  status: 'idle' | 'thinking' | 'executing' | 'done' | 'error'
  activity: string | null
  lastEvent: AgentEvent | null
}

interface ChatMessage {
  id: string
  role: 'user' | 'agent' | 'system'
  agentRole?: AgentRole
  content: string
  timestamp: string
}

interface AgentState {
  agents: AgentInfo[]
  activities: Map<AgentRole, AgentActivity>
  chatMessages: ChatMessage[]
  selectedAgent: AgentRole | null
  buildActive: boolean
  buildEvents: BuildEvent[]
  pendingInputs: InputRequest[]

  /** Current dispatch plan from PM */
  dispatchPlan: DispatchPlan | null
  /** Tasks with live status tracking */
  dispatchTasks: DispatchTask[]
  /** Sub-tasks created by agent self-decomposition, keyed by parent agent role */
  subtasks: Map<string, { id: string; title: string; status: string; index: number; total: number }[]>
  /** Whether the task tray is visible */
  taskTrayOpen: boolean

  // Actions
  setAgents: (agents: AgentInfo[]) => void
  handleAgentEvent: (event: AgentEvent) => void
  handleBuildEvent: (event: BuildEvent) => void
  addInputRequest: (request: InputRequest) => void
  removeInputRequest: (requestId: string) => void
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  selectAgent: (role: AgentRole | null) => void
  clearChat: () => void
  loadPersistedChat: (messages: ChatMessage[]) => void
  setDispatchPlan: (plan: DispatchPlan) => void
  updateTaskStatus: (taskId: string, status: DispatchTask['status']) => void
  clearDispatch: () => void
  toggleTaskTray: () => void
  setTaskTrayOpen: (open: boolean) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  activities: new Map(),
  chatMessages: [],
  selectedAgent: null,
  buildActive: false,
  buildEvents: [],
  pendingInputs: [],
  dispatchPlan: null,
  dispatchTasks: [],
  subtasks: new Map(),
  taskTrayOpen: false,

  setAgents: (agents) => set({ agents }),

  handleAgentEvent: (event) => set((state) => {
    // Handle dispatch_plan events — open the task tray immediately when PM produces a plan
    if (event.data.type === 'dispatch_plan') {
      const planData = (event.data as any).plan
      if (planData?.tasks) {
        return {
          dispatchPlan: planData,
          dispatchTasks: planData.tasks.map((t: any) => ({ ...t, status: 'pending' as const })),
          taskTrayOpen: true,
        }
      }
      return {}
    }

    // Handle task_status events — direct task tray updates from the PM
    if (event.data.type === 'task_status') {
      const { taskId, status } = event.data as { taskId: string; status: DispatchTask['status'] }
      return {
        dispatchTasks: state.dispatchTasks.map((t) =>
          t.id === taskId ? { ...t, status } : t,
        ),
      }
    }

    // Handle subtask_status events — track sub-tasks from agent self-decomposition
    if (event.data.type === 'subtask_status') {
      const { subtaskId, status, title, index, total } = event.data as any
      const agentId = event.agentId
      const subtasks = new Map(state.subtasks)
      const existing = subtasks.get(agentId) ?? []

      const idx = existing.findIndex((s) => s.id === subtaskId)
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], status }
      } else {
        existing.push({ id: subtaskId, title, status, index, total })
      }

      subtasks.set(agentId, [...existing])
      return { subtasks }
    }

    const activities = new Map(state.activities)
    const agentId = event.agentId as AgentRole

    const current = activities.get(agentId) ?? {
      role: agentId,
      status: 'idle' as const,
      activity: null,
      lastEvent: null,
    }

    const updated = { ...current, lastEvent: event }

    if (event.data.type === 'status') {
      updated.status = event.data.status
      if (event.data.message) updated.activity = event.data.message
    } else if (event.data.type === 'activity') {
      updated.activity = event.data.description
    } else if (event.data.type === 'done') {
      updated.status = 'done'
      updated.activity = event.data.summary ?? 'Done'
    } else if (event.data.type === 'error') {
      updated.status = 'error'
      updated.activity = event.data.error
    }

    activities.set(agentId, updated)

    const agents = state.agents.map((a) =>
      a.role === agentId
        ? { ...a, isRunning: updated.status === 'thinking' || updated.status === 'executing' }
        : a,
    )

    return { activities, agents }
  }),

  handleBuildEvent: (event) => set((state) => {
    const buildActive = !event.type.includes('completed') &&
      !event.type.includes('failed') &&
      !event.type.includes('cancelled')

    return {
      buildEvents: [...state.buildEvents, event],
      buildActive,
    }
  }),

  addInputRequest: (request) => set((state) => ({
    pendingInputs: [...state.pendingInputs, request],
  })),

  removeInputRequest: (requestId) => set((state) => ({
    pendingInputs: state.pendingInputs.filter((r) => r.id !== requestId),
  })),

  addChatMessage: (msg) => set((state) => ({
    chatMessages: [...state.chatMessages, {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }],
  })),

  selectAgent: (role) => set({ selectedAgent: role }),

  clearChat: () => set({ chatMessages: [], buildEvents: [] }),

  loadPersistedChat: (messages) => set({ chatMessages: messages }),

  setDispatchPlan: (plan) => set({
    dispatchPlan: plan,
    dispatchTasks: plan.tasks.map((t) => ({ ...t, status: 'pending' as const })),
    taskTrayOpen: true,
  }),

  updateTaskStatus: (taskId, status) => set((state) => ({
    dispatchTasks: state.dispatchTasks.map((t) =>
      t.id === taskId ? { ...t, status } : t,
    ),
  })),

  clearDispatch: () => set({ dispatchPlan: null, dispatchTasks: [], taskTrayOpen: false }),

  toggleTaskTray: () => set((state) => ({ taskTrayOpen: !state.taskTrayOpen })),

  setTaskTrayOpen: (open) => set({ taskTrayOpen: open }),
}))
