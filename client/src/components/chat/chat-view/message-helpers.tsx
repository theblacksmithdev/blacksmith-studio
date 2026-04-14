import { Flex } from '@chakra-ui/react'
import type { ConversationMessage } from '@/components/shared/conversation'
import { ToolCallCard } from '../tool-call-card'
import { ClaudeIcon } from './claude-icon'
import { spacing } from '@/components/shared/ui'
import type { Message } from '@/types'

export function toConversationMessages(messages: Message[]): ConversationMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    senderName: msg.role === 'assistant' ? 'Claude' : undefined,
    senderIcon: msg.role === 'assistant' ? <ClaudeIcon /> : undefined,
    metadata:
      msg.toolCalls && msg.toolCalls.length > 0 ? (
        <Flex direction="column" gap={spacing.xs} css={{ marginTop: spacing.sm }}>
          {msg.toolCalls.map((tc) => (
            <ToolCallCard key={tc.toolId} toolCall={tc} />
          ))}
        </Flex>
      ) : undefined,
  }))
}
