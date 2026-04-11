import { useRef, useEffect } from 'react'
import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { AlertCircle, Sparkles, Bot, User, Cpu } from 'lucide-react'
import { useAgentStore } from '@/stores/agent-store'
import { ROLE_ICONS } from '../shared/role-icons'
import type { AgentRole } from '@/api/types'

/* ── Animations ── */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`

/* ── Styled ── */

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--studio-scrollbar); border-radius: 3px; }
`

const MsgGroup = styled.div`
  animation: ${fadeUp} 0.18s ease;
`

const UserRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2px;
`

const AgentRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 2px;
`

const SystemRow = styled.div`
  display: flex;
  justify-content: center;
  padding: 2px 0;
`

const Avatar = styled.div<{ $variant: 'agent' | 'user' }>`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;

  ${({ $variant }) => $variant === 'agent' ? `
    background: var(--studio-bg-hover);
    border: 1px solid var(--studio-border);
    color: var(--studio-text-tertiary);
  ` : `
    background: var(--studio-accent);
    color: var(--studio-accent-fg);
  `}
`

const UserBubble = styled.div`
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px 12px 4px 12px;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 13.5px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
`

const AgentBubble = styled.div`
  max-width: calc(100% - 32px);
  padding: 8px 12px;
  border-radius: 4px 12px 12px 12px;
  background: var(--studio-bg-main);
  color: var(--studio-text-primary);
  border: 1px solid var(--studio-border);
  font-size: 13.5px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
`

const AgentName = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: var(--studio-green);
  letter-spacing: 0.03em;
  text-transform: capitalize;
  margin-bottom: 1px;
  display: block;
`

const SystemBubble = styled.div`
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
  text-align: center;
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

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  text-align: center;
`

const EmptyIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--studio-green-subtle), var(--studio-green-subtle));
  border: 1px solid var(--studio-green-border);
  color: var(--studio-green);
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
          <EmptyIcon>
            <Sparkles size={18} />
          </EmptyIcon>
          <Text css={{ fontSize: '14px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
            What would you like to build?
          </Text>
          <Text css={{ fontSize: '12px', maxWidth: '200px', lineHeight: 1.55, color: 'var(--studio-text-muted)' }}>
            Describe a feature and the PM will plan and assign tasks to the team.
          </Text>
        </Empty>
      )}

      {msgs.map((m) => {
        if (m.role === 'user') {
          return (
            <MsgGroup key={m.id}>
              <UserRow>
                <UserBubble>{m.content}</UserBubble>
              </UserRow>
            </MsgGroup>
          )
        }

        if (m.role === 'system') {
          return (
            <MsgGroup key={m.id}>
              <SystemRow>
                <SystemBubble>
                  <Cpu size={9} style={{ flexShrink: 0 }} />
                  {m.content}
                </SystemBubble>
              </SystemRow>
            </MsgGroup>
          )
        }

        // Agent message
        const RoleIcon = m.agentRole ? ROLE_ICONS[m.agentRole as AgentRole] : Bot

        return (
          <MsgGroup key={m.id}>
            <AgentRow>
              <Avatar $variant="agent">
                {RoleIcon ? <RoleIcon size={11} /> : <Bot size={11} />}
              </Avatar>
              <Box css={{ flex: 1, minWidth: 0 }}>
                {m.agentRole && (
                  <AgentName>{m.agentRole.replace(/-/g, ' ')}</AgentName>
                )}
                <AgentBubble>{m.content}</AgentBubble>
              </Box>
            </AgentRow>
          </MsgGroup>
        )
      })}

      {inputs.map((r) => (
        <HumanCard key={r.id}>
          <Flex align="flex-start" gap={2} mb="6px">
            <AlertCircle size={12} style={{ color: 'var(--studio-warning)', flexShrink: 0, marginTop: 1 }} />
            <Text css={{ fontSize: '12px', fontWeight: 500, color: 'var(--studio-text-primary)', lineHeight: 1.4 }}>
              {r.question}
            </Text>
          </Flex>
          {r.context && (
            <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', mb: '8px', lineHeight: 1.5, ml: '20px' }}>
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
