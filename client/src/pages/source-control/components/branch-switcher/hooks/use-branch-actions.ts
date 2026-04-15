import { useState } from "react";
import {
  useGitBranchesQuery,
  useGitCreateBranch,
  useGitSwitchBranch,
  useGitMerge,
} from "@/api/hooks/git";

export function useBranchActions(onClose: () => void) {
  const { data: branches, isLoading } = useGitBranchesQuery();
  const createBranch = useGitCreateBranch();
  const switchBranch = useGitSwitchBranch();
  const merge = useGitMerge();

  const [error, setError] = useState<string | null>(null);

  const current = branches?.find((b) => b.current) ?? null;
  const others = branches?.filter((b) => !b.current) ?? [];

  const checkout = (name: string) => {
    setError(null);
    onClose();
    switchBranch.mutate(name, {
      onError: (err) =>
        setError(
          err instanceof Error ? err.message : "Failed to switch branch",
        ),
    });
  };

  const create = (name: string) => {
    setError(null);
    onClose();
    createBranch.mutate(name, {
      onError: (err) =>
        setError(
          err instanceof Error ? err.message : "Failed to create branch",
        ),
    });
  };

  const mergeInto = (source: string) => {
    if (!current) return;
    setError(null);
    merge.mutate(
      { source, target: current.name },
      {
        onSuccess: (result) => {
          if (result.success) {
            onClose();
          } else {
            setError(`Merge conflicts in: ${result.conflicts.join(", ")}`);
          }
        },
        onError: (err) =>
          setError(err instanceof Error ? err.message : "Merge failed"),
      },
    );
  };

  return {
    branches: { current, others, isLoading },
    actions: { checkout, create, mergeInto },
    pending: {
      switching: switchBranch.isPending,
      creating: createBranch.isPending,
      merging: merge.isPending,
    },
    error,
    clearError: () => setError(null),
  };
}
