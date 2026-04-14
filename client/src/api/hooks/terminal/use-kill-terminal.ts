import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'

/**
 * Kills a terminal by its ID.
 */
export function useKillTerminal() {
  return useMutation({
    mutationFn: (id: string) => api.terminal.kill(id),
  })
}
