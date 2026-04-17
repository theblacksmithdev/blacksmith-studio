import type { DispatchService } from "./services/index.js";
import type { AgentDispatchRecord, AgentTaskRecord } from "./types.js";

/** Map a raw status value to the icon/label rendered next to a task. */
const TASK_STATUS_ICON: Record<string, string> = {
  done: "done",
  error: "failed",
};

/** Same mapping for the parent dispatch line. */
const DISPATCH_STATUS_LABEL: Record<string, string> = {
  completed: "done",
};

/**
 * Renders recent dispatches as a markdown block suitable for injection
 * into the PM's context window.
 *
 * Single Responsibility: presentation. Knows nothing about SQL — takes
 * a DispatchService and a project scope, asks for data, formats.
 *
 * Open/Closed: status labels are data-driven maps — extending is a new
 * entry, not a new branch.
 */
export class DispatchHistoryFormatter {
  constructor(private readonly dispatches: DispatchService) {}

  format(projectId: string, limit = 5): string {
    const items = this.dispatches.list(projectId, limit);
    if (items.length === 0) return "";

    const lines: string[] = ["## Recent Work History\n"];
    for (const dispatch of items) {
      this.appendDispatch(lines, dispatch);
    }
    return lines.join("\n");
  }

  private appendDispatch(
    out: string[],
    dispatch: AgentDispatchRecord,
  ): void {
    const status = DISPATCH_STATUS_LABEL[dispatch.status] ?? dispatch.status;
    out.push(`### ${dispatch.planSummary} (${status})`);
    out.push(`Prompt: ${dispatch.prompt.slice(0, 150)}`);
    for (const task of dispatch.tasks) {
      out.push(`  - [${this.statusIconFor(task)}] ${task.title} (${task.role})`);
    }
    out.push("");
  }

  private statusIconFor(task: AgentTaskRecord): string {
    return TASK_STATUS_ICON[task.status] ?? task.status;
  }
}
