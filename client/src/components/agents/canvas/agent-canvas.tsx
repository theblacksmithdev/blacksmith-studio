import { useCallback, useMemo, useState } from 'react'
import { ReactFlow, Background, Controls, type Node, type NodeTypes, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useSettings } from '@/hooks/use-settings'
import type { AgentRole, AgentInfo } from '@/api/types'
import { AgentNode } from '../node'
import { CanvasWrap } from './styles'
import { CanvasToolbar } from './canvas-toolbar'
import { useCanvasNodes } from './use-canvas-nodes'
import { useCanvasEdges } from './use-canvas-edges'
import type { EdgeTypeValue } from './layout'

const nodeTypes: NodeTypes = { agent: AgentNode as any }

interface AgentCanvasProps {
  agents: AgentInfo[]
  onNodeClick: (role: AgentRole) => void
  conversationId?: string
}

export function AgentCanvas({ agents, onNodeClick, conversationId }: AgentCanvasProps) {
  const [liveEdges, setLiveEdges] = useState(false)
  const settings = useSettings()

  const edgeType = (settings.get('agents.edgeType') as EdgeTypeValue) || 'default'
  const setEdgeType = (type: EdgeTypeValue) => settings.set('agents.edgeType', type)

  const { nodes, handleNodesChange } = useCanvasNodes(agents, conversationId)

  const nodeIds = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes])
  const { edges, onEdgesChange } = useCanvasEdges(nodeIds, edgeType, liveEdges)

  const handleNodeClick = useCallback((_: any, node: Node) => {
    onNodeClick(node.id as AgentRole)
  }, [onNodeClick])

  return (
    <CanvasWrap>
      <CanvasToolbar
        liveEdges={liveEdges}
        onToggleLive={() => setLiveEdges(!liveEdges)}
        edgeType={edgeType}
        onEdgeTypeChange={setEdgeType}
      />
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
        <Background variant={BackgroundVariant.Dots} gap={28} size={0.8} color="var(--studio-scrollbar)" />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </CanvasWrap>
  )
}
