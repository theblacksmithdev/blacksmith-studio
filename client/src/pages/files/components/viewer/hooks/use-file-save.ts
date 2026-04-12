import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useFileStore } from '@/stores/file-store'
import { useProjectKeys } from '@/hooks/use-project-keys'

interface SaveInput {
  path: string
  content: string
}

export function useFileSave() {
  const queryClient = useQueryClient()
  const keys = useProjectKeys()
  const markSaved = useFileStore((s) => s.markSaved)

  const mutation = useMutation({
    mutationFn: ({ path, content }: SaveInput) => api.files.save(path, content),
    onSuccess: (_data, { path }) => {
      markSaved(path)
      queryClient.removeQueries({ queryKey: keys.fileContent(path) })
    },
  })

  const save = (path: string) => {
    const tab = useFileStore.getState().openTabs.find((t) => t.path === path)
    if (!tab?.content || tab.content === tab.originalContent) return
    mutation.mutate({ path, content: tab.content })
  }

  return {
    save,
    isSaving: mutation.isPending,
  }
}
