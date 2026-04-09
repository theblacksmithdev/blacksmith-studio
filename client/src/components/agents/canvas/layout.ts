import type { Node } from '@xyflow/react'
import type { AgentRole, AgentInfo } from '@/api/types'
import type { AgentNodeData } from '../node'

/** Center of the radial layout */
const CENTER = { x: 500, y: 400 }

/** Radius from center to outer ring nodes */
const RADIUS = 340

/**
 * Radial order — clockwise from 12 o'clock.
 * Grouped by discipline: planning → design → engineering → quality → ops.
 */
const RING_ORDER: AgentRole[] = [
  'architect',
  'ui-designer',
  'frontend-engineer',
  'fullstack-engineer',
  'backend-engineer',
  'database-engineer',
  'devops-engineer',
  'security-engineer',
  'qa-engineer',
  'code-reviewer',
  'technical-writer',
]

/** Node dimensions for centering (half-width, half-height approx) */
const NODE_OFFSET = { x: 76, y: 50 }
const CENTER_OFFSET = { x: 88, y: 55 }

function radialPosition(index: number, total: number): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2 // start at 12 o'clock
  return {
    x: Math.round(CENTER.x + RADIUS * Math.cos(angle) - NODE_OFFSET.x),
    y: Math.round(CENTER.y + RADIUS * Math.sin(angle) - NODE_OFFSET.y),
  }
}

/** Hub-and-spoke connections: PM ↔ every agent */
export const CONNECTIONS: [string, string][] = RING_ORDER.map(
  (role) => ['product-manager', role],
)

export function buildNodes(agents: AgentInfo[]): Node[] {
  const positions = new Map<AgentRole, { x: number; y: number; isCenter: boolean }>()

  // PM at center
  positions.set('product-manager', {
    x: CENTER.x - CENTER_OFFSET.x,
    y: CENTER.y - CENTER_OFFSET.y,
    isCenter: true,
  })

  // Outer ring
  const total = RING_ORDER.length
  RING_ORDER.forEach((role, i) => {
    const pos = radialPosition(i, total)
    positions.set(role, { ...pos, isCenter: false })
  })

  return agents
    .filter((a) => positions.has(a.role))
    .map((agent) => {
      const pos = positions.get(agent.role)!
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
          isCenter: pos.isCenter,
        } satisfies AgentNodeData,
      }
    })
}
