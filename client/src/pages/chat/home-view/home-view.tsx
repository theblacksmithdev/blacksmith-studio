import { ChatInput } from '@/components/chat/chat-input'
import { HomeHero } from './components/home-hero'
import { QuickActions } from './components/quick-actions'
import { HomeShell, SectionDivider } from './components/home-shell'
import { RecentSection } from './components/recent-section'
import { useHomeView } from './hooks/use-home-view'

export function HomeView() {
  const { handleSend, gotoChat, recentItems, isStreaming } = useHomeView()

  return (
    <HomeShell>
      <HomeHero />
      <ChatInput
        onSend={handleSend}
        onCancel={() => {}}
        isStreaming={isStreaming}
      />
      <QuickActions mode="chat" onSend={handleSend} />
      {recentItems.length > 0 ? (
        <>
          <SectionDivider />
          <RecentSection items={recentItems} onSelect={gotoChat} />
        </>
      ) : null}
    </HomeShell>
  )
}
