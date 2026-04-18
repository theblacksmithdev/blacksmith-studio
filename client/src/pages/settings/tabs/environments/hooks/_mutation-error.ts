/**
 * Uniform error extraction for every mutation in the environments tab.
 *
 * An IPC call can fail in two distinct ways:
 *   1. The main process throws → React Query catches it as `error`
 *   2. The handler returns a structured `{ error: { message } }` shape
 *
 * Both paths mean the same thing to the user, so we surface one
 * string. Check thrown error first; fall back to reading the last
 * returned payload for a soft error.
 */
export function errorFrom(mutation: {
  error?: Error | null;
  data?: unknown;
}): string | null {
  if (mutation.error) return mutation.error.message;
  return extractResultError(mutation.data);
}

export function extractResultError(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;
  if (!("error" in result)) return null;
  const err = (result as { error: unknown }).error;
  if (!err || typeof err !== "object") return null;
  const message = (err as { message?: unknown }).message;
  return typeof message === "string" ? message : null;
}
