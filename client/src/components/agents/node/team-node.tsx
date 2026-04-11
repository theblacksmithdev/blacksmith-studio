import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Users } from 'lucide-react'
import type { TeamNodeData } from './types'
import { handleStyle } from './styles'
import styled from '@emotion/styled'

const Wrapper = styled.div<{ $hasActivity: boolean }>`
  width: 180px;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--studio-bg-surface);
  border: 1px solid ${({ $hasActivity }) =>
    $hasActivity ? 'var(--studio-green)' : 'var(--studio-border)'};
  border-top: 2px solid ${({ $hasActivity }) =>
    $hasActivity ? 'var(--studio-green)' : 'var(--studio-border-hover)'};
  cursor: grab;
  transition: all 0.15s ease;
  position: relative;

  &:hover {
    border-color: var(--studio-border-hover);
    border-top-color: var(--studio-green);
    box-shadow: var(--studio-shadow);
    transform: translateY(-1px);
  }

  &:active {
    cursor: grabbing;
    transform: translateY(0);
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
`

const IconWrap = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-green-subtle);
  color: var(--studio-green);
  flex-shrink: 0;
`

const Title = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MemberCount = styled.div`
  font-size: 11px;
  font-weight: 400;
  color: var(--studio-text-muted);
`

function TeamNodeComponent({ data }: NodeProps & { data: TeamNodeData }) {
  const hasActivity = data.activeCount > 0

  return (
    <>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Wrapper $hasActivity={hasActivity}>
        <Header>
          <IconWrap>
            <Users size={14} />
          </IconWrap>
          <div style={{ minWidth: 0 }}>
            <Title>{data.title}</Title>
            <MemberCount>
              {data.activeCount > 0
                ? `${data.activeCount} of ${data.memberCount} active`
                : `${data.memberCount} members`}
            </MemberCount>
          </div>
        </Header>
      </Wrapper>
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </>
  )
}

export const TeamNode = memo(TeamNodeComponent)
