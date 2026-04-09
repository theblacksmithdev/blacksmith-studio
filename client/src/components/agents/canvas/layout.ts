import type { Node } from '@xyflow/react'
import type { AgentRole, AgentInfo } from '@/api/types'
import type { AgentNodeData } from '../node'

/**
 * Real-world engineering team layout — top-down pipeline flow.
 *
 *   Row 0  Strategy:    Product Manager
 *   Row 1  Planning:    Architect · UI Designer
 *   Row 2  Build:       Database · Backend · Frontend · Fullstack
 *   Row 3  Quality:     Security · QA · Code Reviewer
 *   Row 4  Ship:        DevOps · Technical Writer
 */

const ROW_Y = [0, 160, 320, 480, 640]

/** Positions — centered per tier, even spacing within each row */
const POSITIONS: Record<AgentRole, { x: number; y: number; isCenter?: boolean }> = {
  // ── Strategy ──
  'product-manager':    { x: 420, y: ROW_Y[0], isCenter: true },

  // ── Planning ──
  'architect':          { x: 240, y: ROW_Y[1] },
  'ui-designer':        { x: 600, y: ROW_Y[1] },

  // ── Build ──
  'database-engineer':  { x: 60,  y: ROW_Y[2] },
  'backend-engineer':   { x: 300, y: ROW_Y[2] },
  'frontend-engineer':  { x: 540, y: ROW_Y[2] },
  'fullstack-engineer': { x: 780, y: ROW_Y[2] },

  // ── Quality ──
  'security-engineer':  { x: 160, y: ROW_Y[3] },
  'qa-engineer':        { x: 420, y: ROW_Y[3] },
  'code-reviewer':      { x: 680, y: ROW_Y[3] },

  // ── Ship ──
  'devops-engineer':    { x: 240, y: ROW_Y[4] },
  'technical-writer':   { x: 600, y: ROW_Y[4] },
}

/**
 * Edges model real workflow handoffs:
 *
 *  PM → planners:         requirements flow to architect & designer
 *  Planners → builders:   architecture/designs flow to engineers
 *  Builders → quality:    code flows to QA, security audits
 *  Quality → shipping:    approved work flows to devops & docs
 */
export const CONNECTIONS: [string, string][] = [
  // PM delegates to planners
  ['product-manager', 'architect'],
  ['product-manager', 'ui-designer'],

  // Architect distributes technical work
  ['architect', 'database-engineer'],
  ['architect', 'backend-engineer'],
  ['architect', 'devops-engineer'],

  // Designer hands off to frontend
  ['ui-designer', 'frontend-engineer'],

  // Build-phase handoffs
  ['database-engineer', 'backend-engineer'],
  ['backend-engineer', 'frontend-engineer'],
  ['backend-engineer', 'fullstack-engineer'],
  ['frontend-engineer', 'fullstack-engineer'],

  // Engineers hand off to quality
  ['backend-engineer', 'qa-engineer'],
  ['frontend-engineer', 'qa-engineer'],
  ['fullstack-engineer', 'qa-engineer'],

  // Quality pipeline
  ['qa-engineer', 'code-reviewer'],
  ['security-engineer', 'code-reviewer'],
  ['devops-engineer', 'security-engineer'],

  // Shipping
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
