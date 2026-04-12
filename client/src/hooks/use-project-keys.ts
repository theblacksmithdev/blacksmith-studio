import { useMemo } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { queryKeys } from '@/api/query-keys'

/** Returns project-scoped query keys for the active project. */
export function useProjectKeys() {
  const projectId = useProjectStore((s) => s.activeProject?.id ?? '')
  return useMemo(() => queryKeys.forProject(projectId), [projectId])
}
