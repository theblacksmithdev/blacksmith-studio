import { useState } from 'react'
import styled from '@emotion/styled'
import { Activity, Settings2 } from 'lucide-react'
import { Tooltip } from '@/components/shared/tooltip'
import { EDGE_TYPE_OPTIONS, type EdgeTypeValue } from './layout'

const Wrap = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
`

const Btn = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => $active ? 'rgba(16, 163, 127, 0.3)' : 'var(--studio-border)'};
  background: var(--studio-bg-surface);
  color: ${({ $active }) => $active ? 'var(--studio-green)' : 'var(--studio-text-muted)'};
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-secondary);
  }
`

const Panel = styled.div`
  position: absolute;
  top: 44px;
  left: 0;
  z-index: 11;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 10px;
  min-width: 160px;
  animation: popIn 0.1s ease;

  @keyframes popIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const Label = styled.div`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--studio-text-muted);
  margin-bottom: 6px;
`

const Option = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 5px 8px;
  border-radius: 6px;
  border: none;
  background: ${({ $active }) => $active ? 'var(--studio-bg-hover)' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)'};
  font-size: 11px;
  font-weight: ${({ $active }) => $active ? 500 : 400};
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.1s ease;

  &:hover { background: var(--studio-bg-hover); }
`

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10;
`

interface CanvasToolbarProps {
  liveEdges: boolean
  onToggleLive: () => void
  edgeType: EdgeTypeValue
  onEdgeTypeChange: (type: EdgeTypeValue) => void
}

export function CanvasToolbar({ liveEdges, onToggleLive, edgeType, onEdgeTypeChange }: CanvasToolbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <Wrap>
      <Tooltip content={liveEdges ? 'Show static layout' : 'Show live interactions'}>
        <Btn $active={liveEdges} onClick={onToggleLive}>
          <Activity size={11} />
          {liveEdges ? 'Live' : 'Static'}
        </Btn>
      </Tooltip>

      <div style={{ position: 'relative' }}>
        <Tooltip content="Canvas settings">
          <Btn onClick={() => setOpen(!open)}>
            <Settings2 size={11} />
          </Btn>
        </Tooltip>

        {open && (
          <>
            <Backdrop onClick={() => setOpen(false)} />
            <Panel>
              <Label>Edge Style</Label>
              {EDGE_TYPE_OPTIONS.map((et) => (
                <Option
                  key={et.value}
                  $active={edgeType === et.value}
                  onClick={() => { onEdgeTypeChange(et.value); setOpen(false) }}
                >
                  {et.label}
                </Option>
              ))}
            </Panel>
          </>
        )}
      </div>
    </Wrap>
  )
}
