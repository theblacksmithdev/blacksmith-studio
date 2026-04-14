import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { queryKeys } from '@/api/query-keys'

/** Returns project-scoped query keys derived from the :projectId route param. */
export function useProjectKeys() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  return useMemo(() => queryKeys.forProject(projectId), [projectId])
}
