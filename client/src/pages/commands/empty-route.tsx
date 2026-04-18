import { CommandRunDetail } from "@/components/commands";

/**
 * Default detail pane when no run is selected — renders the
 * "Select a command" empty state via `CommandRunDetail` with a null id.
 */
export default function CommandsEmptyRoute() {
  return <CommandRunDetail runId={null} />;
}
