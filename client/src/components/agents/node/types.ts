import type { AgentRole, AgentTeam } from '@/api/types'

export interface AgentNodeData {
  role: AgentRole
  title: string
  status: 'idle' | 'thinking' | 'executing' | 'done' | 'error'
  activity: string | null
  selected: boolean
  isCenter: boolean
}

export interface TeamNodeData {
  team: AgentTeam
  title: string
  memberCount: number
  activeCount: number
}
