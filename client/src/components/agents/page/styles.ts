import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

export const Layout = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;
  background: var(--studio-bg-main);
`

export const CanvasPanel = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

/* ── Floating action buttons ── */

const FloatingBase = styled.button<{ $active?: boolean }>`
  position: absolute;
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

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

export const TasksBtn = styled(FloatingBase)<{ $hasTasks: boolean }>`
  position: static;
  opacity: ${({ $hasTasks }) => $hasTasks ? 1 : 0.5};
`

export const StopBtn = styled.button`
  position: static;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
  color: var(--studio-error);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.4);
  }
`

export const ButtonGroup = styled.div<{ $shift?: boolean }>`
  position: absolute;
  bottom: 16px;
  left: ${({ $shift }) => $shift ? '376px' : '16px'};
  z-index: 10;
  display: flex;
  gap: 6px;
  transition: left 0.22s cubic-bezier(0.16, 1, 0.3, 1);
`

export const ChatBtn = styled(FloatingBase)<{ $unread?: boolean }>`
  position: static;
`

export const Badge = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--studio-bg-hover);
  color: var(--studio-text-muted);
`

export const UnreadDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--studio-green);
  flex-shrink: 0;
`

/* ── Sliding chat panel ── */

const slideInLeft = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`

const slideOutLeft = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
`

export const ChatOverlay = styled.div<{ $closing: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 20;
  width: 360px;
  max-width: 100%;
  border-right: 1px solid var(--studio-border);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  animation: ${({ $closing }) => $closing ? slideOutLeft : slideInLeft} 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`
