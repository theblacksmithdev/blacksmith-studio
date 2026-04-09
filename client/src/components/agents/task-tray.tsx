import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'
import { Box, Text, CloseButton } from '@chakra-ui/react'
import { CheckCircle, Circle, Loader, XCircle, SkipForward, ListTodo, Trash2, Expand } from 'lucide-react'
import { useAgentStore } from '@/stores/agent-store'
import { Tooltip } from '@/components/shared/tooltip'
import type { DispatchTask } from '@/api/types'

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
`

const Tray = styled.div`
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 320px;
  max-width: 440px;
  max-height: 380px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${fadeSlideIn} 0.15s ease;
`

const TrayHeader = styled.div`
  padding: 10px 8px 10px 14px;
  border-bottom: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

const IconBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-secondary);
  }
`

const TrayBody = styled.div`
  overflow-y: auto;
  padding: 6px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: var(--studio-scrollbar);
    border-radius: 3px;
  }
`

const TaskRow = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 8px;
  transition: background 0.1s ease;

  ${({ $status }) => $status === 'running' && `
    background: var(--studio-bg-hover);
  `}

  &:hover {
    background: var(--studio-bg-hover);
  }
`

const TaskIcon = styled.div<{ $status: string }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  color: ${({ $status }) =>
    $status === 'done' ? 'var(--studio-green)'
    : $status === 'running' ? 'var(--studio-green)'
    : $status === 'error' ? 'var(--studio-error)'
    : $status === 'skipped' ? 'var(--studio-text-muted)'
    : 'var(--studio-text-tertiary)'
  };

  ${({ $status }) => $status === 'running' && css`
    animation: ${spin} 1s linear infinite;
  `}
`

const RoleBadge = styled.span`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--studio-text-muted);
  background: var(--studio-bg-hover);
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  white-space: nowrap;
`

const TrayTitle = styled.button`
  flex: 1;
  font-size: 11px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;

  &:hover {
    color: var(--studio-green);
  }
`

const CountBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`

function getStatusIcon(status: DispatchTask['status']) {
  switch (status) {
    case 'done': return <CheckCircle size={13} />
    case 'running': return <Loader size={13} />
    case 'error': return <XCircle size={13} />
    case 'skipped': return <SkipForward size={13} />
    default: return <Circle size={13} />
  }
}

interface TaskTrayProps {
  onExpand: () => void
}

export function TaskTray({ onExpand }: TaskTrayProps) {
  const dispatchTasks = useAgentStore((s) => s.dispatchTasks)
  const dispatchPlan = useAgentStore((s) => s.dispatchPlan)
  const taskTrayOpen = useAgentStore((s) => s.taskTrayOpen)
  const setTaskTrayOpen = useAgentStore((s) => s.setTaskTrayOpen)
  const clearDispatch = useAgentStore((s) => s.clearDispatch)

  if (!taskTrayOpen || dispatchTasks.length === 0) return null

  const completed = dispatchTasks.filter((t) => t.status === 'done').length
  const total = dispatchTasks.length
  const isFinished = dispatchTasks.every((t) => t.status !== 'pending' && t.status !== 'running')

  return (
    <Tray>
      <TrayHeader>
        <ListTodo size={13} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
        <TrayTitle onClick={onExpand}>
          {dispatchPlan?.summary ?? 'Task Plan'}
        </TrayTitle>
        <CountBadge>{completed}/{total}</CountBadge>
        {isFinished && (
          <Tooltip content="Clear tasks">
            <IconBtn onClick={clearDispatch}>
              <Trash2 size={12} />
            </IconBtn>
          </Tooltip>
        )}
        <Tooltip content="Expand">
          <IconBtn onClick={onExpand}>
            <Expand size={12} />
          </IconBtn>
        </Tooltip>
        <IconBtn onClick={() => setTaskTrayOpen(false)}>
          <CloseButton size="sm" css={{ color: 'inherit', width: 'auto', height: 'auto', minWidth: 0, '&:hover': { background: 'none' } }} />
        </IconBtn>
      </TrayHeader>

      <TrayBody>
        {dispatchTasks.map((task, i) => (
          <TaskRow key={task.id} $status={task.status ?? 'pending'}>
            <Text css={{ fontSize: '10px', color: 'var(--studio-text-muted)', width: '14px', textAlign: 'right', flexShrink: 0, fontWeight: 500 }}>
              {i + 1}
            </Text>
            <TaskIcon $status={task.status ?? 'pending'}>
              {getStatusIcon(task.status)}
            </TaskIcon>
            <Box css={{ flex: 1, minWidth: 0 }}>
              <Text css={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: task.status === 'skipped' ? 'var(--studio-text-muted)' : 'var(--studio-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textDecoration: task.status === 'skipped' ? 'line-through' : 'none',
              }}>
                {task.title}
              </Text>
            </Box>
            <RoleBadge>{task.role.replace('-engineer', '').replace('-', ' ')}</RoleBadge>
          </TaskRow>
        ))}
      </TrayBody>
    </Tray>
  )
}

interface TaskTrayToggleProps {
  onClick: () => void
}

export function TaskTrayToggle({ onClick }: TaskTrayToggleProps) {
  const dispatchTasks = useAgentStore((s) => s.dispatchTasks)
  const taskTrayOpen = useAgentStore((s) => s.taskTrayOpen)

  if (dispatchTasks.length === 0 || taskTrayOpen) return null

  const completed = dispatchTasks.filter((t) => t.status === 'done').length
  const total = dispatchTasks.length
  const hasRunning = dispatchTasks.some((t) => t.status === 'running')

  return (
    <ToggleBtn onClick={onClick} $active={hasRunning}>
      <ListTodo size={13} />
      <span>{completed}/{total} tasks</span>
    </ToggleBtn>
  )
}

const ToggleBtn = styled.button<{ $active: boolean }>`
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: ${({ $active }) => $active ? 'var(--studio-green)' : 'var(--studio-text-secondary)'};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.12s ease;
  font-family: inherit;

  &:hover {
    border-color: var(--studio-border-hover);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
`
