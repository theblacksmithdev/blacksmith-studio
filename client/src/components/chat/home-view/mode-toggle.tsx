import styled from '@emotion/styled'
import { MessageSquare, Network } from 'lucide-react'
import { spacing, radii } from '@/components/shared/ui'
import type { WorkMode } from '@/stores/ui-store'

export type Mode = WorkMode

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing['2xs']};
  padding: ${spacing['2xs']};
  border-radius: ${radii.full};
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  width: fit-content;
  margin: 0 auto;
  -webkit-app-region: no-drag;
`

const Option = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${radii.full};
  border: none;
  background: ${({ $active }) => $active ? 'var(--studio-bg-main)' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)'};
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: ${({ $active }) => $active ? 'var(--studio-shadow)' : 'none'};

  &:hover {
    color: var(--studio-text-primary);
  }
`

interface ModeToggleProps {
  mode: Mode
  onChange: (mode: Mode) => void
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <Wrap>
      <Option $active={mode === 'chat'} onClick={() => onChange('chat')}>
        <MessageSquare size={13} />
        Chat
      </Option>
      <Option $active={mode === 'agents'} onClick={() => onChange('agents')}>
        <Network size={13} />
        Agent Team
      </Option>
    </Wrap>
  )
}
