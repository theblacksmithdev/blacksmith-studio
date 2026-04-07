import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import { History } from 'lucide-react'
import { ChatInput } from '../chat-input'
import { HistoryPanel } from '../history-panel'
import { useClaude } from '@/hooks/use-claude'
import { useSessions } from '@/hooks/use-sessions'
import { useChatStore } from '@/stores/chat-store'
import { useProjectStore } from '@/stores/project-store'
import { useUiStore } from '@/stores/ui-store'
import { chatPath } from '@/router/paths'
import { HomeHero } from './home-hero'
import { RecentConversations } from './recent-conversations'
import { QuickActions } from './quick-actions'
import { TemplateSection } from './template-section'
import { Tooltip } from '@/components/shared/tooltip'

const Root = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`

const Page = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 14px;
  flex-shrink: 0;
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

const Content = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  min-height: 0;
`

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 620px;
  padding: 40px 24px;
  margin: 0 auto;
`

const Divider = styled.div`
  width: 40px;
  height: 1px;
  background: var(--studio-border);
  margin: 4px 0;
`

export function HomeView() {
  const { sendPrompt } = useClaude()
  const { sessions, createSession } = useSessions({ limit: 4 })
  const { isStreaming } = useChatStore()
  const navigate = useNavigate()
  const activeProject = useProjectStore((s) => s.activeProject)
  const historyOpen = useUiStore((s) => s.historyPanelOpen)
  const toggleHistory = useUiStore((s) => s.toggleHistoryPanel)

  const handleSend = async (text: string) => {
    if (!activeProject) return
    const session = await createSession()
    sendPrompt(text, session.id)
    navigate(chatPath(activeProject.id, session.id))
  }

  const handleSelectSession = (sessionId: string) => {
    if (activeProject) navigate(chatPath(activeProject.id, sessionId))
  }

  return (
    <Root>
      {historyOpen && <HistoryPanel />}

      <Page>
        <TopBar>
          <Tooltip content={historyOpen ? 'Close history' : 'Chat history'}>
            <TopBarBtn active={historyOpen} onClick={toggleHistory}>
              <History size={15} />
            </TopBarBtn>
          </Tooltip>
        </TopBar>

        <Content>
          <Stack>
            <HomeHero />
            <ChatInput onSend={handleSend} onCancel={() => {}} isStreaming={isStreaming} />
            <QuickActions onSend={handleSend} />
            <TemplateSection onSend={handleSend} />
            {sessions.length > 0 && (
              <>
                <Divider />
                <RecentConversations
                  sessions={sessions}
                  onSelect={handleSelectSession}
                />
              </>
            )}
          </Stack>
        </Content>
      </Page>
    </Root>
  )
}
