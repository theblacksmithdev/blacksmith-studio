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
 * Arrange agents in a hub-and-spoke circular layout.
 * Center: fullstack-engineer (the generalist)
 * Inner ring: core engineers
 * Outer ring: support roles
 */
function buildLayout(agents: AgentInfo[]): { nodes: Node[]; edges: Edge[] } {
  const centerX = 400
  const centerY = 350

  // Role placement tiers — PM at center as the dispatcher
  const center: AgentRole = 'product-manager'
  const innerRing: AgentRole[] = [
    'frontend-engineer', 'backend-engineer', 'database-engineer', 'architect',
  ]
  const outerRing: AgentRole[] = [
    'ui-designer', 'qa-engineer', 'security-engineer',
    'devops-engineer', 'code-reviewer', 'technical-writer', 'fullstack-engineer',
  ]

  const nodes: Node[] = []
  const edges: Edge[] = []
  const roleMap = new Map(agents.map((a) => [a.role, a]))

  // Center node (PM hub)
  const centerAgent = roleMap.get(center)
  if (centerAgent) {
    nodes.push({
      id: center,
      type: 'agent',
      position: { x: centerX, y: centerY },
      data: {
        role: center,
        title: centerAgent.title,
        status: 'idle',
        activity: null,
        selected: false,
        isCenter: true,
      } satisfies AgentNodeData,
    })
  }

  // Inner ring
  const innerRadius = 200
  innerRing.forEach((role, i) => {
    const agent = roleMap.get(role)
    if (!agent) return
    const angle = (i / innerRing.length) * Math.PI * 2 - Math.PI / 2
    nodes.push({
      id: role,
      type: 'agent',
      position: {
        x: centerX + Math.cos(angle) * innerRadius - 80,
        y: centerY + Math.sin(angle) * innerRadius - 50,
      },
      data: {
        role,
        title: agent.title,
        status: 'idle',
        activity: null,
        selected: false,
        isCenter: false,
      } satisfies AgentNodeData,
    })

    // Connect to center
    edges.push({
      id: `${center}-${role}`,
      source: center,
      target: role,
      animated: false,
      style: { stroke: 'var(--studio-border)', strokeWidth: 1.5, opacity: 0.5 },
    })
  })

  // Outer ring
  const outerRadius = 380
  outerRing.forEach((role, i) => {
    const agent = roleMap.get(role)
    if (!agent) return
    const angle = (i / outerRing.length) * Math.PI * 2 - Math.PI / 2
    nodes.push({
      id: role,
      type: 'agent',
      position: {
        x: centerX + Math.cos(angle) * outerRadius - 80,
        y: centerY + Math.sin(angle) * outerRadius - 50,
      },
      data: {
        role,
        title: agent.title,
        status: 'idle',
        activity: null,
        selected: false,
        isCenter: false,
      } satisfies AgentNodeData,
    })

    // Connect to nearest inner node
    const nearestInner = innerRing.reduce((best, ir, idx) => {
      const irAngle = (idx / innerRing.length) * Math.PI * 2 - Math.PI / 2
      const dist = Math.abs(angle - irAngle)
      return dist < best.dist ? { role: ir, dist } : best
    }, { role: innerRing[0], dist: Infinity })

    edges.push({
      id: `${nearestInner.role}-${role}`,
      source: nearestInner.role,
      target: role,
      animated: false,
      style: { stroke: 'var(--studio-border)', strokeWidth: 1.5, strokeDasharray: '4 4', opacity: 0.35 },
    })
  })

  return { nodes, edges }
}

interface AgentCanvasProps {
  agents: AgentInfo[]
  onNodeClick: (role: AgentRole) => void
}

export function AgentCanvas({ agents, onNodeClick }: AgentCanvasProps) {
  const activities = useAgentStore((s) => s.activities)
  const selectedAgent = useAgentStore((s) => s.selectedAgent)
  const settings = useSettings()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load saved positions from settings, fall back to default layout
  const layout = useMemo(() => {
    const defaultLayout = buildLayout(agents)
    const saved = settings.get('agents.nodePositions') as Record<string, { x: number; y: number }> | undefined
    if (!saved) return defaultLayout

    return {
      ...defaultLayout,
      nodes: defaultLayout.nodes.map((node) => {
        const pos = saved[node.id]
        return pos ? { ...node, position: pos } : node
      }),
    }
  }, [agents]) // eslint-disable-line react-hooks/exhaustive-deps — settings read once on mount

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges)

  // Persist positions on drag end (debounced)
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes)

    // Only save when a drag ends
    const hasDragEnd = changes.some((c) => c.type === 'position' && !c.dragging)
    if (!hasDragEnd) return

    // Debounce to avoid spamming settings on rapid adjustments
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setNodes((current) => {
        const positions: Record<string, { x: number; y: number }> = {}
        for (const node of current) {
          positions[node.id] = node.position
        }
        settings.set('agents.nodePositions', positions)
        return current
      })
    }, 500)
  }, [onNodesChange, setNodes, settings])

  // Sync agent activity state into nodes
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

  // Animate edges when agents are active
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => {
        const sourceActivity = activities.get(edge.source as AgentRole)
        const targetActivity = activities.get(edge.target as AgentRole)
        const isActive =
          sourceActivity?.status === 'executing' || sourceActivity?.status === 'thinking' ||
          targetActivity?.status === 'executing' || targetActivity?.status === 'thinking'
        return {
          ...edge,
          animated: isActive,
          style: {
            stroke: isActive ? 'rgba(16, 163, 127, 0.5)' : 'var(--studio-border)',
            strokeWidth: isActive ? 2 : 1.5,
            opacity: isActive ? 1 : 0.5,
          },
        }
      }),
    )
  }, [activities, setEdges])

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
