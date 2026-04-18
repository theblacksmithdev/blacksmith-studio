import os from "node:os";
import path from "node:path";
import { CommandEnvBuilder } from "./command-env.js";
import {
  InvalidCommandSpecError,
  InvalidCwdError,
  NoProjectEnvError,
  NoStudioEnvError,
  ToolchainNotFoundError,
} from "./errors.js";
import type { ToolchainRegistry } from "./toolchains/registry.js";
import type { Toolchain, ToolchainEnv } from "./toolchains/types.js";
import type { CommandSpec, ResolvedInvocation } from "./types.js";

export interface ProjectPathResolver {
  getPath(projectId: string): string;
}

export interface ProjectSettingsResolver {
  /**
   * Optional explicit path from per-project settings, e.g. user pinned
   * `commands.python.resolution: '/abs/path/to/python'`. Return null
   * when no override is set.
   */
  getExplicitPath(projectId: string, toolchainId: string): string | null;
}

/**
 * Translates an abstract `CommandSpec` into the concrete invocation the
 * runner needs (binary + args + cwd + env + audit display).
 *
 * Single Responsibility: spec → invocation. Picks the toolchain via the
 * registry (never switches on id), detects the scoped env via the
 * toolchain, composes the env via CommandEnvBuilder. All side-effecting
 * spawn work lives in CommandRunner.
 */
export class CommandResolver {
  constructor(
    private readonly registry: ToolchainRegistry,
    private readonly envBuilder: CommandEnvBuilder,
    private readonly projects: ProjectPathResolver,
    private readonly settings: ProjectSettingsResolver,
    private readonly studioRoot: string = path.join(
      os.homedir(),
      ".blacksmith-studio",
    ),
  ) {}

  resolve(spec: CommandSpec): ResolvedInvocation {
    this.validate(spec);

    const toolchain = this.pickToolchain(spec);
    const env = this.pickEnv(toolchain, spec);

    const binary = spec.preset ?? spec.command!;
    const resolved = toolchain.resolveBinary(binary, env);

    const args = [...resolved.prependArgs, ...(spec.args ?? [])];
    const cwd = this.resolveCwd(spec);
    const mergedEnv = this.envBuilder.build({
      base: process.env,
      toolchainEnv: env,
      extraEnv: spec.env,
      // Agent-initiated invocations are always scrubbed. User-
      // initiated ones keep their full env so build scripts that need
      // secrets (publish flows, deploys) still work.
      scrubSecrets: !!spec.agentRole,
    });

    return {
      toolchainId: toolchain.id,
      preset: spec.preset ?? null,
      command: resolved.command,
      args,
      cwd,
      env: mergedEnv,
      resolvedEnvDisplay: env.displayName,
      scope: spec.scope,
    };
  }

  private validate(spec: CommandSpec): void {
    if (!spec.projectId) {
      throw new InvalidCommandSpecError("projectId is required");
    }
    if (!spec.preset && !spec.command) {
      throw new InvalidCommandSpecError(
        "CommandSpec must include either `preset` or `command`",
      );
    }
    if (spec.preset && spec.command) {
      throw new InvalidCommandSpecError(
        "CommandSpec cannot include both `preset` and `command` — pick one",
      );
    }
  }

  /**
   * Containment check — project-scoped invocations must resolve to a
   * cwd inside the project root. Studio-scoped calls are trusted
   * (they come from main-process code, not agents).
   */
  private resolveCwd(spec: CommandSpec): string {
    const projectRoot = this.projects.getPath(spec.projectId);
    const requested = spec.cwd ?? projectRoot;
    if (spec.scope !== "project") return path.resolve(requested);
    const resolved = path.resolve(requested);
    const resolvedRoot = path.resolve(projectRoot);
    const normalized = resolved.endsWith(path.sep)
      ? resolved
      : resolved + path.sep;
    const normalizedRoot = resolvedRoot.endsWith(path.sep)
      ? resolvedRoot
      : resolvedRoot + path.sep;
    if (!normalized.startsWith(normalizedRoot) && resolved !== resolvedRoot) {
      throw new InvalidCwdError(requested, projectRoot);
    }
    return resolved;
  }

  private pickToolchain(spec: CommandSpec): Toolchain {
    if (spec.preset) {
      const owned = this.registry.getByPreset(spec.preset);
      if (!owned) throw new ToolchainNotFoundError(spec.preset);
      return owned;
    }
    const viaBinary = this.registry.getByBinary(spec.command!);
    return viaBinary ?? this.registry.getById("raw");
  }

  private pickEnv(toolchain: Toolchain, spec: CommandSpec): ToolchainEnv {
    if (spec.scope === "studio") {
      const env = toolchain.detectStudioEnv({ studioRoot: this.studioRoot });
      if (!env) throw new NoStudioEnvError(toolchain.id);
      return env;
    }
    const explicit = this.settings.getExplicitPath(
      spec.projectId,
      toolchain.id,
    );
    const env = toolchain.detectProjectEnv({
      projectId: spec.projectId,
      projectRoot: this.projects.getPath(spec.projectId),
      explicitPath: explicit ?? undefined,
    });
    if (!env) {
      throw new NoProjectEnvError(
        toolchain.id,
        this.projects.getPath(spec.projectId),
      );
    }
    return env;
  }
}
