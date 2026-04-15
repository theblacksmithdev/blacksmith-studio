import path from "node:path";

/**
 * Builds a process env with the configured Node binary's directory
 * prepended to PATH. If no nodePath is set, returns process.env unchanged.
 *
 * Usage:
 *   spawn('npm', args, { env: nodeEnv(nodePath) })
 *   spawn('npx', args, { env: nodeEnv(nodePath, { FORCE_COLOR: '0' }) })
 */
export function nodeEnv(
  nodePath?: string,
  extra?: Record<string, string>,
): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = { ...process.env, ...extra };

  if (nodePath) {
    const nodeDir = path.dirname(nodePath);
    env.PATH = `${nodeDir}${path.delimiter}${process.env.PATH ?? ""}`;
  }

  return env;
}

/**
 * Returns the npm/npx command that lives next to the configured node binary.
 * Falls back to the bare command name if no custom path is set.
 */
export function nodeCmd(
  cmd: "npm" | "npx" | "node",
  nodePath?: string,
): string {
  if (!nodePath) return cmd;
  return path.join(path.dirname(nodePath), cmd);
}
