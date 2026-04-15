import { AgentsPage } from "@/components/agents";
import { useNewConversation } from "@/components/agents/page/use-new-conversation";

export default function AgentsNewPage() {
  const { handleSend } = useNewConversation();
  return <AgentsPage onSend={handleSend} />;
}
