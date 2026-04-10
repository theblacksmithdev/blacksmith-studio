import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'

/* ── Animations ── */

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`

/* ── Layout ── */

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`

export const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: var(--studio-scrollbar);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--studio-scrollbar-hover);
  }
`

/* ── Summary Card ── */

export const SummaryCard = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  margin-bottom: 14px;
  flex-shrink: 0;
`

export const ProgressTrack = styled.div`
  height: 2px;
  border-radius: 1px;
  background: var(--studio-bg-hover);
  overflow: hidden;
  margin-top: 10px;
`

export const ProgressFill = styled.div<{ $percent: number; $hasError: boolean }>`
  height: 100%;
  border-radius: 1px;
  background: ${({ $hasError }) => $hasError ? 'var(--studio-error)' : 'var(--studio-green)'};
  width: ${({ $percent }) => $percent}%;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`

export const StatChip = styled.span<{ $color: string }>`
  font-size: 10px;
  font-weight: 500;
  color: ${({ $color }) => $color};
`

export const Separator = styled.span`
  color: var(--studio-text-muted);
  font-size: 10px;
`

/* ── Task Row ── */

export const TaskRow = styled.div<{ $status: string }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--studio-border);
  animation: ${fadeIn} 0.2s ease;

  &:last-child {
    border-bottom: none;
  }
`

export const StepIcon = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  padding-top: 1px;

  color: ${({ $status }) =>
    $status === 'done' ? 'var(--studio-green)'
    : $status === 'running' ? 'var(--studio-green)'
    : $status === 'error' ? 'var(--studio-error)'
    : $status === 'skipped' ? 'var(--studio-text-muted)'
    : 'var(--studio-border-hover)'
  };

  ${({ $status }) => $status === 'running' && css`
    animation: ${spin} 1s linear infinite;
  `}
`

export const RoleTag = styled.span<{ $active: boolean }>`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  white-space: nowrap;
  margin-top: 2px;

  background: ${({ $active }) => $active ? 'rgba(16, 163, 127, 0.08)' : 'var(--studio-bg-hover)'};
  color: ${({ $active }) => $active ? 'var(--studio-green)' : 'var(--studio-text-muted)'};
`

export const ModelTag = styled.span<{ $model: string }>`
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 1px 5px;
  border-radius: 3px;
  flex-shrink: 0;
  white-space: nowrap;
  margin-top: 2px;

  background: ${({ $model }) =>
    $model === 'premium' ? 'rgba(168, 85, 247, 0.08)'
    : $model === 'fast' ? 'rgba(59, 130, 246, 0.08)'
    : 'var(--studio-bg-hover)'
  };
  color: ${({ $model }) =>
    $model === 'premium' ? 'rgb(168, 85, 247)'
    : $model === 'fast' ? 'rgb(59, 130, 246)'
    : 'var(--studio-text-muted)'
  };
`

/* ── Sub-task styles ── */

export const SubTaskList = styled.div`
  padding: 4px 0 8px 30px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const SubTaskRow = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
`

export const SubTaskIcon = styled.div<{ $status: string }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.75);

  color: ${({ $status }) =>
    $status === 'done' ? 'var(--studio-green)'
    : $status === 'running' ? 'var(--studio-green)'
    : $status === 'error' ? 'var(--studio-error)'
    : 'var(--studio-text-tertiary)'
  };

  ${({ $status }) => $status === 'running' && css`
    animation: ${spin} 1s linear infinite;
  `}
`
