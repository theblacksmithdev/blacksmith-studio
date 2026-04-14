import { useMatches } from 'react-router-dom'
import type { RouteHandle } from './index'

/**
 * Returns the `handle` data from the deepest matching route that has one.
 * Use this to read route metadata like `title` set in the router config.
 */
export function useRouteHandle(): RouteHandle {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i].handle as RouteHandle | undefined
    if (handle) return handle
  }
  return {}
}
