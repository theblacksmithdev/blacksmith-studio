import { useState, useCallback } from "react";
import {
  useMcpServersQuery,
  useUpdateMcpServer,
  useRemoveMcpServer,
} from "@/api/hooks/mcp";
import type { McpServerConfig, McpServerEntry } from "@/api/modules/mcp";

export type McpModalState =
  | null
  | { type: "edit"; server: McpServerEntry }
  | { type: "delete"; name: string };

/**
 * Page-level MCP actions — server list, modal state, update/remove.
 * Per-server actions (test, toggle) are in use-mcp-server-item.
 */
export function useMcpActions() {
  const { data: servers = [] } = useMcpServersQuery();
  const updateMutation = useUpdateMcpServer();
  const removeMutation = useRemoveMcpServer();
  const [modal, setModal] = useState<McpModalState>(null);

  const handleUpdate = useCallback(
    async (name: string, config: McpServerConfig) => {
      updateMutation.mutate(
        { name, config },
        {
          onSuccess() {
            setModal(null);
          },
        },
      );
    },
    [updateMutation],
  );

  const handleRemove = useCallback(() => {
    if (modal?.type === "delete") {
      removeMutation.mutate(modal.name, {
        onSuccess() {
          setModal(null);
        },
      });
    }
  }, [modal, removeMutation]);

  return {
    servers,
    modal,
    setModal,
    handleUpdate,
    handleRemove,
  };
}
