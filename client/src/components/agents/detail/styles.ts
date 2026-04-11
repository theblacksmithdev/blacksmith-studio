import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

export const Panel = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  width: 320px;
  max-width: 100%;
  background: var(--studio-bg-sidebar);
  border-left: 1px solid var(--studio-border);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.22s cubic-bezier(0.16, 1, 0.3, 1);
`

export const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`

export const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const IconBox = styled.div<{ $active: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;

  ${({ $active }) => $active ? `
    background: linear-gradient(135deg, var(--studio-green-border), var(--studio-green-subtle));
    border: 1px solid var(--studio-green-border);
    color: var(--studio-green);
  ` : `
    background: var(--studio-bg-hover);
    border: 1px solid var(--studio-border);
    color: var(--studio-text-tertiary);
  `}
`

export const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

export const StatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  margin-top: 10px;

  ${({ $status }) => {
    switch ($status) {
      case 'executing':
      case 'thinking':
        return `background: var(--studio-green-subtle); color: var(--studio-green);`
      case 'done':
        return `background: var(--studio-bg-hover); color: var(--studio-text-primary);`
      case 'error':
        return `background: var(--studio-error-subtle)); color: var(--studio-error);`
      default:
        return `background: var(--studio-bg-surface); color: var(--studio-text-muted);`
    }
  }}
`

export const StatusDot = styled.span<{ $status: string }>`
  width: 5px;
  height: 5px;
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

export const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--studio-scrollbar); border-radius: 3px; }
`

export const Section = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid var(--studio-border);

  &:last-child { border-bottom: none; }
`

export const SectionLabel = styled.div`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  margin-bottom: 10px;
`

export const AboutText = styled.p`
  font-size: 12px;
  color: var(--studio-text-secondary);
  line-height: 1.65;
  letter-spacing: -0.005em;
`

/* ── Activity Timeline ── */

export const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

export const TimelineItem = styled.div<{ $status: string; $isLatest: boolean }>`
  display: flex;
  gap: 10px;
  padding: 6px 0;
  position: relative;

  ${({ $isLatest, $status }) => $isLatest && ($status === 'executing' || $status === 'thinking') && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}
`

export const TimelineTrack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 16px;
  padding-top: 2px;
`

export const TimelineDot = styled.div<{ $status: string }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.15s ease;
  background: ${({ $status }) =>
    $status === 'executing' || $status === 'thinking' ? 'var(--studio-green)'
    : $status === 'done' ? 'var(--studio-accent)'
    : $status === 'error' ? 'var(--studio-error)'
    : 'var(--studio-text-muted)'
  };

  ${({ $status }) => ($status === 'executing' || $status === 'thinking') && `
    box-shadow: 0 0 6px rgba(16, 163, 127, 0.4);
  `}
`

export const TimelineLine = styled.div`
  width: 1px;
  flex: 1;
  min-height: 8px;
  background: var(--studio-border);
  margin-top: 3px;
`

export const TimelineContent = styled.div`
  flex: 1;
  min-width: 0;
`

export const TimelineText = styled.div<{ $status: string; $isLatest: boolean }>`
  font-size: 11px;
  line-height: 1.45;
  color: ${({ $status }) =>
    $status === 'error' ? 'var(--studio-error)'
    : $status === 'done' ? 'var(--studio-text-primary)'
    : 'var(--studio-text-secondary)'
  };

  ${({ $isLatest, $status }) => $isLatest && ($status === 'executing' || $status === 'thinking') && css`
    background: linear-gradient(
      90deg,
      var(--studio-green) 0%,
      var(--studio-text-secondary) 50%,
      var(--studio-green) 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmer} 2.5s ease-in-out infinite;
  `}
`

export const TimelineTime = styled.span`
  font-size: 9px;
  color: var(--studio-text-muted);
  margin-top: 1px;
  display: block;
`

export const EmptyActivity = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 0;
  color: var(--studio-text-muted);
  font-size: 11px;
`
