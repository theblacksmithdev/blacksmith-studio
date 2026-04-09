import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'
import { Box, Flex, Text } from '@chakra-ui/react'
import {
  CheckCircle2, Circle, Loader2, XCircle, SkipForward, Sparkles,
} from 'lucide-react'
import { Drawer } from '@/components/shared/drawer'
import { EmptyState } from '@/components/shared/empty-state'
import { useAgentStore } from '@/stores/agent-store'
import type { DispatchTask } from '@/api/types'

/* ── Animations ── */

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`

/* ── Layout ── */

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`

const ScrollArea = styled.div`
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

const SummaryCard = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  margin-bottom: 14px;
  flex-shrink: 0;
`

const ProgressTrack = styled.div`
  height: 2px;
  border-radius: 1px;
  background: var(--studio-bg-hover);
  overflow: hidden;
  margin-top: 10px;
`

const ProgressFill = styled.div<{ $percent: number; $hasError: boolean }>`
  height: 100%;
  border-radius: 1px;
  background: ${({ $hasError }) => $hasError ? 'var(--studio-error)' : 'var(--studio-green)'};
  width: ${({ $percent }) => $percent}%;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`

const StatChip = styled.span<{ $color: string }>`
  font-size: 10px;
  font-weight: 500;
  color: ${({ $color }) => $color};
`

const Separator = styled.span`
  color: var(--studio-text-muted);
  font-size: 10px;
`

/* ── Task Row ── */

const TaskRow = styled.div<{ $status: string }>`
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

const StepIcon = styled.div<{ $status: string }>`
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

const RoleTag = styled.span<{ $active: boolean }>`
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

/* ── Sub-task styles ── */

const SubTaskList = styled.div`
  padding: 4px 0 8px 30px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const SubTaskRow = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
`

const SubTaskIcon = styled.div<{ $status: string }>`
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

/* ── Helpers ── */

function getIcon(status: DispatchTask['status']) {
  switch (status) {
    case 'done': return <CheckCircle2 size={14} />
    case 'running': return <Loader2 size={14} />
    case 'error': return <XCircle size={14} />
    case 'skipped': return <SkipForward size={14} />
    default: return <Circle size={14} />
  }
}

function statusText(status: DispatchTask['status']): string {
  switch (status) {
    case 'done': return 'Completed'
    case 'running': return 'In progress'
    case 'error': return 'Failed'
    case 'skipped': return 'Skipped'
    default: return 'Pending'
  }
}

function roleLabel(role: string): string {
  return role.replace('-engineer', '').replace('-', ' ')
}

/* ── Component ── */

interface TaskDrawerProps {
  onClose: () => void
}

export function TaskDrawer({ onClose }: TaskDrawerProps) {
  const tasks = useAgentStore((s) => s.dispatchTasks)
  const plan = useAgentStore((s) => s.dispatchPlan)
  const subtasks = useAgentStore((s) => s.subtasks)

  const done = tasks.filter((t) => t.status === 'done').length
  const errored = tasks.filter((t) => t.status === 'error').length
  const skipped = tasks.filter((t) => t.status === 'skipped').length
  const total = tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <Drawer
      title="Tasks"
      onClose={onClose}
      size="380px"
      headerExtra={
        total > 0 ? (
          <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', fontWeight: 500 }}>
            {done}/{total}
          </Text>
        ) : undefined
      }
    >
      <Content>
        {total === 0 ? (
          <EmptyState
            icon={<Sparkles size={22} />}
            title="No active tasks"
            description="Ask the team to build something and the PM will create a plan here."
          />
        ) : (
          <>
            {plan?.summary && (
              <SummaryCard>
                <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)', lineHeight: 1.45, letterSpacing: '-0.01em' }}>
                  {plan.summary}
                </Text>
                <ProgressTrack>
                  <ProgressFill $percent={pct} $hasError={errored > 0} />
                </ProgressTrack>
                <Flex gap={2} mt="8px" align="center">
                  <StatChip $color="var(--studio-green)">{done} done</StatChip>
                  {errored > 0 && <><Separator>·</Separator><StatChip $color="var(--studio-error)">{errored} failed</StatChip></>}
                  {skipped > 0 && <><Separator>·</Separator><StatChip $color="var(--studio-text-muted)">{skipped} skipped</StatChip></>}
                  <Box css={{ flex: 1 }} />
                  <StatChip $color="var(--studio-text-muted)">{done}/{total}</StatChip>
                </Flex>
              </SummaryCard>
            )}

            <ScrollArea>
              {tasks.map((task) => {
                const status = task.status ?? 'pending'
                const isActive = status === 'running'
                const agentSubtasks = subtasks.get(task.role) ?? []

                return (
                  <Box key={task.id}>
                    <TaskRow $status={status}>
                      <StepIcon $status={status}>
                        {getIcon(task.status)}
                      </StepIcon>
                      <Box css={{ flex: 1, minWidth: 0 }}>
                        <Flex align="center" gap="6px">
                          <Text css={{
                            fontSize: '12px', fontWeight: 500, letterSpacing: '-0.01em',
                            color: status === 'skipped' ? 'var(--studio-text-muted)' : 'var(--studio-text-primary)',
                            textDecoration: status === 'skipped' ? 'line-through' : 'none',
                            flex: 1, minWidth: 0,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {task.title}
                          </Text>
                          <RoleTag $active={isActive}>{roleLabel(task.role)}</RoleTag>
                        </Flex>
                        {task.description && (
                          <Text css={{ fontSize: '10px', color: 'var(--studio-text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                            {task.description}
                          </Text>
                        )}
                        <Text css={{ fontSize: '10px', color: 'var(--studio-text-muted)', marginTop: '2px' }}>
                          {statusText(task.status)}
                          {agentSubtasks.length > 0 && ` · ${agentSubtasks.filter((s) => s.status === 'done').length}/${agentSubtasks.length} sub-tasks`}
                          {(task as any).error && status === 'error' && (
                            <span style={{ color: 'var(--studio-error)' }}> — {String((task as any).error).slice(0, 80)}</span>
                          )}
                        </Text>
                      </Box>
                    </TaskRow>

                    {/* Sub-tasks from agent self-decomposition */}
                    {agentSubtasks.length > 0 && (isActive || status === 'done' || status === 'error') && (
                      <SubTaskList>
                        {agentSubtasks.map((sub) => (
                          <SubTaskRow key={sub.id} $status={sub.status}>
                            <SubTaskIcon $status={sub.status}>
                              {getIcon(sub.status as any)}
                            </SubTaskIcon>
                            <Text css={{
                              fontSize: '10px', color: 'var(--studio-text-secondary)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              flex: 1, minWidth: 0,
                            }}>
                              {sub.title}
                            </Text>
                          </SubTaskRow>
                        ))}
                      </SubTaskList>
                    )}
                  </Box>
                )
              })}
            </ScrollArea>
          </>
        )}
      </Content>
    </Drawer>
  )
}
