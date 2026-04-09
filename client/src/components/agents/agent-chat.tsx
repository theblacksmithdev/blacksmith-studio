import { useState } from 'react'
import styled from '@emotion/styled'
import { Text } from '@chakra-ui/react'
import { Network, MessageSquare, History } from 'lucide-react'
import { ChatMessages } from './chat/chat-messages'
import { ChatInput } from './chat/chat-input'
import { ChatHistory } from './chat/chat-history'

/* ── Layout ── */

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--studio-bg-sidebar);
  border-right: 1px solid var(--studio-border);
`

const Header = styled.div`
  padding: 16px 16px 0;
  flex-shrink: 0;
`

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
`

const BrandIcon = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(16, 163, 127, 0.15), rgba(16, 163, 127, 0.04));
  border: 1px solid rgba(16, 163, 127, 0.15);
  color: var(--studio-green);
  flex-shrink: 0;
`

const Tabs = styled.div`
  display: flex;
  background: var(--studio-bg-surface);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
`

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 0;
  font-size: 11px;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;

  background: ${({ $active }) => $active ? 'var(--studio-bg-main)' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)'};
  box-shadow: ${({ $active }) => $active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'};
  &:hover { color: ${({ $active }) => $active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)'}; }
`

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`

/* ── Component ── */

interface AgentChatProps {
  onSend: (msg: string) => void
  onRespond: (id: string, val: string) => void
  isProcessing: boolean
}

export function AgentChat({ onSend, onRespond, isProcessing }: AgentChatProps) {
  const [tab, setTab] = useState<'chat' | 'history'>('chat')

  const handleSend = (msg: string) => {
    onSend(msg)
    setTab('chat')
  }

  return (
    <Shell>
      <Header>
        <Brand>
          <BrandIcon><Network size={12} /></BrandIcon>
          <Text css={{ fontSize: '13px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em', flex: 1 }}>
            Agent Team
          </Text>
        </Brand>
        <Tabs>
          <Tab $active={tab === 'chat'} onClick={() => setTab('chat')}>
            <MessageSquare size={11} /> Chat
          </Tab>
          <Tab $active={tab === 'history'} onClick={() => setTab('history')}>
            <History size={11} /> History
          </Tab>
        </Tabs>
      </Header>

      {tab === 'chat' && (
        <Body>
          <ChatMessages onRespond={onRespond} />
          <ChatInput onSend={handleSend} disabled={isProcessing} />
        </Body>
      )}

      {tab === 'history' && (
        <Body>
          <ChatHistory />
        </Body>
      )}
    </Shell>
  )
}
