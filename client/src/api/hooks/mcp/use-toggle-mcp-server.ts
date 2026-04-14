import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Enables or disables an MCP server. Invalidates the MCP list on success.
 */
export function useToggleMcpServer() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (data: { name: string; enabled: boolean }) =>
      api.mcp.toggle(projectId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.mcp })
    },
  })
}
