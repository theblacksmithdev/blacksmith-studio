import { useOutletContext, useParams } from "react-router-dom";
import { CommandRunDetail } from "@/components/commands";

interface CommandsOutletContext {
  onClose: () => void;
}

/**
 * Route-level wrapper: reads `:runId` from the URL and hands it to
 * `CommandRunDetail`. Close navigates the parent layout back to the
 * list-only route.
 */
export default function CommandRunDetailRoute() {
  const { runId } = useParams<{ runId: string }>();
  const { onClose } = useOutletContext<CommandsOutletContext>();
  return <CommandRunDetail runId={runId ?? null} onClose={onClose} />;
}
