import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Tests the connection to an MCP server. Invalidates the MCP list on settle.
 */
export function useTestMcpServer() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (name: string) => api.mcp.test(projectId!, name),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.mcp })
    },
  })
}
