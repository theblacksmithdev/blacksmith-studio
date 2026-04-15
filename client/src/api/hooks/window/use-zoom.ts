import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ZOOM_KEY = ["window", "zoom"] as const;

/**
 * Reactive zoom level for the app window.
 * `level` is the current zoom (0 = 100%). `setZoomLevel` updates it and syncs to Electron.
 */
export function useZoom() {
  const qc = useQueryClient();

  const { data: level = 0 } = useQuery({
    queryKey: ZOOM_KEY,
    queryFn: () => window.electronAPI?.getZoomLevel() ?? 0,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: async (newLevel: number) => {
      window.electronAPI?.setZoomLevel(newLevel);
      return newLevel;
    },
    onSuccess: (newLevel) => {
      qc.setQueryData(ZOOM_KEY, newLevel);
    },
  });

  return {
    level,
    setZoomLevel: mutation.mutate,
  };
}
