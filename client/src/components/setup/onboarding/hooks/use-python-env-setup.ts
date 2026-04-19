import { useEffect, useState } from "react";
import {
  useCreateProjectEnv,
  useResolvedEnvQuery,
} from "@/api/hooks/commands";
import { useUpdateGlobalSettings } from "@/api/hooks/settings";

export interface UsePythonEnvSetupOptions {
  pythonPath: string | null;
  /** Called the first time the venv is detected/created. */
  onReady: () => void;
}

export interface UsePythonEnvSetupResult {
  /** The resolved studio env (null until detected). */
  existingEnv: { root: string } | null;
  /** True when the venv is already present on disk. */
  envReady: boolean;
  /** True while `commands:createEnv` is running. */
  working: boolean;
  /** Human-readable log lines emitted by the setup flow. */
  log: string[];
  /** Set when the last attempt failed; cleared on next `run()`. */
  error: string | null;
  /** Create (or rebuild) the venv. Pass `true` to force overwrite. */
  run: (overwrite: boolean) => Promise<void>;
}

/**
 * Owns the studio Python venv lifecycle — detection (via the shared
 * env query) + creation (via the shared mutation). Keeps local log and
 * error state so the step component is purely presentational.
 *
 * When `~/.blacksmith-studio/venv` already exists we fire `onReady()`
 * automatically so the wizard can move forward without a click.
 */
export function usePythonEnvSetup({
  pythonPath,
  onReady,
}: UsePythonEnvSetupOptions): UsePythonEnvSetupResult {
  const envQuery = useResolvedEnvQuery("python", "studio");
  const createEnv = useCreateProjectEnv();
  const updateSettings = useUpdateGlobalSettings();

  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const existingEnv = envQuery.data ?? null;
  const envReady = !!existingEnv;

  useEffect(() => {
    if (envReady) onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envReady]);

  const run = async (overwrite: boolean) => {
    if (!pythonPath) {
      setError("Pick a Python interpreter in the previous step first.");
      return;
    }
    setError(null);
    setLog([
      `Using interpreter: ${pythonPath}`,
      "Creating Studio Python environment…",
    ]);
    try {
      const result = await createEnv.mutateAsync({
        toolchainId: "python",
        scope: "studio",
        options: { python: pythonPath, overwrite },
      });
      if ("error" in result) {
        setLog((prev) => [...prev, `[error] ${result.error.message}`]);
        setError(result.error.message);
        return;
      }
      await updateSettings.mutateAsync({ "python.pythonPath": pythonPath });
      setLog((prev) => [...prev, "Environment ready."]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setLog((prev) => [...prev, `[error] ${message}`]);
      setError(message);
    }
  };

  return {
    existingEnv,
    envReady,
    working: createEnv.isPending,
    log,
    error,
    run,
  };
}
