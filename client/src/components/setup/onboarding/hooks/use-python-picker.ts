import { useEffect, useMemo } from "react";
import { useInstalledVersionsQuery } from "@/api/hooks/commands";
import { isPythonVersionValid } from "@/constants";
import type { BinaryCandidate } from "@/components/shared/wizard";

export interface UsePythonPickerOptions {
  value: string | null;
  version: string | null;
  onPick: (path: string, version: string) => void;
}

export interface UsePythonPickerResult {
  candidates: BinaryCandidate[];
  loading: boolean;
  selectedInvalid: boolean;
  detected: boolean;
  rescan: () => void;
}

/**
 * Wraps `useInstalledVersionsQuery("python")` with auto-pick and
 * version validation for the Python onboarding step. Mirrors the Node
 * picker hook — separate so each step owns a focused, readable surface.
 */
export function usePythonPicker({
  value,
  version,
  onPick,
}: UsePythonPickerOptions): UsePythonPickerResult {
  const detect = useInstalledVersionsQuery("python");
  const installs = useMemo(() => detect.data ?? [], [detect.data]);
  const loading = detect.isLoading || detect.isFetching;

  useEffect(() => {
    if (detect.isLoading || installs.length === 0) return;
    if (value) {
      if (!version) {
        const match = installs.find((n) => n.path === value);
        if (match) onPick(match.path, match.version);
      }
      return;
    }
    const firstValid = installs.find((n) => isPythonVersionValid(n.version));
    const pick = firstValid ?? installs[0];
    if (pick) onPick(pick.path, pick.version);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detect.isLoading, installs, value, version]);

  const candidates = useMemo<BinaryCandidate[]>(
    () =>
      installs.map((n) => ({
        label: n.displayName,
        path: n.path,
        version: n.version,
      })),
    [installs],
  );

  const selectedInvalid = !!version && !isPythonVersionValid(version);

  return {
    candidates,
    loading,
    selectedInvalid,
    detected: !detect.isLoading,
    rescan: () => {
      detect.refetch();
    },
  };
}
