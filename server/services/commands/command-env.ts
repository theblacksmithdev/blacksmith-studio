import path from "node:path";
import type { EnvScrubber } from "./env-scrubber.js";
import type { ToolchainEnv } from "./toolchains/types.js";

export interface BuildCommandEnvInput {
  base: NodeJS.ProcessEnv;
  toolchainEnv: ToolchainEnv | null;
  extraEnv?: Record<string, string>;
  /**
   * When true, the scrubber is applied after merging. Set for agent-
   * initiated or otherwise untrusted invocations to avoid leaking
   * secret-bearing env vars into the child process.
   */
  scrubSecrets?: boolean;
}

/**
 * Composes the final env for a spawned process.
 *
 * Single Responsibility: env-variable merging + PATH composition. Pure
 * function behind a class so tests can substitute a stub
 * `CommandEnvBuilder` and the rest of the service stays constructor-
 * injected.
 *
 * Merge order (lowest → highest priority):
 *   1. base process env
 *   2. toolchain-provided envVars (VIRTUAL_ENV, JAVA_HOME, …)
 *   3. project-local bin dirs (`node_modules/.bin`, venv bin)
 *   4. caller-supplied `extraEnv`
 *
 * PATH is assembled independently so bin dirs prepend rather than
 * replace.
 */
export class CommandEnvBuilder {
  constructor(private readonly scrubber?: EnvScrubber) {}

  build(input: BuildCommandEnvInput): Record<string, string> {
    const { base, toolchainEnv, extraEnv, scrubSecrets } = input;

    // Start from the base env, stripped of undefineds so downstream
    // spawn() calls don't see `undefined` values.
    const merged: Record<string, string> = {};
    for (const [k, v] of Object.entries(base)) {
      if (typeof v === "string") merged[k] = v;
    }

    const pathParts: string[] = [];
    if (toolchainEnv?.bin) pathParts.push(toolchainEnv.bin);
    // NodeToolchain (and potentially others) hand the service a
    // colon/semicolon-delimited extra-bins marker so npm-installed
    // binaries (jest, tsc, ...) become resolvable.
    const extraBins = toolchainEnv?.envVars.BLACKSMITH_PROJECT_BIN;
    if (extraBins) {
      for (const p of extraBins.split(path.delimiter)) {
        if (p) pathParts.push(p);
      }
    }
    if (merged.PATH) pathParts.push(merged.PATH);
    merged.PATH = pathParts.join(path.delimiter);

    if (toolchainEnv?.envVars) {
      for (const [k, v] of Object.entries(toolchainEnv.envVars)) {
        if (k === "BLACKSMITH_PROJECT_BIN") continue;
        if (v === "") {
          delete merged[k];
        } else {
          merged[k] = v;
        }
      }
    }

    if (extraEnv) {
      for (const [k, v] of Object.entries(extraEnv)) {
        merged[k] = v;
      }
    }

    if (scrubSecrets && this.scrubber) {
      return this.scrubber.scrub(merged);
    }
    return merged;
  }
}
