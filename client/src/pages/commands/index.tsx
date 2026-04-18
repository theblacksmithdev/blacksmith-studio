import { CommandsPage } from "@/components/commands";

/**
 * Project-wide commands console. Route: `/:projectId/commands`.
 * Shows the audit trail for every subprocess the CommandService has
 * spawned — UI, agents via MCP, and internal tooling all appear here.
 */
export default function CommandsRoute() {
  return <CommandsPage />;
}
