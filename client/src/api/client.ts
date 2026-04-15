/**
 * Strip Electron IPC wrapper noise from error messages.
 *
 * Electron wraps IPC errors as:
 *   "Error invoking remote method 'git:switchVersion': Error: <actual message>"
 *
 * This extracts the actual message so users see clean text.
 */
function cleanIpcError(err: unknown): Error {
  const raw = err instanceof Error ? err.message : String(err);

  const cleaned = raw
    // Remove Electron's "Error invoking remote method 'channel': " prefix
    .replace(/^Error invoking remote method '[^']+':\s*/, "")
    // Remove repeated "Error: " prefixes
    .replace(/^(Error:\s*)+/i, "")
    .trim();

  const error = new Error(cleaned || raw);
  // Preserve the original stack for debugging
  if (err instanceof Error && err.stack) {
    console.error(`[IPC Error]`, err.stack);
  }
  return error;
}

export const api = {
  /** Request/response IPC call. Errors are cleaned for user display. */
  invoke: async <T>(channel: string, ...args: any[]): Promise<T> => {
    try {
      return await window.electronAPI!.invoke(channel, ...args);
    } catch (err) {
      throw cleanIpcError(err);
    }
  },

  /** Subscribe to a push/stream IPC channel. Returns unsubscribe function. */
  subscribe: (
    channel: string,
    callback: (...args: any[]) => void,
  ): (() => void) => window.electronAPI!.on(channel, callback),
};
