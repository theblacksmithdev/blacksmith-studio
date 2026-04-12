import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { queryClient as globalQueryClient } from '@/api/query-client'
import { useFileStore } from '@/stores/file-store'

/** Clear the file content cache. Call when switching projects. */
export function clearFileContentCache() {
  globalQueryClient.removeQueries({ queryKey: ['files', 'content'] })
}

export function useFiles() {
  const queryClient = useQueryClient()
  const { openFile, setTabContent, setTabError, markSaved } = useFileStore()

  const treeQuery = useQuery({
    queryKey: queryKeys.files,
    queryFn: () => api.files.tree(),
  })

  const fetchFileContent = async (filePath: string) => {
    openFile(filePath)
    try {
      const data = await queryClient.fetchQuery({
        queryKey: queryKeys.fileContent(filePath),
        queryFn: () => api.files.content({ path: filePath }),
        staleTime: Infinity,
      })
      setTabContent(filePath, data.content, data.language)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load file'
      setTabError(filePath, message)
    }
  }

  const saveFileContent = async (filePath: string) => {
    const tab = useFileStore.getState().openTabs.find((t) => t.path === filePath)
    if (!tab?.content || tab.content === tab.originalContent) return
    await api.files.save(filePath, tab.content)
    markSaved(filePath)
    queryClient.removeQueries({ queryKey: queryKeys.fileContent(filePath) })
  }

  return {
    tree: treeQuery.data ?? null,
    isLoading: treeQuery.isLoading,
    fetchFileTree: () => treeQuery.refetch(),
    fetchFileContent,
    saveFileContent,
  }
}
