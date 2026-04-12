import { useEffect, useRef } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { useParams, useLocation } from 'react-router-dom'
import { PanelRight, History } from 'lucide-react'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { HistoryPanel } from './history-panel'
import { useClaude } from '@/hooks/use-claude'
import { useSessions } from '@/hooks/use-sessions'
import { useChatStore } from '@/stores/chat-store'
import { useSessionStore } from '@/stores/session-store'
import { useUiStore } from '@/stores/ui-store'
import { PreviewPanel } from '@/components/shared/preview-panel'
import { SplitPanel } from '@/components/shared/layout'
import { IconButton, Tooltip, spacing } from '@/components/shared/ui'

export function ChatView() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const location = useLocation()
  const { sendPrompt, cancelPrompt } = useClaude()
  const { loadSession } = useSessions()
  const { messages, isStreaming, partialMessage } = useChatStore()
  const activeSessionId = useSessionStore((s) => s.activeSessionId)

  const previewOpen = useUiStore((s) => s.previewOpen)
  const setPreviewOpen = useUiStore((s) => s.setPreviewOpen)
  const historyOpen = useUiStore((s) => s.historyPanelOpen)
  const toggleHistory = useUiStore((s) => s.toggleHistoryPanel)

  useEffect(() => {
    if (sessionId && sessionId !== activeSessionId) {
      loadSession(sessionId)
    }
  }, [sessionId, activeSessionId, loadSession])

  // Auto-send initialPrompt from route state (e.g. from "Diagnose with AI")
  const initialPromptSent = useRef(false)
  useEffect(() => {
    const state = location.state as { initialPrompt?: string } | null
    if (state?.initialPrompt && sessionId && !initialPromptSent.current && !isStreaming) {
      initialPromptSent.current = true
      sendPrompt(state.initialPrompt, sessionId)
    }
  }, [sessionId, location.state])

  const handleSend = (text: string) => {
    if (!sessionId) return
    sendPrompt(text, sessionId)
  }

  const handleCancel = () => {
    if (sessionId) cancelPrompt(sessionId)
  }

  const chatContent = (
    <Flex direction="column" css={{ flex: 1, minWidth: 0, height: '100%' }}>
      {/* Top bar */}
      <Flex align="center" css={{ padding: spacing.sm, flexShrink: 0 }}>
        <Tooltip content={historyOpen ? 'Close history' : 'Chat history'}>
          <IconButton
            variant={historyOpen ? 'default' : 'ghost'}
            size="sm"
            onClick={toggleHistory}
            aria-label="Toggle history"
          >
            <History />
          </IconButton>
        </Tooltip>

        <Box css={{ flex: 1 }} />

        <Tooltip content={previewOpen ? 'Close preview' : 'Open preview'}>
          <IconButton
            variant={previewOpen ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewOpen(!previewOpen)}
            aria-label="Toggle preview"
          >
            <PanelRight />
          </IconButton>
        </Tooltip>
      </Flex>

      {/* Messages */}
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        partialMessage={partialMessage}
      />

      {/* Input */}
      <Box css={{ padding: `0 ${spacing.xl} ${spacing.lg}`, maxWidth: '760px', margin: '0 auto', width: '100%' }}>
        <ChatInput onSend={handleSend} onCancel={handleCancel} isStreaming={isStreaming} />
      </Box>
    </Flex>
  )

  // Chat + optional preview
  const mainContent = previewOpen ? (
    <SplitPanel
      left={chatContent}
      defaultWidth={600}
      minWidth={360}
      maxWidth={900}
      storageKey="chat.previewSplit"
    >
      <PreviewPanel onClose={() => setPreviewOpen(false)} />
    </SplitPanel>
  ) : chatContent

  // Optional history panel wrapping everything
  if (!historyOpen) {
    return <Flex css={{ height: '100%', overflow: 'hidden' }}>{mainContent}</Flex>
  }

  return (
    <Flex css={{ height: '100%', overflow: 'hidden' }}>
      <SplitPanel
        left={<HistoryPanel />}
        defaultWidth={260}
        minWidth={200}
        maxWidth={400}
        storageKey="chat.historyWidth"
      >
        {mainContent}
      </SplitPanel>
    </Flex>
  )
}
