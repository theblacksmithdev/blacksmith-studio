import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { ChatInput } from '../chat-input'
import { useClaude } from '@/hooks/use-claude'
import { useSessions } from '@/hooks/use-sessions'
import { useChatStore } from '@/stores/chat-store'
import { useProjectStore } from '@/stores/project-store'
import { chatPath } from '@/router/paths'
import { HomeHero } from './home-hero'
import { QuickActions } from './quick-actions'
import { HomeShell, SectionDivider } from './shared/home-shell'
import { RecentSection, type RecentEntry } from './shared/recent-section'

export function HomeView() {
  const { sendPrompt } = useClaude()
  const { sessions, createSession } = useSessions({ limit: 5 })
  const { isStreaming } = useChatStore()
  const navigate = useNavigate()
  const activeProject = useProjectStore((s) => s.activeProject)
  const pid = activeProject?.id

  const handleSend = async (text: string) => {
    if (!pid) return
    const session = await createSession()
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
