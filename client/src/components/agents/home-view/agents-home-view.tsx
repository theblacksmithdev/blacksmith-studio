import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Network } from 'lucide-react'
import { ChatInput } from '@/components/chat/chat-input'
import { useChatStore } from '@/stores/chat-store'
import { useProjectStore } from '@/stores/project-store'
import { api } from '@/api'
import { agentsNewPath, agentsConversationPath } from '@/router/paths'
import { HomeHero } from '@/components/chat/home-view/home-hero'
import { QuickActions } from '@/components/chat/home-view/quick-actions'
import { HomeShell, SectionDivider } from '@/components/chat/home-view/shared/home-shell'
import { RecentSection, type RecentEntry } from '@/components/chat/home-view/shared/recent-section'

export function AgentsHomeView() {
  const { isStreaming } = useChatStore()
  const navigate = useNavigate()
  const activeProject = useProjectStore((s) => s.activeProject)
  const [convs, setConvs] = useState<any[]>([])

  useEffect(() => {
    api.agents.listConversations()
      .then(setConvs)
      .catch(() => {})
  }, [])

  const pid = activeProject?.id

  const handleSend = async (text: string) => {
    if (!pid) return
    navigate(agentsNewPath(pid), { state: { initialPrompt: text } })
  }

  const handleDelete = async (id: string) => {
    await api.agents.deleteConversation(id)
    setConvs((prev) => prev.filter((c) => c.id !== id))
  }

  const recentItems: RecentEntry[] = convs.map((c) => ({
    id: c.id,
    title: c.title,
    type: 'agents',
    updatedAt: c.updatedAt,
    meta: `${c.messageCount} messages`,
    icon: <Network />,
  }))

  return (
    <HomeShell>
      <HomeHero />
      <ChatInput onSend={handleSend} onCancel={() => {}} isStreaming={isStreaming} />
      <QuickActions mode="agents" onSend={handleSend} />
      {recentItems.length > 0 ? (
        <>
          <SectionDivider />
          <RecentSection
            label="Recent conversations"
            items={recentItems}
            onSelect={(id) => pid && navigate(agentsConversationPath(pid, id))}
            onDelete={handleDelete}
          />
        </>
      ) : null}
    </HomeShell>
  )
}
