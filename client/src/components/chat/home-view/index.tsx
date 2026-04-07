import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import { ChatInput } from '../chat-input'
import { useClaude } from '@/hooks/use-claude'
import { useSessions } from '@/hooks/use-sessions'
import { useChatStore } from '@/stores/chat-store'
import { useProjectStore } from '@/stores/project-store'
import { chatPath } from '@/router/paths'
import { HomeHero } from './home-hero'
import { RecentConversations } from './recent-conversations'
import { QuickActions } from './quick-actions'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
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
    <Page>
      <Content>
        <Stack>
          <HomeHero />
          <ChatInput onSend={handleSend} onCancel={() => {}} isStreaming={isStreaming} />
          <QuickActions onSend={handleSend} />
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
  )
}
