import path from "node:path";
import { CommandEnvBuilder } from "./commands/command-env.js";
import type { ToolchainEnv } from "./commands/toolchains/types.js";

/**
 * Backwards-compatible shim that now delegates to the unified
 * `CommandEnvBuilder`.
 *
 * New code should use `CommandService.run({ preset: 'npm', ... })`
 * instead — this helper remains only so existing callsites
 * (mcp.testStdio, spawnRunner, terminal spawn) keep compiling without
 * a simultaneous mass-migration.
 *
 * @deprecated Prefer `CommandService.run` / `CommandService.stream`.
 */
export function nodeEnv(
  nodePath?: string,
  extra?: Record<string, string>,
): Record<string, string | undefined> {
  if (!nodePath) {
    return { ...process.env, ...extra };
  }
  const nodeDir = path.dirname(nodePath);
  const toolchainEnv: ToolchainEnv = {
    scope: "project",
    toolchainId: "node",
    displayName: `shim: ${nodePath}`,
    root: path.dirname(nodeDir),
    bin: nodeDir,
    envVars: {},
  };
  return envBuilder.build({
    base: process.env,
    toolchainEnv,
    extraEnv: extra,
  });
}

/**
 * Returns the npm/npx command that lives next to the configured node
 * binary. Falls back to the bare command name if no custom path is set.
 *
 * @deprecated Prefer `CommandService` preset resolution.
 */
export function nodeCmd(
  cmd: "npm" | "npx" | "node",
  nodePath?: string,
): string {
  if (!nodePath) return cmd;
  return path.join(path.dirname(nodePath), cmd);
}

const envBuilder = new CommandEnvBuilder();
