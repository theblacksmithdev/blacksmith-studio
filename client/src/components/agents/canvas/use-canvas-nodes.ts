import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNodesState, type Node, type NodeChange } from '@xyflow/react'
import { useAgentStore } from '@/stores/agent-store'
import { useSettings } from '@/hooks/use-settings'
import type { AgentRole, AgentInfo } from '@/api/types'
import type { AgentNodeData } from '../node'
import { buildNodes } from './layout'

/**
 * Manages node state: initial build, activity sync, drag persistence.
 * Positions are saved per conversation.
 */
export function useCanvasNodes(agents: AgentInfo[], conversationId?: string) {
  const activities = useAgentStore((s) => s.activities)
  const selectedAgent = useAgentStore((s) => s.selectedAgent)
  const settings = useSettings()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const positionsKey = conversationId
    ? `agents.nodePositions.${conversationId}`
    : 'agents.nodePositions'

  const initialNodes = useMemo(() => {
    const defaultNodes = buildNodes(agents)
    const saved = settings.get(positionsKey) as Record<string, { x: number; y: number }> | undefined
    if (!saved) return defaultNodes
    return defaultNodes.map((node) => {
      const pos = saved[node.id]
      return pos ? { ...node, position: pos } : node
    })
  }, [agents, positionsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)

  // Reload when conversation changes
  useEffect(() => {
    const defaultNodes = buildNodes(agents)
    const saved = settings.get(positionsKey) as Record<string, { x: number; y: number }> | undefined
    setNodes(defaultNodes.map((node) => {
      const pos = saved?.[node.id]
      return pos ? { ...node, position: pos } : node
    }))
  }, [positionsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync activity data into node data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const activity = activities.get(node.id as AgentRole)
        const data = node.data as unknown as AgentNodeData
        return {
          ...node,
          data: {
            ...data,
            status: activity?.status ?? 'idle',
            activity: activity?.activity ?? null,
            selected: selectedAgent === node.id,
            isCenter: data.isCenter,
          },
        }
      }),
    )
  }, [activities, selectedAgent, setNodes])

  // Persist on drag end (debounced)
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes)
    const hasDragEnd = changes.some((c) => c.type === 'position' && !c.dragging)
    if (!hasDragEnd) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setNodes((current) => {
        const positions: Record<string, { x: number; y: number }> = {}
        for (const node of current) positions[node.id] = node.position
        settings.set(positionsKey, positions)
        return current
      })
    }, 500)
  }, [onNodesChange, setNodes, settings, positionsKey])

  return { nodes, handleNodesChange }
}
