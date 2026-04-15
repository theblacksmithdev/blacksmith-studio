import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";
import type { McpServerConfig } from "@/api/modules/mcp";

/**
 * Updates an existing MCP server config. Invalidates the MCP list on success.
 */
export function useUpdateMcpServer() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (data: { name: string; config: McpServerConfig }) =>
      api.mcp.update(projectId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.mcp });
    },
  });
}
