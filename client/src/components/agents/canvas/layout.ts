import type { Node, Edge } from '@xyflow/react'
import type { AgentRole, AgentInfo } from '@/api/types'
import type { AgentNodeData } from '../node'

export type EdgeTypeValue = 'default' | 'smoothstep' | 'step' | 'straight'

export const EDGE_TYPE_OPTIONS = [
  { value: 'default' as const, label: 'Bezier' },
  { value: 'smoothstep' as const, label: 'Smooth' },
  { value: 'step' as const, label: 'Step' },
  { value: 'straight' as const, label: 'Straight' },
]

/** Semantic positions mirroring the dev pipeline: Planning → Building → Quality */
const POSITIONS: Record<AgentRole, { x: number; y: number; isCenter?: boolean }> = {
  'product-manager':    { x: 80,  y: 300, isCenter: true },
  'architect':          { x: 300, y: 100 },
  'ui-designer':        { x: 300, y: 500 },
  'database-engineer':  { x: 340, y: 300 },
  'backend-engineer':   { x: 560, y: 300 },
  'frontend-engineer':  { x: 780, y: 220 },
  'fullstack-engineer': { x: 780, y: 420 },
  'qa-engineer':        { x: 560, y: 520 },
  'code-reviewer':      { x: 780, y: 600 },
  'security-engineer':  { x: 340, y: 520 },
  'devops-engineer':    { x: 560, y: 100 },
  'technical-writer':   { x: 1000, y: 420 },
}

/** Static pipeline connections showing the natural dev flow */
const CONNECTIONS: [string, string][] = [
  ['product-manager', 'architect'],
  ['product-manager', 'database-engineer'],
  ['product-manager', 'ui-designer'],
  ['product-manager', 'devops-engineer'],
  ['architect', 'database-engineer'],
  ['architect', 'devops-engineer'],
  ['database-engineer', 'backend-engineer'],
  ['backend-engineer', 'frontend-engineer'],
  ['ui-designer', 'frontend-engineer'],
  ['backend-engineer', 'fullstack-engineer'],
  ['backend-engineer', 'qa-engineer'],
  ['frontend-engineer', 'qa-engineer'],
  ['qa-engineer', 'code-reviewer'],
  ['security-engineer', 'qa-engineer'],
  ['code-reviewer', 'technical-writer'],
]

export function buildNodes(agents: AgentInfo[]): Node[] {
  return agents
    .filter((a) => POSITIONS[a.role])
    .map((agent) => {
      const pos = POSITIONS[agent.role]
      return {
        id: agent.role,
        type: 'agent',
        position: { x: pos.x, y: pos.y },
        data: {
          role: agent.role,
          title: agent.title,
          status: 'idle',
          activity: null,
          selected: false,
          isCenter: pos.isCenter ?? false,
        } satisfies AgentNodeData,
      }
    })
}

export function buildStaticEdges(type: EdgeTypeValue = 'default'): Edge[] {
  return CONNECTIONS.map(([source, target]) => ({
    id: `static-${source}-${target}`,
    source,
    target,
    type,
    animated: false,
    style: { stroke: 'var(--studio-border-hover)', strokeWidth: 1, opacity: 0.5 },
  }))
}
