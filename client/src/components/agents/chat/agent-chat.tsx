import { useMemo, useCallback, type ReactNode } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { Network, Bot, Cpu, Sparkles, AlertCircle } from 'lucide-react'
import { useAgentStore } from '@/stores/agent-store'
import { ROLE_ICONS } from '../shared/role-icons'
import { ConversationView, type ConversationMessage } from '@/components/shared/conversation'
import { Text, EmptyState } from '@/components/shared/ui'
import type { AgentRole } from '@/api/types'

/* ── Styled for system + human input ── */

const fadeUp = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); }`

const SystemPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 10px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-muted);
  font-size: 11px;
  font-weight: 450;
  max-width: 90%;
  animation: ${fadeUp} 0.18s ease;
`

const HumanCard = styled.div`
  margin: 4px 0;
  padding: 10px 12px;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
  border-radius: 10px;
  animation: ${fadeUp} 0.18s ease;
`

const OptBtn = styled.button`
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  &:hover { border-color: var(--studio-border-hover); color: var(--studio-text-primary); }
`

const PrimaryOpt = styled(OptBtn)`
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  border-color: transparent;
  &:hover { opacity: 0.85; border-color: transparent; color: var(--studio-accent-fg); background: var(--studio-accent); }
`

/* ── Helpers ── */

function AgentIcon({ role, size = 22 }: { role?: string; size?: number }) {
  const Icon = role ? ROLE_ICONS[role as AgentRole] : Bot
  return (
    <Flex css={{
      width: `${size}px`, height: `${size}px`, borderRadius: '6px',
      background: 'var(--studio-bg-hover)', border: '1px solid var(--studio-border)',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      color: 'var(--studio-text-tertiary)',
    }}>
      {Icon ? <Icon size={Math.round(size * 0.5)} /> : <Bot size={Math.round(size * 0.5)} />}
    </Flex>
  )
}

function formatRoleName(role: string): string {
  return role.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/* ── Component ── */

interface AgentChatProps {
  onSend: (msg: string) => void
  onRespond: (id: string, val: string) => void
  isProcessing: boolean
}

export function AgentChat({ onSend, onRespond, isProcessing }: AgentChatProps) {
  const msgs = useAgentStore((s) => s.chatMessages)
  const inputs = useAgentStore((s) => s.pendingInputs)

  const conversationMessages: ConversationMessage[] = useMemo(() =>
    msgs.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      senderName: m.role === 'agent' && m.agentRole ? formatRoleName(m.agentRole) : undefined,
      senderIcon: m.role === 'agent' ? <AgentIcon role={m.agentRole} /> : undefined,
    })),
    [msgs],
  )

  const renderMessage = useCallback((msg: ConversationMessage): ReactNode | null => {
    // System messages render as centered pills
    if (msg.role === 'system') {
      return (
        <Flex justify="center" css={{ padding: '2px 0' }}>
          <SystemPill>
            <Cpu size={9} style={{ flexShrink: 0 }} />
            {msg.content}
          </SystemPill>
        </Flex>
      )
    }
    // User + agent use default bubble
    return null
  }, [])

  // Human input cards rendered as trailing content after messages
  const inputCards = inputs.length > 0 ? (
    <Flex direction="column" gap="6px">
      {inputs.map((r) => (
        <HumanCard key={r.id}>
          <Flex align="flex-start" gap="8px" css={{ marginBottom: '6px' }}>
            <AlertCircle size={12} style={{ color: 'var(--studio-warning)', flexShrink: 0, marginTop: 1 }} />
            <Text css={{ fontSize: '12px', fontWeight: 500, color: 'var(--studio-text-primary)', lineHeight: 1.4 }}>
              {r.question}
            </Text>
          </Flex>
          {r.context && (
            <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', marginBottom: '8px', lineHeight: 1.5, marginLeft: '20px' }}>
              {r.context.slice(0, 180)}
            </Text>
          )}
          <Flex gap="4px" flexWrap="wrap" css={{ marginLeft: '20px', marginTop: '6px' }}>
            {r.options ? r.options.map((o) => (
              <OptBtn key={o.value} onClick={() => onRespond(r.id, o.value)}>{o.label}</OptBtn>
            )) : r.type === 'approve' ? (
              <>
                <PrimaryOpt onClick={() => onRespond(r.id, 'yes')}>Approve</PrimaryOpt>
                <OptBtn onClick={() => onRespond(r.id, 'no')}>Reject</OptBtn>
              </>
            ) : null}
          </Flex>
        </HumanCard>
      ))}
    </Flex>
  ) : undefined

  const emptyState = (
    <Flex direction="column" align="center" justify="center" gap="10px" css={{ flex: 1, padding: '40px 20px', textAlign: 'center' }}>
      <Flex css={{
        width: '40px', height: '40px', borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--studio-green-subtle), var(--studio-green-subtle))',
        border: '1px solid var(--studio-green-border)', color: 'var(--studio-green)',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Sparkles size={18} />
      </Flex>
      <Text css={{ fontSize: '14px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
        What would you like to build?
      </Text>
      <Text css={{ fontSize: '12px', maxWidth: '220px', lineHeight: 1.55, color: 'var(--studio-text-muted)' }}>
        Describe a feature and the PM will plan and assign tasks to the team.
      </Text>
    </Flex>
  )

  return (
    <Flex direction="column" css={{ height: '100%', background: 'var(--studio-bg-sidebar)' }}>
      {/* Header */}
      <Flex align="center" gap="10px" css={{ padding: '14px 16px', borderBottom: '1px solid var(--studio-border)', flexShrink: 0 }}>
        <Flex css={{
          width: '26px', height: '26px', borderRadius: '7px',
          background: 'linear-gradient(135deg, var(--studio-green-border), var(--studio-green-subtle))',
          border: '1px solid var(--studio-green-border)', color: 'var(--studio-green)',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Network size={12} />
        </Flex>
        <Box css={{ flex: 1 }}>
          <Text css={{ fontSize: '14px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
            Agent Team
          </Text>
          <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', marginTop: '1px' }}>
            Describe what you need built
          </Text>
        </Box>
      </Flex>

      {/* Conversation */}
      <ConversationView
        messages={conversationMessages}
        onSend={onSend}
        disabled={isProcessing}
        placeholder={isProcessing ? 'Agents are working...' : 'Describe what you want to build...'}
        maxWidth="100%"
        renderMessage={renderMessage}
        emptyState={emptyState}
        streamingTrailing={inputCards}
      />
    </Flex>
  )
}
