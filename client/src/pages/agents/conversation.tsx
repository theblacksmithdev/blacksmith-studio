import { useParams } from "react-router-dom";
import { AgentsPage } from "./agents-page";
import { useConversation } from "./hooks/use-conversation";

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
