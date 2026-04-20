import type { SettingsManager } from "../settings.js";
import type { PlatformInfo } from "../platform/index.js";
import { OllamaPaths } from "./paths.js";
import { OllamaBinaryResolver } from "./binary-resolver.js";
import {
  OllamaInstaller,
  type InstallProgressCallback,
} from "./installer.js";
import {
  OllamaDaemonManager,
  type DaemonStatus,
  type DaemonStatusChange,
} from "./daemon-manager.js";
import {
  OllamaModelManager,
  type InstalledModel,
  type PullProgressCallback,
} from "./model-manager.js";

const DEFAULT_ENDPOINT = "http://localhost:11434";

export interface OllamaState {
  installed: boolean;
  /** Absolute path to the resolved binary (any of: managed, system, PATH). */
  binaryPath: string | null;
  /** Source of the binary — useful for UI labelling. */
  source: "managed" | "system" | "path" | null;
  /** Current daemon status. */
  daemon: DaemonStatus;
  /** Configured endpoint (from settings or default). */
  endpoint: string;
}

/**
 * Facade over the four Ollama subsystems (binary, installer, daemon,
 * models). Everywhere outside `server/services/ollama/` talks only to
 * this class so the moving parts stay encapsulated.
 *
 * Composition: this class builds its collaborators in the constructor
 * and exposes a focused surface — state, install, ensureRunning,
 * listModels, pullModel, deleteModel, shutdown. Not every piece is
 * re-exported; they're internal implementation details.
 *
 * The UI never touches the daemon directly. When a user sends a
 * message with Ollama selected, `OllamaProvider` calls
 * `manager.ensureRunning()` first; the facade then delegates to the
 * daemon manager which decides whether spawning is needed.
 */
export class OllamaManager {
  readonly daemon: OllamaDaemonManager;
  readonly models: OllamaModelManager;
  private readonly resolver: OllamaBinaryResolver;
  private readonly installer: OllamaInstaller;
  private readonly paths: OllamaPaths;

  constructor(
    private readonly platform: PlatformInfo,
    private readonly settingsManager: SettingsManager,
  ) {
    this.paths = new OllamaPaths(platform);
    this.resolver = new OllamaBinaryResolver(platform, this.paths);
    this.installer = new OllamaInstaller(platform, this.paths);
    this.daemon = new OllamaDaemonManager(this.resolver, () => this.endpoint());
    this.models = new OllamaModelManager(() => this.endpoint());
  }

  endpoint(): string {
    const raw = this.settingsManager.getGlobal("ai.ollamaEndpoint");
    return (typeof raw === "string" && raw.trim()) || DEFAULT_ENDPOINT;
  }

  /** Everything the UI needs to render the provider card. */
  async state(): Promise<OllamaState> {
    const bin = this.resolver.resolve();
    return {
      installed: !!bin,
      binaryPath: bin?.path ?? null,
      source: bin?.source ?? null,
      daemon: this.daemon.status,
      endpoint: this.endpoint(),
    };
  }

  /** Kick off the download + extract flow. Throws on any failure. */
  install(onProgress: InstallProgressCallback): Promise<void> {
    return this.installer.install(onProgress);
  }

  /**
   * Make sure the daemon is responsive before we hit it with a chat
   * request. If Ollama isn't installed this throws; if it's installed
   * but not running we start it; if it's already running (ours or a
   * system Ollama.app) we just return.
   */
  async ensureRunning(): Promise<void> {
    if (!this.resolver.resolve()) {
      throw new Error(
        "Ollama isn't installed. Open Settings → AI → Ollama to install it.",
      );
    }
    await this.daemon.ensureRunning();
  }

  onDaemonStatus(cb: (change: DaemonStatusChange) => void): () => void {
    this.daemon.on("status", cb);
    return () => this.daemon.off("status", cb);
  }

  listModels(): Promise<InstalledModel[]> {
    return this.models.list();
  }

  pullModel(
    name: string,
    onProgress: PullProgressCallback,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.models.pull(name, onProgress, signal);
  }

  deleteModel(name: string): Promise<boolean> {
    return this.models.remove(name);
  }

  /** Called from the main process's `before-quit`. */
  shutdown(): void {
    this.daemon.shutdown();
  }
}
