import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Removes an MCP server. Invalidates the MCP list on success.
 */
export function useRemoveMcpServer() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (name: string) => api.mcp.remove(projectId!, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.mcp })
    },
  })
}
