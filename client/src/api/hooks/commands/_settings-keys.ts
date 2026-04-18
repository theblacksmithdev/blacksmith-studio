/**
 * Canonical per-toolchain setting key. Must stay in sync with
 * server-side `settingsKeyForToolchain`. Python + Node map to the
 * legacy keys (`python.pythonPath`, `runner.nodePath`) because ~20
 * legacy call sites already read those; unifying the storage lets
 * the Env Inspector's "Change interpreter" action take effect
 * everywhere — Runner, MCP, Claude CLI, terminal, agent builders —
 * without rewriting each consumer.
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
