import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Network } from 'lucide-react'
import { ChatInput } from '@/components/chat/chat-input'
import { useChatStore } from '@/stores/chat-store'
import { useProjectStore } from '@/stores/project-store'
import { useAgentConversations } from '@/hooks/use-agent-conversations'
import { agentsNewPath, agentsConversationPath } from '@/router/paths'
import { HomeHero } from '@/components/chat/home-view/home-hero'
import { QuickActions } from '@/components/chat/home-view/quick-actions'
import { HomeShell, SectionDivider } from '@/components/chat/home-view/shared/home-shell'
import { RecentSection, type RecentEntry } from '@/components/chat/home-view/shared/recent-section'
import { ConfirmDialog } from '@/components/shared/ui'

export function AgentsHomeView() {
  const { isStreaming } = useChatStore()
  const navigate = useNavigate()
  const activeProject = useProjectStore((s) => s.activeProject)
  const { conversations, deleteConversation } = useAgentConversations({ limit: 4 })
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const pid = activeProject?.id

  const handleSend = async (text: string) => {
    if (!pid) return
    navigate(agentsNewPath(pid), { state: { initialPrompt: text } })
  }

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return
    deleteConversation(deleteTarget)
    setDeleteTarget(null)
  }, [deleteTarget, deleteConversation])

  const recentItems: RecentEntry[] = conversations.map((c: any) => ({
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
      {recentItems.length > 0 && (
        <>
          <SectionDivider />
          <RecentSection
            label="Recent conversations"
            items={recentItems}
            onSelect={(id) => pid && navigate(agentsConversationPath(pid, id))}
            onDelete={(id) => setDeleteTarget(id)}
          />
        </>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="Delete this conversation?"
          description="All messages and task history in this conversation will be permanently removed."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </HomeShell>
  )
}
