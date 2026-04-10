import { Box, Text } from '@chakra-ui/react'
import { Layers, X, Clock } from 'lucide-react'
import { useAgentStore } from '@/stores/agent-store'
import { ROLE_ICONS } from '../shared/role-icons'
import type { AgentInfo } from '@/api/types'
import {
  Panel, Header, HeaderTop, IconBox, CloseBtn,
  StatusBadge, StatusDot,
  Body, Section, SectionLabel, AboutText,
  Timeline, TimelineItem, TimelineTrack, TimelineDot, TimelineLine,
  TimelineContent, TimelineText, TimelineTime, EmptyActivity,
} from './styles'

interface AgentDetailProps {
  agent: AgentInfo
  onClose: () => void
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function statusLabel(status: string): string {
  switch (status) {
    case 'idle': return 'Ready'
    case 'thinking': return 'Thinking'
    case 'executing': return 'Executing'
    case 'done': return 'Complete'
    case 'error': return 'Error'
    default: return 'Unknown'
  }
}

export function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const activity = useAgentStore((s) => s.activities.get(agent.role))
  const Icon = ROLE_ICONS[agent.role] ?? Layers
  const status = activity?.status ?? 'idle'
  const isActive = status === 'executing' || status === 'thinking'
  const history = activity?.history ?? []

  const reversed = [...history].reverse()

  return (
    <Panel>
      <Header>
        <HeaderTop>
          <IconBox $active={isActive}>
            <Icon size={18} />
          </IconBox>
          <Box css={{ flex: 1, minWidth: 0 }}>
            <Text css={{ fontSize: '14px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
              {agent.title}
            </Text>
          </Box>
          <CloseBtn onClick={onClose}>
            <X size={14} />
          </CloseBtn>
        </HeaderTop>
        <StatusBadge $status={status}>
          <StatusDot $status={status} />
          {statusLabel(status)}
        </StatusBadge>
      </Header>

      <Body>
        {/* About */}
        <Section>
          <SectionLabel>About</SectionLabel>
          <AboutText>{agent.description}</AboutText>
        </Section>

        {/* Activity Timeline */}
        <Section>
          <SectionLabel>Activity</SectionLabel>
          {history.length === 0 ? (
            <EmptyActivity>
              <Clock size={16} />
              No activity yet
            </EmptyActivity>
          ) : (
            <Timeline>
              {reversed.map((entry, i) => {
                const isLatest = i === 0
                const isLast = i === reversed.length - 1

                return (
                  <TimelineItem key={entry.id} $status={entry.status} $isLatest={isLatest}>
                    <TimelineTrack>
                      <TimelineDot $status={entry.status} />
                      {!isLast && <TimelineLine />}
                    </TimelineTrack>
                    <TimelineContent>
                      <TimelineText $status={entry.status} $isLatest={isLatest}>
                        {entry.text}
                      </TimelineText>
                      <TimelineTime>{formatTime(entry.timestamp)}</TimelineTime>
                    </TimelineContent>
                  </TimelineItem>
                )
              })}
            </Timeline>
          )}
        </Section>
      </Body>
    </Panel>
  )
}
