import { useCallback, useMemo, useState } from 'react'
import { ReactFlow, Background, Controls, type Node, type NodeTypes, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import styled from '@emotion/styled'
import { Settings2 } from 'lucide-react'
import type { AgentRole, AgentInfo } from '@/api/types'
import { Tooltip } from '@/components/shared/tooltip'
import { AgentNode, TeamNode } from '../node'
import { CanvasWrap } from './styles'
import { useCanvasNodes } from './use-canvas-nodes'
import { useCanvasEdges } from './use-canvas-edges'
import { useCanvasSettings, CanvasSettingsDrawer } from './settings'

const nodeTypes: NodeTypes = {
  agent: AgentNode as any,
  team: TeamNode as any,
}

const SettingsBtn = styled.button`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-muted);
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-secondary);
    background: var(--studio-bg-hover);
  }
`

interface AgentCanvasProps {
  agents: AgentInfo[]
  onNodeClick: (role: AgentRole) => void
  onNodeDoubleClick?: (role: AgentRole) => void
  conversationId?: string
}

export function AgentCanvas({ agents, onNodeClick, onNodeDoubleClick, conversationId }: AgentCanvasProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { canvas, update, reset } = useCanvasSettings()

  const { nodes, handleNodesChange } = useCanvasNodes(agents, conversationId)

  const nodeIds = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes])
  const { edges, onEdgesChange } = useCanvasEdges(nodeIds, canvas)

  const handleNodeClick = useCallback((_: any, node: Node) => {
    if (node.type === 'team') return // team nodes don't have detail
    onNodeClick(node.id as AgentRole)
  }, [onNodeClick])

  const handleNodeDoubleClick = useCallback((_: any, node: Node) => {
    if (node.type === 'team') return
    onNodeDoubleClick?.(node.id as AgentRole)
  }, [onNodeDoubleClick])

  return (
    <CanvasWrap>
      <Tooltip content="Canvas settings">
        <SettingsBtn onClick={() => setSettingsOpen(true)}>
          <Settings2 size={11} />
          Settings
        </SettingsBtn>
      </Tooltip>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        proOptions={{ hideAttribution: true }}
        snapToGrid={canvas.snapToGrid}
        snapGrid={[canvas.snapGridSize, canvas.snapGridSize]}
      >
        {canvas.showBackground && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={canvas.backgroundGap}
            size={canvas.backgroundSize}
            color="var(--studio-scrollbar)"
          />
        )}
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>

      {settingsOpen && (
        <CanvasSettingsDrawer
          canvas={canvas}
          onUpdate={update}
          onReset={reset}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </CanvasWrap>
  )
}
