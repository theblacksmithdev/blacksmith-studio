import { Box, Flex, Text } from '@chakra-ui/react'
import { Sparkles } from 'lucide-react'
import { Drawer } from '@/components/shared/drawer'
import { EmptyState } from '@/components/shared/empty-state'
import { useAgentStore } from '@/stores/agent-store'
import { getIcon, statusText, roleLabel } from './helpers'
import {
  Content, ScrollArea, SummaryCard, ProgressTrack, ProgressFill,
  StatChip, Separator, TaskRow, StepIcon, RoleTag,
  SubTaskList, SubTaskRow, SubTaskIcon,
} from './styles'

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
