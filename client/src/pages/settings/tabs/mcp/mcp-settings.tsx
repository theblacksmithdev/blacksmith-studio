import { Flex } from "@chakra-ui/react";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { mcpBrowserPath } from "@/router/paths";
import { McpServerModal } from "@/pages/mcp/components/mcp-server-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useMcpActions } from "./hooks/use-mcp-actions";
import { McpHeader } from "./components/mcp-header";
import { McpServerList } from "./components/mcp-server-list";
import { McpEmptyState } from "./components/mcp-empty-state";

export function McpSettings() {
  const projectId = useActiveProjectId();
  const { servers, modal, setModal, handleUpdate, handleRemove } =
    useMcpActions();

  const enabledCount = servers.filter((s) => s.enabled).length;

  return (
    <Flex direction="column" gap="14px">
      <McpHeader
        serverCount={servers.length}
        enabledCount={enabledCount}
        addPath={mcpBrowserPath(projectId!)}
      />

      {servers.length === 0 ? (
        <McpEmptyState browsePath={mcpBrowserPath(projectId!)} />
      ) : (
        <McpServerList
          servers={servers}
          onEdit={(server) => setModal({ type: "edit", server })}
          onDelete={(name) => setModal({ type: "delete", name })}
          browsePath={mcpBrowserPath(projectId!)}
        />
      )}

      {modal?.type === "edit" && (
        <McpServerModal
          server={modal.server}
          onSave={handleUpdate}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "delete" && (
        <ConfirmDialog
          message={`Remove "${modal.name}"?`}
          description="This will remove the server from your project's MCP configuration."
          confirmLabel="Remove"
          variant="danger"
          onConfirm={handleRemove}
          onCancel={() => setModal(null)}
        />
      )}
    </Flex>
  );
}
