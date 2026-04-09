import { Box, Text, CloseButton } from '@chakra-ui/react'
import { Layers } from 'lucide-react'
import { useAgentStore } from '@/stores/agent-store'
import { ROLE_ICONS } from '../shared/role-icons'
import type { AgentInfo } from '@/api/types'
import { Panel, Header, Body, Section, SectionLabel, StatusChip, StatusDot, ActivityText } from './styles'

interface AgentDetailProps {
  agent: AgentInfo
  onClose: () => void
}

export function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const activity = useAgentStore((s) => s.activities.get(agent.role))
  const Icon = ROLE_ICONS[agent.role] ?? Layers

  const status = activity?.status ?? 'idle'
  const statusLabel =
    status === 'idle' ? 'Ready' :
    status === 'thinking' ? 'Thinking' :
    status === 'executing' ? 'Executing' :
    status === 'done' ? 'Complete' :
    status === 'error' ? 'Error' : 'Unknown'

  const isActive = status === 'executing' || status === 'thinking'

  return (
    <Panel>
      <Header>
        <Box css={{
          width: 14, height: 14, borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.15s ease',
          ...(isActive ? {
            background: 'linear-gradient(135deg, rgba(16, 163, 127, 0.15), rgba(16, 163, 127, 0.05))',
            border: '1px solid rgba(16, 163, 127, 0.2)',
            color: 'var(--studio-green)',
          } : {
            background: 'var(--studio-bg-hover)',
            border: '1px solid transparent',
            color: 'var(--studio-text-tertiary)',
          }),
        }}>
          <Icon size={18} />
        </Box>
        <Box css={{ flex: 1, minWidth: 0 }}>
          <Text css={{ fontSize: '14px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
            {agent.title}
          </Text>
          <StatusChip $status={status}>
            <StatusDot $status={status} />
            {statusLabel}
          </StatusChip>
        </Box>
        <CloseButton
          size="sm"
          onClick={onClose}
          css={{
            color: 'var(--studio-text-muted)', borderRadius: '6px', flexShrink: 0,
            '&:hover': { background: 'var(--studio-bg-hover)', color: 'var(--studio-text-primary)' },
          }}
        />
      </Header>

      <Body>
        {activity?.activity && (
          <Section>
            <SectionLabel>Current Activity</SectionLabel>
            <ActivityText>{activity.activity}</ActivityText>
          </Section>
        )}

        <Section>
          <SectionLabel>About</SectionLabel>
          <Text css={{ fontSize: '12px', color: 'var(--studio-text-secondary)', lineHeight: 1.65 }}>
            {agent.description}
          </Text>
        </Section>
      </Body>
    </Panel>
  )
}
