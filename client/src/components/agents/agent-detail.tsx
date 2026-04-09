import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { Box, Text, CloseButton } from '@chakra-ui/react'
import {
  Monitor, Server, Layers, Container, TestTube, Shield,
  Database, Palette, FileText, GitPullRequest, Building2, ClipboardList,
} from 'lucide-react'
import { useAgentStore } from '@/stores/agent-store'
import type { AgentRole, AgentInfo } from '@/api/types'

const ROLE_ICONS: Record<AgentRole, typeof Monitor> = {
  'frontend-engineer': Monitor,
  'backend-engineer': Server,
  'fullstack-engineer': Layers,
  'devops-engineer': Container,
  'qa-engineer': TestTube,
  'security-engineer': Shield,
  'database-engineer': Database,
  'ui-designer': Palette,
  'technical-writer': FileText,
  'code-reviewer': GitPullRequest,
  'architect': Building2,
  'product-manager': ClipboardList,
}

const slideIn = keyframes`
  from { transform: translateX(16px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`

const Panel = styled.div`
  width: 300px;
  background: var(--studio-bg-sidebar);
  border-left: 1px solid var(--studio-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  animation: ${slideIn} 0.15s ease;
`

const Header = styled.div`
  padding: 14px 14px 14px 16px;
  border-bottom: 1px solid var(--studio-border);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-shrink: 0;
`

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: var(--studio-scrollbar);
    border-radius: 3px;
  }
`

const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  margin-bottom: 8px;
`

const Section = styled.div`
  margin-bottom: 20px;
`

const StatusChip = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;

  ${({ $status }) => {
    switch ($status) {
      case 'executing':
      case 'thinking':
        return `
          background: rgba(16, 163, 127, 0.1);
          color: var(--studio-green);
        `
      case 'done':
        return `
          background: var(--studio-bg-hover);
          color: var(--studio-text-primary);
        `
      case 'error':
        return `
          background: rgba(239, 68, 68, 0.08);
          color: var(--studio-error);
        `
      default:
        return `
          background: var(--studio-bg-surface);
          color: var(--studio-text-tertiary);
        `
    }
  }}
`

const StatusDot = styled.span<{ $status: string }>`
  width: 6px;
  height: 6px;
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

const ActivityText = styled.div`
  font-size: 12px;
  color: var(--studio-text-secondary);
  line-height: 1.5;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px;
`

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
