import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProjectKeys } from "../_shared";

/** Returns a stable callback that invalidates all git-related query caches. */
export function useInvalidateGit() {
  const qc = useQueryClient();
  const keys = useProjectKeys();

  return useCallback(() => {
    qc.invalidateQueries({ queryKey: keys.gitStatus });
    qc.invalidateQueries({ queryKey: keys.gitChangedFiles });
    qc.invalidateQueries({ queryKey: keys.gitHistory });
    qc.invalidateQueries({ queryKey: keys.gitBranches });
    qc.invalidateQueries({ queryKey: keys.gitSyncStatus });
  }, [qc, keys]);
}
