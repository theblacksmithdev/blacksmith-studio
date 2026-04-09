import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

const slideIn = keyframes`
  from { transform: translateX(16px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`

export const Panel = styled.div`
  width: 300px;
  background: var(--studio-bg-sidebar);
  border-left: 1px solid var(--studio-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  animation: ${slideIn} 0.15s ease;
`

export const Header = styled.div`
  padding: 14px 14px 14px 16px;
  border-bottom: 1px solid var(--studio-border);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-shrink: 0;
`

export const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--studio-scrollbar); border-radius: 3px; }
`

export const Section = styled.div`
  margin-bottom: 20px;
`

export const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  margin-bottom: 8px;
`

export const StatusChip = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;

  ${({ $status }) => {
    switch ($status) {
      case 'executing':
      case 'thinking':
        return `background: rgba(16, 163, 127, 0.1); color: var(--studio-green);`
      case 'done':
        return `background: var(--studio-bg-hover); color: var(--studio-text-primary);`
      case 'error':
        return `background: rgba(239, 68, 68, 0.08); color: var(--studio-error);`
      default:
        return `background: var(--studio-bg-surface); color: var(--studio-text-tertiary);`
    }
  }}
`

export const StatusDot = styled.span<{ $status: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $status }) =>
    $status === 'executing' || $status === 'thinking' ? 'var(--studio-green)'
    : $status === 'done' ? 'var(--studio-accent)'
    : $status === 'error' ? 'var(--studio-error)'
    : 'var(--studio-text-muted)'
  };

  ${({ $status }) => ($status === 'executing' || $status === 'thinking') && `
    box-shadow: 0 0 6px var(--studio-green);
  `}
`

export const ActivityText = styled.div`
  font-size: 11px;
  color: var(--studio-text-secondary);
  line-height: 1.5;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  font-family: 'SF Mono', 'Fira Code', monospace;
`
