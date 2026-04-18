import { useState } from "react";
import {
  useCreateProjectEnv,
  useDeleteProjectEnv,
  useResolvedEnvQuery,
} from "@/api/hooks/commands";

export interface StudioVenvVM {
  hasVenv: boolean;
  path: string | null;

  isCreating: boolean;
  isResetting: boolean;
  localError: string | null;

  confirmingReset: boolean;
  requestReset: () => void;
  cancelReset: () => void;
  confirmReset: () => Promise<void>;

  handleCreate: () => Promise<void>;
}

/**
 * View-model for the shared Blacksmith studio venv at
 * `~/.blacksmith-studio/venv/`. Lives at global scope only — it's
 * user-wide infrastructure (used by Graphify and internal pip ops),
 * not project state.
 */
export function useStudioVenv(): StudioVenvVM {
  const { data: studioEnv } = useResolvedEnvQuery("python", "studio");
  const createEnv = useCreateProjectEnv();
  const deleteEnv = useDeleteProjectEnv();

  const [confirmingReset, setConfirmingReset] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLocalError(null);
    try {
      const result = await createEnv.mutateAsync({
        toolchainId: "python",
        scope: "studio",
      });
      if (result && "error" in result) setLocalError(result.error.message);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const confirmReset = async () => {
    setLocalError(null);
    try {
      const result = await deleteEnv.mutateAsync({
        toolchainId: "python",
        scope: "studio",
      });
      setConfirmingReset(false);
      if (result && "error" in result) setLocalError(result.error.message);
    } catch (err) {
      setConfirmingReset(false);
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  return {
    hasVenv: !!studioEnv,
    path: studioEnv?.root ?? null,

    isCreating: createEnv.isPending,
    isResetting: deleteEnv.isPending,
    localError,

    confirmingReset,
    requestReset: () => setConfirmingReset(true),
    cancelReset: () => setConfirmingReset(false),
    confirmReset,

    handleCreate,
  };
}
