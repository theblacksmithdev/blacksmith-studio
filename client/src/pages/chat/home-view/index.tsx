import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { ChatInput } from '@/components/chat/chat-input'
import { useClaude } from '@/hooks/use-claude'
import { useSessionsQuery, useCreateSession } from '@/api/hooks/sessions'
import { useActiveProjectId } from '@/api/hooks/_shared'
import { useChatStore } from '@/stores/chat-store'
import { chatPath } from '@/router/paths'
import { HomeHero } from './home-hero'
import { QuickActions } from './quick-actions'
import { HomeShell, SectionDivider } from './shared/home-shell'
import { RecentSection, type RecentEntry } from './shared/recent-section'

export function HomeView() {
  const { sendPrompt } = useClaude()
  const { data: sessionsData } = useSessionsQuery({ limit: 4 })
  const createSession = useCreateSession()
  const { isStreaming } = useChatStore()
  const navigate = useNavigate()
  const pid = useActiveProjectId()

  const sessions = sessionsData?.items ?? []

  const handleSend = async (text: string) => {
    if (!pid) return
    const session = await createSession.mutateAsync(undefined)
    sendPrompt(text, session.id)
    navigate(chatPath(pid, session.id))
  }

  const recentItems: RecentEntry[] = sessions.map((s) => ({
    id: s.id,
    title: s.lastPrompt || s.name,
    type: 'chat',
    updatedAt: s.updatedAt,
    icon: <MessageSquare />,
  }))

  return (
    <HomeShell>
      <HomeHero />
      <ChatInput onSend={handleSend} onCancel={() => {}} isStreaming={isStreaming} />
      <QuickActions mode="chat" onSend={handleSend} />
      {recentItems.length > 0 ? (
        <>
          <SectionDivider />
          <RecentSection
            items={recentItems}
            onSelect={(id) => pid && navigate(chatPath(pid, id))}
          />
        </>
      ) : null}
    </HomeShell>
  )
}
