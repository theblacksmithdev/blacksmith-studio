import { HomePageView } from "./components/home-page-view";
import { useSingleAgentChat } from "./hooks/use-single-agent-chat";

export function SingleAgentChat() {
  const props = useSingleAgentChat();

  return <HomePageView mode="chat" {...props} />;
}
