import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { WindowState } from "@/api/modules/window";

const WINDOW_STATE_KEY = ["window", "state"] as const;

/**
 * Fetches the full window state (fullscreen, maximized, focused, version).
 * Subscribes to fullscreen changes and updates the cache.
 */
export function useWindowStateQuery() {
  const qc = useQueryClient();

  const query = useQuery<WindowState>({
    queryKey: WINDOW_STATE_KEY,
    queryFn: () => api.window.getState(),
  });

  useEffect(() => {
    const unsub = api.window.onFullscreen((isFullscreen) => {
      qc.setQueryData<WindowState>(WINDOW_STATE_KEY, (prev) =>
        prev ? { ...prev, isFullscreen } : prev,
      );
    });
    return unsub;
  }, [qc]);

  return query;
}
