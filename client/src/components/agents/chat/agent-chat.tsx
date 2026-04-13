import styled from '@emotion/styled'
import { Box, Text } from '@chakra-ui/react'
import { Network, X } from 'lucide-react'
import { ChatMessages } from './chat-messages'
import { ConversationInput } from '@/components/shared/conversation'

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--studio-bg-sidebar);
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
  background: linear-gradient(135deg, var(--studio-green-border), var(--studio-green-subtle));
  border: 1px solid var(--studio-green-border);
  color: var(--studio-green);
  flex-shrink: 0;
`

const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`

const InputWrap = styled.div`
  flex-shrink: 0;
  padding: 0 12px 12px;
`

interface AgentChatProps {
  onSend: (msg: string) => void
  onRespond: (id: string, val: string) => void
  isProcessing: boolean
  onClose?: () => void
}

export function AgentChat({ onSend, onRespond, isProcessing, onClose }: AgentChatProps) {
  return (
    <Shell>
      <Header>
        <BrandIcon><Network size={12} /></BrandIcon>
        <Box css={{ flex: 1 }}>
          <Text css={{ fontSize: '14px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
            Agent Team
          </Text>
          <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', marginTop: '1px' }}>
            Describe what you need built
          </Text>
        </Box>
        {onClose && (
          <CloseBtn onClick={onClose}>
            <X size={14} />
          </CloseBtn>
        )}
      </Header>

      <Body>
        <ChatMessages onRespond={onRespond} />
        <InputWrap>
          <ConversationInput
            onSend={onSend}
            disabled={isProcessing}
            placeholder={isProcessing ? 'Agents are working...' : 'Describe what you want to build...'}
          />
        </InputWrap>
      </Body>
    </Shell>
  )
}
