import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";

const FULLSCREEN_KEY = ["window", "fullscreen"] as const;

/**
 * Tracks fullscreen state. Queries the backend for initial state,
 * then subscribes to push events for live updates.
 */
export function useFullscreen() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: FULLSCREEN_KEY,
    queryFn: async () => {
      const state = await api.window.getState();
      return state.isFullscreen;
    },
  });

  useEffect(() => {
    const unsub = api.window.onFullscreen((isFullscreen) => {
      qc.setQueryData(FULLSCREEN_KEY, isFullscreen);
    });
    return unsub;
  }, [qc]);

  return data ?? false;
}
