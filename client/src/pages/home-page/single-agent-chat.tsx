import { HomePageView } from "./components/home-page-view";
import { useSingleAgentChat } from "./hooks/use-single-agent-chat";
import { useClearLiveMessages } from "@/hooks/use-clear-live-messages";

export function SingleAgentChat() {
  const props = useSingleAgentChat();

  // Clear any stale pending messages from previous sessions on mount
  useClearLiveMessages("chat", "mount");

  return <HomePageView mode="chat" {...props} />;
}
