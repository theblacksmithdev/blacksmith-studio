import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 var(--studio-green-border); }
  50% { box-shadow: 0 0 0 6px rgba(16, 163, 127, 0); }
`

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

export const NodeWrapper = styled.div<{ $status: string; $selected: boolean; $isCenter: boolean }>`
  width: ${({ $isCenter }) => $isCenter ? '176px' : '152px'};
  padding: ${({ $isCenter }) => $isCenter ? '16px' : '14px 12px'};
  border-radius: 12px;
  background: var(--studio-bg-surface);
  border: 1px solid ${({ $status, $selected }) =>
    $selected ? 'var(--studio-border-hover)'
    : $status === 'executing' || $status === 'thinking' ? 'var(--studio-green-border)'
    : $status === 'done' ? 'var(--studio-border-hover)'
    : $status === 'error' ? 'rgba(239, 68, 68, 0.3)'
    : 'var(--studio-border)'
  };
  cursor: grab;
  transition: all 0.15s ease;
  position: relative;

  ${({ $status }) => ($status === 'executing' || $status === 'thinking') && css`
    animation: ${glow} 2.5s ease-in-out infinite;
  `}

  &:hover {
    border-color: var(--studio-border-hover);
    box-shadow: var(--studio-shadow);
    transform: translateY(-1px);
  }

  &:active {
    cursor: grabbing;
    transform: translateY(0);
  }
`

export const IconWrap = styled.div<{ $active: boolean; $isCenter: boolean }>`
  width: ${({ $isCenter }) => $isCenter ? '36px' : '30px'};
  height: ${({ $isCenter }) => $isCenter ? '36px' : '30px'};
  border-radius: ${({ $isCenter }) => $isCenter ? '10px' : '8px'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.15s ease;

  ${({ $active }) => $active ? `
    background: linear-gradient(135deg, var(--studio-green-border), var(--studio-green-subtle));
    border: 1px solid var(--studio-green-border);
    color: var(--studio-green);
  ` : `
    background: var(--studio-bg-hover);
    border: 1px solid transparent;
    color: var(--studio-text-tertiary);
  `}
`

export const Title = styled.div<{ $isCenter: boolean }>`
  font-size: ${({ $isCenter }) => $isCenter ? '12px' : '11px'};
  font-weight: ${({ $isCenter }) => $isCenter ? 600 : 500};
  color: var(--studio-text-primary);
  letter-spacing: -0.01em;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const Activity = styled.div<{ $status: string }>`
  font-size: 10px;
  font-weight: 400;
  min-height: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  color: ${({ $status }) =>
    $status === 'error' ? 'var(--studio-error)'
    : $status === 'executing' || $status === 'thinking' ? 'var(--studio-green)'
    : $status === 'done' ? 'var(--studio-text-secondary)'
    : 'var(--studio-text-muted)'
  };

  ${({ $status }) => ($status === 'executing' || $status === 'thinking') && css`
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

export const StatusDot = styled.div<{ $status: string }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;

  background: ${({ $status }) =>
    $status === 'executing' || $status === 'thinking' ? 'var(--studio-green)'
    : $status === 'done' ? 'var(--studio-accent)'
    : $status === 'error' ? 'var(--studio-error)'
    : 'transparent'
  };

  ${({ $status }) => ($status === 'executing' || $status === 'thinking') && `
    box-shadow: 0 0 6px var(--studio-green);
  `}
`

export const handleStyle = {
  width: 6,
  height: 6,
  background: 'var(--studio-bg-surface)',
  border: '1.5px solid var(--studio-border)',
  transition: 'all 0.12s ease',
}
