import path from "node:path";

/**
 * Builds a process env with the configured Python binary's directory
 * prepended to PATH. If no pythonPath is set, returns process.env unchanged.
 *
 * Usage:
 *   spawn('pip3', args, { env: pythonEnv(pythonPath) })
 */
export function pythonEnv(
  pythonPath?: string,
  extra?: Record<string, string>,
): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = { ...process.env, ...extra };

  if (pythonPath) {
    const pythonDir = path.dirname(pythonPath);
    env.PATH = `${pythonDir}${path.delimiter}${process.env.PATH ?? ""}`;
  }

  return env;
}

/**
 * Returns the pip3/python3 command that lives next to the configured python binary.
 * Falls back to the bare command name if no custom path is set.
 */
export function pythonCmd(
  cmd: "python3" | "pip3" | "pip",
  pythonPath?: string,
): string {
  if (!pythonPath) return cmd;
  return path.join(path.dirname(pythonPath), cmd);
}
