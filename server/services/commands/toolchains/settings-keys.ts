/**
 * Canonical per-toolchain setting key that stores the user-pinned
 * interpreter override.
 *
 * Historically each toolchain had its own key
 * (`python.pythonPath`, `runner.nodePath`) because those predate the
 * toolchain registry and are read by ~20 legacy consumers (Runner,
 * MCP, Claude CLI, terminal, agent builders, setup checks…). The
 * registry's `CommandResolver` used to read a separate
 * `commands.<id>.resolution` key, which caused a split: the Env
 * Inspector could pin a Python the Runner never saw.
 *
 * We map to the legacy keys for `python` / `node` so every consumer
 * reads the same storage. New toolchains get the generic
 * `commands.<id>.resolution` form.
 */
export function settingsKeyForToolchain(toolchainId: string): string {
  switch (toolchainId) {
    case "python":
      return "python.pythonPath";
    case "node":
      return "runner.nodePath";
    default:
      return `commands.${toolchainId}.resolution`;
  }
}
