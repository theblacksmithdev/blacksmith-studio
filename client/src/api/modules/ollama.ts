import { api as raw } from "../client";
import type {
  OllamaState,
  OllamaInstalledModel,
  OllamaInstallProgress,
  OllamaPullProgress,
  OllamaDaemonStatusChange,
} from "../types";

/**
 * Typed client for the Ollama subsystem. Pairs with
 * `electron/ipc/ollama.ts` on the main-process side.
 *
 * Invoke methods are RPC (await results). `on*` subscribe to push
 * channels — they return an unsubscribe function.
 */
export const ollama = {
  /** Snapshot of install + daemon state. */
  state: () => raw.invoke<OllamaState>("ollama:state"),

  /** Download + extract Ollama into the managed directory. Long-running. */
  install: () => raw.invoke<{ ok: true }>("ollama:install"),

  /** Start the daemon (no-op if already running, ours or system's). */
  startDaemon: () => raw.invoke<{ ok: true }>("ollama:startDaemon"),

  /** Kill the daemon if we spawned it. */
  stopDaemon: () => raw.invoke<{ ok: true }>("ollama:stopDaemon"),

  /** List models the daemon already has on disk. */
  listModels: () => raw.invoke<OllamaInstalledModel[]>("ollama:listModels"),

  /** Pull a model. Progress pushed via `onPullProgress`. */
  pullModel: (name: string) =>
    raw.invoke<{ ok: true }>("ollama:pullModel", { name }),

  /** Abort an in-flight pull. */
  cancelPull: (name: string) =>
    raw.invoke<{ ok: true }>("ollama:cancelPull", { name }),

  /** Remove a model from disk. */
  deleteModel: (name: string) =>
    raw.invoke<boolean>("ollama:deleteModel", { name }),

  onInstallProgress: (cb: (p: OllamaInstallProgress) => void) =>
    raw.subscribe("ollama:onInstallProgress", cb),
  onDaemonStatus: (cb: (change: OllamaDaemonStatusChange) => void) =>
    raw.subscribe("ollama:onDaemonStatus", cb),
  onPullProgress: (cb: (p: OllamaPullProgress) => void) =>
    raw.subscribe("ollama:onPullProgress", cb),
} as const;
