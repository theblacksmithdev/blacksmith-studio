import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { projectHome } from '@/router/paths'

const Btn = styled.button<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ expanded }) => (expanded ? '8px' : '0')};
  width: 100%;
  height: 36px;
  padding: ${({ expanded }) => (expanded ? '0 10px' : '0')};
  justify-content: ${({ expanded }) => (expanded ? 'flex-start' : 'center')};
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  flex-shrink: 0;
  overflow: hidden;
  white-space: nowrap;
  margin-bottom: 8px;

  &:hover {
    background: var(--studio-bg-surface);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`

const Label = styled.span<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  width: ${({ visible }) => (visible ? 'auto' : '0')};
  overflow: hidden;
  transition: opacity 0.15s ease;
`

interface NewChatButtonProps {
  expanded: boolean
}

export function NewChatButton({ expanded }: NewChatButtonProps) {
  const navigate = useNavigate()
  const pid = useProjectStore((s) => s.activeProject?.id)

  if (!pid) return null

  return (
    <Btn expanded={expanded} onClick={() => navigate(projectHome(pid))}>
      <Home size={16} style={{ flexShrink: 0 }} />
      <Label visible={expanded}>Home</Label>
    </Btn>
  )
}
