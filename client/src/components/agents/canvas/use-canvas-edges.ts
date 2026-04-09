import { useEffect } from 'react'
import { useEdgesState, type Edge } from '@xyflow/react'
import { useAgentStore } from '@/stores/agent-store'
import { buildStaticEdges, type EdgeTypeValue } from './layout'

/**
 * Manages edge state: static pipeline edges + dynamic interaction edges.
 * Dynamic edges only appear when liveEdges is true.
 */
export function useCanvasEdges(
  nodeIds: Set<string>,
  edgeType: EdgeTypeValue,
  liveEdges: boolean,
) {
  const interactions = useAgentStore((s) => s.interactions)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    const edgeMap = new Map<string, Edge>()

    // Static pipeline edges (always visible)
    for (const edge of buildStaticEdges(edgeType)) {
      if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
        edgeMap.set(edge.id, edge)
      }
    }

    // Dynamic interaction edges — only when live mode is on
    if (liveEdges) {
      for (const interaction of interactions) {
        if (!nodeIds.has(interaction.from) || !nodeIds.has(interaction.to)) continue

        const edgeId = `${interaction.from}->${interaction.to}`
        edgeMap.delete(`static-${interaction.from}-${interaction.to}`)
        edgeMap.delete(`static-${interaction.to}-${interaction.from}`)

        const shortLabel = interaction.label.length > 30
          ? interaction.label.slice(0, 28) + '...'
          : interaction.label

        if (interaction.active) {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: interaction.from,
            target: interaction.to,
            type: edgeType,
            animated: true,
            label: shortLabel,
            labelStyle: { fontSize: 8, fontWeight: 600, fill: 'var(--studio-green)', letterSpacing: '0.01em' },
            labelBgStyle: { fill: 'var(--studio-bg-main)', fillOpacity: 0.95 },
            labelBgPadding: [3, 6] as [number, number],
            labelBgBorderRadius: 4,
            style: { stroke: 'rgba(16, 163, 127, 0.5)', strokeWidth: 1.5 },
          })
        } else {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: interaction.from,
            target: interaction.to,
            type: edgeType,
            animated: false,
            label: shortLabel,
            labelStyle: { fontSize: 7, fontWeight: 500, fill: 'var(--studio-text-muted)' },
            labelBgStyle: { fill: 'var(--studio-bg-main)', fillOpacity: 0.85 },
            labelBgPadding: [2, 5] as [number, number],
            labelBgBorderRadius: 3,
            style: { stroke: 'var(--studio-border)', strokeWidth: 1, opacity: 0.35 },
          })
        }
      }
    }

    setEdges(Array.from(edgeMap.values()))
  }, [interactions, nodeIds, setEdges, liveEdges, edgeType])

  return { edges, onEdgesChange }
}
