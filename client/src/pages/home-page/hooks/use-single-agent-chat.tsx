import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useClaude } from "@/hooks/use-claude";
import { useSessionsQuery, useCreateSession } from "@/api/hooks/sessions";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { useChatStore } from "@/stores/chat-store";
import { chatPath } from "@/router/paths";
import type { RecentEntry } from "../components/recent-section";

export function useSingleAgentChat() {
  const navigate = useNavigate();
  const projectId = useActiveProjectId();
  const { sendPrompt } = useClaude();
  const { isStreaming } = useChatStore();
  const { data: sessionsData } = useSessionsQuery({ limit: 4 });
  const createSession = useCreateSession();

  const sessions = sessionsData?.items ?? [];

  const handleSend = (text: string) => {
    if (!projectId) return;
    createSession.mutate(undefined, {
      onSuccess: (session) => {
        sendPrompt(text, session.id);
        navigate(chatPath(projectId, session.id));
      },
    });
  };

  const recentItems: RecentEntry[] = sessions.map((s) => ({
    id: s.id,
    title: s.lastPrompt || s.name,
    type: "chat",
    updatedAt: s.updatedAt,
    icon: <MessageSquare />,
  }));

  const onSelectRecent = (id: string) => {
    if (projectId) navigate(chatPath(projectId, id));
  };

  return {
    isStreaming,
    recentItems,
    onSend: handleSend,
    onSelectRecent,
  };
}
