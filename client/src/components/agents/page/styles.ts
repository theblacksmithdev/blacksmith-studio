import styled from '@emotion/styled'

export const Layout = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
  background: var(--studio-bg-main);
`

export const ChatPanel = styled.div`
  width: 320px;
  flex-shrink: 0;
`

export const CanvasPanel = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
`

export const TasksBtn = styled.button<{ $active: boolean; $hasTasks: boolean }>`
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => $active ? 'rgba(16, 163, 127, 0.3)' : 'var(--studio-border)'};
  background: var(--studio-bg-surface);
  color: ${({ $active }) => $active ? 'var(--studio-green)' : 'var(--studio-text-secondary)'};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  opacity: ${({ $hasTasks }) => $hasTasks ? 1 : 0.5};

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

export const Badge = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--studio-bg-hover);
  color: var(--studio-text-muted);
`
