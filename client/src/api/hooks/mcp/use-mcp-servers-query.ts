import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Fetches the list of MCP servers configured for the active project.
 */
export function useMcpServersQuery() {
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useQuery({
    queryKey: keys.mcp,
    queryFn: () => api.mcp.list(projectId!),
    enabled: !!projectId,
  })
}
