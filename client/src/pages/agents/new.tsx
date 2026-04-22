import { AgentsPage } from "./agents-page";
import { useNewConversation } from "./hooks/use-new-conversation";

export default function AgentsNewPage() {
  const { handleSend } = useNewConversation();
  return <AgentsPage onSend={handleSend} />;
}
