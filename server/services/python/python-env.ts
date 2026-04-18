import path from "node:path";
import { CommandEnvBuilder } from "../commands/command-env.js";
import type { ToolchainEnv } from "../commands/toolchains/types.js";

/**
 * Backwards-compatible shim that now delegates to the unified
 * `CommandEnvBuilder`.
 *
 * New code should use `CommandService.run({ preset: 'pip', ... })`
 * instead — this helper remains only so legacy callsites
 * (runner setup scripts, ad-hoc `spawn`) keep compiling.
 *
 * @deprecated Prefer `CommandService.run` / `CommandService.stream`.
 */
export function pythonEnv(
  pythonPath?: string,
  extra?: Record<string, string>,
): Record<string, string | undefined> {
  if (!pythonPath) {
    return { ...process.env, ...extra };
  }
  const pythonDir = path.dirname(pythonPath);
  const toolchainEnv: ToolchainEnv = {
    scope: "project",
    toolchainId: "python",
    displayName: `shim: ${pythonPath}`,
    root: path.dirname(pythonDir),
    bin: pythonDir,
    envVars: {},
  };
  return envBuilder.build({
    base: process.env,
    toolchainEnv,
    extraEnv: extra,
  });
}

/**
 * Returns the pip3/python3 command that lives next to the configured
 * python binary. Falls back to the bare command name if no custom path
 * is set.
 *
 * @deprecated Prefer `CommandService` preset resolution.
 */
export function pythonCmd(
  cmd: "python3" | "pip3" | "pip",
  pythonPath?: string,
): string {
  if (!pythonPath) return cmd;
  return path.join(path.dirname(pythonPath), cmd);
}

const envBuilder = new CommandEnvBuilder();
