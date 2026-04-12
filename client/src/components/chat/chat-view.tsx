import { useEffect } from 'react'
import styled from '@emotion/styled'
import { useParams } from 'react-router-dom'
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
import { Tooltip } from '@/components/shared/tooltip'

const Root = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`

const ChatColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  flex-shrink: 0;
`

const Spacer = styled.div`
  flex: 1;
`

const TopBarBtn = styled.button<{ active: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'transparent')};
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const InputWrap = styled.div`
  padding: 0 24px 20px;
  max-width: 760px;
  margin: 0 auto;
  width: 100%;
`

export function ChatView() {
  const { sessionId } = useParams<{ sessionId: string }>()
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

  const handleSend = async (text: string) => {
    if (!sessionId) return
    sendPrompt(text, sessionId)
  }

  const handleCancel = () => {
    if (sessionId) cancelPrompt(sessionId)
  }

  const chatContent = (
    <ChatColumn>
      <TopBar>
        <Tooltip content={historyOpen ? 'Close history' : 'Chat history'}>
          <TopBarBtn active={historyOpen} onClick={toggleHistory}>
            <History size={15} />
          </TopBarBtn>
        </Tooltip>

        <Spacer />

        <Tooltip content={previewOpen ? 'Close preview' : 'Open preview'}>
          <TopBarBtn active={previewOpen} onClick={() => setPreviewOpen(!previewOpen)}>
            <PanelRight size={15} />
          </TopBarBtn>
        </Tooltip>
      </TopBar>

      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        partialMessage={partialMessage}
      />

      <InputWrap>
        <ChatInput onSend={handleSend} onCancel={handleCancel} isStreaming={isStreaming} />
      </InputWrap>
    </ChatColumn>
  )

  // Chat + optional preview (preview is the resizable left panel, chat fills remaining)
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
    return <Root>{mainContent}</Root>
  }

  return (
    <Root>
      <SplitPanel
        left={<HistoryPanel />}
        defaultWidth={260}
        minWidth={200}
        maxWidth={400}
        storageKey="chat.historyWidth"
      >
        {mainContent}
      </SplitPanel>
    </Root>
  )
}
