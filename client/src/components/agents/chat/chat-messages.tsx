import { useRef, useEffect } from 'react'
import styled from '@emotion/styled'
import { Box, Flex, Text } from '@chakra-ui/react'
import { AlertCircle, Sparkles } from 'lucide-react'
import { useAgentStore } from '@/stores/agent-store'

/* ── Styled ── */

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--studio-scrollbar); border-radius: 3px; }
  &::-webkit-scrollbar-thumb:hover { background: var(--studio-scrollbar-hover); }
`

const MsgRow = styled.div<{ $align: 'left' | 'right' | 'center' }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $align }) =>
    $align === 'right' ? 'flex-end' : $align === 'center' ? 'center' : 'flex-start'
  };
  animation: msgIn 0.15s ease;
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(3px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const Bubble = styled.div<{ $variant: 'user' | 'agent' | 'system' }>`
  max-width: 85%;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;

  ${({ $variant }) =>
    $variant === 'user' ? `
      padding: 8px 13px;
      border-radius: 12px 12px 4px 12px;
      background: var(--studio-accent);
      color: var(--studio-accent-fg);
    ` : $variant === 'agent' ? `
      padding: 8px 13px;
      border-radius: 12px 12px 12px 4px;
      background: var(--studio-bg-main);
      color: var(--studio-text-primary);
      border: 1px solid var(--studio-border);
    ` : `
      padding: 3px 0;
      color: var(--studio-text-muted);
      font-size: 10px;
      font-weight: 450;
    `
  }
`

const AgentTag = styled.span`
  font-size: 9px;
  font-weight: 600;
  color: var(--studio-green);
  margin-bottom: 2px;
  margin-left: 2px;
  letter-spacing: 0.03em;
  text-transform: capitalize;
`

const HumanCard = styled.div`
  margin: 3px 0;
  padding: 10px 12px;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
  border-radius: 10px;
`

const OptBtn = styled.button`
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-secondary);
  font-size: 11px;
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

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 36px 20px;
  text-align: center;
`

/* ── Component ── */

interface ChatMessagesProps {
  onRespond: (id: string, val: string) => void
}

export function ChatMessages({ onRespond }: ChatMessagesProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const msgs = useAgentStore((s) => s.chatMessages)
  const inputs = useAgentStore((s) => s.pendingInputs)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [msgs.length, inputs.length])

  return (
    <List ref={listRef}>
      {msgs.length === 0 && (
        <Empty>
          <Box css={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'var(--studio-bg-main)', border: '1px solid var(--studio-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} style={{ color: 'var(--studio-text-tertiary)' }} />
          </Box>
          <Text css={{ fontSize: '12px', fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
            What would you like to build?
          </Text>
          <Text css={{ fontSize: '10px', maxWidth: '190px', lineHeight: 1.55, color: 'var(--studio-text-muted)' }}>
            Describe a feature and the PM will plan and assign tasks.
          </Text>
        </Empty>
      )}

      {msgs.map((m) => (
        <MsgRow key={m.id} $align={m.role === 'user' ? 'right' : m.role === 'system' ? 'center' : 'left'}>
          {m.role === 'agent' && m.agentRole && (
            <AgentTag>{m.agentRole.replace(/-/g, ' ')}</AgentTag>
          )}
          <Bubble $variant={m.role}>{m.content}</Bubble>
        </MsgRow>
      ))}

      {inputs.map((r) => (
        <HumanCard key={r.id}>
          <Flex align="flex-start" gap={2} mb="6px">
            <AlertCircle size={12} style={{ color: 'var(--studio-warning)', flexShrink: 0, marginTop: 1 }} />
            <Text css={{ fontSize: '11px', fontWeight: 500, color: 'var(--studio-text-primary)', lineHeight: 1.4 }}>
              {r.question}
            </Text>
          </Flex>
          {r.context && (
            <Text css={{ fontSize: '10px', color: 'var(--studio-text-muted)', mb: '8px', lineHeight: 1.5, ml: '20px' }}>
              {r.context.slice(0, 180)}
            </Text>
          )}
          <Flex gap="4px" flexWrap="wrap" ml="20px" mt="6px">
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
    </List>
  )
}
