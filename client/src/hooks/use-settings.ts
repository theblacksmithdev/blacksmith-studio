import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '@/api'
import { useProjectKeys } from './use-project-keys'
import { useCallback } from 'react'

export function useSettings() {
  const queryClient = useQueryClient()
  const keys = useProjectKeys()
  const { projectId } = useParams<{ projectId: string }>()

  const { data: settings = {} } = useQuery({
    queryKey: keys.settings,
    queryFn: () => api.settings.getAll(projectId!),
    enabled: !!projectId,
  })

  const mutation = useMutation({
    mutationFn: (pair: { key: string; value: any }) =>
      api.settings.update(projectId!, { [pair.key]: pair.value }),
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: keys.settings })
      const previous = queryClient.getQueryData<Record<string, any>>(keys.settings)
      queryClient.setQueryData(keys.settings, (old: Record<string, any> = {}) => ({
        ...old,
        [key]: value,
      }))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(keys.settings, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.settings })
    },
  })

  const set = useCallback(
    (key: string, value: any) => mutation.mutate({ key, value }),
    [mutation],
  )

  const get = useCallback(
    (key: string) => settings[key],
    [settings],
  )

  return {
    get,
    set,

    // Appearance
    theme: (settings['appearance.theme'] ?? 'system') as 'light' | 'dark' | 'system',
    fontSize: (settings['appearance.fontSize'] ?? 14) as number,
    sidebarCollapsed: (settings['appearance.sidebarCollapsed'] ?? false) as boolean,

    // AI
    model: (settings['ai.model'] ?? 'sonnet') as string,
    maxBudget: settings['ai.maxBudget'] as number | null,
    customInstructions: (settings['ai.customInstructions'] ?? '') as string,
    permissionMode: (settings['ai.permissionMode'] ?? 'bypassPermissions') as string,

    // Editor
    tabSize: (settings['editor.tabSize'] ?? 2) as number,
    wordWrap: (settings['editor.wordWrap'] ?? true) as boolean,
    minimap: (settings['editor.minimap'] ?? true) as boolean,
    lineNumbers: (settings['editor.lineNumbers'] ?? true) as boolean,

    // Project
    displayName: (settings['project.displayName'] ?? '') as string,
    ignoredPatterns: (settings['project.ignoredPatterns'] ?? '') as string,

    // Preview
    frontendPath: (settings['preview.frontendPath'] ?? '/') as string,
    backendPath: (settings['preview.backendPath'] ?? '/api/docs') as string,
    chatSplit: (settings['preview.chatSplit'] ?? 60) as number,
    runSplit: (settings['preview.runSplit'] ?? 55) as number,

    // Runner
    nodePath: (settings['runner.nodePath'] ?? '') as string,
  }
}
