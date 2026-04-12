import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useGlobalSettings } from '@/hooks/use-global-settings'

const EDITOR_QUERY_KEY = ['files', 'editors']

export function useEditors() {
  const globalSettings = useGlobalSettings()

  const { data: editors = [], isLoading } = useQuery({
    queryKey: EDITOR_QUERY_KEY,
    queryFn: () => api.files.detectEditors(),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  })

  const preferredCommand = globalSettings.get('editor.preferred') as string | null

  const preferred = editors.find((e) => e.command === preferredCommand) ?? editors[0] ?? null

  const setPreferred = (command: string) => {
    globalSettings.set('editor.preferred', command)
  }

  const openFile = (filePath: string, command?: string) => {
    const cmd = command || preferred?.command
    if (cmd) api.files.openInEditor(filePath, cmd)
  }

  return {
    editors,
    preferred,
    isLoading,
    setPreferred,
    openFile,
  }
}
