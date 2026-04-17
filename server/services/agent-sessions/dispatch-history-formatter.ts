import type { AgentDispatchRecord, AgentTaskRecord } from "./types.js";

/** Maps raw task status to the icon/label rendered next to a task. */
const TASK_STATUS_ICON: Record<string, string> = {
  done: "done",
  error: "failed",
};

/** Same mapping for the parent dispatch line. */
const DISPATCH_STATUS_LABEL: Record<string, string> = {
  completed: "done",
};

/**
 * Render recent dispatches as a markdown block suitable for injection
 * into the PM's context window. Pure function over the dispatch records
 * — the caller is responsible for fetching them.
 *
 * Status labels are lookup tables, so extending is a new entry rather
 * than a branch in a control flow.
 */
export function formatDispatchHistory(
  dispatches: AgentDispatchRecord[],
): string {
  if (dispatches.length === 0) return "";

  const lines: string[] = ["## Recent Work History\n"];
  for (const dispatch of dispatches) {
    appendDispatch(lines, dispatch);
  }
  return lines.join("\n");
}

function appendDispatch(out: string[], dispatch: AgentDispatchRecord): void {
  const status = DISPATCH_STATUS_LABEL[dispatch.status] ?? dispatch.status;
  out.push(`### ${dispatch.planSummary} (${status})`);
  out.push(`Prompt: ${dispatch.prompt.slice(0, 150)}`);
  for (const task of dispatch.tasks) {
    out.push(`  - [${iconFor(task)}] ${task.title} (${task.role})`);
  }
  out.push("");
}

function iconFor(task: AgentTaskRecord): string {
  return TASK_STATUS_ICON[task.status] ?? task.status;
}
