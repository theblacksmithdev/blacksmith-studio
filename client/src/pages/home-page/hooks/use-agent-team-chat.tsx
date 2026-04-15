import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Network } from "lucide-react";
import {
  useAgentConversationsQuery,
  useDeleteAgentConversation,
} from "@/api/hooks/agents";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { useChatStore } from "@/stores/chat-store";
import { agentsNewPath, agentsConversationPath } from "@/router/paths";
import type { RecentEntry } from "../components/recent-section";
import type { HomePageViewProps } from "../components/home-page-view";

export function useAgentTeamChat() {
  const navigate = useNavigate();
  const projectId = useActiveProjectId();
  const { isStreaming } = useChatStore();
  const { data: allConversations = [] } = useAgentConversationsQuery();
  const deleteConvMutation = useDeleteAgentConversation();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const conversations = allConversations.slice(0, 4);

  const handleSend = (text: string) => {
    if (!projectId) return;
    navigate(agentsNewPath(projectId), { state: { initialPrompt: text } });
  };

  const recentItems: RecentEntry[] = conversations.map((c: any) => ({
    id: c.id,
    title: c.title,
    type: "agents",
    updatedAt: c.updatedAt,
    meta: `${c.messageCount} messages`,
    icon: <Network />,
  }));

  const onSelectRecent = (id: string) => {
    if (projectId) navigate(agentsConversationPath(projectId, id));
  };

  const onDeleteRecent = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteConvMutation.mutate(deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget, deleteConvMutation]);

  const deleteConfirm: HomePageViewProps["deleteConfirm"] = {
    target: deleteTarget,
    message: "Delete this conversation?",
    description:
      "All messages and task history in this conversation will be permanently removed.",
    onConfirm: confirmDelete,
    onCancel: () => setDeleteTarget(null),
  };

  return {
    isStreaming,
    recentItems,
    recentLabel: "Recent conversations",
    onSend: handleSend,
    onSelectRecent,
    onDeleteRecent,
    deleteConfirm,
  };
}
