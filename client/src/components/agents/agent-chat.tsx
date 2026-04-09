import styled from '@emotion/styled'
import { Box, Text } from '@chakra-ui/react'
import { Network } from 'lucide-react'
import { ChatMessages } from './chat/chat-messages'
import { ChatInput } from './chat/chat-input'

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--studio-bg-sidebar);
  border-right: 1px solid var(--studio-border);
`

const Header = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
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

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`

interface AgentChatProps {
  onSend: (msg: string) => void
  onRespond: (id: string, val: string) => void
  isProcessing: boolean
}

export function AgentChat({ onSend, onRespond, isProcessing }: AgentChatProps) {
  return (
    <Shell>
      <Header>
        <BrandIcon><Network size={12} /></BrandIcon>
        <Box css={{ flex: 1 }}>
          <Text css={{ fontSize: '13px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
            Agent Team
          </Text>
          <Text css={{ fontSize: '10px', color: 'var(--studio-text-muted)', marginTop: '1px' }}>
            Describe what you need built
          </Text>
        </Box>
      </Header>

      <Body>
        <ChatMessages onRespond={onRespond} />
        <ChatInput onSend={onSend} disabled={isProcessing} />
      </Body>
    </Shell>
  )
}
