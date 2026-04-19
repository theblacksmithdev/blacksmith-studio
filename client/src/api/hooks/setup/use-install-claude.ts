import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";

export interface UseInstallClaudeOptions {
  /** Called after a successful install (before the setup-check refetch
   *  observed state propagates to consumers). */
  onSuccess?: () => void;
}

export interface UseInstallClaudeResult {
  /** Trigger the global `npm install -g @anthropic-ai/claude-code` run. */
  install: () => Promise<void>;
  /** True while the install subprocess is running. */
  installing: boolean;
  /** `null` when idle / pending; the error message when the last attempt
   *  failed (either a thrown exception or a `{ success: false, error }`
   *  response). */
  error: string | null;
}

/**
 * Installs the Claude Code CLI globally via npm.
 *
 * Owns the full "install" interaction: the mutation, pending state,
 * and error derivation (handles both thrown exceptions and the
 * `{ success: false, error }` response shape). On success the
 * `setup:check` query is invalidated so every consumer of setup
 * state refetches automatically.
 */
export function useInstallClaude(
  options: UseInstallClaudeOptions = {},
): UseInstallClaudeResult {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.setup.installClaude(),
    onSuccess: (result) => {
      if (result.success) {
        qc.invalidateQueries({ queryKey: ["setup", "check"] });
        options.onSuccess?.();
      }
    },
  });

  const install = async () => {
    // Swallow the rejection — the error is surfaced via `error` below.
    try {
      await mutation.mutateAsync();
    } catch {
      /* handled */
    }
  };

  const error = mutation.isPending
    ? null
    : mutation.data && !mutation.data.success
      ? (mutation.data.error ?? "Installation failed.")
      : mutation.error instanceof Error
        ? mutation.error.message
        : mutation.error
          ? String(mutation.error)
          : null;

  return {
    install,
    installing: mutation.isPending,
    error,
  };
}
