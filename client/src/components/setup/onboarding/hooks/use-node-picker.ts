import { useEffect, useMemo } from "react";
import { useDetectNodeQuery } from "@/api/hooks/runner";
import { isNodeVersionValid } from "@/constants";
import type { BinaryCandidate } from "@/components/shared/wizard";

export interface UseNodePickerOptions {
  value: string | null;
  version: string | null;
  onPick: (path: string, version: string) => void;
}

export interface UseNodePickerResult {
  /** Detected Node installations, already shaped for BinaryPicker. */
  candidates: BinaryCandidate[];
  /** True while the initial fetch or a rescan is in-flight. */
  loading: boolean;
  /** True when a value is set but its version is below the minimum. */
  selectedInvalid: boolean;
  /** True once the initial fetch has resolved (with or without results). */
  detected: boolean;
  /** Force a fresh detection run. */
  rescan: () => void;
}

/**
 * Wraps `useDetectNodeQuery` with auto-pick + validation semantics for
 * the Node.js onboarding step. Picks the first candidate that passes
 * `MIN_NODE_MAJOR` on first load so the user doesn't get dropped on an
 * outdated default that would block advancement.
 */
export function useNodePicker({
  value,
  version,
  onPick,
}: UseNodePickerOptions): UseNodePickerResult {
  const detect = useDetectNodeQuery();
  const installs = useMemo(() => detect.data ?? [], [detect.data]);
  const loading = detect.isLoading || detect.isFetching;

  useEffect(() => {
    if (detect.isLoading || installs.length === 0) return;
    if (value) {
      // Path is pre-populated (from settings) but version may not be —
      // match it to a detected candidate and hydrate the version so
      // the validation gate can evaluate it.
      if (!version) {
        const match = installs.find((n) => n.path === value);
        if (match) onPick(match.path, match.version);
      }
      return;
    }
    const firstValid = installs.find((n) => isNodeVersionValid(n.version));
    const pick = firstValid ?? installs[0];
    if (pick) onPick(pick.path, pick.version);
    // onPick is stable across renders in the caller (passed from the
    // onboarding hook), so it's safe to exclude it from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detect.isLoading, installs, value, version]);

  const candidates = useMemo<BinaryCandidate[]>(
    () =>
      installs.map((n) => ({
        label: n.label,
        path: n.path,
        version: n.version,
      })),
    [installs],
  );

  const selectedInvalid = !!version && !isNodeVersionValid(version);

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
