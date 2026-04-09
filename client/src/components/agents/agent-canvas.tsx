import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeChange,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import styled from '@emotion/styled'
import { AgentNode, type AgentNodeData } from './agent-node'
import { useAgentStore } from '@/stores/agent-store'
import { useSettings } from '@/hooks/use-settings'
import type { AgentRole, AgentInfo } from '@/api/types'

const CanvasWrap = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: var(--studio-bg-main);

  .react-flow__background {
    background: var(--studio-bg-main) !important;
  }

  .react-flow__controls {
    bottom: 16px;
    right: 16px;
    left: auto;
    box-shadow: none;
    border: 1px solid var(--studio-border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--studio-bg-surface);
  }

  .react-flow__controls-button {
    background: var(--studio-bg-surface);
    border-bottom: 1px solid var(--studio-border);
    color: var(--studio-text-muted);
    width: 28px;
    height: 28px;

    &:hover {
      background: var(--studio-bg-hover);
      color: var(--studio-text-primary);
    }

    svg {
      fill: currentColor;
      max-width: 12px;
      max-height: 12px;
    }
  }

  .react-flow__edge-path {
    stroke: var(--studio-border);
    stroke-width: 1.5;
  }

  .react-flow__handle {
    opacity: 0;
    transition: opacity 0.12s ease;
  }

  .react-flow__node:hover .react-flow__handle {
    opacity: 0.6;
  }

  .react-flow__minimap,
  .react-flow__attribution {
    display: none;
  }

  .react-flow__pane {
    cursor: default;
  }
`

const nodeTypes: NodeTypes = {
  agent: AgentNode as any,
}

/**
 * Build nodes for agents that are involved in the current work.
 * PM is always shown. Other agents only appear if they have at least one task
 * or interaction. When no work is active, shows all agents.
 */
function buildNodes(agents: AgentInfo[], activeRoles: Set<AgentRole>): Node[] {
  const centerX = 400
  const centerY = 350
  const center: AgentRole = 'product-manager'
  const roleMap = new Map(agents.map((a) => [a.role, a]))

  const nodes: Node[] = []

  // PM always visible
  const pmAgent = roleMap.get(center)
  if (pmAgent) {
    nodes.push({
      id: center,
      type: 'agent',
      position: { x: centerX, y: centerY },
      data: {
        role: center, title: pmAgent.title, status: 'idle', activity: null,
        selected: false, isCenter: true,
      } satisfies AgentNodeData,
    })
  }

  // Filter to only active roles (excluding PM which is already placed)
  const involvedRoles = activeRoles.size > 0
    ? agents.filter((a) => a.role !== center && activeRoles.has(a.role))
    : agents.filter((a) => a.role !== center) // idle: show all

  // Arrange involved agents in a circle around PM
  const radius = involvedRoles.length <= 4 ? 220 : involvedRoles.length <= 8 ? 280 : 340
  involvedRoles.forEach((agent, i) => {
    const angle = (i / involvedRoles.length) * Math.PI * 2 - Math.PI / 2
    nodes.push({
      id: agent.role,
      type: 'agent',
      position: {
        x: centerX + Math.cos(angle) * radius - 80,
        y: centerY + Math.sin(angle) * radius - 50,
      },
      data: {
        role: agent.role, title: agent.title, status: 'idle', activity: null,
        selected: false, isCenter: false,
      } satisfies AgentNodeData,
    })
  })

  return nodes
}

interface AgentCanvasProps {
  agents: AgentInfo[]
  onNodeClick: (role: AgentRole) => void
}

export function AgentCanvas({ agents, onNodeClick }: AgentCanvasProps) {
  const activities = useAgentStore((s) => s.activities)
  const selectedAgent = useAgentStore((s) => s.selectedAgent)
  const interactions = useAgentStore((s) => s.interactions)
  const dispatchTasks = useAgentStore((s) => s.dispatchTasks)
  const settings = useSettings()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Compute which roles are actively involved — from ALL sources
  const activeRoles = useMemo(() => {
    const roles = new Set<AgentRole>()

    // Roles from dispatch tasks
    for (const task of dispatchTasks) {
      roles.add(task.role as AgentRole)
    }

    // Roles from interactions (catches quality gate agents, handoffs, etc.)
    for (const interaction of interactions) {
      roles.add(interaction.from)
      roles.add(interaction.to)
    }

    // Roles that have any non-idle activity (catches agents invoked directly)
    for (const [role, activity] of activities) {
      if (activity.status !== 'idle') {
        roles.add(role)
      }
    }

    // Always include PM if there are any active roles
    if (roles.size > 0) roles.add('product-manager' as AgentRole)

    return roles
  }, [dispatchTasks, interactions, activities])

  // Rebuild nodes when active roles change
  const initialNodes = useMemo(() => {
    const defaultNodes = buildNodes(agents, activeRoles)
    const saved = settings.get('agents.nodePositions') as Record<string, { x: number; y: number }> | undefined
    if (!saved) return defaultNodes
    return defaultNodes.map((node) => {
      const pos = saved[node.id]
      return pos ? { ...node, position: pos } : node
    })
  }, [agents, activeRoles]) // eslint-disable-line react-hooks/exhaustive-deps

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)

  // Update nodes when activeRoles changes (agents appear/disappear)
  useEffect(() => {
    const newNodes = buildNodes(agents, activeRoles)
    const saved = settings.get('agents.nodePositions') as Record<string, { x: number; y: number }> | undefined

    setNodes(newNodes.map((node) => {
      const pos = saved?.[node.id]
      return pos ? { ...node, position: pos } : node
    }))
  }, [activeRoles]) // eslint-disable-line react-hooks/exhaustive-deps
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Persist positions on drag end
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes)
    const hasDragEnd = changes.some((c) => c.type === 'position' && !c.dragging)
    if (!hasDragEnd) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setNodes((current) => {
        const positions: Record<string, { x: number; y: number }> = {}
        for (const node of current) positions[node.id] = node.position
        settings.set('agents.nodePositions', positions)
        return current
      })
    }, 500)
  }, [onNodesChange, setNodes, settings])

  // Sync node data from activities
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

  // Build edges dynamically from interactions
  useEffect(() => {
    const nodeIds = new Set(nodes.map((n) => n.id))
    const edgeMap = new Map<string, Edge>()

    for (const interaction of interactions) {
      if (!nodeIds.has(interaction.from) || !nodeIds.has(interaction.to)) continue

      const edgeId = `${interaction.from}->${interaction.to}`

      if (interaction.active) {
        edgeMap.set(edgeId, {
          id: edgeId,
          source: interaction.from,
          target: interaction.to,
          animated: true,
          label: interaction.label,
          labelStyle: { fontSize: 9, fontWeight: 500, fill: 'var(--studio-green)' },
          labelBgStyle: { fill: 'var(--studio-bg-main)', fillOpacity: 0.9 },
          labelBgPadding: [4, 6] as [number, number],
          labelBgBorderRadius: 4,
          style: {
            stroke: 'rgba(16, 163, 127, 0.6)',
            strokeWidth: 2,
          },
        })
      } else if (!edgeMap.has(edgeId)) {
        edgeMap.set(edgeId, {
          id: edgeId,
          source: interaction.from,
          target: interaction.to,
          animated: false,
          label: interaction.label,
          labelStyle: { fontSize: 8, fontWeight: 400, fill: 'var(--studio-text-muted)' },
          labelBgStyle: { fill: 'var(--studio-bg-main)', fillOpacity: 0.8 },
          labelBgPadding: [3, 5] as [number, number],
          labelBgBorderRadius: 3,
          style: {
            stroke: 'var(--studio-border)',
            strokeWidth: 1,
            opacity: 0.4,
          },
        })
      }
    }

    setEdges(Array.from(edgeMap.values()))
  }, [interactions, nodes, setEdges])

  const handleNodeClick = useCallback((_: any, node: Node) => {
    onNodeClick(node.id as AgentRole)
  }, [onNodeClick])

  return (
    <CanvasWrap>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={0.8}
          color="var(--studio-scrollbar)"
        />
        <Controls
          showInteractive={false}
          position="bottom-right"
        />
      </ReactFlow>
    </CanvasWrap>
  )
}
