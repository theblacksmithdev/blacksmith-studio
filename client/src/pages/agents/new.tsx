import { AgentsPage } from "./agents-page";
import { useNewConversation } from "./hooks/use-new-conversation";
import { useClearLiveMessages } from "@/hooks/use-clear-live-messages";

export default function AgentsNewPage() {
  const { handleSend } = useNewConversation();

  // Clear any stale live messages from previous conversations on mount
  useClearLiveMessages("agents", "mount");

  return <AgentsPage onSend={handleSend} />;
}
