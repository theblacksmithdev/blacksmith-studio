import type { CommandScope } from "../types.js";

/**
 * The single abstraction every runtime ecosystem (Python, Node, Java,
 * Ruby, …) implements. Adding a new runtime means writing exactly one
 * `Toolchain` class and registering it; no other code changes.
 *
 * The core methods are required. Optional capabilities (like
 * `createProjectEnv`) live on separate narrow interfaces (ISP) and are
 * mixed in via declaration merging / runtime checks so a toolchain
 * opts in only to what it can support.
 */

export interface StudioContext {
  /** Absolute path to the ~/.blacksmith-studio directory. */
  studioRoot: string;
  /** Optional override path coming from settings / env. */
  explicitPath?: string;
}

export interface ProjectContext {
  projectId: string;
  projectRoot: string;
  /** Per-toolchain override from settings (e.g. commands.python.resolution). */
  explicitPath?: string;
}

export interface ToolchainEnv {
  scope: CommandScope;
  toolchainId: string;
  /** Short human label — shown in the Timeline + Commands console. */
  displayName: string;
  /** Absolute path to the environment root (e.g. the venv directory). */
  root: string;
  /** Absolute path to the bin/Scripts directory. */
  bin: string;
  /** Additional environment variables required to activate this env. */
  envVars: Record<string, string>;
  /**
   * Optional wrapper invocation. Some toolchains don't give you a direct
   * binary path — they work through a wrapper (`poetry run …`,
   * `bundle exec …`). When set, the runner prefixes the resolved
   * command with this invoker.
   */
  invoker?: { command: string; args: string[] };
}

export interface ResolvedBinary {
  /** Absolute path of the binary (or wrapper) to spawn. */
  command: string;
  /** Args to prepend (wrapper args like `['run']` for Poetry). */
  prependArgs: string[];
}

export interface Toolchain {
  readonly id: string;
  readonly displayName: string;
  /** Binary names this toolchain claims (e.g. ['python','pip','uv']). */
  readonly binaries: readonly string[];
  /** Preset names this toolchain owns. Superset of `binaries` when aliases exist. */
  readonly presetOwnership: readonly string[];

  detectStudioEnv(ctx: StudioContext): ToolchainEnv | null;
  detectProjectEnv(ctx: ProjectContext): ToolchainEnv | null;

  resolveBinary(binary: string, env: ToolchainEnv): ResolvedBinary;

  checkAvailable(
    env: ToolchainEnv,
  ): Promise<{ ok: boolean; version?: string; error?: string }>;
}

/** Optional capability — toolchains that can bootstrap a project env. */
export interface EnvCreatingToolchain extends Toolchain {
  createProjectEnv(
    ctx: ProjectContext,
    options: Record<string, unknown>,
  ): Promise<ToolchainEnv>;
}

export function isEnvCreatingToolchain(
  t: Toolchain,
): t is EnvCreatingToolchain {
  return typeof (t as EnvCreatingToolchain).createProjectEnv === "function";
}
