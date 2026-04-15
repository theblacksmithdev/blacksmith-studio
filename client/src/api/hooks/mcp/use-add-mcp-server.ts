import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";
import type { McpServerConfig } from "@/api/modules/mcp";

/**
 * Adds a new MCP server. Invalidates the MCP list on success.
 */
export function useAddMcpServer() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (data: { name: string; config: McpServerConfig }) =>
      api.mcp.add(projectId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.mcp });
    },
  });
}
