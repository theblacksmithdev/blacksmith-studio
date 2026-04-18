import type {
  ProjectContext,
  ResolvedBinary,
  StudioContext,
  Toolchain,
  ToolchainEnv,
} from "./types.js";

/**
 * Passthrough toolchain for `command: 'make'` / arbitrary bash invocations.
 *
 * Single Responsibility: hand back a trivial env so raw commands still
 * flow through the same runner + audit pipeline. Detects nothing,
 * resolves nothing — the command string IS the binary.
 *
 * Intentionally claims no presets or binaries so the registry can't
 * accidentally route a preset call through it; the resolver picks this
 * toolchain explicitly when the caller provides `command` without a
 * `preset`.
 */
export class RawToolchain implements Toolchain {
  readonly id = "raw";
  readonly displayName = "Raw";
  readonly binaries: readonly string[] = [];
  readonly presetOwnership: readonly string[] = [];

  detectStudioEnv(_ctx: StudioContext): ToolchainEnv | null {
    return {
      scope: "studio",
      toolchainId: this.id,
      displayName: "studio · raw",
      root: "",
      bin: "",
      envVars: {},
    };
  }

  detectProjectEnv(ctx: ProjectContext): ToolchainEnv | null {
    return {
      scope: "project",
      toolchainId: this.id,
      displayName: "project · raw",
      root: ctx.projectRoot,
      bin: "",
      envVars: {},
    };
  }

  resolveBinary(binary: string, _env: ToolchainEnv): ResolvedBinary {
    return { command: binary, prependArgs: [] };
  }

  async checkAvailable(): Promise<{
    ok: boolean;
    version?: string;
    error?: string;
  }> {
    return { ok: true };
  }
}
