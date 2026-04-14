import { HomePageView } from './components/home-page-view'
import { useAgentTeamChat } from './hooks/use-agent-team-chat'

export function AgentTeamChat() {
  const props = useAgentTeamChat()

  return <HomePageView mode="agents" {...props} />
}
