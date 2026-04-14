import { useNavigate } from "react-router-dom";
import { useClaude } from "@/hooks/use-claude";
import { useSessionsQuery, useCreateSession } from "@/api/hooks/sessions";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { useChatStore } from "@/stores/chat-store";
import { chatPath } from "@/router/paths";
import { type RecentEntry } from "@/pages/home-page/components/recent-section";
import { MessageSquare } from "lucide-react";

export const useHomeView = () => {
  const { isStreaming } = useChatStore();
  const { data: sessionsData } = useSessionsQuery({ limit: 4 });

  const { sendPrompt } = useClaude();

  const navigate = useNavigate();
  const createSession = useCreateSession();
  const projectId = useActiveProjectId();

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

  const gotoChat = (id: string) => {
    if (!projectId) return;
    navigate(chatPath(projectId, id));
  };

  return {
    handleSend,
    recentItems,
    isStreaming,
    gotoChat,
  };
};
