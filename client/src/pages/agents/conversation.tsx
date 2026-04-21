import { useParams } from "react-router-dom";
import { AgentsPage } from "@/components/agents";
import { useConversation } from "@/components/agents/page/use-conversation";

export default function AgentsConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { handleSend, isDispatching } = useConversation(conversationId!);
  return (
    <AgentsPage
      conversationId={conversationId}
      onSend={handleSend}
      isDispatching={isDispatching}
    />
  );
}
