import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useFileStore } from '@/stores/file-store'
import { useProjectKeys } from './use-project-keys'

export function useFiles() {
  const queryClient = useQueryClient()
  const keys = useProjectKeys()
  const { openFile, setTabContent, setTabError, markSaved } = useFileStore()

  const treeQuery = useQuery({
    queryKey: keys.files,
    queryFn: () => api.files.tree(),
    staleTime: 30_000,
  })

  const fetchFileContent = async (filePath: string) => {
    openFile(filePath)
    try {
      const data = await queryClient.fetchQuery({
        queryKey: keys.fileContent(filePath),
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
    queryClient.removeQueries({ queryKey: keys.fileContent(filePath) })
  }

  return {
    tree: treeQuery.data ?? null,
    isLoading: treeQuery.isLoading,
    fetchFileTree: () => treeQuery.refetch(),
    fetchFileContent,
    saveFileContent,
  }
}
