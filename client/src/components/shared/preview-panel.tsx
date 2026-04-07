import styled from '@emotion/styled'
import { X, PanelRightClose } from 'lucide-react'
import { RunnerPreview } from '@/components/runner/runner-preview'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--studio-bg-sidebar);
  border-left: 1px solid var(--studio-border);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`

const Title = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--studio-text-secondary);
  flex: 1;
`

const HeaderBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

interface PreviewPanelProps {
  onClose: () => void
}

export function PreviewPanel({ onClose }: PreviewPanelProps) {
  return (
    <Wrap>
      <Header>
        <PanelRightClose size={13} style={{ color: 'var(--studio-text-muted)' }} />
        <Title>Preview</Title>
        <HeaderBtn onClick={onClose} title="Close preview">
          <X size={14} />
        </HeaderBtn>
      </Header>
      <Body>
        <RunnerPreview />
      </Body>
    </Wrap>
  )
}
