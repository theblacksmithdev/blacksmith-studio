import { useEffect } from 'react'
import { useEdgesState, type Edge } from '@xyflow/react'
import { useAgentStore } from '@/stores/agent-store'
import { CONNECTIONS } from './layout'
import type { CanvasSettings } from './settings'

/**
 * Pipeline edges modelling real engineering workflow.
 * An edge lights up when work is flowing through it (source or target active).
 * All styling driven by persisted canvas settings.
 */
export function useCanvasEdges(nodeIds: Set<string>, canvas: CanvasSettings) {
  const activities = useAgentStore((s) => s.activities)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Destructure to stable primitives so the effect only fires on actual value changes
  const { edgeType, edgeWidth, edgeActiveWidth, edgeOpacity, edgeAnimated } = canvas

  useEffect(() => {
    const active = new Set<string>()
    for (const [, a] of activities) {
      if (a.status === 'thinking' || a.status === 'executing') active.add(a.role)
    }

    const next: Edge[] = CONNECTIONS
      .filter(([s, t]) => nodeIds.has(s) && nodeIds.has(t))
      .map(([source, target]) => {
        const isActive = active.has(source) || active.has(target)

        return {
          id: `${source}-${target}`,
          source,
          target,
          type: edgeType,
          animated: isActive && edgeAnimated,
          style: isActive
            ? { stroke: 'rgba(16, 163, 127, 0.6)', strokeWidth: edgeActiveWidth }
            : { stroke: 'var(--studio-border)', strokeWidth: edgeWidth, opacity: edgeOpacity },
        }
      })

    setEdges(next)
  }, [activities, nodeIds, setEdges, edgeType, edgeWidth, edgeActiveWidth, edgeOpacity, edgeAnimated])

  return { edges, onEdgesChange }
}
