import { useEffect, useRef, useCallback, useMemo } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { useParams, useLocation } from 'react-router-dom'
import { PanelRight, History, BotMessageSquare } from 'lucide-react'
import { ConversationView, type ConversationMessage } from '@/components/shared/conversation'
import { StreamingIndicator } from './streaming-indicator'
import { HistoryPanel } from './history-panel'
import { ToolCallCard } from './tool-call-card'
import { ModelSelector } from './model-selector'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { useClaude } from '@/hooks/use-claude'
import { api } from '@/api'
import { useChatStore } from '@/stores/chat-store'
import { useSessionStore } from '@/stores/session-store'
import { useUiStore } from '@/stores/ui-store'
import { PreviewPanel } from '@/components/shared/preview-panel'
import { SplitPanel } from '@/components/shared/layout'
import { IconButton, Tooltip, spacing } from '@/components/shared/ui'
import type { Message } from '@/types'

function ClaudeIcon({ size = 22 }: { size?: number }) {
  return (
    <Box css={{
      width: `${size}px`, height: `${size}px`,
      borderRadius: `${Math.round(size * 0.28)}px`,
      background: 'var(--studio-accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <BotMessageSquare size={Math.round(size * 0.55)} color="var(--studio-accent-fg)" />
    </Box>
  )
}

function toConversationMessages(messages: Message[]): ConversationMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    senderName: msg.role === 'assistant' ? 'Claude' : undefined,
    senderIcon: msg.role === 'assistant' ? <ClaudeIcon /> : undefined,
    metadata: msg.toolCalls && msg.toolCalls.length > 0 ? (
      <Flex direction="column" gap={spacing.xs} css={{ marginTop: spacing.sm }}>
        {msg.toolCalls.map((tc) => <ToolCallCard key={tc.toolId} toolCall={tc} />)}
      </Flex>
    ) : undefined,
  }))
}

export function ChatView() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const location = useLocation()
  const { sendPrompt, cancelPrompt } = useClaude()
  const { messages, isStreaming, partialMessage } = useChatStore()
  const { activeSessionId, setActiveSession } = useSessionStore()
  const { loadMessages } = useChatStore()

  const previewOpen = useUiStore((s) => s.previewOpen)
  const setPreviewOpen = useUiStore((s) => s.setPreviewOpen)
  const historyOpen = useUiStore((s) => s.historyPanelOpen)
  const toggleHistory = useUiStore((s) => s.toggleHistoryPanel)

  useEffect(() => {
    if (sessionId && sessionId !== activeSessionId) {
      api.sessions.get({ id: sessionId }).then((session) => {
        setActiveSession(session.id)
        loadMessages(session.messages)
      })
    }
  }, [sessionId, activeSessionId])

  const initialPromptSent = useRef(false)
  useEffect(() => {
    const state = location.state as { initialPrompt?: string } | null
    if (state?.initialPrompt && sessionId && !initialPromptSent.current && !isStreaming) {
      initialPromptSent.current = true
      sendPrompt(state.initialPrompt, sessionId)
    }
  }, [sessionId, location.state])

  const handleSend = useCallback((text: string) => {
    if (!sessionId) return
    sendPrompt(text, sessionId)
  }, [sessionId, sendPrompt])

  const handleCancel = useCallback(() => {
    if (sessionId) cancelPrompt(sessionId)
  }, [sessionId, cancelPrompt])

  const conversationMessages = useMemo(() => toConversationMessages(messages), [messages])

  const renderContent = useCallback((content: string) => (
    <MarkdownRenderer content={content} />
  ), [])

  const chatContent = (
    <Flex direction="column" css={{ flex: 1, minWidth: 0, height: '100%' }}>
      {/* Top bar */}
      <Flex align="center" css={{ padding: spacing.sm, flexShrink: 0 }}>
        <Tooltip content={historyOpen ? 'Close history' : 'Chat history'}>
          <IconButton variant={historyOpen ? 'default' : 'ghost'} size="sm" onClick={toggleHistory} aria-label="Toggle history">
            <History />
          </IconButton>
        </Tooltip>
        <Box css={{ flex: 1 }} />
        <Tooltip content={previewOpen ? 'Close preview' : 'Open preview'}>
          <IconButton variant={previewOpen ? 'default' : 'ghost'} size="sm" onClick={() => setPreviewOpen(!previewOpen)} aria-label="Toggle preview">
            <PanelRight />
          </IconButton>
        </Tooltip>
      </Flex>

      <ConversationView
        messages={conversationMessages}
        onSend={handleSend}
        onCancel={handleCancel}
        isStreaming={isStreaming}
        placeholder="Ask Claude to build something..."
        renderContent={renderContent}
        streamingTrailing={isStreaming ? <StreamingIndicator partialMessage={partialMessage} /> : undefined}
        inputLeading={<ModelSelector />}
      />
    </Flex>
  )

  const mainContent = previewOpen ? (
    <SplitPanel left={chatContent} defaultWidth={600} minWidth={360} maxWidth={900} storageKey="chat.previewSplit">
      <PreviewPanel onClose={() => setPreviewOpen(false)} />
    </SplitPanel>
  ) : chatContent

  if (!historyOpen) {
    return <Flex css={{ height: '100%', overflow: 'hidden' }}>{mainContent}</Flex>
  }

  return (
    <Flex css={{ height: '100%', overflow: 'hidden' }}>
      <SplitPanel left={<HistoryPanel />} defaultWidth={260} minWidth={200} maxWidth={400} storageKey="chat.historyWidth">
        {mainContent}
      </SplitPanel>
    </Flex>
  )
}
